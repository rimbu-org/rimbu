<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

[![npm version](https://badge.fury.io/js/@rimbu%2Fcommon.svg)](https://www.npmjs.com/package/@rimbu/common) [![Deno](https://shield.deno.dev/x/rimbu)](http://deno.land/x/rimbu)

![Licence](https://img.shields.io/github/license/rimbu-org/rimbu)

# @rimbu/common

Welcome to `@rimbu/common`! This package exports essential types and utilities that are widely used across various Rimbu packages. It provides a robust foundation for building efficient and reliable applications.

### Overview of most important Exported Types:

| Name            | Description                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| `CollectFun`    | Types and values used in various `collect` methods within collections.                                |
| `Comp`          | Interface and default implementations of comparison functions for ordering/sorting values.            |
| `Eq`            | Interface and default implementations of equality functions for checking value equality.              |
| `Err`           | Functions to easily create error-throwing behavior as fallback values.                                |
| `FastIterable`  | An `Iterable` implementation that offers better performance than standard iterables.                  |
| `IndexRange`    | Utilities for selecting index ranges in indexed collections.                                          |
| `OptLazy`       | A utility to provide values that can optionally be lazy.                                              |
| `Range`         | Utility types to specify ranges for comparable types.                                                 |
| `Reducer`       | An API to create reusable logic pieces that process data streams, which can be processed in parallel. |
| `TraverseState` | A utility for loops to maintain traversal state.                                                      |
| `Update`        | A standard way to update a value.                                                                     |

### Documentation

For complete documentation, please visit the [Rimbu Docs](https://rimbu.org), or directly explore the [Rimbu Common API Docs](https://rimbu.org/api/rimbu/common).

### Try It Out

Experience `@rimbu/common` in action! [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) on CodeSandBox.

## Installation

### Compabitity

- [`Node` ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org)
- [`Deno` ![Deno JS](https://img.shields.io/badge/deno%20js-000000?logo=deno&logoColor=white)](https://deno.com/runtime)
- [`Bun` ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logoColor=white)](https://bun.sh/)
- `Web` ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?logoColor=white)

### Package Managers

**Yarn:**

```sh
yarn add @rimbu/common
```

**npm:**

```sh
npm install @rimbu/common
```

**Bun:**

```sh
bun add @rimbu/common
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
import { Eq } from '@rimbu/common';

console.log(Eq.stringCaseInsentitive()('abc', 'AbC'));
// => true
```

## Author

Created and maintained by [Arvid Nicolaas](https://github.com/vitoke).

## Contributing

We welcome contributions! Please read our [Contributing guide](https://github.com/rimbu-org/rimbu/blob/main/CONTRIBUTING.md).

## Contributors

<img src = "https://contrib.rocks/image?repo=rimbu-org/rimbu"/>

_Made with [contributors-img](https://contrib.rocks)._

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) for details.
