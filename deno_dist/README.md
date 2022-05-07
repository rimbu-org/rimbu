<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

[![codecov](https://codecov.io/gh/rimbu-org/rimbu/branch/main/graph/badge.svg?token=RSFK5B0N0Z)](https://codecov.io/gh/rimbu-org/rimbu)

# Immutable collections and tools for TypeScript

Rimbu is a TypeScript library focused on _immutable, performant, and type-safe collections_ and other tools. Its main aim is to allow programmers to create safe and performant programs without getting in the way. It is inspired by various other collection libraries, mainly Java's Guava library, the Java 8 Collection library, and Scala's collection library plus various ideas from the Scala community.

## Quick overview of features and benefits

- Extensive set of collection types to cover many problems that would otherwise require more coding to solve.
- Advanced typing uses the TS compiler to offer strict type inference without much explicit typing, and to prove collection non-emptiness.
- Avoid 'monad' style programming / chaining (e.g. using types like Option) by offering flexible fallback options for simple methods that can 'fail'.
- No external dependencies.
- Provides sane defaults but allows extensive customization and configuration.
- A novel and efficient immutable random-access List implementation.

For complete documentation please visit the _[Rimbu Docs](https://rimbu.org)_ or the _[Rimbu API Docs](https://rimbu.org/api)_.

Or [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Main exports

The main exported packages are:

| Name                                                 | Description                                                                                                                                  |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [@rimbu/bimap](packages/bimap)                       | a bidirectional map in which keys and values have a one-to-one mapping                                                                       |
| [@rimbu/bimultimap](packages/bimultimap)             | a bidirectional multimap in which keys and values have a many-to-many mapping                                                                |
| [@rimbu/collection-types](packages/collection-types) | definitions for many of the generic collection types, used to derive more specific implementations                                           |
| [@rimbu/common](packages/common)                     | contains public types and functions that are used throughout the whole library                                                               |
| [@rimbu/core](packages/core)                         | a convenience package that exports most of the main types from the other packages                                                            |
| [@rimbu/deep](packages/deep)                         | offers tools to use handle plain JS objects as immutable objects. library                                                                    |
| [@rimbu/graph](packages/graph)                       | provides various graph implementations to represent data in forms of nodes and edges                                                         |
| [@rimbu/hashed](packages/hashed)                     | provides a HashMap and HashSet implementation, using hash functions to efficiently retrieve keys                                             |
| [@rimbu/list](packages/list)                         | provides the List datastructure containing an ordered sequence of elements that can be manipulated and accessed randomly in an efficient way |
| [@rimbu/multimap](packages/multimap)                 | provides a map in which keys and values have a one-to-many mapping                                                                           |
| [@rimbu/multiset](packages/multiset)                 | provides a set in which elements can occur multiple times                                                                                    |
| [@rimbu/ordered](packages/ordered)                   | provides the OrderedSet and OrderedMap collections, that keep insertion order                                                                |
| [@rimbu/sorted](packages/sorted)                     | provides a SortedMap and SortedSet implementation, using compare functions to efficiently keep the elements sorted                           |
| [@rimbu/stream](packages/stream)                     | contains methods to easily manipulate sequences of data                                                                                      |
| [@rimbu/table](packages/table)                       | provides various Table data structures where a combination of a row key and column key maps to a single                                      |

## Development: Getting started with this monorepo

1. Clone this repository
2. Run `yarn setup`

To build all the packages: `yarn build`
To run the tests: `yarn test`

## Author

[Arvid Nicolaas](https://github.com/vitoke)

## Contributing

Feel very welcome to contribute to further improve Rimbu. Please read our [Contributing guide](/CONTRIBUTING.md).

## Contributors

<img src = "https://contrib.rocks/image?repo=vitoke/iternal"/>

Made with [contributors-img](https://contrib.rocks).

## License

Licensed under the MIT License, Copyright © 2020-present Arvid Nicolaas.

See [LICENSE](./LICENSE) for more information.
