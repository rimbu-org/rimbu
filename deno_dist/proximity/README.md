<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

[![npm version](https://badge.fury.io/js/@rimbu%2Fproximity.svg)](https://www.npmjs.com/package/@rimbu/proximity) [![Deno](https://shield.deno.dev/x/rimbu)](http://deno.land/x/rimbu)

![Licence](https://img.shields.io/github/license/rimbu-org/rimbu)

# @rimbu/proximity

This package contains all Rimbu proximity-based collections - especially the `ProximityMap` type. The collections use a configurable `DistanceFunction` to determine the proximity of values/objects.

This package exports the following main types:

| Name                 | Description                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| `ProximityMap<K, V>` | a map with entries of key type K and value type V, where keys are compared via a `DistanceFunction` |

For complete documentation please visit the [Map](https://rimbu.org/docs/collections/map) page _[Rimbu Docs](https://rimbu.org)_, or directly see the _[Rimbu Proximity API Docs](https://rimbu.org/api/rimbu/proximity)_.

Or [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

### Compabitity

- [`Node >= 16` ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org)
- [`Deno` ![Deno JS](https://img.shields.io/badge/deno%20js-000000?logo=deno&logoColor=white)](https://deno.com/runtime)
- [`Bun >= 0.6.0` ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logoColor=white)](https://bun.sh/)
- `Web` ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?logoColor=white)

### Yarn / NPM / Bun

To install this package only:

For `yarn`:

> `yarn add @rimbu/proximity`

For `npm`:

> `npm i @rimbu/proximity`

For `bun`:

> `bun add @rimbu/proximity`

### Deno

For Deno, the following approach is recommended:

In the root folder of your project, create or edit a file called `import_map.json` with the following contents (where you should replace `x.y.z` with the desired version of Rimbu):

```json
{
  "imports": {
    "@rimbu/": "https://deno.land/x/rimbu@x.y.z/"
  }
}
```

**Note: The trailing slashes are important!**

In this way you can use relative imports from Rimbu in your code, like so:

```ts
import { List } from '@rimbu/core/mod.ts';
import { ProximityMap } from '@rimbu/proximity/mod.ts';
```

Note that for sub-packages, due to conversion limitations it is needed to import the `index.ts` instead of `mod.ts`, like so:

```ts
import { ProximityMap } from '@rimbu/proximity/map/index.ts';
```

To run your script (let's assume the entry point is in `src/main.ts`):

`deno run --import-map import_map.json src/main.ts`

## Usage

```ts
import { ProximityMap } from '@rimbu/proximity';

console.log(
  ProximityMap.from([
    [1, 'A'],
    [2, 'B'],
  ]).toString()
);
```

## Author

[Arvid Nicolaas](https://github.com/vitoke)

[Gianluca Costa](https://gianlucacosta.info)

## Contributing

Feel very welcome to contribute to further improve Rimbu. Please read our [Contributing guide](https://github.com/rimbu-org/rimbu/blob/main/CONTRIBUTING.md).

## Contributors

<img src = "https://contrib.rocks/image?repo=rimbu-org/rimbu"/>

Made with [contributors-img](https://contrib.rocks).

## License

Licensed under the MIT License, Copyright © 2020-present Arvid Nicolaas.

See [LICENSE](./LICENSE) for more information.
