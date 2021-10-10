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

For complete documentation please visit the [Graph page](https://rimbu.org/docs/collections/graph) _[Rimbu Docs](https://rimbu.org)_.

Or [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) in CodeSandBox.

## Installation

All types are exported through [`@rimbu/core`](../core). It is recommended to use that package.

To install separately:

### Yarn/NPM

> `yarn add @rimbu/graph`

or

> `npm i @rimbu/graph`

### Deno

Create a file called `rimbu.ts` and add the following:

> ```ts
> export * from 'https://deno.land/x/rimbu/graph/mod.ts';
> ```

Or using a pinned version (`x.y.z`):

> ```ts
> export * from 'https://deno.land/x/rimbu/graph@x.y.z/mod.ts';
> ```

Then import what you need from `rimbu.ts`:

```ts
import { Graph } from './rimbu.ts';
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
