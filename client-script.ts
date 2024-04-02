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

function rel(date: number | string | null): string {
  return date === null
    ? "null"
    : new Date(Number(date)).getTime() - scriptStart + "ms since script start";
}

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

  // Wait for the 'open' event to happen before returning
  socket.addEventListener("open", resolve);
  await promise;
  socket.removeEventListener("open", resolve);
  return socket;
}

console.info(`Running against: ${CONNECTION_STRING}`);

const socket = await connect();

function send(x) {
  console.info("sent", x);
  socket.send(x);
}

send("now?");
send("lastPong?");

await sleep(100);
send("ping");
await sleep(100);

await waitForHibernation();
send("ping");

await sleep(800);
send("lastPong?");

await sleep(1_000);
socket.close();

if (!(Number.isFinite(actualLastPong) && Number.isFinite(reportedLastPong))) {
  throw new Error("Test failed to gather results");
}

const diffInMillis = actualLastPong - reportedLastPong;
const isCloseEnough = Math.abs(diffInMillis) < 1_000;
console.log({
  actualLastPong,
  reportedLastPong,
  diffInMillis,
  isCloseEnough,
});

console.log(
  isCloseEnough
    ? "✅ Success"
    : "❌ Failed, .gWSART() reported timestamp does not match actual last auto-response timestamp"
);
