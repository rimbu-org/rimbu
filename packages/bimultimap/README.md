<p align="center">
  <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" height="96" alt="Rimbu Logo" />
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/@rimbu%2Fbimultimap.svg)](https://www.npmjs.com/package/@rimbu/bimultimap)
![License](https://img.shields.io/github/license/rimbu-org/rimbu)
![Types Included](https://img.shields.io/badge/TypeScript-ready-blue)
![Node](https://img.shields.io/badge/Node-18+-6DA55F?logo=node.js&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg)
![ESM + CJS](https://img.shields.io/badge/modules-ESM%20%2B%20CJS-informational)

</div>

# `@rimbu/bimultimap`

**Immutable many‑to‑many bidirectional multimaps for TypeScript & JavaScript.**

`@rimbu/bimultimap` provides an efficient, type‑safe **BiMultiMap**: a data structure that maintains a many‑to‑many relationship between keys and values. Each key can map to multiple values, each value can map to multiple keys, and all associations are kept in sync in **both directions** with immutable, persistent semantics.

Use it whenever you need **reverse lookups over multi‑valued relationships** (e.g. tags ↔ items, users ↔ groups, roles ↔ permissions) without manually juggling two separate multimaps.

---

## Table of Contents

1. [Why `@rimbu/bimultimap`?](#why-rimbu-bimultimap)
2. [Feature Highlights](#feature-highlights)
3. [Quick Start](#quick-start)
4. [Core Concepts & Types](#core-concepts--types)
5. [Working with Hash & Sorted BiMultiMaps](#working-with-hash--sorted-bimultimaps)
6. [Performance Notes](#performance-notes)
7. [Installation](#installation)
8. [FAQ](#faq)
9. [Ecosystem & Integration](#ecosystem--integration)
10. [Contributing](#contributing)
11. [License](#license)
12. [Attributions](#attributions)

---

## Why `@rimbu/bimultimap`?

Plain multimaps give you **key → values** lookups, but in many domains you also need efficient **values → keys**:

- **Tagging & categorization** – `item ↔ tags`, `user ↔ roles`, `post ↔ topics`.
- **Bidirectional indices** – `id ↔ features`, `entity ↔ relations`.
- **Graph‑like structures** – modelling adjacency where both node → neighbors and neighbor → nodes are interesting.

`@rimbu/bimultimap` focuses on:

- **True two‑way navigation** – every key‑value association is mirrored as a value‑key association.
- **Immutable operations** – updates return new instances, sharing most of their structure internally.
- **Multi‑valued associations** – both keys and values can be associated with multiple counterparts.
- **Ergonomic API** – familiar multimap‑like operations plus BiMultiMap‑specific helpers.

If you find yourself maintaining **two multimaps in sync**, a BiMultiMap is usually the better fit.

---

## Feature Highlights

- **Bidirectional many‑to‑many lookups** – efficient `key → values` and `value → keys` access.
- **Rich operations** – add/remove by key, value, or entry; bulk updates; streaming; traversal utilities.
- **Immutable & persistent** – structural sharing for fast copies and snapshots.
- **Multiple views** – access `keyValueMultiMap` and `valueKeyMultiMap` as regular Rimbu multimaps.
- **Hash & sorted variants** – choose `HashBiMultiMap` for speed, `SortedBiMultiMap` for ordering.

---

## Quick Start

```ts
import { HashBiMultiMap } from '@rimbu/bimultimap';

// Create from entry tuples
const biMultiMap = HashBiMultiMap.of([1, 'a'], [1, 'b'], [2, 'b']);

// Forward lookup: key -> values
console.log(biMultiMap.getValues(1).toArray()); // ['a', 'b']

// Reverse lookup: value -> keys
console.log(biMultiMap.getKeys('b').toArray()); // [1, 2]

// Add more associations immutably
const updated = biMultiMap.add(2, 'c');
console.log(updated.getValues(2).toArray()); // ['b', 'c']
```

Try Rimbu (including `@rimbu/bimultimap`) live in the browser using the
[Rimbu Sandbox on CodeSandbox](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts).

---

## Core Concepts & Types

### Exported Types

| Name                        | Description                                                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `BiMultiMap<K, V>`          | Immutable, type‑invariant bidirectional **MultiMap** with a many‑to‑many relationship between `K` and `V`.              |
| `BiMultiMap.NonEmpty<K, V>` | Non‑empty refinement of `BiMultiMap<K, V>` with stronger type guarantees.                                               |
| `HashBiMultiMap<K, V>`      | BiMultiMap implementation backed by hashed multimaps – great default for most use cases.                                |
| `SortedBiMultiMap<K, V>`    | BiMultiMap implementation backed by sorted multimaps – keeps entries ordered by key / value depending on configuration. |

### Key Operations

```ts
import { HashBiMultiMap } from '@rimbu/bimultimap';

// Construction
const empty = HashBiMultiMap.empty<number, string>();
const fromEntries = HashBiMultiMap.of([1, 'one'], [1, 'uno'], [2, 'two']);

// Size & emptiness
empty.isEmpty; // true
fromEntries.size; // 3 (three key-value associations)
fromEntries.keySize; // 2 (keys: 1 and 2)

// Lookups
fromEntries.hasKey(1); // true
fromEntries.hasValue('two'); // true
fromEntries.hasEntry(1, 'uno'); // true

fromEntries.getValues(1).toArray(); // ['one', 'uno']
fromEntries.getKeys('two').toArray(); // [2]

// Updating (returns new HashBiMultiMap)
const withMore = fromEntries.add(2, 'dos');

// Removing by key or value
const withoutKey = withMore.removeKey(1);
const withoutValue = withMore.removeValue('two');
```

See the full [BiMultiMap docs](https://rimbu.org/docs/collections/bimultimap) and
[API reference](https://rimbu.org/api/rimbu/bimultimap) for all operations.

---

## Working with Hash & Sorted BiMultiMaps

```ts
import { HashBiMultiMap, SortedBiMultiMap } from '@rimbu/bimultimap';

// HashBiMultiMap: fast hash-based implementation
const hashBiMultiMap = HashBiMultiMap.of(
  ['alice', 'admin'],
  ['alice', 'editor'],
  ['bob', 'viewer']
);

// SortedBiMultiMap: ordered by keys and/or values
const sortedBiMultiMap = SortedBiMultiMap.of(
  ['alice', 'admin'],
  ['alice', 'editor'],
  ['bob', 'viewer']
);

// Both support the same BiMultiMap interface:
hashBiMultiMap.getValues('alice').toArray(); // ['admin', 'editor']
sortedBiMultiMap.getKeys('viewer').toArray(); // ['bob']

// Iterate like any other Rimbu collection
for (const [user, role] of sortedBiMultiMap) {
  console.log(user, role);
}
```

- **Choose `HashBiMultiMap`** when you care about raw lookup/update performance.
- **Choose `SortedBiMultiMap`** when stable ordering (e.g. for UI rendering, serialization, or range‑like operations) matters.

---

## Performance Notes

- BiMultiMaps in Rimbu are built on **persistent data structures** – updates are typically \\(O(\log n)\\) and share most of their structure.
- Lookups by key or value are designed to behave similarly to their underlying multimap implementations (hashed / sorted).
- Many bulk operations accept generic `StreamSource` inputs, letting you construct and transform BiMultiMaps efficiently from arrays, iterables, or streams.

For detailed performance characteristics and benchmarks, see the main Rimbu documentation at [rimbu.org](https://rimbu.org).

---

## Installation

### Node / Bun / npm / Yarn

```sh
npm install @rimbu/bimultimap
# or
yarn add @rimbu/bimultimap
# or
bun add @rimbu/bimultimap
# or
deno add npm:@rimbu/bimultimap
```

### Browser / ESM

`@rimbu/bimultimap` ships both **ESM** and **CJS** builds. Use it with any modern bundler
(Vite, Webpack, esbuild, Bun, etc.) or directly in Node ESM projects.

---

## FAQ

**Q: How is a BiMultiMap different from a regular Map or MultiMap?**  
A BiMultiMap maintains **two synchronized multimaps** under the hood: one for `key → values`
and one for `value → keys`. You get efficient lookups in both directions without manually
maintaining two separate structures.

**Q: Can a key or value appear multiple times?**  
Yes. Unlike a BiMap, a BiMultiMap allows a key to be associated with multiple values and a
value with multiple keys. Operations like `add`, `getValues`, and `getKeys` are designed
around this many‑to‑many model.

**Q: Is the structure mutable?**  
No. All updates return new BiMultiMap instances; existing ones remain unchanged and can be safely
shared across your application.

**Q: Can I iterate keys or values separately?**  
Yes. Use `keyValueMultiMap` and `valueKeyMultiMap` to access standard Rimbu multimap views
with all their APIs.

---

## Ecosystem & Integration

- Part of the broader **Rimbu** collection ecosystem – interoperates with `@rimbu/hashed`,
  `@rimbu/sorted`, `@rimbu/collection-types`, and `@rimbu/stream`.
- Ideal for modelling multi‑valued relationships in domain models, tagging systems, permission
  models, or graph‑like structures.
- Works seamlessly with other Rimbu collections and utilities for building rich, immutable data models.

Explore more at the [Rimbu documentation](https://rimbu.org) and the
[BiMultiMap API docs](https://rimbu.org/api/rimbu/bimultimap).

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
