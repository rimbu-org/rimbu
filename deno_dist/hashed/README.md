<p align="center">
    <img src="../../assets/rimbu_logo.svg" />
</p>

# @rimbu/hashed

This package contains the implementation for the `HashMap` and `HashSet` types, which form the basis of all Rimbu Hashed collections. The collections use a `Hasher` instance that is configurable to determine the equality of values/objects.

This package exports the following main types:

| Name            | Description                                                                              |
| --------------- | ---------------------------------------------------------------------------------------- |
| `HashMap<K, V>` | a map with entries of key type K and value type V, where keys are hashed with a `Hasher` |
| `HashSet<T>`    | a set of value type T where items are hashed with a `Hasher`                             |

For complete documentation please visit the _[Rimbu Docs](http://rimbu.org)_.

Or [Try Me Out](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

All types are exported through [`@rimbu/core`](../core). It is recommended to use this package.

To install separately:

> `yarn add @rimbu/hashed`

or

> `npm i @rimbu/hashed`

### recommended tsconfig settings

Rimbu uses advanced and recursive typing, potentially making the TypeScript compiler quite slow in some cases, or causing infinite recursion. It is recommended to set the following values in the `tsconfig.json` file of your project:

```json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "noStrictGenericChecks": true
  }
}
```

## Usage

```ts
import { HashSet } from '@rimbu/hashed';

console.log(HashSet.of(1, 3, 2, 4, 3, 1).toString());
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
