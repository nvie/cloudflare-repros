// const CONNECTION_STRING = "https://my-online-deployment.workers.dev"
const CONNECTION_STRING = "http://127.0.0.1:8787";

const scriptStart = Date.now();

function sleep(millis: number) {
  return new Promise<void>((res) => setTimeout(() => res(), millis));
}

async function waitForHibernation() {
  console.info("Waiting to trigger hibernation now...");
  try {
    return await sleep(12_000);
  } finally {
    console.info("Should be hibernated now, continuing...");
  }
}

let actualLastPong: number | null = null;
let reportedLastPong: number | null = null;

async function connect() {
  let resolve;
  const promise = new Promise((res) => {
    resolve = res;
  });

  const socket = new WebSocket(CONNECTION_STRING);

  socket.addEventListener("message", (ev) => {
    const msg = ev.data as string;
    console.info("received", msg);

    if (msg === "pong") {
      actualLastPong = Date.now();
    } else if (msg.startsWith("lastPong=")) {
      const num = Number(msg.slice(9));
      if (!isNaN(num)) {
        reportedLastPong = num;
      }
    }
  });

  socket.addEventListener("close", (ev) => {
    console.warn(`Got CLOSE event: code=${ev.code} reason=${ev.reason}`);
    // socket.close();
  });

  socket.addEventListener("error", (err) => {
    console.error(`Got ERROR event: ${String(err)}`);
    // socket.close();
  });

  // Wait for the 'open' event to happen before returning
  socket.addEventListener("open", resolve);
  await promise;
  socket.removeEventListener("open", resolve);
  return socket;
}

console.info(`Running against: ${CONNECTION_STRING}`);
console.info(`PID: ${process.pid}`);

const socket = await connect();

for await (const chunk of Bun.stdin.stream()) {
  const chunkText = Buffer.from(chunk).toString().trim();
  if (chunkText === "q") {
    break;
  }
  socket.send(chunkText);
}

socket.close();
console.log("bye");
