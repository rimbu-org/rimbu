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

For complete documentation please visit the [Stream page](https://rimbu.org/docs/collections/stream) in the _[Rimbu Docs](https://rimbu.org)_, or directly see the _[Rimbu Stream API Docs](https://rimbu.org/api/rimbu/stream)_.

Or [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

For convenience, all main types are also exported through [`@rimbu/core`](../core).

To install separately:

### Yarn/NPM

> `yarn add @rimbu/stream`

or

> `npm i @rimbu/stream`

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

Because Rimbu uses advanced types, this may slow down the type checking part when running your code. If you're able to rely on your code editor to provide type errors, you can skip the Deno type check using the `--no-check` flag:

`deno run --import-map import_map.json --no-check src/main.ts`

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

<img src = "https://contrib.rocks/image?repo=rimbu-org/rimbu"/>

Made with [contributors-img](https://contrib.rocks).

## License

Licensed under the MIT License, Copyright © 2020-present Arvid Nicolaas.

See [LICENSE](./LICENSE) for more information.
