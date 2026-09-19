<p align="center">
  <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" height="96" alt="Rimbu Logo" />
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/@rimbu%2Fordered.svg)](https://www.npmjs.com/package/@rimbu/ordered)
![License](https://img.shields.io/github/license/rimbu-org/rimbu)
![Types Included](https://img.shields.io/badge/TypeScript-ready-blue)
![Node](https://img.shields.io/badge/Node-18+-6DA55F?logo=node.js&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg)
![ESM](https://img.shields.io/badge/modules-ESM-informational)

</div>

## `@rimbu/ordered`

**Immutable ordered maps and sets for TypeScript & JavaScript.**

`@rimbu/ordered` provides **OrderedMap** and **OrderedSet** collections that
preserve **insertion order** while exposing the standard immutable
`MapCollection` / `SetCollection` capability API. You get predictable iteration
order, persistent updates, and the same vocabulary as `HashMap`/`HashSet`.

Use it whenever you need **stable iteration order**, **consistent UI rendering**,
or **ordered serialization**, without giving up immutability.

---

## Table of Contents

1. [Feature Highlights](#feature-highlights)
2. [Quick Start](#quick-start)
3. [Core Concepts & Types](#core-concepts--types)
4. [Order Semantics](#order-semantics)
5. [Choosing Key Storage](#choosing-key-storage)
6. [Installation](#installation)
7. [FAQ](#faq)
8. [Ecosystem & Integration](#ecosystem--integration)
9. [Contributing](#contributing)
10. [License](#license)
11. [Attributions](#attributions)

---

## Feature Highlights

- **Stable insertion order** – iteration and streaming follow the order in which
  entries were first added.
- **Immutable updates** – every operation returns a new collection; previous
  versions remain usable and share structure.
- **Standard capability API** – `get`, `has`, `set`, `add`, `removeKey`,
  `modifyAtKey`, `updateAtKey`, `map`, `mapValues`, `filter`, `NonEmpty`
  refinements, and the rest of the `MapCollection`/`SetCollection` surface.
- **Configurable key storage** – pick a hashed or sorted key map through the
  context without changing the ordered API or the iteration order.
- **Stream-friendly** – integrates with the broader Rimbu stream ecosystem.

---

## Quick Start

```ts
import { OrderedMap, OrderedSet } from '@rimbu/ordered';

const map = OrderedMap.of([1, 'a'], [2, 'b'], [3, 'c']);
map.toArray(); // [[1, 'a'], [2, 'b'], [3, 'c']]

// Updating an existing key keeps its position
map.set(1, 'z').toArray(); // [[1, 'z'], [2, 'b'], [3, 'c']]

// Building incrementally
const built = OrderedMap.builder<number, string>()
  .add([1, 'a'])
  .add([2, 'b'])
  .build();

const set = OrderedSet.of('b', 'a', 'c', 'b');
set.toArray(); // ['b', 'a', 'c']
```

---

## Core Concepts & Types

`OrderedMap<K, V>` and `OrderedSet<T>` are the main immutable types. Both have a
`NonEmpty` refinement that is tracked at the type level:

| Type | Description |
|---|---|
| `OrderedMap<K, V>` | Immutable, type-invariant map preserving key insertion order. |
| `OrderedMap.NonEmpty<K, V>` | Non-empty refinement; methods like `first()` need no fallback. |
| `OrderedMap.Builder<K, V>` | Mutable builder for efficient batch construction. |
| `OrderedMap.Context<UK>` | Factory/context for creating `OrderedMap` instances. |
| `OrderedSet<T>` | Immutable, type-invariant set preserving element insertion order. |
| `OrderedSet.NonEmpty<T>` | Non-empty refinement. |
| `OrderedSet.Builder<T>` | Mutable builder for efficient batch construction. |
| `OrderedSet.Context<UT>` | Factory/context for creating `OrderedSet` instances. |

The exported `OrderedMap` / `OrderedSet` values are terminal factories exposing
`empty`, `of`, `from`, `builder`, `reducer`, and `createContext`.

---

## Order Semantics

- New keys and elements are **appended**.
- Updating an existing key's value – through `set`, `add`, `modifyAtKey`, or
  `updateAtKey` – **keeps its position**.
- Setting an existing key to an `Object.is`-equal value is a **no-op**.
- Removing and re-adding a key/element **appends it at the end**.
- `mapValues` keeps positions; `filter` keeps the relative order of survivors;
  `map`/`flatMap` rebuild in the order emitted by the mapping function.

---

## Choosing Key Storage

By default keys are stored in a `HashMap`. Pass another map context to change
key equality/lookup semantics. Iteration order is always insertion order,
regardless of the key map.

```ts
import { OrderedMap } from '@rimbu/ordered/map';
import { SortedMap } from '@rimbu/sorted/map';

const sortedKeys = OrderedMap.createContext<number>({
  keyMapContext: SortedMap.createContext<number>({}),
  // block size of the internal ordering index (default 5)
  indicatorBlockSizeBits: 5,
});

sortedKeys.of([3, 'c'], [1, 'a'], [2, 'b']).toArray();
// [[3, 'c'], [1, 'a'], [2, 'b']] – insertion order, not key order
```

Internally each collection maintains a key map (key → value + order indicator)
and a sorted indicator map that defines the iteration order. The indicator
context is private; only its `indicatorBlockSizeBits` is configurable.

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

`@rimbu/ordered` ships an ESM build. Use it with any modern bundler (Vite,
Webpack, esbuild, Bun, etc.) or directly in Node ESM projects.

---

## FAQ

**Q: How is an `OrderedMap` different from a regular `Map`?**  
A `Map` preserves insertion order too, but `OrderedMap` is immutable, exposes the
Rimbu capability API, and can be configured with hashed or sorted key storage
while always iterating in insertion order.

**Q: What happens if I insert an existing key?**  
Its value is updated in place and its position is unchanged. To move a key to the
end, remove it first and then add it again.

**Q: Are these structures mutable?**  
No. All updates return new instances; previous ones remain usable and can be
freely shared.

**Q: How do I get a hash-backed vs sorted-key ordered map?**  
Use `OrderedMap.createContext({ keyMapContext })`. There are no separate
`OrderedHashMap`/`OrderedSortedMap` types.

---

## Ecosystem & Integration

- Part of the broader **Rimbu** collection ecosystem – interoperates with
  `@rimbu/hashed`, `@rimbu/sorted`, `@rimbu/collection-types`, and `@rimbu/stream`.
- Ideal for modelling ordered logs and timelines, UI lists with stable rendering
  order, and any domain where **relative insertion order** is part of the data
  model.

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
