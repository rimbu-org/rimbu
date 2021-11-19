<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

# @rimbu/sorted

This package contains the implementation for the `SortedMap` and `SortedSet` types, which form the basis of all Rimbu Sorted collections. The collections use a `Comp` instance that is configurable to determine the equality and order of values/objects.

This package exports the following types:

| Name              | Description                                                                            |
| ----------------- | -------------------------------------------------------------------------------------- |
| `SortedMap<K, V>` | a map with entries of key type K and value type V, where keys are sorted with a `Comp` |
| `SortedSet<T>`    | a set of value type T where items are sorted with a `Comp`                             |

For complete documentation please visit the [Map](https://rimbu.org/docs/collections/map) or [Se](https://rimbu.org/docs/collections/set) page in the _[Rimbu Docs](https://rimbu.org)_.

Or [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

All types are exported through [`@rimbu/core`](../core). It is recommended to use that package.

To install separately:

### Yarn/NPM

> `yarn add @rimbu/sorted`

or

> `npm i @rimbu/sorted`

### Deno

Create a file called `rimbu.ts` and add the following:

> ```ts
> export * from 'https://deno.land/x/rimbu/sorted/mod.ts';
> ```

Or using a pinned version (`x.y.z`):

> ```ts
> export * from 'https://deno.land/x/rimbu/sorted@x.y.z/mod.ts';
> ```

Then import what you need from `rimbu.ts`:

```ts
import { SortedMap } from './rimbu.ts';
```

Because Rimbu uses complex types, it's recommended to use the `--no-check` flag (your editor should already have checked your code) and to specify a `tsconfig.json` file with the settings described below.

Running your script then becomes:

> `deno run --no-check --config tsconfig.json <your-script>.ts`

## Usage

```ts
import { SortedSet } from '@rimbu/sorted';

console.log(SortedSet.of(1, 3, 4, 2, 3).toString());
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
