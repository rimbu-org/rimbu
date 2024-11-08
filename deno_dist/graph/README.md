<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

[![npm version](https://badge.fury.io/js/@rimbu%2Fgraph.svg)](https://www.npmjs.com/package/@rimbu/graph) [![Deno](https://shield.deno.dev/x/rimbu)](http://deno.land/x/rimbu)

![Licence](https://img.shields.io/github/license/rimbu-org/rimbu)

# @rimbu/graph

Welcome to `@rimbu/graph`! This package provides a versatile and powerful Graph data structure, allowing you to model complex relationships between nodes with ease.

### Key Features:

- **Directed and Undirected Graphs**: Choose between Arrow Graphs (directed) and Edge Graphs (undirected) based on your needs.
- **Valued Graphs**: Add values to your edges for richer data representation.
- **Hashed and Sorted Implementations**: Optimize your graphs with hashed or sorted nodes for efficient lookups and ordered traversal.

### Exported Types:

| Name                       | Description                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------- |
| `ArrowGraph<N>`            | A generic directed graph with nodes of type `N`.                                   |
| `ArrowGraphHashed<N>`      | A directed graph with hashed nodes of type `N`.                                    |
| `ArrowGraphSorted<N>`      | A directed graph with sorted nodes of type `N`.                                    |
| `EdgeGraph<N>`             | A generic undirected graph with nodes of type `N`.                                 |
| `EdgeGraphHashed<N>`       | An undirected graph with hashed nodes of type `N`.                                 |
| `EdgeGraphSorted<N>`       | An undirected graph with sorted nodes of type `N`.                                 |
| `Graph<N>`                 | A generic graph with nodes of type `N`.                                            |
| `ValuedGraph<N, V>`        | A generic graph with nodes of type `N` and edges with value type `V`.              |
| `VariantGraph<N>`          | A generic type-variant graph with nodes of type `N`.                               |
| `VariantValuedGraph<N, V>` | A generic type-variant graph with nodes of type `N` and edges with value type `V`. |

### Documentation

For complete documentation, please visit the [Graph page](https://rimbu.org/docs/collections/graph) in the [Rimbu Docs](https://rimbu.org), or directly explore the [Rimbu Graph API Docs](https://rimbu.org/api/rimbu/graph).

### Try It Out

Experience `@rimbu/graph` in action! [Try Out Rimbu](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts) on CodeSandBox.

## Installation

### Compabitity

- [`Node` ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org)
- [`Deno` ![Deno JS](https://img.shields.io/badge/deno%20js-000000?logo=deno&logoColor=white)](https://deno.com/runtime)
- [`Bun` ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logoColor=white)](https://bun.sh/)
- `Web` ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?logoColor=white)

### Package Managers

**Yarn:**

```sh
yarn add @rimbu/graph
```

**npm:**

```sh
npm install @rimbu/graph
```

**Bun:**

```sh
bun add @rimbu/graph
```

### Deno Setup

Create or edit `import_map.json` in your project root:

```json
{
  "imports": {
    "@rimbu/": "https://deno.land/x/rimbu@x.y.z/"
  }
}
```

_Replace `x.y.z` with the desired version._

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

Created and maintained by [Arvid Nicolaas](https://github.com/vitoke).

## Contributing

We welcome contributions! Please read our [Contributing guide](https://github.com/rimbu-org/rimbu/blob/main/CONTRIBUTING.md).

## Contributors

<img src = "https://contrib.rocks/image?repo=rimbu-org/rimbu"/>

_Made with [contributors-img](https://contrib.rocks)._

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) for details.
