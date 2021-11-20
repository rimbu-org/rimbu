<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

# @rimbu/stream

A Stream is an Iterable-like structure that represents a source that can stream values when requested. The source is unspecified, it may be a materialized object (e.g. an Array), or a calculated sequence (e.g. the fibonacci numbers). However, unlike an Iterable, a Stream offers many methods to change the values produced by the Stream, before it is consumed, without the need to `materialize` intermediate instances.

This package exports the following main types:

| Name              | Description                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| `FastIterable<T>` | an Iterable that supports faster iterating than the `Iterable` type                                  |
| `FastIterator<T>` | an Iterator that supports faster iterating than the `Iterator` type                                  |
| `Stream<T>`       | an Iterable-like structure that represents a source that can produce values of type T when requested |
| `Streamable<T>`   | an interface requiring that an object has a `.stream()` method                                       |
| `StreamSource<T>` | a convenience type that covers all types that can be automatically converted to a `Stream`           |

For complete documentation please visit the [Stream page](https://rimbu.org/docs/collections/stream) in the _[Rimbu Docs](https://rimbu.org)_.

Or [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

All types are exported through [`@rimbu/core`](../core). It is recommended to use that package.

To install separately:

### Yarn/NPM

> `yarn add @rimbu/stream`

or

> `npm i @rimbu/stream`

### Deno

Create a file called `rimbu.ts` and add the following:

> ```ts
> export * from 'https://deno.land/x/rimbu/stream/mod.ts';
> ```

Or using a pinned version (`x.y.z`):

> ```ts
> export * from 'https://deno.land/x/rimbu/stream@x.y.z/mod.ts';
> ```

Then import what you need from `rimbu.ts`:

```ts
import { Stream } from './rimbu.ts';
```

Because Rimbu uses complex types, it's recommended to use the `--no-check` flag (your editor should already have checked your code) and to specify a `tsconfig.json` file with the settings described below.

Running your script then becomes:

> `deno run --no-check --config tsconfig.json <your-script>.ts`

## Usage

```ts
import { Stream } from '@rimbu/stream';

console.log(Stream.range({ start: 10, amount: 15 }).toArray());
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
