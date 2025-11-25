<p align="center">
  <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" height="96" alt="Rimbu Logo" />
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/@rimbu%2Fproximity.svg)](https://www.npmjs.com/package/@rimbu/proximity)
![License](https://img.shields.io/github/license/rimbu-org/rimbu)
![Types Included](https://img.shields.io/badge/TypeScript-ready-blue)
![Node](https://img.shields.io/badge/Node-18+-6DA55F?logo=node.js&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg)
![ESM + CJS](https://img.shields.io/badge/modules-ESM%20%2B%20CJS-informational)

</div>

# `@rimbu/proximity`

**Immutable proximity-based maps for TypeScript & JavaScript.**

`@rimbu/proximity` provides the **ProximityMap** collection: an immutable map where lookups are resolved
by **closest key**, according to a configurable `DistanceFunction`. Instead of only matching exact keys,
you can express “nearness” (numbers, vectors, coordinates, scores, etc.) and always retrieve the value
whose key is _closest_ to the one you query.

Use it when you need **nearest-neighbour lookups**, **tolerant matching**, or when reasoning about
**distance between keys** is more natural than exact equality.

---

## Table of Contents

1. [Why `@rimbu/proximity`?](#why-rimbu-proximity)
2. [Feature Highlights](#feature-highlights)
3. [Quick Start](#quick-start)
4. [Core Concepts & Types](#core-concepts--types)
5. [Configuring Distance Functions & Contexts](#configuring-distance-functions--contexts)
6. [Installation](#installation)
7. [FAQ](#faq)
8. [Ecosystem & Integration](#ecosystem--integration)
9. [Contributing](#contributing)
10. [License](#license)

---

## Why `@rimbu/proximity`?

Classic maps answer the question: **“What value is stored for this _exact_ key?”**  
Sometimes you really need: **“What value is stored for the key _closest_ to this one?”**

Examples:

- **Numeric thresholds** – map score ranges to labels, but query by actual score.
- **Timestamps** – find the closest recorded event to a given time.
- **Spatial / metric data** – locations, distances, or any metric space.
- **Fuzzy matching** – use a custom distance (e.g. edit distance) instead of strict equality.

`ProximityMap` focuses on:

- **Proximity-aware lookups** – `get` uses a `DistanceFunction` to find the nearest key.
- **Immutable operations** – all updates return new maps, with structural sharing.
- **Configurable metric** – plug in any `DistanceFunction<T>` that returns a non‑negative number.
- **Familiar map semantics** – insertion, removal, streaming, and builders behave like other Rimbu maps.

---

## Feature Highlights

- **Nearest-key lookup** – `get` returns the value whose key has the smallest distance from the query key.
- **Configurable distance** – use the default `DistanceFunction.defaultFunction` (based on `===`), or supply
  your own for numbers, vectors, dates, etc.
- **Immutable & persistent** – efficient structural sharing, ideal for functional and reactive code.
- **Builders for bulk updates** – use `ProximityMap.Builder` to perform many mutations before freezing.
- **Context-based configuration** – use `ProximityMap.createContext` to configure the distance function and
  underlying `HashMap` context once and reuse it across instances.

---

## Quick Start

```ts
import { ProximityMap } from '@rimbu/proximity';

// Default context uses a strict equality-based distance:
// DistanceFunction.defaultFunction: 0 if a === b, +Infinity otherwise.
const map = ProximityMap.of<[number, string]>(
  [10, 'low'],
  [20, 'medium'],
  [30, 'high']
);

// Exact match: behaves like a normal Map
console.log(map.get(20)); // 'medium'

// Nearest neighbour lookup:
// the closest stored key to 18 is 20
console.log(map.get(18)); // 'medium'
```

Try Rimbu (including `@rimbu/proximity`) live in the browser using the  
[Rimbu Sandbox on CodeSandbox](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts).

---

## Core Concepts & Types

### Exported Types (from `@rimbu/proximity/map`)

| Name                          | Description                                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| `ProximityMap<K, V>`          | Immutable, type‑invariant map where lookups are resolved using a `DistanceFunction` over keys.           |
| `ProximityMap.NonEmpty<K, V>` | Non‑empty refinement of `ProximityMap<K, V>` with stronger type guarantees.                              |
| `ProximityMap.Context<UK>`    | Factory/context for creating proximity maps; holds the `distanceFunction` and backing `HashMap` context. |
| `ProximityMap.Builder<K, V>`  | Mutable builder for efficiently constructing or transforming a `ProximityMap` before freezing it.        |

From `@rimbu/proximity/common`:

| Name                               | Description                                                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `Distance`                         | A non‑negative `number` representing the distance between two values (0 = equal, `Number.POSITIVE_INFINITY` = no match). |
| `DistanceFunction<T>`              | `(one: T, another: T) => Distance` – measures the distance between two values.                                           |
| `DistanceFunction.defaultFunction` | Default distance function based on `===`.                                                                                |
| `NearestKeyMatch<K, V>`            | Result object describing the closest key, its value, and the associated distance.                                        |
| `findNearestKeyMatch`              | Utility to find the nearest key/value pair in an iterable of entries, used internally by `ProximityMap`.                 |

See the full [Proximity docs](https://rimbu.org/docs/collections/map) and  
[API reference](https://rimbu.org/api/rimbu/proximity) for all operations.

### Basic Operations

```ts
import { ProximityMap } from '@rimbu/proximity';

// Construction
const empty = ProximityMap.empty<number, string>();
const fromEntries = ProximityMap.of<[number, string]>(
  [0, 'origin'],
  [5, 'near'],
  [10, 'far']
);

// Size & emptiness
empty.isEmpty; // true
fromEntries.size; // 3

// Nearest-key lookups
fromEntries.get(4); // 'near' (closest key to 4 is 5)
fromEntries.get(8); // 'far' (closest key to 8 is 10)

// Updating (returns new ProximityMap)
const updated = fromEntries.set(7, 'mid');

// Iteration / streaming (via Rimbu's stream API)
for (const [k, v] of updated) {
  console.log(k, v);
}
```

---

## Configuring Distance Functions & Contexts

By default, the `ProximityMap` context uses `DistanceFunction.defaultFunction`, which behaves like a
regular equality-based map. To unlock proximity behaviour, supply a custom `DistanceFunction`:

```ts
import { ProximityMap } from '@rimbu/proximity';
import { DistanceFunction } from '@rimbu/proximity/common';

// Example: distance on numbers (absolute difference)
const numericDistance: DistanceFunction<number> = (a, b) => Math.abs(a - b);

const NumericProximityMap = ProximityMap.createContext<number>({
  distanceFunction: numericDistance,
});

const numericMap = NumericProximityMap.of<[number, string]>(
  [10, 'low'],
  [20, 'medium'],
  [40, 'high']
);

numericMap.get(22); // 'medium' (closest key is 20)
numericMap.get(35); // 'high' (closest key is 40)
```

You can also customize the underlying `HashMap` context via the `hashMapContext` option if you need
different hashing or equality semantics.

For more advanced usage (builders, non‑empty variants, streaming, etc.), see the  
[ProximityMap API docs](https://rimbu.org/api/rimbu/proximity/map/ProximityMap/interface).

---

## Installation

### Node / Bun / npm / Yarn

```sh
npm install @rimbu/proximity
# or
yarn add @rimbu/proximity
# or
bun add @rimbu/proximity
# or
deno add npm:@rimbu/proximity
```

### Browser / ESM

`@rimbu/proximity` ships both **ESM** and **CJS** builds. Use it with any modern bundler
(Vite, Webpack, esbuild, Bun, etc.) or directly in Node ESM projects.

---

## FAQ

**Q: How is a `ProximityMap` different from a regular `Map`?**  
A `ProximityMap` doesn’t only match exact keys – it uses a `DistanceFunction` to find the _closest_ key
and returns its value, making it ideal for numeric, temporal, or spatial data.

**Q: What distance function is used by default?**  
By default, `DistanceFunction.defaultFunction` is used, which returns `0` when `a === b` and
`Number.POSITIVE_INFINITY` otherwise – effectively behaving like a standard map.

**Q: Is the structure mutable?**  
No. All updates return new `ProximityMap` instances; existing ones remain unchanged and can be shared safely.
For batch mutations, use a `ProximityMap.Builder`.

**Q: Can I iterate keys or values separately?**  
Yes – `ProximityMap` implements the Rimbu `RMap` interfaces, so you can stream entries, keys, and values
using the standard Rimbu streaming utilities.

---

## Ecosystem & Integration

- Part of the broader **Rimbu** collection ecosystem – interoperates with `@rimbu/hashed`,
  `@rimbu/collection-types`, and `@rimbu/stream`.
- Ideal for modelling nearest‑neighbour queries, thresholds, scoring systems, and fuzzy matching.
- Works seamlessly with other Rimbu collections and utilities for building rich, immutable data models.

Explore more at the [Rimbu documentation](https://rimbu.org) and the  
[Proximity API docs](https://rimbu.org/api/rimbu/proximity).

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

Created and maintained by [Arvid Nicolaas](https://github.com/vitoke) and
[Gianluca Costa](https://gianlucacosta.info). Logo © Rimbu.
