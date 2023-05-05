<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

[![npm version](https://badge.fury.io/js/@rimbu%2Fdeep.svg)](https://www.npmjs.com/package/@rimbu/deep) [![Deno](https://shield.deno.dev/x/rimbu)](http://deno.land/x/rimbu)

![Licence](https://img.shields.io/github/license/rimbu-org/rimbu)

# @rimbu/deep

Offers tools to use handle plain JS objects as immutable objects. The [`Patch` object](https://rimbu.org/docs/deep/patch) allows convenient immutable modification of simple objects. The [`Match` object](https://rimbu.org/docs/deep/match) allows easy matching on plain objects. The [`Path` object](https://rimbu.org/docs/deep/path) allows easy querying of nested values. The [`Immutable` type](https://rimbu.org/docs/deep/immutable) makes it easy to create plain objects that that have compile-time protection against mutation. The [`Tuple` type](https://rimbu.org/docs/deep/tuple) is a utility to have similar functionality as `as const` but less strict.

For complete documentation please visit the [Immutable Objects overview](https://rimbu.org/docs/deep/overview) in the _[Rimbu Docs](https://rimbu.org)_, or directly see the _[Rimbu Deep API Docs](https://rimbu.org/api/rimbu/deep)_.

Or [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

### Compabitity

- [`Node >= 16` ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org)
- [`Deno` ![Deno JS](https://img.shields.io/badge/deno%20js-000000?logo=deno&logoColor=white)](https://deno.com/runtime)
- [`Bun >= 0.6.0` ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logoColor=white)](https://bun.sh/)
- `Web` ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?logoColor=white)

### Yarn / NPM / Bun

For convenience, all main types are also exported through [`@rimbu/core`](../core).

To install this package only:

For `yarn`:

> `yarn add @rimbu/deep`

For `npm`:

> `npm i @rimbu/deep`

For `bun`:

> `bun add @rimbu/deep`

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
import { List } from '@rimbu/core/mod.ts';
import { HashMap } from '@rimbu/hashed/mod.ts';
```

Note that for sub-packages, due to conversion limitations it is needed to import the `index.ts` instead of `mod.ts`, like so:

```ts
import { HashMap } from '@rimbu/hashed/map/index.ts';
```

To run your script (let's assume the entry point is in `src/main.ts`):

`deno run --import-map import_map.json src/main.ts`

## Usage

```ts
import { patch } from '@rimbu/deep';

console.log(
  patch({
    a: 'a',
    b: { c: 1, d: true },
  })({
    a: 'q',
    b: { c: (v) => v + 1 },
  })
);
// => { a: 'q', b: { c: 2, d: true }}
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
