<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

[![npm version](https://badge.fury.io/js/@rimbu%channel.svg)](https://www.npmjs.com/package/@rimbu/channel)
[![Deno](https://shield.deno.dev/x/rimbu)](http://deno.land/x/rimbu)
![Licence](https://img.shields.io/github/license/rimbu-org/rimbu)

# @rimbu/channel

Welcome to the `@rimbu/channel` package! This package brings you powerful channel implementations inspired by Go, designed to facilitate synchronous or buffered one-to-one communication in an asynchronous context.

### Key Features:

- **Channel**: Seamlessly communicate between asynchronous processes within the same thread.
- **CrossChannel**: Utilize pairs of channels for sending and receiving different types of messages.
- **RemoteChannel**: Enable communication between (worker) threads effortlessly.
- **RemoteObject**: Interact with remote APIs/objects as if they are available locally over a channel.
- **RemoteChannelServer & RemoteChannelClient**: Easily create new channels across threads.
- **Synchronization Utilities**: Leverage cross-process synchronization tools like `Mutex`, `Semaphore`, and `WaitGroup`.

### Why Use `@rimbu/channel`?

- **Simplicity**: Simplifies complex asynchronous communication patterns.
- **Flexibility**: Supports various communication models and synchronization mechanisms.
- **Efficiency**: Optimized for performance in concurrent environments.

For complete documentation, please visit the [Rimbu Docs](https://rimbu.org), or directly explore the [Rimbu Core API Docs](https://rimbu.org/api/rimbu/channel).

## Installation

### Compabitity

- [`Node` ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org)
- [`Deno` ![Deno JS](https://img.shields.io/badge/deno%20js-000000?logo=deno&logoColor=white)](https://deno.com/runtime)
- [`Bun` ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logoColor=white)](https://bun.sh/)
- `Web` ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?logoColor=white)

### Package Managers

**Yarn:**

```sh
yarn add @rimbu/channel
```

**npm:**

```sh
npm install @rimbu/channel
```

**Bun:**

```sh
bun add @rimbu/channel
```

### Deno Setup

Create or edit `import_map.json` in your project root:

```json
{
  "imports": {
    "@rimbu/": "https://deno.land/x/rimbu@x.y.z/"
  }
}
```

_Replace `x.y.z` with the desired version._

In this way you can use relative imports from Rimbu in your code, like so:

```ts
import { Channel } from '@rimbu/channel/mod.ts';
```

Note that for sub-packages, due to conversion limitations it is needed to import the `index.ts` instead of `mod.ts`, like so:

```ts
import { Channel } from '@rimbu/channel/custom/index.ts';
```

To run your script (let's assume the entry point is in `src/main.ts`):

`deno run --import-map import_map.json src/main.ts`

## Usage

```ts
import { Channel } from '@rimbu/channel';

async function produce(ch: Channel.Write<number>) {
  for (let i = 0; i < 6; i++) {
    console.log('sending', i);
    await ch.send(i);
    console.log('sent', i);
  }

  ch.close();
}

async function consume(ch: Channel.Read<number>) {
  let sum = 0;

  while (!ch.isExhausted) {
    console.log('receiving');
    const value = await ch.receive();
    console.log('received', value);
    sum += value;
  }

  console.log({ sum });
}

const channel = Channel.create<number>();
produce(channel);
consume(channel);
```

## Author

Created and maintained by [Arvid Nicolaas](https://github.com/vitoke).

## Contributing

We welcome contributions! Please read our [Contributing guide](https://github.com/rimbu-org/rimbu/blob/main/CONTRIBUTING.md).

## Contributors

<img src = "https://contrib.rocks/image?repo=rimbu-org/rimbu"/>

_Made with [contributors-img](https://contrib.rocks)._

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) for details.
