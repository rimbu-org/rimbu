<p align="center">
    <img src="../../assets/rimbu_logo.svg" />
</p>

# @rimbu/common

This package exports common types and objects used in many other Rimbu packages.

Here is a brief overview:

| Name            | Description                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| `CollectFun`    | types and values used in various `collect` methods in the collection.                                    |
| `Comp`          | an interface and default implementations of comparison functions to order/sort values.                   |
| `Eq`            | an interface and default implementations of equality functions to check value equality                   |
| `Err`           | functions to easily create error throwing behavior as fallback values                                    |
| `FastIterable`  | an `Iterable` implementation that can be more performant than usual iterables                            |
| `IndexRange`    | utilities to select index ranges in indexed collections                                                  |
| `OptLazy`       | a utility to provide values that can optionally be lazy                                                  |
| `Range`         | utility types to specify ranges for comparable types                                                     |
| `Reducer`       | an API to create reusable pieces of logic that process streams of data that can be processed in parallel |
| `TraverseState` | a utility for loops to maintain the traversal state                                                      |
| `Update`        | a standard way to update a value                                                                         |

Other than these values, there are a number of utility types that are exported that are also used throughout the collection.

For complete documentation please visit the _[Rimbu Docs](http://rimbu.org)_.

Or [Try Me Out](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

All types are exported through `@rimbu/core`. It is recommended to use this package.

To install separately:

> `yarn add @rimbu/common`

or

> `npm i @rimbu/common`

## Usage

```ts
import { Eq } from '@rimbu/common';

console.log(Eq.stringCaseInsentitive()('abc', 'AbC'));
// => true
```

## Author

[Arvid Nicolaas](https://github.com/vitoke)

## Contributing

Feel very welcome to contribute to further improve Rimbu. Please read our [Contributing guide](../../CONTRIBUTING.md).

## Contributors

<img src = "https://contrib.rocks/image?repo=vitoke/iternal"/>

Made with [contributors-img](https://contrib.rocks).

## License

Licensed under the MIT License, Copyright © 2020-present Arvid Nicolaas.

See [LICENSE](./LICENSE) for more information.
