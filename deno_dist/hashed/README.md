<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

# @rimbu/hashed

This package contains the implementation for the `HashMap` and `HashSet` types, which form the basis of all Rimbu Hashed collections. The collections use a `Hasher` instance that is configurable to determine the equality of values/objects.

This package exports the following main types:

| Name            | Description                                                                              |
| --------------- | ---------------------------------------------------------------------------------------- |
| `HashMap<K, V>` | a map with entries of key type K and value type V, where keys are hashed with a `Hasher` |
| `HashSet<T>`    | a set of value type T where items are hashed with a `Hasher`                             |

For complete documentation please visit the [Map](https://rimbu.org/docs/collections/map) or [Set](https://rimbu.org/docs/collections/set) page _[Rimbu Docs](https://rimbu.org)_, or directly see the _[Rimbu Hashed API Docs](https://rimbu.org/api/rimbu/hashed)_.

Or [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

For convenience, all main types are also exported through [`@rimbu/core`](../core).

To install separately:

### Yarn/NPM

> `yarn add @rimbu/hashed`

or

> `npm i @rimbu/hashed`

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
import { HashSet } from '@rimbu/hashed';

console.log(HashSet.of(1, 3, 2, 4, 3, 1).toString());
```

## Author

[Arvid Nicolaas](https://github.com/vitoke)

## Contributing

Feel very welcome to contribute to further improve Rimbu. Please read our [Contributing guide](https://github.com/rimbu-org/rimbu/blob/main/CONTRIBUTING.md).

## Contributors

<img src = "https://contrib.rocks/image?repo=rimbu-org/rimbu"/>

Made with [contributors-img](https://contrib.rocks).

## License

Licensed under the MIT License, Copyright ?? 2020-present Arvid Nicolaas.

See [LICENSE](./LICENSE) for more information.
