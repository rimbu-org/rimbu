<p align="center">
  <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" height="96" alt="Rimbu Logo" />
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/@rimbu%2Fcommon.svg)](https://www.npmjs.com/package/@rimbu/common)
![License](https://img.shields.io/github/license/rimbu-org/rimbu)
![Types Included](https://img.shields.io/badge/TypeScript-ready-blue)
![Node](https://img.shields.io/badge/Node-18+-6DA55F?logo=node.js&logoColor=white)
![Deno](https://shield.deno.dev/x/rimbu)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg)
![ESM + CJS](https://img.shields.io/badge/modules-ESM%20%2B%20CJS-informational)

</div>

# `@rimbu/common`

**Shared utility types and helpers for the Rimbu ecosystem.**

`@rimbu/common` provides the low-level **building blocks** used throughout Rimbu:

- **Equality & comparison** helpers (`Eq`, `Comp`) for consistent value semantics.
- **Range & index utilities** (`Range`, `IndexRange`) for working with slices and windows.
- **Lazy values & updates** (`OptLazy`, `OptLazyOr`, `AsyncOptLazy`, `Update`) for ergonomic APIs.
- **Traversal helpers** (`CollectFun`, `TraverseState`) for efficient collection operations.
- **Type-level utilities** (`SuperOf`, `SubOf`, `RelatedTo`, `ArrayNonEmpty`, `StringNonEmpty`, `ToJSON`) for stronger TypeScript modelling.

Use this package directly in your own code, or consume it indirectly when using other Rimbu packages.

---

## Table of Contents

1. [Why `@rimbu/common`?](#why-rimbucommon)
2. [Feature Highlights](#feature-highlights)
3. [Quick Start](#quick-start)
4. [Core Concepts & Types](#core-concepts--types)
5. [Working with Equality & Comparison](#working-with-equality--comparison)
6. [Lazy Values, Updates & Async](#lazy-values-updates--async)
7. [Ranges & Indices](#ranges--indices)
8. [Type Utilities](#type-utilities)
9. [Installation](#installation)
10. [Ecosystem & Links](#ecosystem--links)
11. [Contributing](#contributing)
12. [License](#license)

---

## Why `@rimbu/common`?

Many Rimbu collections (and your own APIs) need **consistent behaviour** for:

- Comparing values (e.g. custom sort orders, structural vs reference equality).
- Handling optional or deferred values (lazy evaluation, async computations).
- Working with index or value ranges in a uniform way.
- Expressing richer type relationships in TypeScript.

Instead of re‑implementing these patterns, `@rimbu/common` provides:

- **Well-tested primitives** shared across all Rimbu packages.
- **Reusable utilities** you can depend on directly in your own libraries and apps.
- **Type-safe building blocks** that integrate smoothly with the rest of the Rimbu ecosystem.

---

## Feature Highlights

- **Pluggable equality & comparison** – `Eq` and `Comp` instances for primitives, objects, iterables, JSON, case-insensitive strings, and more.
- **Lazy & async helpers** – `OptLazy`, `OptLazyOr`, `AsyncOptLazy`, `MaybePromise` to keep APIs flexible without sacrificing clarity.
- **Declarative ranges** – `Range<T>` and `IndexRange` to describe open/closed and offset-based ranges in a single, typed shape.
- **Traversal utilities** – `CollectFun` and `TraverseState` for customizable, short‑circuitable traversals.
- **Type-level helpers** – utilities like `ArrayNonEmpty`, `StringNonEmpty`, and `ToJSON` to express invariants and serializable shapes.

---

## Quick Start

```ts
import { Eq, Comp, OptLazy, Update } from '@rimbu/common';

// Equality: deep structural comparison
const eq = Eq.anyDeepEq<Record<string, unknown>>();
console.log(eq({ a: 1, b: 2 }, { b: 2, a: 1 }));
// => true

// Comparison: natural number ordering
const numComp = Comp.numberComp();
console.log(numComp.compare(3, 5) < 0);
// => true

// Lazy values: compute only when needed
const lazyValue = OptLazy(() => 1 + 2);
console.log(lazyValue); // 3

// Updates: accept either a value or an updater function
const next = Update(1, v => v + 1);
console.log(next); // 2
```

Try Rimbu (including `@rimbu/common`) live in the browser using the
[Rimbu Sandbox on CodeSandbox](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts).

---

## Core Concepts & Types

### Exported Types & Utilities

| Name               | Description                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| `CollectFun`       | Types used by `collect`-style functions to map/filter in a single pass with skip & halt support.   |
| `AsyncCollectFun`  | Asynchronous version of `CollectFun`, returning `MaybePromise` of a collected value or skip token. |
| `Comp`             | Interface and implementations for comparing values (ordering / sorting).                           |
| `Eq`               | Interface and implementations for checking value equality.                                         |
| `Err`, `ErrBase`   | Helpers to throw consistent custom errors from fallback handlers.                                  |
| `IndexRange`       | Range specification for numeric indices (e.g. slicing arrays or collections).                      |
| `Range<T>`         | Range specification for ordered values of type `T`.                                                |
| `OptLazy`          | A value or a function returning a value (lazy).                                                    |
| `OptLazyOr`        | Like `OptLazy`, but can return a provided default value instead.                                   |
| `AsyncOptLazy`     | Potentially lazy and/or async values built on `OptLazy` + `MaybePromise`.                          |
| `MaybePromise<T>`  | A value of type `T` or a `Promise<T>`.                                                              |
| `TraverseState`    | Object to track progress & early termination in traversals.                                        |
| `Update`           | Value or updater function used to derive a new value from the old one.                             |
| `SuperOf`, `SubOf` | Type utilities for expressing upper/lower bounds between types.                                    |
| `RelatedTo`        | Type utility accepting related types where one extends the other.                                   |
| `ArrayNonEmpty`    | Tuple type representing non-empty arrays.                                                          |
| `StringNonEmpty`   | Type representing non-empty string types.                                                          |
| `ToJSON`           | Helper interface for JSON-serializable wrapper objects.                                            |

See the full [Common API reference](https://rimbu.org/api/rimbu/common) for all members and overloads.

---

## Working with Equality & Comparison

### Equality with `Eq`

```ts
import { Eq } from '@rimbu/common';

// Deep structural equality
const deepEq = Eq.anyDeepEq<Record<string, unknown>>();
console.log(deepEq({ a: 1, b: 2 }, { b: 2, a: 1 }));
// => true

// Shallow equality: one level into objects / iterables
const shallowEq = Eq.anyShallowEq<Record<string, unknown>>();
console.log(shallowEq({ a: 1, b: 2 }, { b: 2, a: 1 }));
// => true

// Flat equality: composed values compared using Object.is
const flatEq = Eq.anyFlatEq<Record<string, unknown>>();
console.log(flatEq({ a: 1, b: 2 }, { b: 2, a: 1 }));
// => false

// Case-insensitive string equality
const ci = Eq.stringCaseInsentitiveEq();
console.log(ci('AbC', 'aBc'));
// => true
```

### Comparison with `Comp`

```ts
import { Comp } from '@rimbu/common';

// Numbers: natural ordering with special handling for NaN and infinities
const numberComp = Comp.numberComp();
numberComp.compare(3, 5); // < 0

// Strings: locale-aware comparison
const stringComp = Comp.stringComp('en');
stringComp.compare('a', 'b'); // < 0

// Deep comparison of arbitrary values
const anyDeepComp = Comp.anyDeepComp<unknown>();
anyDeepComp.compare({ a: 1 }, { a: 1 }); // 0

// Convert a comparison into an equality function
const objectEq = Comp.toEq(Comp.objectComp());
console.log(objectEq({ a: 1, b: 2 }, { b: 2, a: 1 }));
// => true
```

---

## Lazy Values, Updates & Async

### `OptLazy` and `OptLazyOr`

```ts
import { OptLazy, OptLazyOr } from '@rimbu/common';

// Eager or lazy values
OptLazy(1); // => 1
OptLazy(() => 1); // => 1

// With a default "other" value
OptLazyOr(1, 'a'); // => 1
OptLazyOr(() => 1, 'a'); // => 1
OptLazyOr(none => none, 'a'); // => 'a'
```

### `Update`

```ts
import { Update } from '@rimbu/common';

Update(1, 2); // => 2
Update(1, () => 10); // => 10
Update(1, v => v + 1); // => 2
```

### `AsyncOptLazy` and `MaybePromise`

```ts
import { AsyncOptLazy } from '@rimbu/common';

// Get a value or promised value
await AsyncOptLazy.toPromise(1); // Promise(1)
await AsyncOptLazy.toPromise(() => 1); // Promise(1)
await AsyncOptLazy.toPromise(async () => 1); // Promise(1)
await AsyncOptLazy.toPromise(Promise.resolve(1)); // Promise(1)
```

---

## Ranges & Indices

### `Range<T>`

```ts
import { Range } from '@rimbu/common';

// Inclusive start, exclusive end
const r1: Range<number> = { start: [0, true], end: [10, false] };

// Only end (inclusive by default)
const r2: Range<number> = { end: 5 };

// Normalize for easier handling
const normalized = Range.getNormalizedRange(r1);
// => { start: [0, true], end: [10, false] }
```

### `IndexRange`

```ts
import { IndexRange } from '@rimbu/common';

const ir: IndexRange = { start: [0, true], amount: 3 };

// Extract concrete indices for a given length
IndexRange.getIndicesFor(ir, 10); // [0, 2]
```

---

## Type Utilities

```ts
import type {
  SuperOf,
  SubOf,
  RelatedTo,
  ArrayNonEmpty,
  StringNonEmpty,
  ToJSON,
} from '@rimbu/common';

type A = SuperOf<string, 'a' | 'b'>; // string
type B = SubOf<'a' | 'b', string>; // 'a' | 'b'
type R = RelatedTo<'a', string>; // 'a' | string

type NonEmptyNumbers = ArrayNonEmpty<number>; // [number, ...number[]]
type NonEmptyString = StringNonEmpty<'a' | ''>; // 'a'

interface UserJSON extends ToJSON<{ id: number }, 'User'> {}
```

---

## Installation

### Node / Bun / npm / Yarn

```sh
npm install @rimbu/common
# or
yarn add @rimbu/common
# or
bun add @rimbu/common
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
import { Eq } from '@rimbu/common/mod.ts';
```

### Browser / ESM

`@rimbu/common` ships both **ESM** and **CJS** builds. Use it with any modern bundler
(Vite, Webpack, esbuild, Bun, etc.) or directly in Node ESM projects.

---

## Ecosystem & Links

- Part of the broader **Rimbu** collection ecosystem – interoperates with `@rimbu/collection-types`,
  `@rimbu/hashed`, `@rimbu/ordered`, `@rimbu/stream`, and more.
- Main documentation: [rimbu.org](https://rimbu.org)
- Package docs: [Common docs](https://rimbu.org/docs/common/overview)  
- API reference: [Common API](https://rimbu.org/api/rimbu/common)

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
