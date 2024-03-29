export class Counter implements DurableObject {
  count: number = 0;

  constructor(readonly state: DurableObjectState) {}

  fetch(request: Request) {
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    this.state.acceptWebSocket(server);

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(
    ws: WebSocket,
    message: string | ArrayBuffer
  ): Promise<void> {
    ws.send("hello back");
  }
}

export default <ExportedHandler<Env>>{
  fetch(request, env) {
    const { pathname } = new URL(request.url);
    const id = env.COUNTER.idFromName(pathname);
    const stub = env.COUNTER.get(id);
    return stub.fetch(request);
  },
};
