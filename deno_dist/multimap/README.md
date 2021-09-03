<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

# @rimbu/multimap

A Rimbu MultiMap is a Map in which each key has one or more values. For each key, it's associated values are unique, that is, the values for each key are kept in a `Set`.

This package exports the following types:

| Name                              | Description                                                            |
| --------------------------------- | ---------------------------------------------------------------------- |
| `HashMultiMapHashValue<K, V>`     | a multimap between hashed values of type K and hashed values of type V |
| `HashMultiMapSortedValue<K, V>`   | a multimap between hashed values of type K and sorted values of type V |
| `MultiMap<K, V>`                  | a generic multimap between values of type K and values of type V       |
| `SortedMultiMapHashValue<K, V>`   | a multimap between sorted values of type K and hashed values of type V |
| `SortedMultiMapSortedValue<K, V>` | a multimap between sorted values of type K and sorted values of type V |
| `VariantMultiMap<K, V>`           | a type-variant multimap between values of type K and values of type V  |

For complete documentation please visit the _[Rimbu Docs](http://rimbu.org)_.

Or [Try Me Out](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

All types are exported through [`@rimbu/core`](../core). It is recommended to use that package.

To install separately:

### Yarn/NPM

> `yarn add @rimbu/multimap`

or

> `npm i @rimbu/multimap`

### Deno

Create a file called `rimbu.ts` and add the following:

> ```ts
> export * from 'https://deno.land/x/rimbu/multimap/mod.ts';
> ```

Or using a pinned version (`x.y.z`):

> ```ts
> export * from 'https://deno.land/x/rimbu/multimap@x.y.z/mod.ts';
> ```

Then import what you need from `rimbu.ts`:

```ts
import { HashMultiMapHashValue } from './rimbu.ts';
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
import { HashMultiMapHashValue } from '@rimbu/multimap';

console.log(HashMultiMapHashValue.of([1, 2], [1, 3], [2, 3]).toString());
```

## Usage

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
