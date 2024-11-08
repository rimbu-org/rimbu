<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

[![npm version](https://badge.fury.io/js/@rimbu%2Fproximity.svg)](https://www.npmjs.com/package/@rimbu/proximity) [![Deno](https://shield.deno.dev/x/rimbu)](http://deno.land/x/rimbu)

![Licence](https://img.shields.io/github/license/rimbu-org/rimbu)

# @rimbu/proximity

Welcome to `@rimbu/proximity`! This package provides proximity-based collections, with the `ProximityMap` type being the highlight. These collections use a configurable `DistanceFunction` to determine the proximity of values or objects, making them ideal for scenarios where spatial relationships matter.

### Key Features:

- **Proximity-Based Mapping**: Use a `DistanceFunction` to compare keys based on their proximity.
- **Flexible Configurations**: Customize how proximity is calculated to suit your specific needs.

### Exported Types:

| Name                 | Description                                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| `ProximityMap<K, V>` | A map with entries of key type `K` and value type `V`, where keys are compared via a `DistanceFunction`. |

### Documentation

For complete documentation, please visit the [Map](https://rimbu.org/docs/collections/map) page in the [Rimbu Docs](https://rimbu.org), or directly explore the [Rimbu Proximity API Docs](https://rimbu.org/api/rimbu/proximity).

### Try It Out

Experience `@rimbu/proximity` in action! [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) on CodeSandBox.

## Installation

### Compabitity

- [`Node` ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org)
- [`Deno` ![Deno JS](https://img.shields.io/badge/deno%20js-000000?logo=deno&logoColor=white)](https://deno.com/runtime)
- [`Bun` ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logoColor=white)](https://bun.sh/)
- `Web` ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?logoColor=white)

### Package Managers

**Yarn:**

```sh
yarn add @rimbu/proximity
```

**npm:**

```sh
npm install @rimbu/proximity
```

**Bun:**

```sh
bun add @rimbu/proximity
```

### Deno Setup

Create or edit `import_map.json` in your project root:

```json
{
  "imports": {
    "@rimbu/": "https://deno.land/x/rimbu@x.y.z/"
  }
}
```

_Replace `x.y.z` with the desired version._

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

Created and maintained by [Arvid Nicolaas](https://github.com/vitoke) and [Gianluca Costa](https://gianlucacosta.info).

## Contributing

We welcome contributions! Please read our [Contributing guide](https://github.com/rimbu-org/rimbu/blob/main/CONTRIBUTING.md).

## Contributors

<img src = "https://contrib.rocks/image?repo=rimbu-org/rimbu"/>

_Made with [contributors-img](https://contrib.rocks)._

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) for details.
