<p align="center">
  <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" height="96" alt="Rimbu Logo" />
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/@rimbu%2Fsorted.svg)](https://www.npmjs.com/package/@rimbu/sorted)
![License](https://img.shields.io/github/license/rimbu-org/rimbu)
![Types Included](https://img.shields.io/badge/TypeScript-ready-blue)
![Node](https://img.shields.io/badge/Node-18+-6DA55F?logo=node.js&logoColor=white)
![Deno](https://shield.deno.dev/x/rimbu)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg)
![ESM + CJS](https://img.shields.io/badge/modules-ESM%20%2B%20CJS-informational)

</div>

# `@rimbu/sorted`

**Fast, immutable sorted maps and sets for TypeScript & JavaScript.**

`@rimbu/sorted` provides efficient, type-safe **SortedMap** and **SortedSet** implementations.
They keep elements in a **deterministic sorted order** using a configurable comparator (`Comp`),
while offering immutable, persistent semantics and a rich, map/set‑like API.

Use them whenever you need **ordered iteration** (by key or value), **range queries**, or
index‑based slicing on top of regular map/set behaviour.

---

## Table of Contents

1. [Why `@rimbu/sorted`?](#why-rimbu-sorted)
2. [Feature Highlights](#feature-highlights)
3. [Quick Start](#quick-start)
4. [Core Concepts & Types](#core-concepts--types)
5. [Working with `SortedMap`](#working-with-sortedmap)
6. [Working with `SortedSet`](#working-with-sortedset)
7. [Custom Comparators & Contexts](#custom-comparators--contexts)
8. [Installation](#installation)
9. [FAQ](#faq)
10. [Ecosystem & Integration](#ecosystem--integration)
11. [Contributing](#contributing)
12. [License](#license)

---

## Why `@rimbu/sorted`?

Plain `Map` / `Set` in JS don’t know about ordering beyond insertion order.
`@rimbu/sorted` focuses on:

- **Sorted views** – entries (for maps) and values (for sets) are always kept in sorted order.
- **Range queries** – stream or slice by key or value ranges and by index ranges.
- **Index-based access** – get the *n‑th* smallest key or value directly.
- **Immutable operations** – updates return new instances with structural sharing.

If you ever needed to sort a map’s entries repeatedly, maintain parallel sorted arrays,
or build your own tree structures, `SortedMap` / `SortedSet` are usually a better fit.

---

## Feature Highlights

- **SortedMap & SortedSet** – ordered by a configurable comparator (`Comp`‑like interface).
- **Efficient lookups** – map/set semantics with \\(O(\log n)\\)-style updates on persistent trees.
- **Index-aware APIs** – `getAtIndex`, `sliceIndex`, `take`, `drop`, `streamRange`, `streamSliceIndex`.
- **Configurable contexts** – build custom contexts with your own comparison logic and block sizes.
- **Immutable & persistent** – structural sharing for cheap copies, undo/redo, and change detection.

Try Rimbu (including `@rimbu/sorted`) live in the browser using the
[Rimbu Sandbox on CodeSandbox](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts).

---

## Quick Start

```ts
import { SortedMap, SortedSet } from '@rimbu/sorted';

// SortedMap: keys are kept in sorted order
const m = SortedMap.of(
  ['b', 2],
  ['d', 4],
  ['a', 1],
  ['c', 3]
).asNormal(); // convert to a normal (possibly empty) view

console.log(m.toArray());
// => [['a', 1], ['b', 2], ['c', 3], ['d', 4]]

// SortedSet: values are kept in sorted order
const s = SortedSet.of('b', 'd', 'a', 'c').asNormal();
console.log(s.toArray());
// => ['a', 'b', 'c', 'd']
```

See the [Map docs](https://rimbu.org/docs/collections/map),
[Set docs](https://rimbu.org/docs/collections/set), and the
[sorted API reference](https://rimbu.org/api/rimbu/sorted) for full details.

---

## Core Concepts & Types

### Exported Types

From the main entry:

| Name                           | Description                                                                                           |
| ------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `SortedMap<K, V>`              | Immutable, type‑invariant map whose keys are kept in sorted order.                                   |
| `SortedMap.NonEmpty<K, V>`     | Non‑empty refinement of `SortedMap<K, V>` with stronger guarantees.                                   |
| `SortedMap.Context<UK>`        | Factory/context for creating `SortedMap` instances with a given key comparator and tree parameters.   |
| `SortedMap.Builder<K, V>`      | Mutable builder for efficiently constructing or mutating a `SortedMap` before freezing it.           |
| `SortedSet<T>`                 | Immutable, type‑invariant set of values kept in sorted order.                                        |
| `SortedSet.NonEmpty<T>`        | Non‑empty refinement of `SortedSet<T>`.                                                              |
| `SortedSet.Context<UT>`        | Factory/context for creating `SortedSet` instances with a given comparator and tree parameters.      |
| `SortedSet.Builder<T>`         | Mutable builder for efficiently constructing or mutating a `SortedSet` before freezing it.           |

You can import them via:

```ts
import { SortedMap, SortedSet } from '@rimbu/sorted';
// or more granular:
// import { SortedMap } from '@rimbu/sorted/map';
// import { SortedSet } from '@rimbu/sorted/set';
```

---

## Working with `SortedMap`

```ts
import { SortedMap } from '@rimbu/sorted';

// Construction
const empty = SortedMap.empty<string, number>();
const fromEntries = SortedMap.of(
  ['b', 2],
  ['d', 4],
  ['a', 1],
  ['c', 3]
).asNormal();

// Size & emptiness
empty.isEmpty; // true
fromEntries.size; // 4

// Lookups
fromEntries.hasKey('b'); // true
fromEntries.get('c'); // 3

// Sorted access helpers
fromEntries.min(); // ['a', 1]
fromEntries.maxKey(); // 'd'
fromEntries.getAtIndex(1); // ['b', 2]
fromEntries.getValueAtIndex(-1); // 4 (last value)

// Range queries (by key and by index)
fromEntries
  .streamRange({ start: 'b', end: 'c' })
  .toArray(); // [['b', 2], ['c', 3]]

fromEntries
  .sliceIndex({ start: 1, amount: 2 })
  .toArray(); // [['b', 2], ['c', 3]]
```

See the [SortedMap API docs](https://rimbu.org/api/rimbu/sorted/map/SortedMap/interface)
for all operations (including builders, contexts, and more advanced methods).

---

## Working with `SortedSet`

```ts
import { SortedSet } from '@rimbu/sorted';

// Construction
const empty = SortedSet.empty<string>();
const values = SortedSet.of('b', 'd', 'a', 'c').asNormal();

// Basic queries
values.has('b'); // true
values.min(); // 'a'
values.max(); // 'd'

// Index‑based access
values.getAtIndex(1); // 'b'
values.getAtIndex(-1); // 'd'

// Range queries
values
  .streamRange({ start: 'b', end: 'c' })
  .toArray(); // ['b', 'c']

values
  .sliceIndex({ start: 1, amount: 2 })
  .toArray(); // ['b', 'c']
```

See the [SortedSet API docs](https://rimbu.org/api/rimbu/sorted/set/SortedSet/interface)
for the full, strongly‑typed surface.

---

## Custom Comparators & Contexts

By default, `SortedMap` / `SortedSet` use a generic comparator that works well
for most values. For specialised ordering you can create your own context:

```ts
import { SortedSet } from '@rimbu/sorted';

// Comparator compatible with the Comp<UT> interface
const caseInsensitiveStringComp = {
  isComparable: (value: unknown): value is string => typeof value === 'string',
  compare: (a: string, b: string): number =>
    a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()),
};

const ciSetContext = SortedSet.createContext<string>({
  comp: caseInsensitiveStringComp,
  // blockSizeBits (optional) controls the underlying tree node size, default 5
});

const ciSet = ciSetContext.of('a', 'B', 'c');
ciSet.has('b'); // true (case‑insensitive)
```

You can do the same for `SortedMap` by providing a key comparator.
Contexts also expose `builder()` / `createBuilder()` for efficient bulk updates.

---

## Installation

### Node / Bun / npm / Yarn

```sh
npm install @rimbu/sorted
# or
yarn add @rimbu/sorted
# or
bun add @rimbu/sorted
```

### Deno (import map)

```jsonc
{
  "imports": {
    "@rimbu/": "https://deno.land/x/rimbu@<version>/"
  }
}
```

Then:

```ts
import { SortedMap, SortedSet } from '@rimbu/sorted/mod.ts';
```

### Browser / ESM

`@rimbu/sorted` ships both **ESM** and **CJS** builds. Use it with any modern bundler
(Vite, Webpack, esbuild, Bun, etc.) or directly in Node ESM projects.

---

## FAQ

**Q: How is `SortedMap` different from a regular `Map`?**  
`SortedMap` maintains its keys in sorted order rather than insertion order, and
adds index‑based access (`getAtIndex`, `take`, `sliceIndex`, etc.) and range‑based
streaming over keys.

**Q: Are these collections mutable?**  
No. All updates return new instances; existing ones remain unchanged and can be safely
shared across your application.

**Q: What is a “context” and when should I use it?**  
A context (`SortedMap.Context`, `SortedSet.Context`) encapsulates the comparator and
tree configuration. Use custom contexts when you need non‑default ordering or want
to tune block sizes for your workload.

**Q: Do I always need a custom comparator?**  
No. For most use cases the default comparator is sufficient; custom comparators are
useful when domain‑specific ordering (case‑insensitive strings, locale‑aware sorting,
domain‑specific ranks, etc.) is required.

---

## Ecosystem & Integration

- Part of the broader **Rimbu** collection ecosystem – interoperates with `@rimbu/hashed`,
  `@rimbu/ordered`, `@rimbu/collection-types`, and `@rimbu/stream`.
- Ideal for modelling **ordered indexes**, **time‑series views**, **leaderboards**, or
  any domain where sorted iteration and range queries matter.
- Works seamlessly with other Rimbu collections and utilities for building rich, immutable data models.

Explore more at the [Rimbu documentation](https://rimbu.org) and the
[sorted API docs](https://rimbu.org/api/rimbu/sorted).

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
