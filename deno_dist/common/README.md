<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

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

For complete documentation please visit the _[Rimbu Docs](http://rimbu.org)_.

Or [Try Me Out](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

All types are exported through `@rimbu/core`. It is recommended to use that package.

To install this package separately:

### Yarn/NPM

> `yarn add @rimbu/common`

or

> `npm i @rimbu/common`

### Deno

Create a file called `rimbu.ts` and add the following:

> ```ts
> export * from 'https://deno.land/x/rimbu/common/mod.ts';
> ```

Or using a pinned version (`x.y.z`):

> ```ts
> export * from 'https://deno.land/x/rimbu/common@x.y.z/mod.ts';
> ```

Then import what you need from `rimbu.ts`:

```ts
import { Eq } from './rimbu.ts';
```

Because Rimbu uses complex types, it's recommended to use the `--no-check` flag (your editor should already have checked your code) and to specify a `tsconfig.json` file with the settings described below.

Running your script then becomes:

> `deno run --no-check --config tsconfig.json <your-script>.ts`

## Recommended `tsconfig.json` settings

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
import { Eq } from '@rimbu/common';

console.log(Eq.stringCaseInsentitive()('abc', 'AbC'));
// => true
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
