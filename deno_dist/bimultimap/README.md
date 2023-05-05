<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

[![npm version](https://badge.fury.io/js/@rimbu%2Fbimultimap.svg)](https://www.npmjs.com/package/@rimbu/bimultimap) [![Deno](https://shield.deno.dev/x/rimbu)](http://deno.land/x/rimbu)

![Licence](https://img.shields.io/github/license/rimbu-org/rimbu)

# @rimbu/bimultimap

A BiMultiMap is a bidirectional MultiMap of keys and values, where each key-value association also has an inverse value-key association. There is a many-to-many mapping between keys and values.

This package exports the following types:

| Name                     | Description                                                      |
| ------------------------ | ---------------------------------------------------------------- |
| `BiMultiMap<K, V>`       | a generic BiMultiMap between keys of type K and values of type V |
| `HashBiMultiMap<K, V>`   | a BiMultiMap implementation where keys and values are hashed     |
| `SortedBiMultiMap<K, V>` | a BiMultiMap implementation where keys and values are sorted     |

For complete documentation please visit the [BiMultiap page](https://rimbu.org/docs/collections/bimultimap) in the _[Rimbu Docs](https://rimbu.org)_, or directly see the _[Rimbu BiMultiMap API Docs](https://rimbu.org/api/rimbu/bimultimap)_.

Or [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

### Compabitity

- [`Node >= 16` ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org)
- [`Deno` ![Deno JS](https://img.shields.io/badge/deno%20js-000000?logo=deno&logoColor=white)](https://deno.com/runtime)
- [`Bun >= 0.6.0` ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logoColor=white)](https://bun.sh/)
- `Web` ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?logoColor=white)

### Yarn / NPM / Bun

For convenience, all main types are also exported through [`@rimbu/core`](../core).

To install this package only:

For `yarn`:

> `yarn add @rimbu/bimultimap`

For `npm`:

> `npm i @rimbu/bimultimap`

For `bun`:

> `bun add @rimbu/bimultimap`

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
import { HashMap } from '@rimbu/hashed/mod.ts';
```

Note that for sub-packages, due to conversion limitations it is needed to import the `index.ts` instead of `mod.ts`, like so:

```ts
import { HashMap } from '@rimbu/hashed/map/index.ts';
```

To run your script (let's assume the entry point is in `src/main.ts`):

`deno run --import-map import_map.json src/main.ts`

## Usage

```ts
import { HashBiMultiMap } from '@rimbu/bimultimap';

const biMultiMap = HashBiMultiMap.of([1, 'a'], [2, 'b'], [3, 'b']);
console.log(biMultiMap.toString());
// HashBiMultiMap(1 <-> ['a'], 2 <-> ['b'], 3 <-> ['b'])

console.log(biMultiMap.getValues(1).toArray());
// ['a']
console.log(biMultiMap.getKeys('b').toArray());
// [2, 3]
```

## Author

[Arvid Nicolaas](https://github.com/vitoke)

## Contributing

Feel very welcome to contribute to further improve Rimbu. Please read our [Contributing guide](https://github.com/rimbu-org/rimbu/blob/main/CONTRIBUTING.md).

## Contributors

<img src = "https://contrib.rocks/image?repo=rimbu-org/rimbu"/>

Made with [contributors-img](https://contrib.rocks).

## License

Licensed under the MIT License, Copyright © 2020-present Arvid Nicolaas.

See [LICENSE](./LICENSE) for more information.
