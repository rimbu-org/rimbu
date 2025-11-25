<p align="center">
  <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" height="96" alt="Rimbu Logo" />
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/@rimbu%2Fchannel.svg)](https://www.npmjs.com/package/@rimbu/channel)
![License](https://img.shields.io/github/license/rimbu-org/rimbu)
![Types Included](https://img.shields.io/badge/TypeScript-ready-blue)
![Node](https://img.shields.io/badge/Node-18+-6DA55F?logo=node.js&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg)
![ESM + CJS](https://img.shields.io/badge/modules-ESM%20%2B%20CJS-informational)

</div>

# `@rimbu/channel`

**Typed channels and concurrency primitives for TypeScript & JavaScript.**

`@rimbu/channel` provides **Go-style channels** and related concurrency tools for coordinating asynchronous processes:
typed channels, cross‑thread communication, remote object access, and synchronization primitives – all with a clean,
composable API.

Use it whenever you need **structured message passing**, **back‑pressure**, or **safe cross‑thread / cross‑context
coordination** instead of ad‑hoc callbacks and shared mutable state.

---

## Table of Contents

1. [Why `@rimbu/channel`?](#why-rimbuchannel)
2. [Feature Highlights](#feature-highlights)
3. [Quick Start](#quick-start)
4. [Core Concepts & Types](#core-concepts--types)
5. [Remote Channels & Remote Objects](#remote-channels--remote-objects)
6. [Synchronization Utilities](#synchronization-utilities)
7. [Installation](#installation)
8. [FAQ](#faq)
9. [Ecosystem & Integration](#ecosystem--integration)
10. [Contributing](#contributing)
11. [License](#license)

---

## Why `@rimbu/channel`?

Modern applications are full of **concurrent tasks**: background workers, IO‑bound operations, UI events, and more.
Promise chains and callbacks quickly become hard to reason about, especially when you need:

- **Back‑pressure** – pausing producers when consumers fall behind.
- **One‑to‑one communication** – coordinating work between specific components.
- **Cross‑thread / worker communication** – using `Worker`/`MessagePort`‑like APIs.
- **Safer access to shared resources** – without ad‑hoc locks everywhere.

`@rimbu/channel` focuses on:

- **Typed channels** – `Channel.Read<T>` / `Channel.Write<T>` with clear variance.
- **Structured communication** – send, receive, and select patterns inspired by Go.
- **Remote capabilities** – `RemoteChannel`, `RemoteChannelClient`, `RemoteChannelServer`,
  `RemoteObject`, and `RpcProxy` for cross‑context RPC over channels.
- **Synchronization primitives** – `Mutex`, `Semaphore`, and `WaitGroup` for common concurrency patterns.

---

## Feature Highlights

- **Typed channels**
  - `Channel<T>` – buffered or unbuffered, blocking `send` / `receive` semantics.
  - `Channel.Read<T>` / `Channel.Write<T>` – separate read/write views to constrain APIs.
- **Cross‑channel communication**
  - `CrossChannel<TSend, TReceive>` – pair channels where send/receive types may differ.
  - `CrossChannel.createPair` – create bidirectionally connected channel pairs.
- **Remote communication**
  - `RemoteChannel` – use a `SimpleMessagePort` (compatible with browser, Node, Worker) to connect contexts.
  - `RemoteChannelClient` / `RemoteChannelServer` – high‑level helpers to negotiate and manage remote channels.
  - `RemoteObject` + `RpcProxy` – invoke methods on a remote object as if it were local.
- **Synchronization utilities**
  - `Mutex` – exclusive access to a shared resource.
  - `Semaphore` – weighted concurrency limiting with back‑pressure.
  - `WaitGroup` – fork‑join style coordination for asynchronous tasks.
- **First‑class TypeScript support**
  - Rich type definitions, overloads for timeouts and recovery, and helpers for extracting message types.

See the [Channel docs](https://rimbu.org/docs/channel/overview) and
[API reference](https://rimbu.org/api/rimbu/channel) for full details.

---

## Quick Start

### Basic in‑process channel

```ts
import { Channel } from '@rimbu/channel';

async function produce(ch: Channel.Write<number>) {
  for (let i = 0; i < 5; i++) {
    console.log('sending', i);
    await ch.send(i);
  }

  ch.close();
}

async function consume(ch: Channel.Read<number>) {
  let sum = 0;

  while (!ch.isExhausted) {
    const value = await ch.receive();
    console.log('received', value);
    sum += value;
  }

  console.log('sum', sum);
}

const ch = Channel.create<number>({ capacity: 2 });
produce(ch);
consume(ch);
```

### Selecting from multiple channels

```ts
import { Channel } from '@rimbu/channel';

const a = Channel.create<string>();
const b = Channel.create<string>();

// somewhere else, values are being sent to a and b

const value = await Channel.select([a, b], {
  timeoutMs: 1_000,
  recover: (err) => {
    console.warn('select failed:', err);
    return 'fallback';
  },
});

console.log('selected value:', value);
```

---

## Core Concepts & Types

### Exported Types

From the main entrypoint (`@rimbu/channel`):

| Name                                       | Description                                                                             |
| ------------------------------------------ | --------------------------------------------------------------------------------------- |
| `Channel<T>`                               | Bidirectional channel composed of `Channel.Read<T>` and `Channel.Write<T>`.             |
| `Channel.Read<T>`                          | Read‑only channel supporting blocking `receive` and async iteration over messages.      |
| `Channel.Write<T>`                         | Write‑only channel supporting blocking `send` and `sendAll`.                            |
| `Channel.Config`                           | Configuration for `Channel.create` (buffer capacity, message validator, etc.).          |
| `Channel.Error` / `ChannelError`           | Channel error type and associated error classes/utilities.                              |
| `CrossChannel<TS, TR>`                     | Channel where send and receive types can differ (`TS` vs `TR`).                         |
| `CrossChannel.Pair`                        | Tuple of two connected `CrossChannel`s for bidirectional communication.                 |
| `Mutex`                                    | Mutual‑exclusion primitive built on top of `Semaphore`.                                 |
| `Semaphore`                                | Weighted semaphore controlling concurrent access to a shared resource.                  |
| `Semaphore.Error` / `SemaphoreError`       | Semaphore error type and helpers.                                                       |
| `WaitGroup`                                | Fork‑join style synchronization primitive for tracking completion of multiple tasks.    |
| `RemoteChannel`                            | Factory for creating remote read, write, and cross channels over a `SimpleMessagePort`. |
| `RemoteChannelClient`                      | Client API for requesting remote channels from a server.                                |
| `RemoteChannelServer`                      | Server API that accepts remote channel creation requests from clients.                  |
| `RemoteObject`                             | Utility for exposing an object over a `CrossChannel` and accessing it remotely.         |
| `RemoteObject.Error` / `RemoteObjectError` | Remote object error type and helpers.                                                   |
| `RpcProxy<T>`                              | Typed proxy for building RPC calls as property access + function application paths.     |
| `RpcProxy.Error` / `RpcProxyError`         | RPC proxy error type and helpers.                                                       |

### Working with channels

```ts
import { Channel } from '@rimbu/channel';

// Create an unbuffered channel
const ch = Channel.create<number>();

// Type-safe write and read views
const write: Channel.Write<number> = ch.writable();
const read: Channel.Read<number> = ch.readable();

// Sending with timeout and error handling
const maybeError = await write.send(42, {
  timeoutMs: 500,
  catchChannelErrors: true,
});

if (maybeError) {
  console.warn('send failed with channel error:', maybeError);
}

// Receiving with recovery
const value = await read.receive({
  timeoutMs: 1_000,
  recover: (err) => {
    console.warn('receive failed:', err);
    return -1;
  },
});
```

See the full [Channel API docs](https://rimbu.org/api/rimbu/channel) for all operations and overloads.

---

## Remote Channels & Remote Objects

### Remote channels over a message port

`RemoteChannel` wraps a low‑level `RemoteChannel.SimpleMessagePort` (browser, Node, Worker‑like) to provide typed
channels across contexts:

```ts
import { RemoteChannel } from '@rimbu/channel';

// Assume `port` is a MessagePort-like object
const readCh = await RemoteChannel.createRead<string>(port, {
  channelId: 'example',
});

const writeCh = await RemoteChannel.createWrite<string>(port, {
  channelId: 'example',
});
```

For more structured scenarios, use `RemoteChannelClient` and `RemoteChannelServer` to negotiate channels dynamically.

### Remote objects via `RemoteObject` and `RpcProxy`

`RemoteObject` and `RpcProxy` allow you to call methods on a remote object as if it were local:

```ts
import { RemoteObject, RpcProxy, type CrossChannel } from '@rimbu/channel';

type Api = {
  getUser(id: string): Promise<{ id: string; name: string }>;
};

// On the client
declare const clientCh: RemoteObject.ClientCrossChannel;
const apiProxy: RpcProxy<Api> = RemoteObject.createClient<Api>(clientCh);

const user = await apiProxy.exec((api) => api.getUser('123'));
```

On the server, you expose an object via `RemoteObject.createServer` using the corresponding
`RemoteObject.ServerCrossChannel`.

---

## Synchronization Utilities

`@rimbu/channel` also exports common concurrency primitives:

```ts
import { Mutex, Semaphore, WaitGroup } from '@rimbu/channel';

// Mutex – exclusive access
const mutex = Mutex.create();
await mutex.acquire();
try {
  // critical section
} finally {
  mutex.release();
}

// Semaphore – weighted concurrency
const sem = Semaphore.create({ maxSize: 4 });
await sem.acquire(2);
// perform work...
sem.release(2);

// WaitGroup – fork-join style
const wg = WaitGroup.create();

wg.add(3);
doAsyncWork().finally(() => wg.done());
doAsyncWork().finally(() => wg.done());
doAsyncWork().finally(() => wg.done());

await wg.wait({ timeoutMs: 5_000 });
```

---

## Installation

### Node / Bun / npm / Yarn

```sh
npm install @rimbu/channel
# or
yarn add @rimbu/channel
# or
bun add @rimbu/channel
# or
deno add npm:@rimbu/channel
```

### Browser / ESM

`@rimbu/channel` ships both **ESM** and **CJS** builds. Use it with any modern bundler
(Vite, Webpack, esbuild, Bun, etc.) or directly in Node ESM projects.

---

## FAQ

**Q: Are channels synchronous or asynchronous?**  
Channels provide **asynchronous** APIs (`send`, `receive` return `Promise`s), but support **synchronous style**
coordination with blocking semantics and optional buffering.

**Q: What happens when a channel is full or empty?**  
`send` blocks (with optional timeout/abort) when the buffer is full; `receive` blocks when there are no messages.
You can use timeouts and abort signals to regain control.

**Q: How do errors surface?**  
Channel‑specific failures use typed error classes such as `Channel.Error.TimeoutError`,
`Channel.Error.ChannelClosedError`, etc. Helper functions like `Channel.Error.isChannelError`
let you safely detect them.

**Q: Can I iterate over a channel?**  
Yes. `Channel.Read<T>` implements `AsyncIterable<T>`, so you can use `for await...of` or convert to an Rimbu
`AsyncStream`.

---

## Ecosystem & Integration

- Part of the broader **Rimbu** ecosystem – interoperates with `@rimbu/common`, `@rimbu/stream`, and other
  collection packages.
- Ideal for modelling concurrent workflows, worker pools, message pipelines, and remote APIs.
- Works seamlessly with other Rimbu collections and utilities for building rich, immutable and concurrent data flows.

Explore more at the [Rimbu documentation](https://rimbu.org) and the
[Channel API docs](https://rimbu.org/api/rimbu/channel).

---

## Contributing

We welcome contributions! See the
[Contributing guide](https://github.com/rimbu-org/rimbu/blob/main/CONTRIBUTING.md) for details.

<img src="https://contrib.rocks/image?repo=rimbu-org/rimbu" alt="Contributors" />

_Made with [contributors-img](https://contrib.rocks)._

---

## License

MIT © Rimbu contributors. See [LICENSE](./LICENSE) for details.

---

## Attributions

Created and maintained by [Arvid Nicolaas](https://github.com/vitoke). Logo © Rimbu.
