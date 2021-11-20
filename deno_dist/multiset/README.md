<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

# @rimbu/multiset

A Rimbu MultiSet is a Set-like structure where each unique element can be added multiple times. Each element in the MultiSet occurs one or more times. The MultiSet keeps track of the amount of times an element was added.

This package exports the following main types:

| Name                 | Description                                     |
| -------------------- | ----------------------------------------------- |
| `HashMultiSet<T>`    | a MultiSet with hashed elements of type T       |
| `MultiSet<T>`        | a generic MultiSet with elements of type T      |
| `SortedMultiSet<T>`  | a MultiSet with sorted elements of type T       |
| `VariantMultiSet<T>` | a type-variant MultiSet with elements of type T |

For complete documentation please visit the [MultiSet page](https://rimbu.org/docs/collections/multiset) in the _[Rimbu Docs](https://rimbu.org)_.

Or [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

All types are exported through [`@rimbu/core`](../core). It is recommended to use that package.

To install separately:

### Yarn/NPM

> `yarn add @rimbu/multiset`

or

> `npm i @rimbu/multiset`

### Deno

Create a file called `rimbu.ts` and add the following:

> ```ts
> export * from 'https://deno.land/x/rimbu/multiset/mod.ts';
> ```

Or using a pinned version (`x.y.z`):

> ```ts
> export * from 'https://deno.land/x/rimbu/multiset@x.y.z/mod.ts';
> ```

Then import what you need from `rimbu.ts`:

```ts
import { HashMultiSet } from './rimbu.ts';
```

Because Rimbu uses complex types, it's recommended to use the `--no-check` flag (your editor should already have checked your code) and to specify a `tsconfig.json` file with the settings described below.

Running your script then becomes:

> `deno run --no-check --config tsconfig.json <your-script>.ts`

## Usage

```ts
import { SortedMultiSet } from '@rimbu/multiset';

console.log(SortedMultiSet.of(1, 3, 2, 3, 2, 3).toString());
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
