<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

[![codecov](https://codecov.io/gh/rimbu-org/rimbu/branch/main/graph/badge.svg?token=RSFK5B0N0Z)](https://codecov.io/gh/rimbu-org/rimbu)

[![nest.land](https://nest.land/badge-block.svg)](https://nest.land/package/rimbu)

# Immutable collections and tools for TypeScript

Rimbu is a TypeScript library focused on _immutable, performant, and type-safe collections_ and other tools. Its main aim is to allow programmers to create safe and performant programs without getting in the way. It is inspired by various other collection libraries, mainly Java's Guava library, the Java 8 Collection library, and Scala's collection library plus various ideas from the Scala community.

## Quick overview of features and benefits

- Extensive set of collection types to cover many problems that would otherwise require more coding to solve.
- Strongly typed API: compiler wil prevent common errors and guide you towards safe code.
- No external dependencies.
- Available for Web, Node.js and Deno.
- Provides sane defaults but allows extensive customization and configuration.

For complete documentation please visit the _[Rimbu Docs](https://rimbu.org)_ or the _[Rimbu API Docs](https://rimbu.org/api)_.

Or [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

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
2. Run `yarn setup`

To build all the packages: `yarn build`
To run the tests: `yarn test`

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
