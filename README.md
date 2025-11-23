<p align="center">
  <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" alt="Rimbu logo" height="120" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@rimbu/core">
    <img src="https://badge.fury.io/js/@rimbu%2Fcore.svg" alt="npm version" />
  </a>
  <a href="https://deno.land/x/rimbu">
    <img src="https://shield.deno.dev/x/rimbu" alt="Deno" />
  </a>
  <a href="https://github.com/rimbu-org/rimbu/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/rimbu-org/rimbu" alt="License: MIT" />
  </a>
  <a href="https://codecov.io/gh/rimbu-org/rimbu">
    <img src="https://codecov.io/gh/rimbu-org/rimbu/branch/main/graph/badge.svg?token=RSFK5B0N0Z" alt="codecov" />
  </a>
</p>

## Rimbu: Immutable collections and tools for TypeScript

**Rimbu** is a modern TypeScript library for **fast, immutable data structures** and **composable async utilities**. It gives you persistent lists, maps, sets, graphs, tables, streams, channels, and tasks with a strong type story and predictable performance across Node, Deno, Bun, and the browser.

Use Rimbu when you want:

- **Immutable by default**: structural sharing instead of manual copying, ideal for state management and undo/redo.
- **First-class TypeScript**: rich generics, non-empty refinements, and higher-kinded collection types.
- **Production-grade performance**: tree-based and hash-based structures tuned for real applications.
- **Composable APIs**: collections, streams, channels, and tasks that interoperate cleanly.

### Documentation & playground

- **Docs**: [rimbu.org](https://rimbu.org)
- **API reference**: [rimbu.org/api](https://rimbu.org/api)
- **Guides & collection docs**: [rimbu.org/docs](https://rimbu.org/docs)
- **Playground / sandbox**: [Rimbu Sandbox on CodeSandbox](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts)

---

## Getting started

### Runtime compatibility

- **Node** ![NodeJS](https://img.shields.io/badge/node.js-18+-6DA55F?logo=node.js&logoColor=white)
- **Deno** ![Deno JS](https://img.shields.io/badge/deno%20js-000000?logo=deno&logoColor=white)
- **Bun** ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logoColor=white)
- **Web** ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?logoColor=white)

### Install (`@rimbu/core`)

**Yarn**

```sh
yarn add @rimbu/core
```

**npm**

```sh
npm install @rimbu/core
```

**pnpm**

```sh
pnpm add @rimbu/core
```

**Bun**

```sh
bun add @rimbu/core
```

### Deno setup

Create or edit `import_map.json` in your project root:

```json
{
  "imports": {
    "@rimbu/": "https://deno.land/x/rimbu@x.y.z/"
  }
}
```

_Replace `x.y.z` with the desired version._ You can then import from Rimbu just like in Node:

```ts
import { List } from '@rimbu/core/mod.ts';
```

See the docs for more Deno and sub-package import examples.

---

## Quick example

```ts
import { List, HashMap, Stream } from '@rimbu/core';

type User = { id: number; name: string; active: boolean };

const users = List.of<User>(
  { id: 1, name: 'Ada', active: true },
  { id: 2, name: 'Grace', active: false },
  { id: 3, name: 'Linus', active: true }
);

// Build an immutable index by id
const byId = HashMap.from(
  users.stream().map((u) => [u.id, u] as const)
);

// Stream over active user names
const activeNames = Stream.from(users)
  .filter((u) => u.active)
  .map((u) => u.name)
  .toArray();

// Nothing above mutates the original data structures
console.log(byId.get(1)?.name); // 'Ada'
console.log(activeNames); // ['Ada', 'Linus']
```

For more examples, start from the [`@rimbu/core` README](packages/core) or the online docs.

---

## Stable packages (v1.0.0 and higher)

Rimbu is a monorepo of focused npm packages.  
This overview only lists **packages that have reached version `1.0.0` or higher**. Each package directory contains a detailed README and API documentation links.

### Core foundations

| Package                                             | Description                                                                                           |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [@rimbu/core](packages/core)                        | **Single entrypoint** that re-exports the main Rimbu collections and utilities from one import.      |
| [@rimbu/base](packages/base)                        | Foundational **immutable array and utility primitives** used by all other Rimbu collections.         |
| [@rimbu/collection-types](packages/collection-types) | Shared **map/set interfaces and higher-kinded collection types** implemented by concrete packages.   |
| [@rimbu/common](packages/common)                    | Shared **equality, comparison, range, lazy, and type-level utilities** across the ecosystem.         |
| [@rimbu/deep](packages/deep)                        | **Deep patching, matching, paths, and selectors** for treating plain JS objects as immutable data.   |

### Collections: maps, sets, lists, graphs, tables

| Package                         | Description                                                                                                             |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| [@rimbu/list](packages/list)    | **Immutable random-access lists** (vector-like) with efficient updates, slicing, and non-empty variants.              |
| [@rimbu/hashed](packages/hashed) | **HashMap** and **HashSet** implementations with configurable hashing and equality strategies.                        |
| [@rimbu/sorted](packages/sorted) | **SortedMap** and **SortedSet** with deterministic ordering, range queries, and index-based access.                   |
| [@rimbu/ordered](packages/ordered) | **OrderedMap** and **OrderedSet** that preserve insertion order on top of existing map/set implementations.          |
| [@rimbu/bimap](packages/bimap)  | **Bidirectional maps** (BiMap) that maintain a strict one-to-one mapping between keys and values.                     |
| [@rimbu/bimultimap](packages/bimultimap) | **Many-to-many bidirectional multimaps** where keys and values can both have multiple associations.           |
| [@rimbu/multimap](packages/multimap) | **One-to-many multimaps** where each key maps to a set of unique values.                                             |
| [@rimbu/multiset](packages/multiset) | **Multisets (bags)** that track how many times each element occurs.                                                 |
| [@rimbu/table](packages/table)  | **2D tables** indexed by row and column keys, with hashed and sorted row/column variants.                             |
| [@rimbu/graph](packages/graph)  | **Directed, undirected, and valued graphs** with traversal helpers and hashed/sorted variants.                        |
| [@rimbu/proximity](packages/proximity) | **Proximity-based maps** (`ProximityMap`) that resolve lookups using nearest-key distance functions.          |

### Streams, channels, and tasks

| Package                         | Description                                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [@rimbu/stream](packages/stream) | **Lazy synchronous and asynchronous streams** (`Stream` / `AsyncStream`) for composable data pipelines.    |
| [@rimbu/channel](packages/channel) | **Typed channels and concurrency primitives** (Go-style channels, remote channels, mutexes, semaphores). |
| [@rimbu/task](packages/task)    | **Composable, cancellable async tasks** with structured concurrency, retries, timeouts, and supervision.   |

---

## Development

### Local setup

1. Clone the repository.
2. Run `yarn` to install dependencies.
3. Build all packages with `yarn build`.
4. Run tests with `yarn test`.

See the individual package READMEs and the docs for package-specific commands (benchmarks, type tests, docs generation, etc.).

### Contributing

We welcome contributions of all kinds—bug reports, docs, examples, and new features.  
Please read the [Contributing guide](https://github.com/rimbu-org/rimbu/blob/main/CONTRIBUTING.md) before opening an issue or pull request.

### Author & community

- **Author**: [Arvid Nicolaas](https://github.com/vitoke)
- **Sponsors**: Special thanks to early sponsors like [bglgwyng](https://github.com/bglgwyng) 🙌

#### Contributors

<img src="https://contrib.rocks/image?repo=rimbu-org/rimbu" alt="Contributors" />

_Made with [contributors-img](https://contrib.rocks)._

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) for details.
