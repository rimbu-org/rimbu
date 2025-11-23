<p align="center">
  <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" height="96" alt="Rimbu Logo" />
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/@rimbu%2Fmultiset.svg)](https://www.npmjs.com/package/@rimbu/multiset)
![License](https://img.shields.io/github/license/rimbu-org/rimbu)
![Types Included](https://img.shields.io/badge/TypeScript-ready-blue)
![Node](https://img.shields.io/badge/Node-18+-6DA55F?logo=node.js&logoColor=white)
![Deno](https://shield.deno.dev/x/rimbu)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg)
![ESM + CJS](https://img.shields.io/badge/modules-ESM%20%2B%20CJS-informational)

</div>

## `@rimbu/multiset`

**Fast, immutable multisets (bags) for TypeScript & JavaScript.**

`@rimbu/multiset` provides efficient, type‑safe **MultiSet** implementations: set‑like collections
where each distinct element can appear **multiple times**, and the structure tracks how often each
element occurs. This is ideal when element **frequency matters**, such as counters, histograms,
weighted collections, or multi‑valued states.

Use it whenever you need to model **“how many times”** something appears rather than just whether it
exists, without giving up immutability or strong typing.

---

### Table of Contents

1. [Why `@rimbu/multiset`?](#why-rimbu-multiset)
2. [Feature Highlights](#feature-highlights)
3. [Quick Start](#quick-start)
4. [Core Concepts & Types](#core-concepts--types)
5. [Working with Hash & Sorted MultiSets](#working-with-hash--sorted-multisets)
6. [Performance Notes](#performance-notes)
7. [Installation](#installation)
8. [FAQ](#faq)
9. [Ecosystem & Integration](#ecosystem--integration)
10. [Contributing](#contributing)
11. [License](#license)
12. [Attributions](#attributions)

---

### Why `@rimbu/multiset`?

Plain sets and maps only tell you whether a value is present, not **how many times** it occurs:

- Counting events or log messages.
- Tracking items in inventories or carts.
- Representing weighted choices or frequencies.
- Implementing histograms or term frequencies.

`@rimbu/multiset` focuses on:

- **Element counts, not just membership** – every value has an associated non‑negative count.
- **Immutable operations** – updates return new instances, sharing structure internally.
- **Choice of backing map** – hash‑based for speed, or sorted for deterministic value order.
- **Ergonomic API** – familiar set‑like operations plus count‑aware helpers.

If you ever maintain a `Map<T, number>` (or object) to track counts manually, a MultiSet is usually a
better fit.

---

### Feature Highlights

- **Counts per element** – each value can occur multiple times; counts are tracked in an internal map.
- **Distinct vs total size** – `sizeDistinct` for unique values, `size` for total occurrences.
- **Hash & sorted variants** – choose `HashMultiSet` for fast hashing or `SortedMultiSet` for
  deterministic ordering.
- **Immutable & persistent** – structural sharing for fast copies and history‑friendly updates.
- **Configurable contexts** – build custom configurations via `MultiSet.createContext`,
  `HashMultiSet.createContext`, or `SortedMultiSet.createContext`.
- **Rich operations** – add/remove values, set or modify counts, bulk operations, streaming, and
  traversal utilities.

---

### Quick Start

```ts
import { HashMultiSet } from '@rimbu/multiset';

// Create from individual values
const m = HashMultiSet.of('apple', 'banana', 'apple', 'orange');

// Total size vs number of distinct values
console.log(m.size); // 4
console.log(m.sizeDistinct); // 3

// Counts per element
console.log(m.count('apple')); // 2
console.log(m.count('banana')); // 1

// Updating counts returns a new multiset
const withMore = m.add('banana', 2);
console.log(withMore.count('banana')); // 3
```

Try Rimbu (including `@rimbu/multiset`) live in the browser using the
[Rimbu Sandbox on CodeSandbox](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts).

---

### Core Concepts & Types

#### Exported Types

From `@rimbu/multiset`:

| Name                           | Description                                                                                   |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| `MultiSet<T>`                  | Generic, type‑invariant multiset where values of type `T` can occur multiple times.          |
| `MultiSet.NonEmpty<T>`        | Non‑empty refinement of `MultiSet<T>` with stronger guarantees.                               |
| `MultiSet.Context<UT>`        | Context/factory for creating `MultiSet` instances with configurable underlying map contexts.  |
| `MultiSet.Builder<T>`         | Mutable builder for efficiently constructing a `MultiSet` before freezing it.                 |
| `VariantMultiSet<T>`          | Read‑only, type‑variant multiset; supports safe type‑widening but no mutating operations.     |
| `VariantMultiSet.NonEmpty<T>` | Non‑empty refinement of `VariantMultiSet<T>`.                                                 |
| `HashMultiSet<T>`             | Multiset backed by a `HashMap` for counts (hashed elements, fast unordered operations).       |
| `HashMultiSet.Context<UT>`   | Context for `HashMultiSet`, exposing configuration and factories.                             |
| `HashMultiSet.Builder<T>`    | Builder type for `HashMultiSet`.                                                              |
| `SortedMultiSet<T>`           | Multiset backed by a `SortedMap` for counts (sorted elements, deterministic ordering).        |
| `SortedMultiSet.Context<UT>` | Context for `SortedMultiSet`.                                                                 |
| `SortedMultiSet.Builder<T>`  | Builder type for `SortedMultiSet`.                                                            |

#### Key Operations (`HashMultiSet`)

```ts
import { HashMultiSet } from '@rimbu/multiset';

// Construction
const empty = HashMultiSet.empty<number>();
const fromValues = HashMultiSet.of(1, 2, 2, 3);

// Size & distinct size
empty.isEmpty; // true
fromValues.size; // 4
fromValues.sizeDistinct; // 3

// Lookups
fromValues.has(2); // true
fromValues.count(2); // 2
fromValues.count(10); // 0

// Updating (returns new MultiSet)
const withMore = fromValues.add(2); // add one more '2'
const withSetCount = fromValues.setCount(3, 5); // set exact count for value 3

// Removing occurrences
const removedSome = fromValues.remove(2, { amount: 1 });
const removedAll = fromValues.remove(2, { amount: 'ALL' });
```

See the full [MultiSet docs](https://rimbu.org/docs/collections/multiset) and
[API reference](https://rimbu.org/api/rimbu/multiset) for all operations.

---

### Working with Hash & Sorted MultiSets

All concrete variants share the same `MultiSet` semantics but differ in how values are stored and
ordered internally:

```ts
import { HashMultiSet, SortedMultiSet } from '@rimbu/multiset';

// Hash-based multiset (fast, unordered)
const hashMulti = HashMultiSet.of('b', 'a', 'b');
hashMulti.stream().toArray(); // order not guaranteed

// Sorted multiset (deterministic value order)
const sortedMulti = SortedMultiSet.of('b', 'a', 'b');
sortedMulti.stream().toArray(); // ['a', 'b', 'b']

// Working with streams of distinct values
sortedMulti.streamDistinct().toArray(); // ['a', 'b']
```

If you need custom underlying contexts (e.g. custom hashers or comparators), you can create them via
`HashMultiSet.createContext` or `SortedMultiSet.createContext`:

```ts
import { HashMultiSet } from '@rimbu/multiset';

const context = HashMultiSet.createContext<number>({
  countMapContext: /* optional: custom RMap.Context<number> */,
});

const multi = context.of(1, 2, 2, 3);
```

For read‑only, type‑variant views that can be safely widened, use the `VariantMultiSet` interfaces
exported from this package.

---

### Performance Notes

- MultiSets in Rimbu are built on **persistent data structures** – updates are typically
  \\(O(\log n)\\) and share most of their structure.
- Lookups and updates behave similarly to the underlying `HashMap` / `SortedMap` implementations
  used for the internal count maps.
- Many bulk operations accept generic `StreamSource` inputs, letting you construct and transform
  MultiSets efficiently from arrays, iterables, or streams.

For detailed performance characteristics and benchmarks, see the main Rimbu documentation at
[rimbu.org](https://rimbu.org).

---

### Installation

#### Node / Bun / npm / Yarn

```sh
npm install @rimbu/multiset
# or
yarn add @rimbu/multiset
# or
bun add @rimbu/multiset
```

#### Deno (import map)

```jsonc
{
  "imports": {
    "@rimbu/": "https://deno.land/x/rimbu@<version>/"
  }
}
```

Then:

```ts
import { HashMultiSet } from '@rimbu/multiset/mod.ts';
```

#### Browser / ESM

`@rimbu/multiset` ships both **ESM** and **CJS** builds. Use it with any modern bundler
(Vite, Webpack, esbuild, Bun, etc.) or directly in Node ESM projects.

---

### FAQ

**Q: How is a MultiSet different from a regular Set?**  
A MultiSet allows **multiple occurrences per value** and tracks their counts, while a regular Set
only tracks membership and stores each value at most once.

**Q: What happens if I add the same value multiple times?**  
The count for that value increases: `add`, `addAll`, or `addEntries` will raise its occurrence count
instead of ignoring duplicates.

**Q: Is the structure mutable?**  
No. All updates return new MultiSet instances; existing ones remain unchanged and can be safely
shared across your application.

**Q: Can I iterate values or distinct values separately?**  
Yes. Use `stream()` to iterate all occurrences and `streamDistinct()` to iterate each distinct
value once.

---

### Ecosystem & Integration

- Part of the broader **Rimbu** collections ecosystem – interoperates with `@rimbu/hashed`,
  `@rimbu/sorted`, `@rimbu/collection-types`, and `@rimbu/stream`.
- Ideal for modelling counters, tag frequencies, weighted selections, and other count‑based
  structures.
- Works seamlessly with other Rimbu collections and utilities for building rich, immutable data
  models.

Explore more at the [Rimbu documentation](https://rimbu.org) and the
[MultiSet API docs](https://rimbu.org/api/rimbu/multiset).

---

### Contributing

We welcome contributions! See the
[Contributing guide](https://github.com/rimbu-org/rimbu/blob/main/CONTRIBUTING.md) for details.

<img src="https://contrib.rocks/image?repo=rimbu-org/rimbu" alt="Contributors" />

_Made with [contributors-img](https://contrib.rocks)._

---

### License

MIT © Rimbu contributors. See [LICENSE](./LICENSE) for details.

---

### Attributions

Created and maintained by [Arvid Nicolaas](https://github.com/vitoke). Logo © Rimbu.
