<p align="center">
  <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" height="96" alt="Rimbu Logo" />
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/@rimbu%2Flist.svg)](https://www.npmjs.com/package/@rimbu/list)
![License](https://img.shields.io/github/license/rimbu-org/rimbu)
![Types Included](https://img.shields.io/badge/TypeScript-ready-blue)
![Node](https://img.shields.io/badge/Node-18+-6DA55F?logo=node.js&logoColor=white)
![Deno](https://shield.deno.dev/x/rimbu)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg)
![ESM + CJS](https://img.shields.io/badge/modules-ESM%20%2B%20CJS-informational)

</div>

## `@rimbu/list`

**Fast, immutable random‑access lists for TypeScript & JavaScript.**

`@rimbu/list` provides an efficient, type‑safe **List**: an ordered, indexable, immutable sequence. It behaves much like a persistent “vector” or array – supporting random access, slicing, concatenation, mapping and more – while sharing structure between versions so updates stay cheap.

Use it whenever you need **ordered collections**, **random index access**, or want to avoid copying arrays on every update in your application state.

---

### Table of Contents

1. [Why `@rimbu/list`?](#why-rimbu-list)
2. [Feature Highlights](#feature-highlights)
3. [Quick Start](#quick-start)
4. [Core Concepts & Types](#core-concepts--types)
5. [Working with Lists](#working-with-lists)
6. [Builders & Contexts](#builders--contexts)
7. [Performance Notes](#performance-notes)
8. [Installation](#installation)
9. [Ecosystem & Integration](#ecosystem--integration)
10. [Contributing](#contributing)
11. [License](#license)
12. [Attributions](#attributions)

---

### Why `@rimbu/list`?

Plain JavaScript arrays are flexible, but they’re:

- **Mutable by default** – accidental sharing and in‑place updates cause subtle bugs.
- **Copy‑heavy for updates** – you often spread or slice arrays to keep them “immutable”.
- **Unstructured** – no built‑in notion of non‑empty variants or persistent builders.

`@rimbu/list` focuses on:

- **Immutable operations** – every change returns a new `List`, sharing most of its structure.
- **Random access** – `get(index)` and `length` behave like arrays, with negative indices supported for convenience.
- **Rich slicing and transformation** – `take`, `drop`, `slice`, `map`, `flatMap`, `filter`, `collect`, `repeat`, `rotate`, `padTo`, and more.
- **Non‑empty refinement** – `List.NonEmpty<T>` gives stronger type guarantees when emptiness is impossible.
- **Efficient builders** – `List.Builder<T>` lets you do many mutations before freezing into an immutable `List`.

If you reach for arrays but want **persistent, predictable semantics** and a strong type story, `@rimbu/list` is a great fit.

---

### Feature Highlights

- **Immutable, random‑access sequence** – ordered collection with `length`, `get`, and negative indices (`-1` is the last element).
- **Powerful slicing APIs** – `take`, `drop`, `slice`, and `streamRange` support ranges and reverse traversal.
- **Transformations** – `map`, `mapPure`, `flatMap`, `filter`, `collect`, `repeat`, `rotate`, `padTo`, etc.
- **Non‑empty variant** – `List.NonEmpty<T>` and `nonEmpty()`/`assumeNonEmpty()` for stronger compile‑time guarantees.
- **Builders** – `List.Builder<T>` for efficient bulk updates before calling `build()`.
- **Context‑based configuration** – `List.createContext({ blockSizeBits })` to tune internal block sizes.
- **Stream integration** – many APIs accept or return `Stream` / `StreamSource` for composable data flows.

---

### Quick Start

```ts
import { List } from '@rimbu/list';

// Construction
const empty = List.empty<number>();
const fromValues = List.of(1, 2, 3);
const fromSources = List.from([1, 2], [3, 4]); // StreamSource inputs

// Basic operations
fromValues.length; // 3
fromValues.isEmpty; // false

// Indexed access (supports negative indices)
fromValues.get(0); // 1
fromValues.get(-1); // 3
fromValues.get(10, 'fallback'); // 'fallback'

// Immutable updates
const with4 = fromValues.append(4); // List.NonEmpty<number>
const rotated = with4.rotate(1); // List(4, 1, 2, 3)

console.log(with4.toArray()); // [1, 2, 3, 4]
console.log(rotated.toString()); // List(4, 1, 2, 3)
```

Try Rimbu (including `@rimbu/list`) live in the browser using the
[Rimbu Sandbox on CodeSandbox](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts).

---

### Core Concepts & Types

#### Exported Types

From `@rimbu/list`:

| Name                      | Description                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| `List<T>`                 | Immutable, random‑access, ordered sequence of values `T`.                                        |
| `List.NonEmpty<T>`        | Non‑empty refinement of `List<T>` with stricter guarantees (e.g. `first()` and `last()` return). |
| `List.Context`            | Factory/context used to create `List` instances with specific configuration.                     |
| `List.Builder<T>`         | Mutable builder for efficiently constructing or mutating a List before freezing it.              |
| `ListFactory` / `ListCreators` | Internal factory/creator interfaces re‑exported via the `List` constant.                    |

The main entry point exports a frozen `List` creators object:

```ts
import { List } from '@rimbu/list';

// Factory methods
const l1 = List.empty<number>();
const l2 = List.of(1, 2, 3);
const l3 = List.from([1, 2], [3, 4]);
const chars = List.fromString('abc'); // List.NonEmpty<string>
```

See the full [List docs](https://rimbu.org/docs/collections/list) and
[API reference](https://rimbu.org/api/rimbu/list) for all operations.

---

### Working with Lists

#### Construction & Emptiness

```ts
import { List } from '@rimbu/list';

const empty = List.empty<number>();
const numbers = List.of(1, 2, 3);
const fromArrays = List.from([1, 2], [3, 4]); // StreamSource<number>[]

empty.isEmpty; // true
numbers.nonEmpty(); // true

// Type refinement
if (numbers.nonEmpty()) {
  // here: numbers is List.NonEmpty<number>
  numbers.first(); // number
}

// Assert non‑emptiness (throws at runtime if empty)
const nonEmpty = numbers.assumeNonEmpty(); // List.NonEmpty<number>
```

#### Indexing, Slicing, and Ranges

```ts
const list = List.of(0, 1, 2, 3, 4, 5);

list.get(0); // 0
list.get(-1); // 5
list.get(10, 'fallback'); // 'fallback'

// Take / drop from front or back (negative amount counts from end)
list.take(3).toArray(); // [0, 1, 2]
list.drop(2).toArray(); // [2, 3, 4, 5]
list.take(-2).toArray(); // [4, 5]

// Slice using IndexRange
list.slice({ start: 1, amount: 3 }).toArray(); // [1, 2, 3]
list
  .slice({ start: -3, amount: 2 }, { reversed: true })
  .toArray(); // [4, 3]
```

#### Streams & Iteration

```ts
import { Stream } from '@rimbu/stream';

const list = List.of(10, 20, 30);

// Iterable
[...list]; // [10, 20, 30]

// Streams
list.stream().toArray(); // [10, 20, 30]
list.stream({ reversed: true }).toArray(); // [30, 20, 10]

// From streams
const fromStream = List.from(Stream.range({ start: 0, amount: 5 }));
fromStream.toArray(); // [0, 1, 2, 3, 4]
```

#### Transformations

```ts
const list = List.of(1, 2, 3, 4);

// map / mapPure
list.map((v, i) => `#${i}: ${v}`).toArray();
// ['#0: 1', '#1: 2', '#2: 3', '#3: 4']

list.mapPure(v => v * 2).toArray();
// [2, 4, 6, 8]

// filter
list.filter(v => v % 2 === 0).toArray(); // [2, 4]

// flatMap
list.flatMap(v => [v, v + 1]).toArray();
// [1, 2, 2, 3, 3, 4, 4, 5]

// collect (map + filter with skip/halt)
const collected = list.collect((v, i, skip, halt) => {
  if (v > 3) halt();
  if (v === 2) return skip;
  return v * 10;
});
collected.toArray(); // [10, 30]
```

#### Bulk Operations & Utilities

```ts
const base = List.of(0, 1, 2, 3);

// Concat with other StreamSource values
base.concat([10, 11], new Set([12])).toArray();
// [0, 1, 2, 3, 10, 11, 12]

// Repeat (negative repeats reverse)
base.repeat(2).toArray();
// [0, 1, 2, 3, 0, 1, 2, 3]
base.repeat(-1).toArray();
// [3, 2, 1, 0]

// Rotate
base.rotate(2).toArray(); // [2, 3, 0, 1]
base.rotate(-1).toArray(); // [1, 2, 3, 0]

// Pad to length
List.of(0, 1).padTo(4, 9).toArray();
// [0, 1, 9, 9]

// Splice / insert / remove by index
base.splice({ index: 2, remove: 1, insert: [9] }).toArray();
// [0, 1, 9, 3]
base.insert(1, [9, 9]).toArray();
// [0, 9, 9, 1, 2, 3]
base.remove(1, { amount: 2 }).toArray();
// [0, 3]
```

---

### Builders & Contexts

#### Using `List.Builder`

```ts
import { List } from '@rimbu/list';

const builder = List.builder<number>();

builder.append(1);
builder.prepend(0);
builder.insert(1, 5);

builder.length; // 3

const finalList = builder.build(); // List<number>
finalList.toArray(); // [0, 5, 1]
```

Builders are ideal when you:

- Need to build a List incrementally in a hot path.
- Want to perform many updates before freezing into an immutable value.

#### Contexts and `List.createContext`

```ts
import { List } from '@rimbu/list';

// Create a custom context (tuning the internal block size)
const SmallBlocks = List.createContext({ blockSizeBits: 3 });

const a = SmallBlocks.of(1, 2, 3);
const b = SmallBlocks.from([4, 5]);

const combined = a.concat(b);
combined.context === SmallBlocks; // true
```

Contexts let you:

- Share configuration (like `blockSizeBits`) across many Lists.
- Keep structural sharing efficient within the same context.

The default exported `List` creators object also provides:

- `List.defaultContext()` – access the shared default context.

---

### Performance Notes

- Lists in Rimbu are built on **persistent tree‑based structures** – most operations are \\(O(\log_B n)\\) where \\(B\\) is the internal block size.
- Random access, updates, concatenation, and slicing are designed to be efficient while sharing structure between versions.
- Many bulk operations accept `StreamSource` inputs, so you can build Lists from arrays, iterables, or Rimbu streams without unnecessary copying.

For more details and benchmarks, see the main Rimbu documentation at [rimbu.org](https://rimbu.org).

---

### Installation

#### Node / Bun / npm / Yarn

```sh
npm install @rimbu/list
# or
yarn add @rimbu/list
# or
bun add @rimbu/list
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
import { List } from '@rimbu/list/mod.ts';
```

#### Browser / ESM

`@rimbu/list` ships both **ESM** and **CJS** builds. Use it with any modern bundler
(Vite, Webpack, esbuild, Bun, etc.) or directly in Node ESM projects.

---

### Ecosystem & Integration

- Part of the broader **Rimbu** collections ecosystem – interoperates with `@rimbu/hashed`,
  `@rimbu/bimap`, `@rimbu/ordered`, `@rimbu/collection-types`, and `@rimbu/stream`.
- Ideal for representing ordered application state, timelines, logs, UI lists, sequences of events, and more.
- Works seamlessly with other Rimbu collections and utilities for building rich, immutable data models.

Explore more at the [Rimbu documentation](https://rimbu.org) and the
[List API docs](https://rimbu.org/api/rimbu/list).

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
