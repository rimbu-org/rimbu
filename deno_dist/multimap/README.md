<p align="center">
  <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" height="96" alt="Rimbu Logo" />
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/@rimbu%2Fmultimap.svg)](https://www.npmjs.com/package/@rimbu/multimap)
![License](https://img.shields.io/github/license/rimbu-org/rimbu)
![Types Included](https://img.shields.io/badge/TypeScript-ready-blue)
![Node](https://img.shields.io/badge/Node-18+-6DA55F?logo=node.js&logoColor=white)
![Deno](https://shield.deno.dev/x/rimbu)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg)
![ESM + CJS](https://img.shields.io/badge/modules-ESM%20%2B%20CJS-informational)

</div>

# `@rimbu/multimap`

**Fast, immutable multimaps (multi‑value maps) for TypeScript & JavaScript.**

`@rimbu/multimap` provides efficient, type‑safe **MultiMap** implementations: data structures where
each key can be associated with **one or more unique values**. Values for a key are stored in a
set‑like collection, so duplicates are automatically removed, while all operations remain immutable
and persistent.

Use it whenever you need to model **one‑to‑many relationships** such as tags, roles, inverted
indexes, or adjacency lists.

---

## Table of Contents

1. [Why `@rimbu/multimap`?](#why-rimbu-multimap)
2. [Feature Highlights](#feature-highlights)
3. [Quick Start](#quick-start)
4. [Core Concepts & Types](#core-concepts--types)
5. [Working with Hash & Sorted MultiMaps](#working-with-hash--sorted-multimaps)
6. [Performance Notes](#performance-notes)
7. [Installation](#installation)
8. [FAQ](#faq)
9. [Ecosystem & Integration](#ecosystem--integration)
10. [Contributing](#contributing)
11. [License](#license)

---

## Why `@rimbu/multimap`?

Plain maps give you **key → value** mappings, but many real‑world use cases are **one‑to‑many**:

- Users → roles, groups, or permissions.
- Documents → tags or keywords.
- Graphs → adjacency lists (node → neighbours).
- Indices → all items matching a category or property.

`@rimbu/multimap` focuses on:

- **Multiple values per key** – each key can have a set of unique values.
- **Immutable operations** – updates return new instances, sharing structure internally.
- **Flexible underlying storage** – hash‑based or sorted keys and values.
- **Ergonomic API** – map‑like operations, plus multi‑value‑aware helpers.

If you ever keep a map from keys to sets of values manually, a MultiMap is usually a better fit.

---

## Feature Highlights

- **One‑to‑many mappings** – each key can be associated with multiple unique values.
- **Uniqueness per key** – values for a given key are stored in a set; duplicates are dropped.
- **Hash & sorted variants** – choose hashing for speed or sorted variants for deterministic order.
- **Immutable & persistent** – structural sharing for fast copies and history‑friendly updates.
- **Configurable contexts** – build custom configurations via `createContext` for advanced use cases.
- **Rich operations** – add/remove values, bulk updates, streaming, traversal utilities.

---

## Quick Start

```ts
import { HashMultiMapHashValue } from '@rimbu/multimap';

// Create from entry tuples: key -> value
const multi = HashMultiMapHashValue.of(
  [1, 'a'],
  [1, 'b'],
  [2, 'a']
);

// Each key maps to a set of unique values
console.log(multi.getValues(1).toArray());
// ['a', 'b']

// Adding values returns a new multimap
const updated = multi.add(2, 'c');
console.log(updated.getValues(2).toArray());
// ['a', 'c']

// Removing keys or entries is also immutable
const withoutKey1 = updated.removeKey(1);
const withoutEntry = updated.removeEntry(2, 'a');
```

Try Rimbu (including `@rimbu/multimap`) live in the browser using the
[Rimbu Sandbox on CodeSandbox](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts).

---

## Core Concepts & Types

### Exported Types

From `@rimbu/multimap` you get the following core types:

| Name                                  | Description                                                                                                           |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `MultiMap<K, V>`                      | Generic, type‑invariant multimap interface: keys of type `K` mapping to sets of values `V`.                           |
| `MultiMap.NonEmpty<K, V>`            | Non‑empty refinement of `MultiMap<K, V>` with stronger type guarantees.                                               |
| `MultiMap.Context<UK, UV>`           | Context/factory for creating `MultiMap` instances with configurable underlying map & set contexts.                   |
| `MultiMap.Builder<K, V>`             | Mutable builder for efficiently constructing or mutating a `MultiMap` before freezing it.                             |
| `VariantMultiMap<K, V>`              | Read‑only, type‑variant multimap interface; supports safe type‑widening but no mutating operations.                  |
| `VariantMultiMap.NonEmpty<K, V>`     | Non‑empty refinement of `VariantMultiMap<K, V>`.                                                                      |
| `HashMultiMapHashValue<K, V>`        | Multimap with **hashed keys** and **hashed value sets** (`HashMap` + `HashSet`).                                      |
| `HashMultiMapSortedValue<K, V>`      | Multimap with **hashed keys** and **sorted value sets** (`HashMap` + `SortedSet`).                                    |
| `SortedMultiMapHashValue<K, V>`      | Multimap with **sorted keys** and **hashed value sets** (`SortedMap` + `HashSet`).                                    |
| `SortedMultiMapSortedValue<K, V>`    | Multimap with **sorted keys** and **sorted value sets** (`SortedMap` + `SortedSet`).                                  |
| `HashMultiMapHashValue.Context<UK, UV>`     | Context for `HashMultiMapHashValue`, exposing configuration and factories.                                           |
| `HashMultiMapSortedValue.Context<UK, UV>`   | Context for `HashMultiMapSortedValue`.                                                                               |
| `SortedMultiMapHashValue.Context<UK, UV>`   | Context for `SortedMultiMapHashValue`.                                                                               |
| `SortedMultiMapSortedValue.Context<UK, UV>` | Context for `SortedMultiMapSortedValue`.                                                                             |

### Key Operations (HashMultiMapHashValue)

```ts
import { HashMultiMapHashValue } from '@rimbu/multimap';

// Construction
const empty = HashMultiMapHashValue.empty<number, string>();
const fromEntries = HashMultiMapHashValue.of(
  [1, 'a'],
  [1, 'b'],
  [2, 'a']
);

// Size & key count
empty.isEmpty; // true
fromEntries.keySize; // 2 (keys: 1, 2)
fromEntries.size; // 3 (entries: [1, 'a'], [1, 'b'], [2, 'a'])

// Lookups
fromEntries.hasKey(1); // true
fromEntries.hasEntry(1, 'b'); // true
fromEntries.getValues(1).toArray(); // ['a', 'b']

// Updating (returns new MultiMap)
const withMore = fromEntries.add(2, 'c');
const replaced = fromEntries.setValues(1, ['x', 'y']);

// Removing
const withoutKey = fromEntries.removeKey(2);
const withoutEntry = fromEntries.removeEntry(1, 'a');
```

See the full [MultiMap docs](https://rimbu.org/docs/collections/multimap) and
[API reference](https://rimbu.org/api/rimbu/multimap) for all operations.

---

## Working with Hash & Sorted MultiMaps

All concrete variants share the same `MultiMap` semantics but differ in how keys and values are
stored internally:

```ts
import {
  HashMultiMapHashValue,
  HashMultiMapSortedValue,
  SortedMultiMapHashValue,
  SortedMultiMapSortedValue,
} from '@rimbu/multimap';

// Hash keys, hash value sets (fast, unordered)
const hashHash = HashMultiMapHashValue.of([1, 'a'], [1, 'b'], [2, 'a']);

// Hash keys, sorted value sets (deterministic value order per key)
const hashSorted = HashMultiMapSortedValue.of([1, 'b'], [1, 'a'], [2, 'c']);
hashSorted.getValues(1).toArray(); // ['a', 'b']

// Sorted keys, hash value sets (sorted key order, fast values)
const sortedHash = SortedMultiMapHashValue.of(['b', 1], ['a', 2]);
sortedHash.streamKeys().toArray(); // ['a', 'b']

// Sorted keys, sorted value sets
const sortedSorted = SortedMultiMapSortedValue.of(
  ['b', 2],
  ['b', 1],
  ['a', 3]
);
sortedSorted.stream().toArray();
// [['a', 3], ['b', 1], ['b', 2]] (keys and values sorted)
```

If you need custom underlying contexts (e.g. custom hashers or comparators), you can create them via
`createContext`:

```ts
import { HashMultiMapHashValue } from '@rimbu/multimap';

const context = HashMultiMapHashValue.createContext<number, string>({
  // optional: custom key/value contexts
});

const multi = context.of([1, 'a'], [1, 'b']);
```

For read‑only, type‑variant views that can be safely widened, use the `VariantMultiMap` interfaces
exported from this package.

---

## Performance Notes

- MultiMaps in Rimbu are built on **persistent data structures** – updates are typically
  \\(O(\log n)\\) and share most of their structure.
- Lookups and updates behave similarly to the underlying `HashMap` / `SortedMap` and `HashSet` /
  `SortedSet` implementations.
- Many bulk operations accept generic `StreamSource` inputs, letting you construct and transform
  MultiMaps efficiently from arrays, iterables, or streams.

For detailed performance characteristics and benchmarks, see the main Rimbu documentation at
[rimbu.org](https://rimbu.org).

---

## Installation

### Node / Bun / npm / Yarn

```sh
npm install @rimbu/multimap
# or
yarn add @rimbu/multimap
# or
bun add @rimbu/multimap
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
import { HashMultiMapHashValue } from '@rimbu/multimap/mod.ts';
```

### Browser / ESM

`@rimbu/multimap` ships both **ESM** and **CJS** builds. Use it with any modern bundler
(Vite, Webpack, esbuild, Bun, etc.) or directly in Node ESM projects.

---

## FAQ

**Q: How is a MultiMap different from a regular Map?**  
A MultiMap allows **multiple unique values per key**. Retrieval is still keyed, but you work with
sets of values (`getValues(key)`), not a single value.

**Q: Are values per key ordered?**  
That depends on the variant. Hash‑based value sets (`HashMultiMapHashValue`, `SortedMultiMapHashValue`)
are not ordered; sorted value sets (`HashMultiMapSortedValue`, `SortedMultiMapSortedValue`) are.

**Q: Is the structure mutable?**  
No. All updates return new instances; existing ones remain unchanged and can be safely shared across
your application.

**Q: Can I iterate keys or values separately?**  
Yes. Use `stream`, `streamKeys`, `streamValues`, or the underlying `keyMap` to traverse in different
ways.

---

## Ecosystem & Integration

- Part of the broader **Rimbu** collection ecosystem – interoperates with `@rimbu/hashed`,
  `@rimbu/ordered`, `@rimbu/collection-types`, and `@rimbu/stream`.
- Ideal for modelling tag systems, permission sets, inverted indices, and adjacency lists.
- Works seamlessly with other Rimbu collections and utilities for building rich, immutable data
  models.

Explore more at the [Rimbu documentation](https://rimbu.org) and the
[MultiMap API docs](https://rimbu.org/api/rimbu/multimap).

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
