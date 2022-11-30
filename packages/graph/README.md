<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

# @rimbu/graph

A Graph is a data structure consisting of nodes that can be connected through edges. Each node has a unique value or identifier. Edges can be directed, in which case we will call it an Arrow Graph, or undirected, in which case we will call it an Edge Graph. Furthermore, edges and arrows can also have values, in which case we call it a Valued Graph.

This package exports the following main types:

| Name                       | Description                                                                   |
| -------------------------- | ----------------------------------------------------------------------------- |
| `ArrowGraph<N>`            | a generic directed graph with nodes of type N                                 |
| `ArrowGraphHashed<N>`      | a directed graph with hashed nodes of type N                                  |
| `ArrowGraphSorted<N>`      | a directed graph with sorted nodes of type N                                  |
| `EdgeGraph<N>`             | a generic undirected graph with nodes of type N                               |
| `EdgeGraphHashed<N>`       | an undirected graph with hashed nodes of type N                               |
| `EdgeGraphSorted<N>`       | an undirected graph with sorted nodes of type N                               |
| `Graph<N>`                 | a generic graph with nodes of type N                                          |
| `ValuedGraph<N, V>`        | a generic graph with nodes of type N and edges with value type V              |
| `VariantGraph<N>`          | a generic type-variant graph with nodes of type N                             |
| `VariantValuedGraph<N, V>` | a generic type-variant graph with nodes of type N and edges with value type V |

For complete documentation please visit the [Graph page](https://rimbu.org/docs/collections/graph) _[Rimbu Docs](https://rimbu.org)_, or directly see the _[Rimbu Graph API Docs](https://rimbu.org/api/rimbu/graph)_.

Or [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

For convenience, all main types are also exported through [`@rimbu/core`](../core).

To install separately:

### Yarn/NPM

> `yarn add @rimbu/graph`

or

> `npm i @rimbu/graph`

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

## Usage

```ts
import { EdgeGraphSorted } from '@rimbu/graph';

console.log(EdgeGraphSorted.of([1, 2], [2, 3], [3, 1], [5]).toString());
```

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
