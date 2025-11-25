<p align="center">
  <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" height="96" alt="Rimbu Logo" />
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/@rimbu%2Fstream.svg)](https://www.npmjs.com/package/@rimbu/stream)
![License](https://img.shields.io/github/license/rimbu-org/rimbu)
![Types Included](https://img.shields.io/badge/TypeScript-ready-blue)
![Node](https://img.shields.io/badge/Node-18+-6DA55F?logo=node.js&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg)
![ESM + CJS](https://img.shields.io/badge/modules-ESM%20%2B%20CJS-informational)

</div>

# `@rimbu/stream`

**Lazy, composable streams for TypeScript & JavaScript.**

`@rimbu/stream` provides **Stream** and **AsyncStream** – efficient, iterable-like sequences
that can be finite or infinite, materialized (arrays, strings, collections) or computed
on the fly. Streams are **lazy** and **immutable**: you can chain many operations
(`map`, `filter`, `flatMap`, `window`, `groupBy`, …) without creating intermediate
collections until you finally consume the result.

Use streams when you want **fluent, high‑level data pipelines** that are still
performance-conscious and type-safe.

---

## Table of Contents

1. [Why `@rimbu/stream`?](#why-rimbu-stream)
2. [Feature Highlights](#feature-highlights)
3. [Quick Start](#quick-start)
4. [Core Concepts & Types](#core-concepts--types)
5. [Sync vs Async Streams](#sync-vs-async-streams)
6. [Performance Notes](#performance-notes)
7. [Installation](#installation)
8. [FAQ](#faq)
9. [Ecosystem & Integration](#ecosystem--integration)
10. [Contributing](#contributing)
11. [License](#license)

---

## Why `@rimbu/stream`?

Plain arrays and iterables are great, but they tend to push you toward:

- **Eager computation** – multiple passes and intermediate arrays for each step.
- **Manual control flow** – nested loops, counters, and early exits.
- **Ad‑hoc composition** – hard-to-reuse logic scattered across your code.

`@rimbu/stream` focuses on:

- **Laziness** – operations like `map`, `filter`, `flatMap`, `take`, `drop`, and `window`
  are applied as you iterate; no intermediate arrays are allocated unless you ask for them.
- **Expressive APIs** – rich, chainable operators for both sync `Stream` and `AsyncStream`.
- **Interoperability** – work seamlessly with arrays, strings, iterables, async iterables,
  and other Rimbu collections.
- **Immutable, persistent semantics** – derived structures and terminal results are safe
  to share and reuse.

If you find yourself writing a lot of `for` loops over arrays or async sources,
Streams are usually a better, more declarative fit.

---

## Feature Highlights

- **Lazy & composable** – build rich pipelines without materializing intermediate values.
- **Sync and async variants** – `Stream` for synchronous sources, `AsyncStream` for async ones.
- **Flexible sources** – consume arrays, strings, iterables, async iterables, other streams,
  and more via `StreamSource` / `AsyncStreamSource`.
- **Powerful operators** – mapping, filtering, windows, grouping, flattening, zipping,
  splitting on separators or slices, and more.
- **Reducer / Transformer support** – reusable `Reducer` and `Transformer` utilities
  for advanced aggregation and streaming transformations.
- **Type-safe non-empty variants** – `Stream.NonEmpty<T>` and `AsyncStream.NonEmpty<T>`
  for stronger guarantees when you know a stream is non-empty.

Try Rimbu (including `@rimbu/stream`) live in the browser using the
[Rimbu Sandbox on CodeSandbox](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts).

---

## Quick Start

### Basic `Stream` usage

```ts
import { Stream } from '@rimbu/stream';

// Create from arrays, strings, or other sources
const s = Stream.from([1, 2, 3, 4, 5]);

// Build a lazy pipeline
const result = s
  .filter((v) => v % 2 === 1) // keep odd numbers
  .map((v) => v * v) // square them
  .take(3); // at most 3 values

console.log(result.toArray()); // [1, 9, 25]
```

### Ranged and infinite streams

```ts
import { Stream } from '@rimbu/stream';

// Finite range
console.log(Stream.range({ start: 10, amount: 5 }).toArray());
// => [10, 11, 12, 13, 14]

// Infinite stream: repeat pattern
const repeating = Stream.of('a', 'b').repeat(); // infinite
console.log(repeating.take(5).toArray());
// => ['a', 'b', 'a', 'b', 'a']
```

### `AsyncStream` usage

```ts
import { AsyncStream } from '@rimbu/stream/async';

async function* numbers() {
  for (let i = 0; i < 5; i++) {
    await new Promise((r) => setTimeout(r, 10));
    yield i;
  }
}

const s = AsyncStream.from(numbers());

const doubled = s.filter((v) => v % 2 === 0).map(async (v) => v * 2);

console.log(await doubled.toArray()); // [0, 4, 8]
```

---

## Core Concepts & Types

### Exported Types (sync)

From the main entry (`@rimbu/stream`):

| Name                 | Description                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `FastIterator<T>`    | An iterator that extends the default `Iterator` with a `fastNext` method for more efficient iteration.             |
| `FastIterable<T>`    | An `Iterable` that returns a `FastIterator<T>` from its `[Symbol.iterator]` method.                                |
| `Stream<T>`          | A possibly infinite, lazy sequence of elements of type `T` with a rich set of transformation and aggregation APIs. |
| `Stream.NonEmpty<T>` | A non-empty refinement of `Stream<T>` with stronger type guarantees.                                               |
| `Streamable<T>`      | An object that can create a `Stream<T>` via `.stream()`.                                                           |
| `StreamSource<T>`    | A convenience type covering arrays, strings, iterables, streams and `Streamable` objects convertible to `Stream`.  |
| `Reducer<I, O>`      | A stand‑alone, reusable reduction specification that turns a sequence of `I` into a single result `O`.             |
| `Transformer<T, R>`  | A `Reducer` that produces `StreamSource<R>` values, useful for reusable streaming transforms.                      |

### Exported Types (async)

From the async entry (`@rimbu/stream/async`):

| Name                      | Description                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `AsyncFastIterator<T>`    | An async iterator with `fastNext` for efficient asynchronous iteration.                                             |
| `AsyncFastIterable<T>`    | An `AsyncIterable` that returns an `AsyncFastIterator<T>`.                                                          |
| `AsyncStream<T>`          | A possibly infinite asynchronous sequence of elements, mirroring the `Stream` API.                                  |
| `AsyncStream.NonEmpty<T>` | A non-empty refinement of `AsyncStream<T>`.                                                                         |
| `AsyncStreamable<T>`      | An object that can create an `AsyncStream<T>` via `.asyncStream()`.                                                 |
| `AsyncStreamSource<T>`    | Any source convertible to an `AsyncStream<T>` (async streams, async iterables, sync streams, lazy factories, etc.). |
| `AsyncReducer<I, O>`      | An asynchronous reducer that can consume values of type `I` and eventually yield a result of type `O`.              |
| `AsyncTransformer<T, R>`  | An `AsyncReducer` that produces `AsyncStreamSource<R>` values, for reusable async streaming transformations.        |

See the full [Stream docs](https://rimbu.org/docs/collections/stream) and
[API reference](https://rimbu.org/api/rimbu/stream) for all operations.

---

## Sync vs Async Streams

- **`Stream`** (sync) is ideal when your data source is already in memory or synchronously available:
  arrays, strings, other collections, generated ranges, etc.
- **`AsyncStream`** is the async counterpart when values arrive over time:
  async generators, network responses, file I/O, timers, etc.

Imports:

```ts
import { Stream } from '@rimbu/stream';
import { AsyncStream } from '@rimbu/stream/async';
```

Interoperability examples:

```ts
// Build an AsyncStream from a sync Stream
const sync = Stream.range({ start: 0, amount: 10 });
const asyncFromSync = AsyncStream.from(sync);

// Or consume async sources and materialize them synchronously later
async function load(): Promise<number[]> {
  return await AsyncStream.from(fetch('/api/data').then((r) => r.json()))
    .map((item) => item.value)
    .toArray();
}
```

Both APIs are intentionally similar so you can switch between sync and async
variants with minimal friction.

---

## Performance Notes

- Streams are built on **fast iterators** (`FastIterator` / `AsyncFastIterator`) to minimize
  overhead in tight loops.
- Most operations are **lazy**: they only do work when you iterate, and they avoid
  intermediate allocations unless you call methods like `toArray` or `groupBy`.
- Many terminal operations (like `reduce`, `fold`, `containsSlice`, `window`, `partition`,
  `groupBy`) delegate to reusable `Reducer` / `AsyncReducer` definitions, making it easy
  to share optimized aggregations across your codebase.

For detailed performance characteristics and benchmarks, see the main Rimbu
documentation at [rimbu.org](https://rimbu.org).

---

## Installation

### Node / Bun / npm / Yarn

```sh
npm install @rimbu/stream
# or
yarn add @rimbu/stream
# or
bun add @rimbu/stream
# or
deno add npm:@rimbu/stream
```

### Browser / ESM

`@rimbu/stream` ships both **ESM** and **CJS** builds. Use it with any modern bundler
(Vite, Webpack, esbuild, Bun, etc.) or directly in Node ESM projects.

---

## FAQ

**Q: How is `Stream` different from just using arrays?**  
`Stream` is **lazy** and does not allocate intermediate arrays for each step. You can
express long pipelines and only materialize a result when you need it (e.g. via
`toArray`, `join`, `groupBy`, or other reducers).

**Q: Are streams immutable?**  
Yes. Stream operations return **new stream instances**; the underlying sources are
not mutated. This makes them safe to reuse and share.

**Q: Can streams be infinite?**  
Yes. Many constructors and operations (e.g. `Stream.range` without an `amount`,
`Stream.always`, `repeat`) can create infinite streams. Just make sure to apply
limiting operations like `take` when you need a finite result.

**Q: How do `Reducer` and `Transformer` relate to streams?**  
`Reducer` and `AsyncReducer` encapsulate reusable reduction logic that can be applied
to any stream (e.g. `Reducer.sum`, `Reducer.minBy`, `Reducer.groupBy`).  
`Transformer` and `AsyncTransformer` are reducers that output `StreamSource` /
`AsyncStreamSource` and power methods like `transform`, `window`, `splitOn`, and more.

---

## Ecosystem & Integration

- Part of the broader **Rimbu** ecosystem – interoperates with `@rimbu/core`,
  `@rimbu/collection-types`, `@rimbu/hashed`, `@rimbu/ordered`, and others.
- Many Rimbu collections accept `StreamSource` / `AsyncStreamSource`, so you can
  build data pipelines with streams and materialize them into maps, sets, lists, etc.
- Ideal for **data processing**, **ETL-like flows**, **reactive style pipelines**,
  or anywhere you want a clear separation between _building_ and _consuming_ data.

Explore more at the [Rimbu documentation](https://rimbu.org) and the
[Stream API docs](https://rimbu.org/api/rimbu/stream).

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
