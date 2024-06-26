export class Demo implements DurableObject {
  constructor(readonly state: DurableObjectState) {}

  fetch(req: Request) {
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    this.state.acceptWebSocket(server);

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, msg: string | ArrayBuffer) {
    ws.send("hello back");
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
