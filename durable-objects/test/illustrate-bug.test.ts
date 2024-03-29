import { SELF, env, runInDurableObject } from "cloudflare:test";
import { expect, it } from "vitest";

function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function waitForMessage(ws: WebSocket): Promise<MessageEvent> {
  return new Promise((resolve) => {
    const onMessage = (event: MessageEvent) => {
      resolve(event);
      ws.removeEventListener("message", onMessage);
    };

    ws.addEventListener("message", onMessage);
  });
}

it("works", async () => {
  const response = await SELF.fetch("https://example.com", {
    headers: { Upgrade: "websocket" },
  });
  const ws = response.webSocket!;
  expect(ws).toBeDefined();

  ws.accept();

  ws.send("hello");

  const event = await waitForMessage(ws);
  expect(event.data).toBe("hello back");

  ws.close();

  // -----------------------------------------------------------
  // Do the trick
  // -----------------------------------------------------------
  const { pathname } = new URL("https://example.com");
  const id = env.DEMO.idFromName(pathname);
  const stub = env.DEMO.get(id);
  try {
    await runInDurableObject(stub, (_, state) =>
      state.blockConcurrencyWhile(() => {
        throw new Error("Shutting down");
      })
    );
  } catch {}
});
