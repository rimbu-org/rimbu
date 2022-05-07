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

For complete documentation please visit the [MultiSet page](https://rimbu.org/docs/collections/multiset) in the _[Rimbu Docs](https://rimbu.org)_, or directly see the _[Rimbu MultiSet API Docs](https://rimbu.org/api/rimbu/multiset)_.

Or [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

For convenience, all main types are also exported through [`@rimbu/core`](../core).

To install separately:

### Yarn/NPM

> `yarn add @rimbu/multiset`

or

> `npm i @rimbu/multiset`

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
import { SortedMultiSet } from '@rimbu/multiset';

console.log(SortedMultiSet.of(1, 3, 2, 3, 2, 3).toString());
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
