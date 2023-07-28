<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

[![npm version](https://badge.fury.io/js/@rimbu%2Fordered.svg)](https://www.npmjs.com/package/@rimbu/ordered) [![Deno](https://shield.deno.dev/x/rimbu)](http://deno.land/x/rimbu)

![Licence](https://img.shields.io/github/license/rimbu-org/rimbu)

# @rimbu/channel

This package provides various channel implementation in the spirit of Go to allow synchronous or buffered one-to-one communication in an asynchronous context. The `Channel` offers communication between asynchronous processes in the same thread. `CrossChannel` consist of pairs of channels that allow different types of messages for sending and receiving. `RemoteChannel` offers communication between (worker) threads. `RemoteObject` offers a way to interact with a remote API/object as though it is available locally over a channel. `RemoteChannelServer` and `RemoteChannelClient` allow easy cross-thread creation of new channels. Finally, this package offers various cross-process synchronization utilities like `Mutex`, `Semaphore` and `WaitGroup`.

For complete documentation please visit the _[Rimbu Docs](https://rimbu.org)_, or directly see the _[Rimbu Core API Docs](https://rimbu.org/api/rimbu/channel)_.

## Installation

### Compabitity

- [`Node >= 16` ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org)
- [`Deno` ![Deno JS](https://img.shields.io/badge/deno%20js-000000?logo=deno&logoColor=white)](https://deno.com/runtime)
- [`Bun >= 0.6.0` ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logoColor=white)](https://bun.sh/)
- `Web` ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?logoColor=white)

### Yarn / NPM / Bun

To install this package:

For `yarn`:

> `yarn add @rimbu/channel`

For `npm`:

> `npm i @rimbu/channel`

For `bun`:

> `bun add @rimbu/channel`

### Deno

For Deno, the following approach is recommended:

In the root folder of your project, create or edit a file called `import_map.json` with the following contents (where you should replace `x.y.z` with the desired version of Rimbu):

```json
{
  "imports": {
    "@rimbu/": "https://deno.land/x/rimbu@x.y.z/"
  }
}
```

**Note: The trailing slashes are important!**

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

[Arvid Nicolaas](https://github.com/vitoke)

## Contributing

Feel very welcome to contribute to further improve Rimbu. Please read our [Contributing guide](https://github.com/rimbu-org/rimbu/blob/main/CONTRIBUTING.md).

## Contributors

<img src = "https://contrib.rocks/image?repo=rimbu-org/rimbu"/>

Made with [contributors-img](https://contrib.rocks).

## License

Licensed under the MIT License, Copyright © 2020-present Arvid Nicolaas.

See [LICENSE](./LICENSE) for more information.
