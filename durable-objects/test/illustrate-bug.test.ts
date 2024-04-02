import { SELF } from "cloudflare:test";
import { expect, it } from "vitest";

function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

it("works", async () => {
  const resp1 = await SELF.fetch("https://example.com", {
    headers: { Upgrade: "websocket" },
  });
  const resp2 = await SELF.fetch("https://example.com", {
    headers: { Upgrade: "websocket" },
  });

  const ws1 = resp1.webSocket!;
  const ws2 = resp2.webSocket!;

  ws1.accept();
  ws2.accept();

  // Trigger hibernation
  // await wait(9_500); // Works, but it hasn't hibernated
  await wait(10_000); // Crashes with a segfault :(

  const resp3 = await SELF.fetch("https://example.com", {
    headers: { Upgrade: "websocket" },
  });

  const ws3 = resp3.webSocket!;
  ws3.accept();
});
