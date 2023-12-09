<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

[![npm version](https://badge.fury.io/js/@rimbu%2Fcore.svg)](https://www.npmjs.com/package/@rimbu/core) [![Deno](https://shield.deno.dev/x/rimbu)](http://deno.land/x/rimbu)

![Licence](https://img.shields.io/github/license/rimbu-org/rimbu) [![codecov](https://codecov.io/gh/rimbu-org/rimbu/branch/main/graph/badge.svg?token=RSFK5B0N0Z)](https://codecov.io/gh/rimbu-org/rimbu)

# Immutable collections and tools for TypeScript

Rimbu is a TypeScript library focused on _immutable, performant, and type-safe collections_ and more. It offers a powerful and efficient way to work with data in a safe and predictable manner. With Rimbu, you can easily create and manipulate collections of data, such as lists and maps, without the risk of accidentally modifying the original data. This not only ensures data integrity, but also makes it easier to reason about your code and catch bugs early on. Plus, our library is fully compatible with TypeScript, providing you with improved type safety and a seamless development experience. Get started with our immutable collections library today and experience the benefits of working with truly immutable data.

## Quick overview of features and benefits

- Ensures data integrity by preventing accidental modifications to original data
- Makes it easier to reason about your code and catch bugs early on
- Provides improved type safety through full compatibility with TypeScript
- Offers a seamless development experience
- Increases performance by reducing the need for deep copies
- Enables functional programming techniques such as immutability-based change detection and simpler undo/redo
- Encourages the use of immutable data structures which has benefits in concurrent and parallel programming
- Simplifies testing by eliminating the need to account for side-effects
- Available for Web, Node.js and Deno.

For complete documentation please visit the _[Rimbu Docs](https://rimbu.org)_ or the _[Rimbu API Docs](https://rimbu.org/api)_.

Or [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

### Compabitity

- [`Node >= 16` ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org)
- [`Deno` ![Deno JS](https://img.shields.io/badge/deno%20js-000000?logo=deno&logoColor=white)](https://deno.com/runtime)
- [`Bun >= 0.6.0` ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logoColor=white)](https://bun.sh/)
- `Web` ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?logoColor=white)

To get started with the immutable collections, which are exported through `@rimbu/core`, you can use the following.

### Yarn / NPM / Bun

For `yarn`:

> `yarn add @rimbu/core`

For `npm`:

> `npm i @rimbu/core`

For `bun`:

> `bun add @rimbu/core`

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

## Main exports

The main exported packages are:

| Name                                                 | Description                                                                                                                                  |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [@rimbu/bimap](./rimbu/bimap)                       | a bidirectional map in which keys and values have a one-to-one mapping                                                                       |
| [@rimbu/bimultimap](./rimbu/bimultimap)             | a bidirectional multimap in which keys and values have a many-to-many mapping                                                                |
| [@rimbu/collection-types](./rimbu/collection-types) | definitions for many of the generic collection types, used to derive more specific implementations                                           |
| [@rimbu/common](./rimbu/common)                     | contains public types and functions that are used throughout the whole library                                                               |
| [@rimbu/core](./rimbu/core)                         | a convenience package that exports most of the main types from the other packages                                                            |
| [@rimbu/deep](./rimbu/deep)                         | offers tools to use handle plain JS objects as immutable objects. library                                                                    |
| [@rimbu/graph](./rimbu/graph)                       | provides various graph implementations to represent data in forms of nodes and edges                                                         |
| [@rimbu/hashed](./rimbu/hashed)                     | provides a HashMap and HashSet implementation, using hash functions to efficiently retrieve keys                                             |
| [@rimbu/list](./rimbu/list)                         | provides the List datastructure containing an ordered sequence of elements that can be manipulated and accessed randomly in an efficient way |
| [@rimbu/multimap](./rimbu/multimap)                 | provides a map in which keys and values have a one-to-many mapping                                                                           |
| [@rimbu/multiset](./rimbu/multiset)                 | provides a set in which elements can occur multiple times                                                                                    |
| [@rimbu/ordered](./rimbu/ordered)                   | provides the OrderedSet and OrderedMap collections, that keep insertion order                                                                |
| [@rimbu/sorted](./rimbu/sorted)                     | provides a SortedMap and SortedSet implementation, using compare functions to efficiently keep the elements sorted                           |
| [@rimbu/stream](./rimbu/stream)                     | contains methods to easily manipulate sequences of data                                                                                      |
| [@rimbu/table](./rimbu/table)                       | provides various Table data structures where a combination of a row key and column key maps to a single                                      |

## Development: Getting started with this monorepo

1. Clone this repository
2. Run `yarn`

To build all the packages: `yarn build`
To run the tests: `yarn test`

## Author

[Arvid Nicolaas](https://github.com/vitoke)

## Contributing

Feel very welcome to contribute to further improve Rimbu. Please read our [Contributing guide](https://github.com/rimbu-org/rimbu/blob/main/CONTRIBUTING.md).

## Contributors

<img src = "https://contrib.rocks/image?repo=rimbu-org/rimbu"/>

Made with [contributors-img](https://contrib.rocks).

## Mentions

Special thanks go to:

- Github user [bglgwyng](https://github.com/bglgwyng) for being the very first Rimbu sponsor! Awesome!

## License

Licensed under the MIT License, Copyright © 2020-present Arvid Nicolaas.

See [LICENSE](./LICENSE) for more information.
