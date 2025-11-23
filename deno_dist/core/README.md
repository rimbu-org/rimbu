<p align="center">
  <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" height="96" alt="Rimbu Logo" />
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/@rimbu%2Fcore.svg)](https://www.npmjs.com/package/@rimbu/core)
![License](https://img.shields.io/github/license/rimbu-org/rimbu)
![Types Included](https://img.shields.io/badge/TypeScript-ready-blue)
![Node](https://img.shields.io/badge/Node-18+-6DA55F?logo=node.js&logoColor=white)
![Deno](https://shield.deno.dev/x/rimbu)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg)
![ESM + CJS](https://img.shields.io/badge/modules-ESM%20%2B%20CJS-informational)

</div>

# `@rimbu/core`

**All core Rimbu collections and utilities from a single import.**

`@rimbu/core` is the **convenience entry point** to the Rimbu ecosystem. It re‑exports the public APIs of the main
collection packages (lists, maps, sets, graphs, tables, streams, and more) together with the shared utilities from
`@rimbu/common`, so you can build rich immutable data models without juggling many imports.

Use it when you want:

- a **single dependency** that gives you the full set of Rimbu core collections
- a consistent, **fully typed** API for immutable data structures
- both **direct imports** and a **creation “menu”** (`@rimbu/core/menu`) for concise, expressive code

---

## Table of Contents

1. [Why `@rimbu/core`?](#why-rimbu-core)
2. [Feature Highlights](#feature-highlights)
3. [Quick Start](#quick-start)
4. [Import Styles](#import-styles)
5. [What’s Included](#whats-included)
6. [Installation](#installation)
7. [Ecosystem & Integration](#ecosystem--integration)
8. [Contributing](#contributing)
9. [License](#license)
10. [Attributions](#attributions)

---

## Why `@rimbu/core`?

Rimbu is a collection library focused on **immutable**, **persistent** data structures with a strong TypeScript story.
Each collection type lives in its own package (e.g. `@rimbu/list`, `@rimbu/hashed`, `@rimbu/sorted`, …), and
`@rimbu/common` provides shared types and utilities used across the ecosystem.

`@rimbu/core` brings these together:

- **Single import** – access all main collections through `@rimbu/core`.
- **Shared utilities included** – get everything from `@rimbu/common` as part of the same dependency.
- **Consistent experience** – unified API surface, aligned docs, and the same immutable semantics throughout.

If you just want to “use Rimbu” without thinking about which sub‑package exports which type, `@rimbu/core` is what you
install.

For full documentation, see the [Rimbu Docs](https://rimbu.org) and the
[`@rimbu/core` API reference](https://rimbu.org/api/rimbu/core).

---

## Feature Highlights

- **All main collections in one place** – `List`, `Stream` / `AsyncStream`, `HashMap`, `SortedMap`, `HashSet`,
  `SortedSet`, `BiMap`, `BiMultiMap`, `Table`, graphs, multimaps, multisets, and more.
- **Immutable & persistent semantics** – structural sharing for efficient copies and diffs.
- **Typed end‑to‑end** – works great in TypeScript, with rich generics and non‑empty refinements.
- **Creation “menu”** – optional namespace‑style API via `@rimbu/core/menu` for expressive code like
  `Rimbu.Map.Sorted.of(...)`.
- **Cross‑runtime support** – Node ≥ 18, Deno, Bun, and modern browsers (ESM + CJS builds included).

Each individual collection has its own dedicated documentation and examples, but `@rimbu/core` lets you reach them all
from a single dependency.

---

## Quick Start

### Direct imports

```ts
import { List, Stream, SortedMap } from '@rimbu/core';

// Build an immutable list
const list = List.of(1, 3, 2, 4, 2);

// Transform it into a stream of entry tuples
const stream = Stream.from(list).map((v) => [v, String(v * 2)] as const);

// Materialize into a sorted map
const map = SortedMap.from(stream);

console.log(map.toArray());
// => [[1, '2'], [2, '4'], [3, '6'], [4, '8']]
```

### Try it online

Experiment with Rimbu (including `@rimbu/core`) in the browser using the
[Rimbu Sandbox on CodeSandbox](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts).

---

## Import Styles

### 1. Direct imports from `@rimbu/core`

Recommended when you only need a few specific types:

```ts
import { List, HashMap, Stream } from '@rimbu/core';

const list = List.of(1, 2, 3);
const map = HashMap.of(
  ['a', 1],
  ['b', 2]
);

const result = Stream.from(map.entries()).toArray();
```

All public types from the core collection packages are re‑exported here, so you rarely need to import the
sub‑packages directly.

### 2. Using the creation “menu” from `@rimbu/core/menu`

The “menu” groups key Rimbu types into a single namespace, which is convenient for quick prototyping or REPL usage:

```ts
import Rimbu from '@rimbu/core/menu';

const list = Rimbu.List.of(1, 3, 2, 4, 2);

const stream = Rimbu.Stream.from(list).map((v) => [v, String(v * 2)] as const);

const map = Rimbu.Map.Sorted.from(stream);

console.log(map.toArray());
// => [[1, '2'], [2, '4'], [3, '6'], [4, '8']]
```

Under the hood, this uses the same types that are exported from `@rimbu/core`, organized into namespaces like
`Rimbu.Map`, `Rimbu.Set`, `Rimbu.Table`, and `Rimbu.Graph`.

---

## What’s Included

`@rimbu/core` re‑exports the public APIs of the following sub‑packages. Use these packages directly when you need
package‑specific documentation, but feel free to import their types through `@rimbu/core`:

| Package                                        | Description                                                                                          |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [@rimbu/bimap](../bimap)                       | Bidirectional map where each key maps to a unique value and vice versa.                             |
| [@rimbu/bimultimap](../bimultimap)             | Bidirectional multimap allowing many‑to‑many mappings between keys and values.                      |
| [@rimbu/collection-types](../collection-types) | Shared collection type definitions used by all Rimbu collections.                                   |
| [@rimbu/common](../common)                     | Public types and utility functions used throughout the library.                                     |
| [@rimbu/deep](../deep)                         | Tools (such as `Deep` and `Tuple`) for treating plain JS objects as immutable structures.           |
| [@rimbu/graph](../graph)                       | Graph implementations for modelling data as nodes and edges.                                        |
| [@rimbu/hashed](../hashed)                     | `HashMap` / `HashSet` implementations using hash functions for fast key retrieval.                  |
| [@rimbu/list](../list)                         | Immutable `List` for ordered sequences with efficient random access and updates.                    |
| [@rimbu/multimap](../multimap)                 | Map where each key can be associated with multiple values.                                          |
| [@rimbu/multiset](../multiset)                 | Set where elements can occur multiple times.                                                        |
| [@rimbu/ordered](../ordered)                   | `OrderedMap` / `OrderedSet` that retain insertion order.                                            |
| [@rimbu/proximity](../proximity)               | `ProximityMap` for retrieving values based on key proximity.                                        |
| [@rimbu/sorted](../sorted)                     | `SortedMap` / `SortedSet` implementations that keep elements sorted via compare functions.          |
| [@rimbu/stream](../stream)                     | Lazy, composable `Stream` / `AsyncStream` types for processing sequences of data.                   |
| [@rimbu/table](../table)                       | Table data structures where row/column key pairs map to a single value.                             |

For a complete overview, start from the [Rimbu documentation](https://rimbu.org) or jump directly to the
[`@rimbu/core` API docs](https://rimbu.org/api/rimbu/core).

---

## Installation

### Node / Bun / npm / Yarn

```sh
npm install @rimbu/core
# or
yarn add @rimbu/core
# or
bun add @rimbu/core
```

### Deno (import map)

Create or edit `import_map.json` in your project root:

```jsonc
{
  "imports": {
    "@rimbu/": "https://deno.land/x/rimbu@<version>/"
  }
}
```

Then you can import from `@rimbu/core` just like in Node:

```ts
import { List } from '@rimbu/core/mod.ts';
```

For sub‑packages that expose multiple entry points under nested paths, you may sometimes need to import `index.ts`
directly, for example:

```ts
import { HashMap } from '@rimbu/hashed/map/index.ts';
```

Finally, run your script (assuming the entry point is in `src/main.ts`):

```sh
deno run --import-map import_map.json src/main.ts
```

### Browser / ESM

`@rimbu/core` ships both **ESM** and **CJS** builds. Use it with any modern bundler (Vite, Webpack, esbuild, Bun, etc.)
or directly in Node ESM projects.

---

## Ecosystem & Integration

- Part of the broader **Rimbu** collection ecosystem – interoperates with packages like `@rimbu/hashed`,
  `@rimbu/ordered`, `@rimbu/collection-types`, and `@rimbu/stream`.
- Designed for **immutable, persistent data models** in TypeScript and JavaScript applications.
- Works well in Node services, browser apps, and Deno/Bun runtimes.

Explore more at the [Rimbu documentation](https://rimbu.org) and the
[`@rimbu/core` API docs](https://rimbu.org/api/rimbu/core).

---

## Contributing

We welcome contributions! See the
[Contributing guide](https://github.com/rimbu-org/rimbu/blob/main/CONTRIBUTING.md) for details.

<img src="https://contrib.rocks/image?repo=rimbu-org/rimbu" alt="Contributors" />

_Made with [contributors-img](https://contrib.rocks)._

---

## License

MIT © Rimbu contributors. See [LICENSE](./LICENSE) for details.

---

## Attributions

Created and maintained by [Arvid Nicolaas](https://github.com/vitoke). Logo © Rimbu.
