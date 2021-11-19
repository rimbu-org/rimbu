<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

# @rimbu/bimap

A BiMap is a bidirectional Map of keys and values, where each key has exactly one value, and each value has exactly one key. There is a one-to-one mapping between keys and values.

This package exports the following types:

| Name                | Description                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `BiMap<K, V>`       | a generic BiMap between keys of type K and values of type V                                    |
| `HashBiMap<K, V>`   | a BiMap between keys of type K and values of type V, where both the keys and values are hashed |
| `SortedBiMap<K, V>` | a BiMap between keys of type K and values of type V, where both the keys and values are sorted |

For complete documentation please visit the [BiMap page](https://rimbu.org/docs/collections/bimap) in the _[Rimbu Docs](https://rimbu.org)_.

Or [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

All types are exported through [`@rimbu/core`](../core). It is recommended to use that package.

To install this package only:

### Yarn/NPM

> `yarn add @rimbu/bimap`

or

> `npm i @rimbu/bimap`

### Deno

Create a file called `rimbu.ts` and add the following:

> ```ts
> export * from 'https://deno.land/x/rimbu/bimap/mod.ts';
> ```

Or using a pinned version (`x.y.z`):

> ```ts
> export * from 'https://deno.land/x/rimbu/bimap@x.y.z/mod.ts';
> ```

Then import what you need from `rimbu.ts`:

```ts
import { HashBiMultiMap } from './rimbu.ts';
```

Because Rimbu uses complex types, it's recommended to use the `--no-check` flag (your editor should already have checked your code) and to specify a `tsconfig.json` file with the settings described below.

Running your script then becomes:

> `deno run --no-check --config tsconfig.json <your-script>.ts`

## Usage

```ts
import { HashBiMap } from '@rimbu/bimap';

const biMap = HashBiMap.of([1, 'a'], [2, 'b'], [3, 'b']);
console.log(biMap.toString());
// HashBiMap(3 -> b)
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
