<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

[![npm version](https://badge.fury.io/js/@rimbu%2Fbimap.svg)](https://www.npmjs.com/package/@rimbu/bimap) [![Deno](https://shield.deno.dev/x/rimbu)](http://deno.land/x/rimbu)

![Licence](https://img.shields.io/github/license/rimbu-org/rimbu)

# @rimbu/bimap

Welcome to `@rimbu/bimap`! A BiMap is a powerful bidirectional map that ensures a one-to-one mapping between keys and values. Each key is associated with exactly one value, and each value is associated with exactly one key.

### Key Features:

- **Bidirectional Mapping**: Effortlessly navigate between keys and values.
- **Unique Associations**: Guarantees unique key-value pairs, ensuring data integrity.

### Exported Types:

| Name                | Description                                                                             |
| ------------------- | --------------------------------------------------------------------------------------- |
| `BiMap<K, V>`       | A generic BiMap for keys of type `K` and values of type `V`.                            |
| `HashBiMap<K, V>`   | A BiMap where both keys and values are hashed for efficient lookups.                    |
| `SortedBiMap<K, V>` | A BiMap where both keys and values are sorted, providing ordered traversal and lookups. |

### Documentation

For complete documentation, please visit the [BiMap page](https://rimbu.org/docs/collections/bimap) in the [Rimbu Docs](https://rimbu.org), or directly explore the [Rimbu BiMap API Docs](https://rimbu.org/api/rimbu/bimap).

### Try It Out

Experience `@rimbu/bimap` in action! [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) on CodeSandBox.

## Installation

### Compabitity

- [`Node` ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org)
- [`Deno` ![Deno JS](https://img.shields.io/badge/deno%20js-000000?logo=deno&logoColor=white)](https://deno.com/runtime)
- [`Bun` ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logoColor=white)](https://bun.sh/)
- `Web` ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?logoColor=white)

### Package Managers

**Yarn:**

```sh
yarn add @rimbu/bimap
```

**npm:**

```sh
npm install @rimbu/bimap
```

**Bun:**

```sh
bun add @rimbu/bimap
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
import { HashBiMap } from '@rimbu/bimap';

const biMap = HashBiMap.of([1, 'a'], [2, 'b'], [3, 'b']);
console.log(biMap.toString());
// HashBiMap(3 -> b)
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
