<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

[![npm version](https://badge.fury.io/js/@rimbu%2Fmultiset.svg)](https://www.npmjs.com/package/@rimbu/multiset) [![Deno](https://shield.deno.dev/x/rimbu)](http://deno.land/x/rimbu)

![Licence](https://img.shields.io/github/license/rimbu-org/rimbu)

# @rimbu/multiset

Welcome to `@rimbu/multiset`! A Rimbu MultiSet is a powerful Set-like structure where each unique element can be added multiple times. It keeps track of the number of occurrences of each element, making it ideal for scenarios where element frequency matters.

### Key Features:

- **Multiple Occurrences**: Each element can occur one or more times.
- **Frequency Tracking**: Efficiently keeps track of how many times each element was added.
- **Flexible Implementations**: Choose between hashed and sorted implementations based on your needs.

### Exported Types:

| Name                 | Description                                        |
| -------------------- | -------------------------------------------------- |
| `HashMultiSet<T>`    | A MultiSet with hashed elements of type `T`.       |
| `MultiSet<T>`        | A generic MultiSet with elements of type `T`.      |
| `SortedMultiSet<T>`  | A MultiSet with sorted elements of type `T`.       |
| `VariantMultiSet<T>` | A type-variant MultiSet with elements of type `T`. |

### Documentation

For complete documentation, please visit the [MultiSet page](https://rimbu.org/docs/collections/multiset) in the [Rimbu Docs](https://rimbu.org), or directly explore the [Rimbu MultiSet API Docs](https://rimbu.org/api/rimbu/multiset).

### Try It Out

Experience `@rimbu/multiset` in action! [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) on CodeSandBox.

## Installation

### Compabitity

- [`Node` ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org)
- [`Deno` ![Deno JS](https://img.shields.io/badge/deno%20js-000000?logo=deno&logoColor=white)](https://deno.com/runtime)
- [`Bun` ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logoColor=white)](https://bun.sh/)
- `Web` ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?logoColor=white)

### Package Managers

**Yarn:**

```sh
yarn add @rimbu/multiset
```

**npm:**

```sh
npm install @rimbu/multiset
```

**Bun:**

```sh
bun add @rimbu/multiset
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
import { SortedMultiSet } from '@rimbu/multiset';

console.log(SortedMultiSet.of(1, 3, 2, 3, 2, 3).toString());
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
