<p align="center">
  <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" height="96" alt="Rimbu Logo" />
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/@rimbu%2Fgraph.svg)](https://www.npmjs.com/package/@rimbu/graph)
![License](https://img.shields.io/github/license/rimbu-org/rimbu)
![Types Included](https://img.shields.io/badge/TypeScript-ready-blue)
![Node](https://img.shields.io/badge/Node-18+-6DA55F?logo=node.js&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg)
![ESM + CJS](https://img.shields.io/badge/modules-ESM%20%2B%20CJS-informational)

</div>

# `@rimbu/graph`

**Fast, immutable graph data structures for TypeScript & JavaScript.**

`@rimbu/graph` provides a rich family of **directed** and **undirected** graph implementations, with optional **edge values**, and both **hashed** and **sorted** internal representations. All graphs are **immutable & persistent**, giving you predictable behaviour and structural sharing while still feeling ergonomic to use.

Use it whenever you need to model **networks, dependencies, state machines, hierarchical links, or arbitrary relationships** between entities.

---

## Table of Contents

1. [Why `@rimbu/graph`?](#why-rimbu-graph)
2. [Feature Highlights](#feature-highlights)
3. [Quick Start](#quick-start)
4. [Core Concepts & Types](#core-concepts--types)
5. [Directed vs Undirected Graphs](#directed-vs-undirected-graphs)
6. [Valued Graphs](#valued-graphs)
7. [Traversal Helpers (`Traverse`)](#traversal-helpers-traverse)
8. [Performance Notes](#performance-notes)
9. [Installation](#installation)
10. [FAQ](#faq)
11. [Ecosystem & Integration](#ecosystem--integration)
12. [Contributing](#contributing)
13. [License](#license)

---

## Why `@rimbu/graph`?

Graphs are everywhere:

- **Domain models** – users ↔ groups, services ↔ dependencies, resources ↔ references.
- **Algorithms** – path finding, reachability, connectivity, topological ordering.
- **Config & state** – workflows, finite state machines, dependency graphs.

`@rimbu/graph` focuses on:

- **Clear semantics** – separate types for **directed** (`ArrowGraph`) and **undirected** (`EdgeGraph`) graphs.
- **Valued edges** – attach weights, metadata, or labels via valued graphs (e.g. `ArrowValuedGraphHashed`).
- **Immutable operations** – updates always return new instances, sharing structure internally.
- **Strong typing** – generics for node and value types, plus non‑empty refinements.
- **Consistent API** – graph families share common operations and higher‑kinded `Context` / `Builder` types.

---

## Feature Highlights

- **Directed & undirected graphs** – choose between arrow (directed) and edge (undirected) graphs.
- **Valued edges** – store extra data per connection (weights, labels, costs, metadata).
- **Hashed & sorted variants** – pick between hashed (`*Hashed`) or sorted (`*Sorted`) internal collections.
- **Immutable & persistent** – safe sharing across components, snapshots, and undo/redo flows.
- **Context & builders** – use `Context` and `Builder` types for efficient, batched updates.
- **Traversal utilities** – breadth‑first and depth‑first traversal helpers via the exported `Traverse` namespace.

Try Rimbu (including `@rimbu/graph`) live in the browser using the
[Rimbu Sandbox on CodeSandbox](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts).

---

## Quick Start

### Basic undirected graph

```ts
import { EdgeGraphHashed } from '@rimbu/graph';

// Create from node/connection tuples
const g = EdgeGraphHashed.of(
  [1, 2],
  [2, 3],
  [3, 4],
  [5] // isolated node
);

g.hasNode(2); // true
g.hasConnection(1, 2); // true

// Get all connections from a node as a nested map
const neighbors = g.getConnectionsFrom(2);
console.log(neighbors.toArray()); // e.g. [[1], [3]]

// Iterate graph elements as a stream
g.stream().toArray();
// => [[1, 2], [2, 3], [3, 4], [5]]
```

### Basic directed graph

```ts
import { ArrowGraphHashed } from '@rimbu/graph';

const g = ArrowGraphHashed.of([1, 2], [2, 3], [3, 1]);

g.hasConnection(1, 2); // true
g.hasConnection(2, 1); // false

g.getConnectionsFrom(1).toArray();
// => [[2]]
```

### Valued graph (weighted edges)

```ts
import { ArrowValuedGraphHashed } from '@rimbu/graph';

// [from, to, weight]
const wg = ArrowValuedGraphHashed.of([1, 2, 5], [2, 3, 3]);

wg.getValue(1, 2); // 5

wg.stream().toArray();
// => [[1, 2, 5], [2, 3, 3]]
```

---

## Core Concepts & Types

The main public surface of `@rimbu/graph` is exported from `src/main/index.mts`.

### Common graph interfaces

| Name                    | Description                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| `Graph<N>`              | Type‑invariant immutable graph interface.                                                |
| `Graph.NonEmpty<N>`     | Non‑empty refinement of `Graph<N>` with a non‑empty `stream` of graph elements.          |
| `Graph.Context<UN>`     | Factory/context for creating `Graph` instances and builders for an upper node type `UN`. |
| `VariantGraph<N>`       | Type‑variant graph interface with covariant node type.                                   |
| `VariantGraph.NonEmpty` | Non‑empty refinement of `VariantGraph<N>` with a non‑empty stream of graph elements.     |

### Directed (arrow) graphs

| Name                     | Description                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| `ArrowGraph<N>`          | Type‑invariant **directed** graph.                                                                    |
| `ArrowGraph.NonEmpty<N>` | Non‑empty directed graph; `stream()` yields either `[N]` (isolated node) or `[from, to]` connections. |
| `ArrowGraph.Context<UN>` | Context for `ArrowGraph` instances (generic over an upper node type `UN`).                            |
| `ArrowGraph.Builder<N>`  | Mutable builder for efficiently constructing or mutating an `ArrowGraph<N>` before freezing it.       |
| `ArrowGraphHashed<N>`    | Directed graph whose connections are internally stored in hashed collections.                         |
| `ArrowGraphSorted<N>`    | Directed graph whose connections are internally stored in sorted collections.                         |

Each of the hashed/sorted variants has its own `NonEmpty`, `Builder`, and `Context` types, such as:

- `ArrowGraphHashed.NonEmpty<N>`
- `ArrowGraphHashed.Context<UN>`
- `ArrowGraphSorted.NonEmpty<N>`
- `ArrowGraphSorted.Context<UN>`

### Undirected (edge) graphs

| Name                    | Description                                                                     |
| ----------------------- | ------------------------------------------------------------------------------- |
| `EdgeGraph<N>`          | Type‑invariant **undirected** graph.                                            |
| `EdgeGraph.NonEmpty<N>` | Non‑empty undirected graph; `stream()` yields `[N]` or `[N, N]` graph elements. |
| `EdgeGraph.Context<UN>` | Context for `EdgeGraph` instances.                                              |
| `EdgeGraph.Builder<N>`  | Mutable builder for `EdgeGraph<N>`.                                             |
| `EdgeGraphHashed<N>`    | Undirected graph backed by hashed collections.                                  |
| `EdgeGraphSorted<N>`    | Undirected graph backed by sorted collections.                                  |

Again, hashed/sorted variants include corresponding `NonEmpty`, `Builder`, and `Context` types.

---

## Directed vs Undirected Graphs

- **Arrow graphs** (`ArrowGraph*`) represent **directed** edges.  
  A connection `[1, 2]` means “an edge from `1` to `2`”, but not necessarily from `2` to `1`.
- **Edge graphs** (`EdgeGraph*`) represent **undirected** edges.  
  A connection `[1, 2]` is symmetric: `hasConnection(1, 2)` and `hasConnection(2, 1)` both hold.

All graph variants share core APIs, such as:

```ts
g.hasNode(node);
g.hasConnection(node1, node2);
g.getConnectionsFrom(node); // returns a map / set of neighbors
g.stream(); // stream of graph elements
```

Use `*Hashed` variants when you care about fast hashed lookups, and `*Sorted` variants when you want deterministic, ordered traversal.

---

## Valued Graphs

Valued graphs let you store an extra value per edge (weight, label, capacity, etc.).

### Generic valued interfaces

| Name                          | Description                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------ |
| `ValuedGraph<N, V>`           | Type‑invariant graph where each connection has a value of type `V`.            |
| `ValuedGraph.NonEmpty<N, V>`  | Non‑empty valued graph; `stream()` yields `ValuedGraphElement<N, V>` elements. |
| `VariantValuedGraph<N, V>`    | Type‑variant valued graph.                                                     |
| `VariantValuedGraph.NonEmpty` | Non‑empty variant valued graph.                                                |

### Concrete valued graph families

| Name                           | Description                                               |
| ------------------------------ | --------------------------------------------------------- |
| `ArrowValuedGraph<N, V>`       | Directed valued graph interface.                          |
| `ArrowValuedGraphHashed<N, V>` | Directed valued graph backed by `HashMap` structures.     |
| `ArrowValuedGraphSorted<N, V>` | Directed valued graph backed by `SortedMap` structures.   |
| `EdgeValuedGraph<N, V>`        | Undirected valued graph interface.                        |
| `EdgeValuedGraphHashed<N, V>`  | Undirected valued graph backed by `HashMap` structures.   |
| `EdgeValuedGraphSorted<N, V>`  | Undirected valued graph backed by `SortedMap` structures. |

Each of these has matching `NonEmpty`, `Builder`, and `Context` types, and exposes a `stream()` that yields **graph elements**:

- Isolated node: `[node]`
- Valued connection: `[from, to, value]`

```ts
import { EdgeValuedGraphHashed } from '@rimbu/graph';

const g = EdgeValuedGraphHashed.of([1, 2, 'a'], [2, 3, 'b']);

g.getValue(1, 2); // 'a'
g.stream().toArray();
// => [[1, 2, 'a'], [2, 3, 'b']]
```

---

## Traversal Helpers (`Traverse`)

The main index exports a `Traverse` namespace that groups traversal utilities:

```ts
import { Traverse, EdgeGraphHashed } from '@rimbu/graph';

const g = EdgeGraphHashed.of([1, 2], [2, 3], [1, 3], [3, 4]);

// Breadth‑first traversal
const bfs = Traverse.traverseBreadthFirstHashed(g, 1);
console.log(bfs.toArray());
// => [[1, 2], [1, 3], [2, 3], [3, 4]]

// Depth‑first traversal
const dfs = Traverse.traverseDepthFirstHashed(g, 1);
console.log(dfs.toArray());
// => [[1, 2], [2, 3], [1, 3], [3, 4]]
```

Available helpers include:

- `traverseBreadthFirstCustom`
- `traverseBreadthFirstHashed`
- `traverseBreadthFirstSorted`
- `traverseDepthFirstCustom`
- `traverseDepthFirstHashed`
- `traverseDepthFirstSorted`

All of them work with any non‑empty `VariantGraphBase`‑compatible graph from this package.

---

## Performance Notes

- Graphs in Rimbu are built on **persistent data structures** – updates are typically \\(O(\log n)\\) and share most of their structure.
- Hashed vs sorted variants differ mainly in the underlying maps/sets (`HashMap` / `HashSet` vs `SortedMap` / `SortedSet`).
- Many operations accept generic `StreamSource` inputs (from `@rimbu/stream`), allowing efficient construction and transformation from arrays, iterables, or streams.

For more details, see the main Rimbu documentation at [rimbu.org](https://rimbu.org).

---

## Installation

### Node / Bun / npm / Yarn

```sh
npm install @rimbu/graph
# or
yarn add @rimbu/graph
# or
bun add @rimbu/graph
# or
deno add npm:@rimbu/graph
```

Then:

```ts
import { EdgeGraphHashed } from '@rimbu/graph/mod.ts';
```

### Browser / ESM

`@rimbu/graph` ships both **ESM** and **CJS** builds. Use it with any modern bundler
(Vite, Webpack, esbuild, Bun, etc.) or directly in Node ESM projects.

---

## FAQ

**Q: What is the difference between `Graph`, `ArrowGraph`, and `EdgeGraph`?**  
`Graph` and `VariantGraph` are general graph interfaces, while `ArrowGraph*` and `EdgeGraph*` are concrete families for directed and undirected graphs, respectively, with hashed/sorted variants and context/builder support.

**Q: When should I use valued graphs?**  
Whenever edges carry additional information (weights, labels, capacities, timestamps, etc.), use `ArrowValuedGraph*` or `EdgeValuedGraph*` to keep that data close to the topology.

**Q: Are these graphs mutable?**  
No. All operations return new graph instances; existing ones remain unchanged and can be freely shared.

**Q: Can I build graphs incrementally?**  
Yes. Use the `Builder` types (e.g. `ArrowGraphHashed.Builder`, `EdgeValuedGraphSorted.Builder`) exposed via their `Context` or via helpers like `toBuilder()`.

---

## Ecosystem & Integration

- Part of the broader **Rimbu** collection ecosystem – interoperates with `@rimbu/hashed`,
  `@rimbu/sorted`, `@rimbu/collection-types`, and `@rimbu/stream`.
- Well‑suited for domain modelling, compilers/interpreters, schedulers, routing, and more.
- Works seamlessly with Rimbu streams and other collections for building rich, immutable data models.

Explore more at the [Rimbu Graph docs](https://rimbu.org/docs/collections/graph) and the
[Graph API reference](https://rimbu.org/api/rimbu/graph).

---

## Contributing

We welcome contributions! See the
[Contributing guide](https://github.com/rimbu-org/rimbu/blob/main/CONTRIBUTING.md) for details.

<img src="https://contrib.rocks/image?repo=rimbu-org/rimbu" alt="Contributors" />

_Made with [contributors-img](https://contrib.rocks)._

---

## License

MIT © Rimbu contributors. See [LICENSE](./LICENSE) for details.
