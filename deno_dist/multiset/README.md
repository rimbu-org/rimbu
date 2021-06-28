<p align="center">
    <img src="../../assets/rimbu_logo.svg" />
</p>

# @rimbu/multiset

A Rimbu MultiSet is a Set-like structure where each unique element can be added multiple times. Each element in the MultiSet occurs one or more times. The MultiSet keeps track of the amount of times an element was added.

This package exports the following main types:

| Name                 | Description                                     |
| -------------------- | ----------------------------------------------- |
| `HashMultiSet<T>`    | a MultiSet with hashed elements of type T       |
| `MultiSet<T>`        | a generic MultiSet with elements of type T      |
| `SortedMultiSet<T>`  | a MultiSet with sorted elements of type T       |
| `VariantMultiSet<T>` | a type-variant MultiSet with elements of type T |

For complete documentation please visit the _[Rimbu Docs](http://rimbu.org)_.

## Installation

All types are exported through [`@rimbu/core`](../core). It is recommended to use this package.

To install separately:

> `yarn add @rimbu/multiset`

or

> `npm i @rimbu/multiset`

### recommended tsconfig settings

Rimbu uses advanced and recursive typing, potentially making the TypeScript compiler quite slow in some cases, or causing infinite recursion. It is recommended to set the following values in the `tsconfig.json` file of your project:

```json
{
  //  ...
  "compilerOptions": {
    // ...
    "skipLibCheck": true,
    "noStrictGenericChecks": true
  }
}
```

## Usage

```ts
import { SortedMultiSet } from '@rimbu/multiset';

console.log(SortedMultiSet.of(1, 3, 2, 3, 2, 3).toString());
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
