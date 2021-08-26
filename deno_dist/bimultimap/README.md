<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

# @rimbu/bimultimap

A BiMultiMap is a bidirectional MultiMap of keys and values, where each key-value association also has an inverse value-key association. There is a many-to-many mapping between keys and values.

This package exports the following types:

| Name                     | Description                                                      |
| ------------------------ | ---------------------------------------------------------------- |
| `BiMultiMap<K, V>`       | a generic BiMultiMap between keys of type K and values of type V |
| `HashBiMultiMap<K, V>`   | a BiMultiMap implementation where keys and values are hashed     |
| `SortedBiMultiMap<K, V>` | a BiMultiMap implementation where keys and values are sorted     |

For complete documentation please visit the _[Rimbu Docs](http://rimbu.org)_.

Or [Try Me Out](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

All types are exported through [`@rimbu/core`](../core). It is recommended to use that package.

To install this package only:

### Yarn/NPM

> `yarn add @rimbu/bimultimap`

or

> `npm i @rimbu/bimultimap`

### Deno

Create a file called `rimbu.ts` and add the following:

> ```ts
> export * from 'https://deno.land/x/rimbu/bimultimap/mod.ts';
> ```

Or using a pinned version (`x.y.z`):

> ```ts
> export * from 'https://deno.land/x/rimbu@x.y.z/bimultimap/mod.ts';
> ```

Then import what you need from `rimbu.ts`:

```ts
import { HashBiMultiMap } from './rimbu.ts';
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

Feel very welcome to contribute to further improve Rimbu. Please read our [Contributing guide](../../CONTRIBUTING.md).

## Contributors

<img src = "https://contrib.rocks/image?repo=vitoke/iternal"/>

Made with [contributors-img](https://contrib.rocks).

## License

Licensed under the MIT License, Copyright © 2020-present Arvid Nicolaas.

See [LICENSE](./LICENSE) for more information.
