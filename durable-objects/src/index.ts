function formatReadyState(ws: WebSocket) {
  switch (ws.readyState) {
    case WebSocket.CONNECTING:
      return "CONNECTING";
    case WebSocket.OPEN:
      return "OPEN";
    case WebSocket.CLOSING:
      return "CLOSING";
    case WebSocket.CLOSED:
      return "CLOSED";
    default:
      throw new Error("Unknown ready state");
  }
}

function sleep(millis: number) {
  return new Promise<void>((res) => setTimeout(() => res(), millis));
}

export class Demo implements DurableObject {
  constructor(readonly state: DurableObjectState) {
    console.log("");
    console.log("***********************************");
    console.log("Running constructor");
    console.log("***********************************");
    this.printSockets();

    let index = 0;
    for (const ws of this.state.getWebSockets()) {
      try {
        ws.send("beep");
      } catch (err) {
        console.error(`Could not send a beep to socket#${index}: ${err}`);
      }
      index++;
    }

    this.state.blockConcurrencyWhile(async () => {
      console.info("Almost ready...");
      await sleep(1_000);
      console.info("Constructor done running");
    });
  }

  fetch(req: Request) {
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    if (this.state.getWebSocketAutoResponse() === null) {
      this.state.setWebSocketAutoResponse(
        new WebSocketRequestResponsePair("ping", "pong")
      );
    }

    this.state.acceptWebSocket(server);
    this.printSockets();

    return new Response(null, { status: 101, webSocket: client });
  }

  printSockets() {
    const sockets = this.state.getWebSockets();
    console.log(
      `--- ${sockets.length} sockets -----------------------------------`
    );
    let index = 0;
    for (const ws of sockets) {
      console.log(`Socket ${index}: ${formatReadyState(ws)}`);
      index++;
    }
  }

  async webSocketMessage(ws: WebSocket, msg: string | ArrayBuffer) {
    console.log(`Server received ${msg}`);

    switch (msg) {
      case "?": {
        const sockets = this.state.getWebSockets();
        ws.send(
          `${sockets.length} sockets: ${sockets
            .map(formatReadyState)
            .join(", ")}`
        );
        return;
      }

      case "now?":
        ws.send(`now=${Date.now()}`);
        return;

      case "lastPong?":
        ws.send(
          `lastPong=${
            this.state
              .getWebSocketAutoResponseTimestamp(ws)
              ?.getTime()
              .toString() ?? "null"
          }`
        );
        return;

      default:
        ws.send(`Unexpected command: ${msg}`);
        ws.close(4000, "Unexpected");
        return;
    }
  }

  async webSocketClose(ws: WebSocket) {
    console.log(
      `Got CLOSE event for socket ${this.state.getWebSockets().indexOf(ws)}`
    );
  }

  async webSocketError(ws: WebSocket) {
    console.log(
      `Got ERROR event for socket ${this.state.getWebSockets().indexOf(ws)}`
    );
  }
}

export default <ExportedHandler<Env>>{
  fetch(request, env) {
    const { pathname } = new URL(request.url);
    const id = env.DEMO.idFromName(pathname);
    const stub = env.DEMO.get(id);
    return stub.fetch(request);
  },
};
