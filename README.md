<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

[![npm version](https://badge.fury.io/js/@rimbu%2Fcore.svg)](https://www.npmjs.com/package/@rimbu/core) [![Deno](https://shield.deno.dev/x/rimbu)](http://deno.land/x/rimbu)
![Licence](https://img.shields.io/github/license/rimbu-org/rimbu) [![codecov](https://codecov.io/gh/rimbu-org/rimbu/branch/main/graph/badge.svg?token=RSFK5B0N0Z)](https://codecov.io/gh/rimbu-org/rimbu)

# Rimbu: Immutable Collections and Tools for TypeScript

Welcome to **Rimbu**—your go-to TypeScript library for highly performant, type-safe, and immutable collections. With Rimbu, your data manipulation tasks become more efficient and predictable, offering enhanced data integrity and type safety.

## Why Choose Rimbu?

- **Data Integrity**: Prevent accidental modifications and safeguard your original data.
- **Debugging Made Easy**: Simplify reasoning about your code and catch bugs early.
- **Type Safety**: Full compatibility with TypeScript ensures robust code.
- **Performance Boost**: Reduce the need for deep copies.
- **Functional Programming**: Supports immutability-based change detection, undo/redo features, and safe concurrent programming.
- **Simplified Testing**: Eliminate side effects and simplify your tests.
- **Versatile**: Works seamlessly across Web, Node.js, Bun, and Deno environments.

## Quick Links

- 📚 [Rimbu Docs](https://rimbu.org)
- 🗂 [Rimbu API Docs](https://rimbu.org/api)
- 🎮 [Try Rimbu in CodeSandBox](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts)

## Installation

### Compatibility

- [`Node` ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org)
- [`Deno` ![Deno JS](https://img.shields.io/badge/deno%20js-000000?logo=deno&logoColor=white)](https://deno.com/runtime)
- [`Bun` ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logoColor=white)](https://bun.sh/)
- `Web` ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?logoColor=white)

### Package Managers

**Yarn:**

```sh
yarn add @rimbu/core
```

**npm:**

```sh
npm install @rimbu/core
```

**Bun:**

```sh
bun add @rimbu/core
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

## Main Packages

| Package                                              | Description                                                |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| [@rimbu/bimap](packages/bimap)                       | Bidirectional map with one-to-one key-value mapping        |
| [@rimbu/bimultimap](packages/bimultimap)             | Bidirectional multimap with many-to-many key-value mapping |
| [@rimbu/collection-types](packages/collection-types) | Generic collection types definitions                       |
| [@rimbu/common](packages/common)                     | Common types and functions across the library              |
| [@rimbu/core](packages/core)                         | Exports most main types from other packages                |
| [@rimbu/deep](packages/deep)                         | Tools for treating JS objects as immutable                 |
| [@rimbu/graph](packages/graph)                       | Graph implementations with nodes and edges                 |
| [@rimbu/hashed](packages/hashed)                     | HashMap and HashSet implementations                        |
| [@rimbu/list](packages/list)                         | Efficiently ordered sequence manipulations                 |
| [@rimbu/multimap](packages/multimap)                 | Map with one-to-many key-value mapping                     |
| [@rimbu/multiset](packages/multiset)                 | Set allowing multiple occurrences of elements              |
| [@rimbu/ordered](packages/ordered)                   | OrderedSet and OrderedMap collections                      |
| [@rimbu/sorted](packages/sorted)                     | SortedMap and SortedSet with efficient sorting             |
| [@rimbu/stream](packages/stream)                     | Data sequence manipulation methods                         |
| [@rimbu/table](packages/table)                       | Table structures with row and column key mapping           |

## Development Setup

1. Clone the repository.
2. Run `yarn` to install dependencies.
3. To build packages, use `yarn build`.
4. Run tests with `yarn test`.

## Author

Created and maintained by [Arvid Nicolaas](https://github.com/vitoke).

## Contributing

We welcome contributions! Please read our [Contributing guide](https://github.com/rimbu-org/rimbu/blob/main/CONTRIBUTING.md).

## Contributors

<img src = "https://contrib.rocks/image?repo=rimbu-org/rimbu"/>

_Made with [contributors-img](https://contrib.rocks)._

## Acknowledgements

Special thanks to [bglgwyng](https://github.com/bglgwyng) for being the first Rimbu sponsor. You're awesome!

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) for details.
