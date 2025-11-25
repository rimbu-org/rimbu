<p align="center">
  <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" height="96" alt="Rimbu Logo" />
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/@rimbu%2Fbimap.svg)](https://www.npmjs.com/package/@rimbu/bimap)
![License](https://img.shields.io/github/license/rimbu-org/rimbu)
![Types Included](https://img.shields.io/badge/TypeScript-ready-blue)
![Node](https://img.shields.io/badge/Node-18+-6DA55F?logo=node.js&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg)
![ESM + CJS](https://img.shields.io/badge/modules-ESM%20%2B%20CJS-informational)

</div>

# `@rimbu/bimap`

**Fast, immutable bidirectional maps for TypeScript & JavaScript.**

`@rimbu/bimap` provides an efficient, type-safe **BiMap**: a data structure that maintains a strict one‑to‑one relationship between keys and values. Every key maps to exactly one value, and every value maps back to exactly one key – giving you O(1)-style lookup in both directions with immutable, persistent semantics.

Use it whenever you need **reverse lookups**, **unique associations** (like IDs ↔ handles, user ↔ email, code ↔ label), or want to avoid keeping two maps in sync manually.

---

## Table of Contents

1. [Why `@rimbu/bimap`?](#why-rimbu-bimap)
2. [Feature Highlights](#feature-highlights)
3. [Quick Start](#quick-start)
4. [Core Concepts & Types](#core-concepts--types)
5. [Working with Hash & Sorted BiMaps](#working-with-hash--sorted-bimaps)
6. [Performance Notes](#performance-notes)
7. [Installation](#installation)
8. [FAQ](#faq)
9. [Ecosystem & Integration](#ecosystem--integration)
10. [Contributing](#contributing)
11. [License](#license)

---

## Why `@rimbu/bimap`?

Plain maps give you **key → value** lookups, but often you also need **value → key**:

- **Unique identifiers** – map `userId ↔ email`, `handle ↔ id`, `token ↔ session`.
- **Code / label pairs** – `statusCode ↔ statusLabel`, `enumValue ↔ string`.
- **Indexing external data** – keep a stable, unique mapping between two domains.

`@rimbu/bimap` focuses on:

- **True bijection** – the structure guarantees a one‑to‑one mapping at all times.
- **Immutable operations** – updates return new instances, sharing structure internally.
- **Safe reverse lookups** – `getValue` and `getKey` mirror each other.
- **Ergonomic API** – familiar map-like operations plus BiMap‑specific helpers.

If you find yourself maintaining two maps in sync, a BiMap is usually the better fit.

---

## Feature Highlights

- **Bidirectional lookups** – efficient `key → value` and `value → key` access.
- **Strict uniqueness** – inserting a key or value replaces any existing association.
- **Immutable & persistent** – structural sharing for fast copies and diffs.
- **Multiple views** – access `keyValueMap` and `valueKeyMap` as regular Rimbu maps.
- **Configurable contexts** – backed by hash maps by default, with support for custom underlying map contexts via `BiMap.createContext`.
- **Rich operations** – add/remove by key or value, bulk updates, streaming, traversal utilities.

---

## Quick Start

```ts
import { BiMap } from '@rimbu/bimap';

// Create from entry tuples
const biMap = BiMap.of([1, 'a'], [2, 'b'], [3, 'c']);

// Forward lookup: key -> value
console.log(biMap.getValue(2)); // 'b'

// Reverse lookup: value -> key
console.log(biMap.getKey('c')); // 3

// Update associations immutably
const updated = biMap.set(2, 'z'); // value 'z' can only belong to one key
console.log(updated.getKey('z')); // 2
```

Try Rimbu (including `@rimbu/bimap`) live in the browser using the
[Rimbu Sandbox on CodeSandbox](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts).

---

## Core Concepts & Types

### Exported Types

| Name                    | Description                                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| `BiMap<K, V>`           | Immutable, type‑invariant bidirectional map with a strict one‑to‑one mapping between `K` and `V`.               |
| `BiMap.NonEmpty<K, V>`  | Non‑empty refinement of `BiMap<K, V>` with stronger type guarantees.                                            |
| `BiMap.Context<UK, UV>` | Factory/context for creating BiMaps with configurable underlying map implementations for keys and values.       |
| `BiMap.Builder<K, V>`   | Mutable builder for efficiently constructing or mutating a BiMap before freezing it into an immutable instance. |

### Key Operations

```ts
import { BiMap } from '@rimbu/bimap';

// Construction
const empty = BiMap.empty<number, string>();
const fromEntries = BiMap.of([1, 'one'], [2, 'two']);

// Size & emptiness
empty.isEmpty; // true
fromEntries.size; // 2

// Lookups
fromEntries.hasKey(1); // true
fromEntries.hasValue('two'); // true
fromEntries.getValue(2); // 'two'
fromEntries.getKey('one'); // 1

// Updating (returns new BiMap)
const updated = fromEntries.set(3, 'three');

// Removing by key or value
const withoutKey = updated.removeKey(1);
const withoutValue = updated.removeValue('two');
```

See the full [BiMap docs](https://rimbu.org/docs/collections/bimap) and
[API reference](https://rimbu.org/api/rimbu/bimap) for all operations.

---

## Performance Notes

- BiMaps in Rimbu are built on **persistent data structures** – updates are typically \\(O(\log n)\\) and share most of their structure.
- Lookups by key or value are designed to behave similarly to their underlying map implementations (`HashMap` / sorted maps).
- Many bulk operations accept generic `StreamSource` inputs, letting you construct and transform BiMaps efficiently from arrays, iterables, or streams.

For detailed performance characteristics and benchmarks, see the main Rimbu documentation at [rimbu.org](https://rimbu.org).

---

## Installation

### Node / Bun / npm / Yarn / Deno

```sh
npm install @rimbu/bimap
# or
yarn add @rimbu/bimap
# or
bun add @rimbu/bimap
# or
deno add npm:@rimbu/bimap
```

### Browser / ESM

`@rimbu/bimap` ships both **ESM** and **CJS** builds. Use it with any modern bundler
(Vite, Webpack, esbuild, Bun, etc.) or directly in Node ESM projects.

---

## FAQ

**Q: How is a BiMap different from a regular Map?**  
A BiMap enforces a **one‑to‑one** relationship: each value can appear at most once. It also gives
you efficient `value → key` lookups via `getKey`.

**Q: What happens if I insert a key or value that already exists?**  
The new association **replaces** the previous one, keeping the BiMap bijective. This may remove
or re‑associate other entries to preserve uniqueness.

**Q: Is the structure mutable?**  
No. All updates return new BiMap instances; existing ones remain unchanged and can be safely
shared across your application.

**Q: Can I iterate keys or values separately?**  
Yes. Use `keyValueMap` and `valueKeyMap` to access standard Rimbu map views with all their APIs.

---

## Ecosystem & Integration

- Part of the broader **Rimbu** collection ecosystem – interoperates with `@rimbu/hashed`,
  `@rimbu/ordered`, `@rimbu/collection-types`, and `@rimbu/stream`.
- Ideal for modelling unique relationships in domain models, routing tables, protocol maps, etc.
- Works seamlessly with other Rimbu collections and utilities for building rich, immutable data models.

Explore more at the [Rimbu documentation](https://rimbu.org) and the
[BiMap API docs](https://rimbu.org/api/rimbu/bimap).

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
