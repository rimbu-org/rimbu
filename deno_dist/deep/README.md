<p align="center">
    <img src="../../assets/rimbu_logo.svg" />
</p>

# @rimbu/deep

Offers tools to use handle plain JS objects as immutable objects.

For complete documentation please visit the _[Rimbu Docs](http://rimbu.org)_.

## Installation

> `yarn add @rimbu/deep`

or

> `npm i @rimbu/deep`

### recommended tsconfig.json settings

Rimbu uses advanced and recursive typing, potentially making the TS compiler quite slow. It is recommended to set the following values in the `tsconfig.json` file of your project:

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
import { Patch } from '@rimbu/deep';

console.log(
  Patch({
    a: 'a',
    b: { c: 1, d: true },
  })({
    a: 'q',
    b: { c: (v) => v + 1 },
  })
);
// => { a: 'q', b: { c: 2, d: true }}
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
