<p align="center">
    <img src="../../assets/rimbu_logo.svg" />
</p>

# @rimbu/actor

This package offers generic state management tools to create stateful logic that can be easily integrated in any framework.

For complete documentation please visit the _[Rimbu Docs](http://rimbu.org/rimbu-actor)_.

## Installation

`yarn add @rimbu/actor`

or

`npm i @rimbu/actor`

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
import { Obs } from '@rimbu/actor';

const obs = Obs.create({ count: 0, total: 0 });

obs.patchState({ count: (v) => v + 1 });
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
