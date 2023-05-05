<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

[![npm version](https://badge.fury.io/js/@rimbu%2Fcommon.svg)](https://www.npmjs.com/package/@rimbu/common) [![Deno](https://shield.deno.dev/x/rimbu)](http://deno.land/x/rimbu)

![Licence](https://img.shields.io/github/license/rimbu-org/rimbu)

# @rimbu/common

This package exports common types and objects used in many other Rimbu packages.

Here is a brief overview:

| Name            | Description                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| `CollectFun`    | types and values used in various `collect` methods in the collection.                                    |
| `Comp`          | an interface and default implementations of comparison functions to order/sort values.                   |
| `Eq`            | an interface and default implementations of equality functions to check value equality                   |
| `Err`           | functions to easily create error throwing behavior as fallback values                                    |
| `FastIterable`  | an `Iterable` implementation that can be more performant than usual iterables                            |
| `IndexRange`    | utilities to select index ranges in indexed collections                                                  |
| `OptLazy`       | a utility to provide values that can optionally be lazy                                                  |
| `Range`         | utility types to specify ranges for comparable types                                                     |
| `Reducer`       | an API to create reusable pieces of logic that process streams of data that can be processed in parallel |
| `TraverseState` | a utility for loops to maintain the traversal state                                                      |
| `Update`        | a standard way to update a value                                                                         |

Other than these values, there are a number of utility types that are exported that are also used throughout the collection.

For complete documentation please visit the _[Rimbu Docs](https://rimbu.org)_, or directly see the _[Rimbu Common API Docs](https://rimbu.org/api/rimbu/common)_.

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

> `yarn add @rimbu/common`

For `npm`:

> `npm i @rimbu/common`

For `bun`:

> `bun add @rimbu/common`

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
import { Eq } from '@rimbu/common';

console.log(Eq.stringCaseInsentitive()('abc', 'AbC'));
// => true
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
