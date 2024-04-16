import { WebSocket } from "ws";

// const CONNECTION_STRING = "https://my-online-deployment.workers.dev"
const CONNECTION_STRING = "http://127.0.0.1:8787";

function sleep(millis) {
  return new Promise((res) => setTimeout(() => res(), millis));
}

async function connect() {
  let resolve;
  const promise = new Promise((res) => {
    resolve = res;
  });

  const socket = new WebSocket(CONNECTION_STRING);

  socket.on("ping", () => console.info("PING received"));

  socket.on("message", (ev) => {
    const msg = String(ev);
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

  socket.on("close", (code, reason) => {
    console.warn(`Got CLOSE event: code=${code} reason=${reason}`);
    //   socket.close();
  });

  socket.on("error", (err) => {
    console.error(`Got ERROR event: ${String(err)}`);
    // socket.close();
  });

  // Wait for the 'open' event to happen before returning
  socket.on("open", resolve);
  await promise;
  // socket.removeEventListener("open", resolve);
  return socket;
}

console.info(`Running against: ${CONNECTION_STRING}`);
console.info(`PID: ${process.pid}`);

const socket = await connect();

await sleep(1_000);

socket.send("x");
await sleep(100);

// for await (const chunk of Bun.stdin.stream()) {
//   const chunkText = Buffer.from(chunk).toString().trim();
//   if (chunkText === "q") {
//     break;
//   }
//   socket.send(chunkText);
// }

socket.close(1000);
