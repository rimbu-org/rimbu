<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

# @rimbu/ordered

This packages contains an implementation of `OrderedMap` and `OrderedSet`, which are wrappers around other `RMap` and `RSet` implementations, and that add the capability to remember insertion order. Iterating over the collections will return the values in this insertion order.

This package exports the following types:

| Name               | Description                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------ |
| `OrderedMap<K, V>` | a map with entries of key type K and value type V, where key insertion order is maintained |
| `OrderedSet<T>`    | a set of value type T where insertion order is maintained                                  |

For complete documentation please visit the _[Rimbu Docs](http://rimbu.org)_.

Or [Try Me Out](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

All types are exported through [`@rimbu/core`](../core). It is recommended to use that package.

To install separately:

### Yarn/NPM

> `yarn add @rimbu/ordered`

or

> `npm i @rimbu/ordered`

### Deno

Create a file called `rimbu.ts` and add the following:

> ```ts
> export * from 'https://deno.land/x/rimbu/ordered/mod.ts';
> ```

Or using a pinned version (`x.y.z`):

> ```ts
> export * from 'https://deno.land/x/rimbu/ordered@x.y.z./mod.ts';
> ```

Then import what you need from `rimbu.ts`:

```ts
import { OrderedMap } from './rimbu.ts';
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
import { OrderedSet } from '@rimbu/ordered';

console.log(OrderedSet.of(1, 3, 2, 3, 1).toString());
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
