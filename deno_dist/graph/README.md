<p align="center">
    <img src="../../assets/rimbu_logo.svg" />
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

For complete documentation please visit the _[Rimbu Docs](http://rimbu.org)_.

Or [Try Me Out](https://codesandbox.io/s/rimbu-sandbox-d4tbk?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

All types are exported through [`@rimbu/core`](../core). It is recommended to use this package.

To install separately:

> `yarn add @rimbu/graph`

or

> `npm i @rimbu/graph`

### recommended tsconfig settings

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
import { EdgeGraphSorted } from '@rimbu/graph';

console.log(EdgeGraphSorted.of([1, 2], [2, 3], [3, 1], [5]).toString());
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
