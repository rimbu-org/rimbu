<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

# @rimbu/table-sorted-row

A `Table` is an immutable 2-dimensional Map, containing row keys and column keys, where a combination of a row and column key can contain one value.

This package contains the sorted row implementations of Table. It was mainly split off from the `@rimbu/table` package to reduce build time and memory usage.

This package exports the following main types:

| Name                               | Description                                                            |
| ---------------------------------- | ---------------------------------------------------------------------- |
| `SortedTableHashColumn<R, C, V>`   | a `Table` where the row keys are sorted and the column keys are hashed |
| `SortedTableSortedColumn<R, C, V>` | a `Table` where the row keys and column keys are sorted                |

For complete documentation please visit the _[Rimbu Docs](http://rimbu.org)_.

Or [Try Me Out](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

All types are exported through [`@rimbu/core`](../core). It is recommended to use that package.

To install separately:

### Yarn/NPM

> `yarn add @rimbu/table-sorted-row`

or

> `npm i @rimbu/table-sorted-row`

### Deno

Create a file called `rimbu.ts` and add the following:

> ```ts
> export * from 'https://deno.land/x/rimbu/table-sorted-row/mod.ts';
> ```

Or using a pinned version (`x.y.z`):

> ```ts
> export * from 'https://deno.land/x/rimbu/table-sorted-row@x.y.z./mod.ts';
> ```

Then import what you need from `rimbu.ts`:

```ts
import { SortedTableHashColumn } from './rimbu.ts';
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
import { SortedTableSortedColumn } from '@rimbu/table-sorted-row';

console.log(
  SortedTableSortedColumn.of([1, 'a', true], [1, 'b', false]).toString()
);
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
