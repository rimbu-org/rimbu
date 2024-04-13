<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

[![npm version](https://badge.fury.io/js/@rimbu%2Fcommon.svg)](https://www.npmjs.com/package/@rimbu/config) [![Deno](https://shield.deno.dev/x/rimbu)](http://deno.land/x/rimbu)

![Licence](https://img.shields.io/github/license/rimbu-org/rimbu)

# @rimbu/config

This package provides a simple but powerful way to create resources that can be used for configuration, internationalization, translation and more.

## Usage

For configuration:

```ts
import { Config } from '@rimbu/config';

const context = Config.context(['dev', 'prod']);

// this is fully type-checked
const config = context.compile({
  server: [{ dev: 'dev.rimbu.org', prod: 'rimbu.org' }],
  keys: {
    api1: [{ dev: 'abc123', prod: 'def345' }],
    port: [{ dev: 1234, prod: 4321 }],
  },
  tempPath: (subPath: string) => [
    { dev: `/tmp/${subPath}`, prod: `./__tmp__/${subPath}` },
  ],
});

const activeConfig = config.prod; // or config.dev

console.log(
  activeConfig.server,
  activeConfig.tempPath('myfile.out'),
  activeConfig.keys.api1,
  activeConfig.keys.port
);
// output:
// rimbu.org ./__tmp__/myfile.out def345 4321
```

Or translation:

```ts
import { Config, cond } from '@rimbu/config';

const context = Config.context(['en', 'es']);

const translations = context.compile({
  main: {
    hello: [{ en: 'Hello.', es: 'Hola.' }],
  },
  cart: {
    content: [{ en: 'Your cart contains:', es: 'Tu carrito contiene:'}]
    oranges: [
      {
        en: cond(
          [1, 'one orange'],
          [true, (amount) => `${amount} oranges`]
        ),
        es: cond(
          [1, 'una naranja'],
          [true, (amount) => `${amount} naranjas`]
        ),
      },
    ],
  },
});

type Translations = Config.InstanceType<typeof translations>

let t = translations.en
console.log(`${t.main.hello} ${t.cart.content} ${t.cart.oranges(1)}`)
// Hello. Your cart contains: one orange

```

## Package contents

Here is a brief overview of the exported items:

| Name     | Description                                                       |
| -------- | ----------------------------------------------------------------- |
| `Config` | Main entrypoint to create resources.                              |
| `cond`   | a utility function to facilitate conditional statements in config |
| `condFn` | a utility function to facilitate conditional statements in config |

For complete documentation please visit the _[Rimbu Docs](https://rimbu.org)_.

Or [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

### Compabitity

- [`Node` ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org)
- [`Deno` ![Deno JS](https://img.shields.io/badge/deno%20js-000000?logo=deno&logoColor=white)](https://deno.com/runtime)
- [`Bun` ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logoColor=white)](https://bun.sh/)
- `Web` ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?logoColor=white)

### Yarn / NPM / Bun

To install this package:

For `yarn`:

> `yarn add @rimbu/config`

For `npm`:

> `npm i @rimbu/config`

For `bun`:

> `bun add @rimbu/config`

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
import { Config } from '@rimbu/config/mod.ts';
```

To run your script (let's assume the entry point is in `src/main.ts`):

`deno run --import-map import_map.json src/main.ts`

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
