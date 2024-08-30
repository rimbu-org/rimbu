<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

[![npm version](https://badge.fury.io/js/@rimbu%2Fordered.svg)](https://www.npmjs.com/package/@rimbu/ordered) [![Deno](https://shield.deno.dev/x/rimbu)](http://deno.land/x/rimbu)

![Licence](https://img.shields.io/github/license/rimbu-org/rimbu)

# @rimbu/ordered

Welcome to `@rimbu/ordered`! This package provides implementations of `OrderedMap` and `OrderedSet`, which are designed to maintain the insertion order of elements. These collections are wrappers around other `RMap` and `RSet` implementations, ensuring that iteration over the collections returns values in the order they were added.

### Key Features:

- **Insertion Order**: Maintains the order in which elements are added.
- **Flexible Wrappers**: Wraps around existing `RMap` and `RSet` implementations.
- **Efficient Iteration**: Iterating over the collections respects the insertion order.

### Exported Types:

| Name               | Description                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| `OrderedMap<K, V>` | A map with entries of key type `K` and value type `V`, where key insertion order is maintained. |
| `OrderedSet<T>`    | A set of value type `T` where insertion order is maintained.                                    |

### Documentation

For complete documentation, please visit the [Map](https://rimbu.org/docs/collections/map) or [Set](https://rimbu.org/docs/collections/set) pages in the [Rimbu Docs](https://rimbu.org), or directly explore the [Rimbu Ordered API Docs](https://rimbu.org/api/rimbu/ordered).

### Try It Out

Experience `@rimbu/ordered` in action! [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) on CodeSandBox.

## Installation

### Compabitity

- [`Node` ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org)
- [`Deno` ![Deno JS](https://img.shields.io/badge/deno%20js-000000?logo=deno&logoColor=white)](https://deno.com/runtime)
- [`Bun` ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logoColor=white)](https://bun.sh/)
- `Web` ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?logoColor=white)

### Package Managers

**Yarn:**

```sh
yarn add @rimbu/ordered
```

**npm:**

```sh
npm install @rimbu/ordered
```

**Bun:**

```sh
bun add @rimbu/ordered
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
import { OrderedHashSet } from '@rimbu/ordered';

console.log(OrderedHashSet.of(1, 3, 2, 3, 1).toString());
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
