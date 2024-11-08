<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

[![npm version](https://badge.fury.io/js/@rimbu%2Fdeep.svg)](https://www.npmjs.com/package/@rimbu/deep) [![Deno](https://shield.deno.dev/x/rimbu)](http://deno.land/x/rimbu)

![Licence](https://img.shields.io/github/license/rimbu-org/rimbu)

# @rimbu/deep

Welcome to `@rimbu/deep`! This package offers powerful tools to handle plain JavaScript objects as immutable objects, making your code more robust and maintainable.

### Key Features:

- **Immutable Modification**: Use the [`Patch` object](https://rimbu.org/docs/deep/patch) for convenient and immutable modifications of simple objects.
- **Pattern Matching**: The [`Match` object](https://rimbu.org/docs/deep/match) allows easy pattern matching on plain objects.
- **Nested Value Querying**: Easily query nested values with the [`Path` object](https://rimbu.org/docs/deep/path).
- **Compile-Time Protection**: The [`Immutable` type](https://rimbu.org/docs/deep/immutable) helps create plain objects with compile-time protection against mutation.
- **Flexible Tuples**: The [`Tuple` type](https://rimbu.org/docs/deep/tuple) provides similar functionality to `as const` but with more flexibility.

### Documentation

For complete documentation, please visit the [Immutable Objects overview](https://rimbu.org/docs/deep/overview) in the [Rimbu Docs](https://rimbu.org), or directly explore the [Rimbu Deep API Docs](https://rimbu.org/api/rimbu/deep).

### Try It Out

Experience `@rimbu/deep` in action! [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) on CodeSandBox.

## Installation

### Compabitity

- [`Node` ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org)
- [`Deno` ![Deno JS](https://img.shields.io/badge/deno%20js-000000?logo=deno&logoColor=white)](https://deno.com/runtime)
- [`Bun` ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logoColor=white)](https://bun.sh/)
- `Web` ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?logoColor=white)

### Package Managers

**Yarn:**

```sh
yarn add @rimbu/deep
```

**npm:**

```sh
npm install @rimbu/deep
```

**Bun:**

```sh
bun add @rimbu/deep
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

Created and maintained by [Arvid Nicolaas](https://github.com/vitoke).

## Contributing

We welcome contributions! Please read our [Contributing guide](https://github.com/rimbu-org/rimbu/blob/main/CONTRIBUTING.md).

## Contributors

<img src = "https://contrib.rocks/image?repo=rimbu-org/rimbu"/>

_Made with [contributors-img](https://contrib.rocks)._

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) for details.
