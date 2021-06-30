<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

# @rimbu/base

This package contains mostly utilities to implement the other Rimbu collections. The types are not exported by any of the other packages, but are internally used by most of them.

Most important are the exported `Arr` methods that are used at the basis of all the block-based data structures. These methods should be as correct and efficient as possible.

For complete documentation please visit the _[Rimbu Docs](http://rimbu.org)_.

## Installation

> `yarn add @rimbu/base`

or

> `npm install @rimbu/base`

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
import { Arr } from '@rimbu/base';

const arr = [1, 2, 3];
console.log(Arr.mod(arr, 1, (v) => v + 1));
// [1, 3, 3]

console.log(arr);
// [1, 2, 3]
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
