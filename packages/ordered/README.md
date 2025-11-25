<p align="center">
  <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" height="96" alt="Rimbu Logo" />
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/@rimbu%2Fordered.svg)](https://www.npmjs.com/package/@rimbu/ordered)
![License](https://img.shields.io/github/license/rimbu-org/rimbu)
![Types Included](https://img.shields.io/badge/TypeScript-ready-blue)
![Node](https://img.shields.io/badge/Node-18+-6DA55F?logo=node.js&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg)
![ESM + CJS](https://img.shields.io/badge/modules-ESM%20%2B%20CJS-informational)

</div>

## `@rimbu/ordered`

**Immutable ordered maps and sets for TypeScript & JavaScript.**

`@rimbu/ordered` provides **OrderedMap** and **OrderedSet** collections that preserve **insertion order** while wrapping high-performance `RMap` and `RSet` implementations. You get predictable iteration order, efficient updates via persistent data structures, and familiar map/set semantics.

Use it whenever you need **stable iteration order**, **consistent UI rendering**, or want to **augment existing maps/sets with ordering semantics** without giving up immutability.

---

## Table of Contents

1. [Why `@rimbu/ordered`?](#why-rimbu-ordered)
2. [Feature Highlights](#feature-highlights)
3. [Quick Start](#quick-start)
4. [Core Concepts & Types](#core-concepts--types)
5. [Working with Hash & Sorted Variants](#working-with-hash--sorted-variants)
6. [Performance Notes](#performance-notes)
7. [Installation](#installation)
8. [FAQ](#faq)
9. [Ecosystem & Integration](#ecosystem--integration)
10. [Contributing](#contributing)
11. [License](#license)
12. [Attributions](#attributions)

---

## Why `@rimbu/ordered`?

Plain maps and sets do not always guarantee predictable ordering semantics across environments, and even when they do, you may want **explicit, controllable order** that is part of your data model.

`@rimbu/ordered` focuses on:

- **Explicit insertion order** – every key or value remembers _when_ it was added.
- **Immutable updates** – structural sharing keeps operations fast and memory‑friendly.
- **Composable contexts** – you can wrap different underlying map/set implementations (hash or sorted) while keeping a consistent ordered API.
- **Stream‑friendly iteration** – integrates with the broader Rimbu stream ecosystem.

If you care about how items are rendered, serialized, or traversed, ordered collections are often the right abstraction.

---

## Feature Highlights

- **Stable insertion order** – iteration and streaming follow the order of insertion.
- **Multiple backing stores** – use hash‑based or sorted underlying maps/sets depending on your needs.
- **Immutable & persistent** – safe structural sharing for snapshots and undo/redo style workflows.
- **Rich APIs** – full map/set operations plus access to:
  - `keyOrder` / `order` as a `List`
  - `sourceMap` / `sourceSet` to reach the underlying collection.
- **Configurable contexts** – `createContext` and `defaultContext` let you control hashing, sorting, and list behavior.

---

## Quick Start

```ts
import {
  OrderedMap,
  OrderedHashMap,
  OrderedSet,
  OrderedHashSet,
} from '@rimbu/ordered';

// Ordered hash-based map (keys hashed via HashMap)
const m = OrderedHashMap.of(
  [2, 'b'],
  [1, 'a'],
  [3, 'c']
);

console.log(m.toString());
// OrderedHashMap(2 -> 'b', 1 -> 'a', 3 -> 'c')

// Ordered hash-based set
const s = OrderedHashSet.of('b', 'a', 'c', 'b');

console.log(s.toArray());
// ['b', 'a', 'c']

// Plain OrderedMap wrapping an arbitrary RMap context
const ctx = OrderedMap.createContext<number>({
  listContext: undefined, // use default List context
  mapContext: /* any RMap.Context<number> */,
});
const ordered = ctx.of(
  [1, 'one'],
  [2, 'two']
);

console.log(ordered.keyOrder.toArray());
// [1, 2]
```

Try Rimbu (including `@rimbu/ordered`) live in the browser using the
[Rimbu Sandbox on CodeSandbox](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts).

---

## Core Concepts & Types

`@rimbu/ordered` is a convenience package that re‑exports from:

- `@rimbu/ordered/map`
- `@rimbu/ordered/set`

### Exported Map Types

From `@rimbu/ordered/map`:

| Name                             | Description                                                                                                                      |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `OrderedMap<K, V>`               | Immutable, type‑invariant ordered map that preserves key insertion order while wrapping a generic `RMap`.                        |
| `OrderedMap.NonEmpty<K, V>`      | Non‑empty refinement of `OrderedMap<K, V>` with stronger guarantees (e.g. `size > 0`, non‑empty `keyOrder`).                     |
| `OrderedMap.Context<UK>`         | Factory/context for creating `OrderedMap` instances, configured with a `List.Context` and the underlying map `RMap.Context<UK>`. |
| `OrderedMap.Builder<K, V>`       | Mutable builder for efficiently constructing or mutating an ordered map before freezing it into an immutable instance.           |
| `OrderedHashMap<K, V>`           | Ordered map backed by a `HashMap`, using hash‑based key equality from `@rimbu/hashed/map`.                                       |
| `OrderedHashMap.NonEmpty<K, V>`  | Non‑empty refinement of `OrderedHashMap<K, V>`.                                                                                  |
| `OrderedHashMap.Context<UK>`     | Context for `OrderedHashMap`, exposing `hasher` and `eq` from the underlying `HashMap.Context`.                                  |
| `OrderedHashMap.Builder<K, V>`   | Mutable builder for `OrderedHashMap`.                                                                                            |
| `OrderedSortedMap<K, V>`         | Ordered map backed by a `SortedMap`, combining sorted semantics with insertion order tracking.                                   |
| `OrderedSortedMap.NonEmpty<K,V>` | Non‑empty refinement of `OrderedSortedMap<K, V>`.                                                                                |
| `OrderedSortedMap.Context<UK>`   | Context for `OrderedSortedMap`, using a `SortedMap.Context<UK>` as backing.                                                      |
| `OrderedSortedMap.Builder<K, V>` | Mutable builder for `OrderedSortedMap`.                                                                                          |

Key additional properties:

- `OrderedMapBase.keyOrder: List<K>` – a `List` representing the key insertion order.
- `OrderedMapBase.sourceMap` – the underlying `RMap`/`HashMap`/`SortedMap` instance.

### Exported Set Types

From `@rimbu/ordered/set`:

| Name                           | Description                                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `OrderedSet<T>`                | Immutable, type‑invariant ordered set that preserves value insertion order while wrapping a generic `RSet`.        |
| `OrderedSet.NonEmpty<T>`       | Non‑empty refinement of `OrderedSet<T>` with a non‑empty `order` and `sourceSet`.                                  |
| `OrderedSet.Context<UT>`       | Factory/context for `OrderedSet` instances, configured with a `List.Context` and an underlying `RSet.Context<UT>`. |
| `OrderedSet.Builder<T>`        | Mutable builder for efficiently constructing an ordered set.                                                       |
| `OrderedHashSet<T>`            | Ordered set backed by `HashSet`, using hash‑based equality for values.                                             |
| `OrderedHashSet.NonEmpty<T>`   | Non‑empty refinement of `OrderedHashSet<T>`.                                                                       |
| `OrderedHashSet.Context<UT>`   | Context for `OrderedHashSet`, using `HashSet.Context<UT>` as backing.                                              |
| `OrderedHashSet.Builder<T>`    | Mutable builder for `OrderedHashSet`.                                                                              |
| `OrderedSortedSet<T>`          | Ordered set backed by `SortedSet`, combining sorted semantics with insertion‑order tracking.                       |
| `OrderedSortedSet.NonEmpty<T>` | Non‑empty refinement of `OrderedSortedSet<T>`.                                                                     |
| `OrderedSortedSet.Context<UT>` | Context for `OrderedSortedSet`, using `SortedSet.Context<UT>` as backing.                                          |
| `OrderedSortedSet.Builder<T>`  | Mutable builder for `OrderedSortedSet`.                                                                            |

Key additional properties:

- `OrderedSetBase.order: List<T>` – a `List` representing the insertion order of values.
- `OrderedSetBase.sourceSet` – the underlying `RSet`/`HashSet`/`SortedSet` instance.

See the full [Map documentation](https://rimbu.org/docs/collections/map),
[Set documentation](https://rimbu.org/docs/collections/set),
and the [Ordered API reference](https://rimbu.org/api/rimbu/ordered) for all operations.

---

## Working with Hash & Sorted Variants

### OrderedHashMap

```ts
import { OrderedHashMap } from '@rimbu/ordered';

const map = OrderedHashMap.of([1, 'a'], [2, 'b'], [3, 'c']);

map.keyOrder.toArray(); // [1, 2, 3]
map.sourceMap.toString(); // HashMap(1 -> 'a', 2 -> 'b', 3 -> 'c')
```

Use `OrderedHashMap` when:

- You want **fast hash‑based lookups** with explicit insertion order.
- You are already using `HashMap` and want to add ordered semantics.

### OrderedSortedMap

```ts
import { OrderedSortedMap } from '@rimbu/ordered';

const sorted = OrderedSortedMap.of([2, 'b'], [1, 'a'], [3, 'c']);

sorted.keyOrder.toArray(); // [2, 1, 3]
sorted.sourceMap.toString(); // SortedMap(1 -> 'a', 2 -> 'b', 3 -> 'c')
```

Use `OrderedSortedMap` when:

- You need **sorted key semantics** plus **remembered insertion order**.
- You want predictable key ordering for serialization but still care about insertion history.

### OrderedHashSet & OrderedSortedSet

```ts
import { OrderedHashSet, OrderedSortedSet } from '@rimbu/ordered';

const hashSet = OrderedHashSet.of('b', 'a', 'c', 'b');
hashSet.order.toArray(); // ['b', 'a', 'c']

const sortedSet = OrderedSortedSet.of('b', 'a', 'c');
sortedSet.order.toArray(); // ['b', 'a', 'c']
sortedSet.sourceSet.toString(); // SortedSet('a', 'b', 'c')
```

Choose:

- `OrderedHashSet` for **hash‑based equality** and ordered semantics.
- `OrderedSortedSet` when you also want a **sorted** backing set.

---

## Performance Notes

- Ordered collections are built on top of Rimbu’s **persistent data structures** – typical updates are \\(O(\log n)\\) and share most of their structure with previous versions.
- The cost of ordering is primarily:
  - Maintaining a `List` (`keyOrder` / `order`) for insertion order.
  - Delegating key/value membership and lookup to the underlying `RMap` / `RSet`.
- Hash‑based variants behave similarly to `HashMap` / `HashSet`, while sorted variants behave similarly to `SortedMap` / `SortedSet` for membership and lookup.

For detailed performance characteristics and benchmarks, see the main Rimbu documentation at [rimbu.org](https://rimbu.org).

---

## Installation

### Node / Bun / npm / Yarn / Deno

```sh
npm install @rimbu/ordered
# or
yarn add @rimbu/ordered
# or
bun add @rimbu/ordered
# or
deno add npm:@rimbu/ordered
```

### Browser / ESM

`@rimbu/ordered` ships both **ESM** and **CJS** builds. Use it with any modern bundler
(Vite, Webpack, esbuild, Bun, etc.) or directly in Node ESM projects.

---

## FAQ

**Q: How is an `OrderedMap` different from a regular `Map`?**  
An `OrderedMap` explicitly tracks insertion order in a `List` while delegating key/value
storage to an underlying `RMap`. You get predictable iteration order plus the full Rimbu map API.

**Q: What happens if I insert an existing key?**  
The value for that key is updated, but the key’s existing position in the order remains
unchanged (it does not move to the end).

**Q: Are these structures mutable?**  
No. All updates return new instances; previous ones remain usable and can be freely shared.

**Q: Can I access the underlying map or set?**  
Yes. Use `sourceMap` / `sourceSet` to reach the wrapped `RMap` / `RSet` (or `HashMap` / `SortedMap` / `HashSet` / `SortedSet`).

---

## Ecosystem & Integration

- Part of the broader **Rimbu** collection ecosystem – interoperates with `@rimbu/hashed`,
  `@rimbu/sorted`, `@rimbu/collection-types`, and `@rimbu/stream`.
- Ideal for modelling:
  - Ordered logs and timelines
  - UI lists and menus with stable rendering order
  - Any domain where **relative insertion order** is part of the data model.

Explore more at the [Rimbu documentation](https://rimbu.org) and the
[Ordered API docs](https://rimbu.org/api/rimbu/ordered).

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
