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

For complete documentation please visit the _[Rimbu Docs](http://rimbu.org)_.

Or [Try Me Out](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Main exports

The main exported projects are:

| Name                               | Description                                                                                           |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [@rimbu/core](packages/core)       | Immutable collections including `List`, `SortedMap`, `EdgeGraph`, `HashBiMultiMap` and many more.     |
| [@rimbu/actor](packages/actor)     | A framework-agnostic synchronous state management library that uses immutable objects under the hood. |
| [@rimbu/reactor](packages/reactor) | A framework that allows usage of `@rimbu/actor` objects in `React`.                                   |

## Getting started with this monorepo

1. Clone this repository
2. Run `yarn setup`

To build all the packages: `yarn build`
To start the Rimbu Docs locally: `yarn docsify`
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
