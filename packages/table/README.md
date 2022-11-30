<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

# @rimbu/table

A `Table` is an immutable 2-dimensional Map, containing row keys and column keys, where a combination of a row and column key can contain one value.

This package exports the following main types:

| Name                    | Description                                                         |
| ----------------------- | ------------------------------------------------------------------- |
| `Table<R, C, V>`        | a generic `Table` with row keys R, column keys C, and values V      |
| `VariantTable<R, C, V>` | a type-variant `Table` with row keys R, column keys C, and values V |

For complete documentation please visit the [Table page](https://rimbu.org/docs/collections/table) in the _[Rimbu Docs](https://rimbu.org)_, or directly see the _[Rimbu Table API Docs](https://rimbu.org/api/rimbu/table)_.

Or [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

For convenience, all main types are also exported through [`@rimbu/core`](../core).

To install separately:

### Yarn/NPM

> `yarn add @rimbu/table`

or

> `npm i @rimbu/table`

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

## Author

[Arvid Nicolaas](https://github.com/vitoke)

## Contributing

Feel very welcome to contribute to further improve Rimbu. Please read our [Contributing guide](https://github.com/rimbu-org/rimbu/blob/main/CONTRIBUTING.md).

## Contributors

<img src = "https://contrib.rocks/image?repo=rimbu-org/rimbu"/>

Made with [contributors-img](https://contrib.rocks).

## License

Licensed under the MIT License, Copyright © 2020-present Arvid Nicolaas.

See [LICENSE](./LICENSE) for more information.
