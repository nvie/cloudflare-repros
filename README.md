# The replication

This repo demonstrates a bug where websocket hibernation causes a segfault.

1. Check out this branch.
2. `npm i`
3. `npm run test` (takes 10 seconds due to the wait)
4. 💥 Crash with segfault 💥

# The crash details

```
$ npm run test

> test
> vitest --config vitest.workers.config.ts --reporter basic


 DEV  v1.3.0 /Users/nvie/Projects/cloudflare-repros

[vpw:inf] Starting single runtime for durable-objects/vitest.config.ts...
*** Received signal #11: Segmentation fault: 11
stack:

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
TypeError: fetch failed
 ❯ fetch node_modules/undici/index.js:112:15
 ❯ process.processTicksAndRejections node:internal/process/task_queues:95:5
 ❯ MessagePort.<anonymous> [worker eval]:28:22

Caused by: Error: connect ECONNREFUSED 127.0.0.1:54101
 ❯ TCPConnectWrap.afterConnect [as oncomplete] node:net:1555:16

/Users/nvie/Projects/cloudflare-repros/node_modules/wrangler/wrangler-dist/cli.js:29573
            throw a;
            ^

TypeError: fetch failed
    at fetch (/Users/nvie/Projects/cloudflare-repros/node_modules/undici/index.js:112:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async MessagePort.<anonymous> ([worker eval]:28:22) {
  stacks: [
    {
      method: 'fetch',
      file: '/Users/nvie/Projects/cloudflare-repros/node_modules/undici/index.js',
      line: 112,
      column: 15
    },
    {
      method: 'process.processTicksAndRejections',
      file: '/Users/nvie/Projects/cloudflare-repros/node:internal/process/task_queues',
      line: 95,
      column: 5
    },
    {
      method: 'MessagePort.<anonymous>',
      file: '/Users/nvie/Projects/cloudflare-repros/[worker eval]',
      line: 28,
      column: 22
    }
  ],
  [cause]: Error: connect ECONNREFUSED 127.0.0.1:54101
      at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1555:16) {
    name: 'Caused by: Error',
    stacks: [
      {
        method: 'TCPConnectWrap.afterConnect [as oncomplete]',
        file: '/Users/nvie/Projects/cloudflare-repros/node:net',
        line: 1555,
        column: 16
      }
    ]
  }
}

Node.js v18.19.1
```
