<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

[![npm version](https://badge.fury.io/js/@rimbu%2Fmultimap.svg)](https://www.npmjs.com/package/@rimbu/multimap) [![Deno](https://shield.deno.dev/x/rimbu)](http://deno.land/x/rimbu)

![Licence](https://img.shields.io/github/license/rimbu-org/rimbu)

# @rimbu/multimap

Welcome to `@rimbu/multimap`! A Rimbu MultiMap is a powerful data structure where each key can have one or more unique values, stored in a `Set`. This ensures that each key's associated values are unique and easily manageable.

### Key Features:

- **Multiple Values per Key**: Each key can map to multiple unique values.
- **Unique Values**: Values for each key are stored in a `Set`, ensuring uniqueness.
- **Flexible Implementations**: Choose between hashed and sorted implementations based on your needs.

### Exported Types:

| Name                              | Description                                                          |
| --------------------------------- | -------------------------------------------------------------------- |
| `HashMultiMapHashValue<K, V>`     | A multimap with hashed keys and hashed values.                       |
| `HashMultiMapSortedValue<K, V>`   | A multimap with hashed keys and sorted values.                       |
| `MultiMap<K, V>`                  | A generic multimap for keys of type `K` and values of type `V`.      |
| `SortedMultiMapHashValue<K, V>`   | A multimap with sorted keys and hashed values.                       |
| `SortedMultiMapSortedValue<K, V>` | A multimap with sorted keys and sorted values.                       |
| `VariantMultiMap<K, V>`           | A type-variant multimap for keys of type `K` and values of type `V`. |

### Documentation

For complete documentation, please visit the [MultiMap page](https://rimbu.org/docs/collections/multimap) in the [Rimbu Docs](https://rimbu.org), or directly explore the [Rimbu MultiMap API Docs](https://rimbu.org/api/rimbu/multimap).

### Try It Out

Experience `@rimbu/multimap` in action! [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) on CodeSandBox.

## Installation

### Compabitity

- [`Node` ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org)
- [`Deno` ![Deno JS](https://img.shields.io/badge/deno%20js-000000?logo=deno&logoColor=white)](https://deno.com/runtime)
- [`Bun` ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logoColor=white)](https://bun.sh/)
- `Web` ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?logoColor=white)

### Package Managers

**Yarn:**

```sh
yarn add @rimbu/multimap
```

**npm:**

```sh
npm install @rimbu/multimap
```

**Bun:**

```sh
bun add @rimbu/multimap
```

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
import { HashMultiMapHashValue } from '@rimbu/multimap';

console.log(HashMultiMapHashValue.of([1, 2], [1, 3], [2, 3]).toString());
```

## Usage

## Author

Created and maintained by [Arvid Nicolaas](https://github.com/vitoke).

## Contributing

We welcome contributions! Please read our [Contributing guide](https://github.com/rimbu-org/rimbu/blob/main/CONTRIBUTING.md).

## Contributors

<img src = "https://contrib.rocks/image?repo=rimbu-org/rimbu"/>

_Made with [contributors-img](https://contrib.rocks)._

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) for details.
