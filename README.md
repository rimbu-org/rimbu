<p align="center">
    <img src="assets/rimbu_logo.svg" />
</p>

# Immutable collections and tools for TypeScript

Rimbu consists of TypeScript projects focused on immutability. This is the monorepo for all Rimbu projects.

For complete documentation please visit the _[Rimbu Docs](http://rimbu.org)_.

The main projects are:

| Name                               | Description                                                                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [@rimbu/core](packages/core)       | Immutable collections including `List`, `SortedMap`, `EdgeGraph`, `HashBiMultiMap` and many more.                                           |
| [@rimbu/deep](packages/deep)       | Utilities to define immutable views on plain JS objects, and to easily handle and manipulate (e.g. create changed copies) of those objects. |
| [@rimbu/actor](packages/actor)     | A framework-agnostic synchronous state management library that uses immutable objects under the hood.                                       |
| [@rimbu/reactor](packages/reactor) | A framework that allows usage of `@rimbu/actor` objects in `React`.                                                                         |

## Getting started with this monorepo

1. Clone this repository
2. Run `yarn setup`

To build all the packages: `yarn build`
To start the Rimbu Docs locally: `yarn docsify`

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
