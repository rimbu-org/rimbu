<p align="center">
    <img src="../../assets/rimbu_logo.svg" />
</p>

# @rimbu/bimap

A BiMap is a bidirectional Map of keys and values, where each key has exactly one value, and each value has exactly one key. There is a one-to-one mapping between keys and values.

This package exports the following types:

| Name                | Description                                                 |
| ------------------- | ----------------------------------------------------------- |
| `BiMap<K, V>`       | a generic BiMap between keys of type K and values of type V |
| `HashBiMap<K, V>`   | a BiMap implementation where keys and values are hashed     |
| `SortedBiMap<K, V>` | a BiMap implementation where keys and values are sorted     |

For complete documentation please visit the _[Rimbu Docs](http://rimbu.org/rimbu-core)_.

## Installation

All types are exported through [`@rimbu/core`](../core). It is recommended to use this package.

To install separately:

`yarn add @rimbu/bimap`

or

`npm i @rimbu/bimap`

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
import { HashBiMap } from '@rimbu/bimap';

const biMap = HashBiMap.of([1, 'a'], [2, 'b'], [3, 'b']);
console.log(biMap.toString());
// HashBiMap(3 -> b)
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
