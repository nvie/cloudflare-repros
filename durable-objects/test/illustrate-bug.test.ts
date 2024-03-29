import { SELF } from "cloudflare:test";
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
});
