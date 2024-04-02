export class Demo implements DurableObject {
  constructor(readonly state: DurableObjectState) {}

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

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, msg: string | ArrayBuffer) {
    switch (msg) {
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

  // async webSocketClose(ws: WebSocket) {
  //   console.log(`Got CLOSE event for socket ${ws}`);
  // }

  // async webSocketError(ws: WebSocket) {
  //   console.log(`Got ERROR event for socket ${ws}`);
  // }
}

export default <ExportedHandler<Env>>{
  fetch(request, env) {
    const { pathname } = new URL(request.url);
    const id = env.DEMO.idFromName(pathname);
    const stub = env.DEMO.get(id);
    return stub.fetch(request);
  },
};
