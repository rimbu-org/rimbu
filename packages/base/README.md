<p align="center">
    <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" />
</p>

[![npm version](https://badge.fury.io/js/@rimbu%2Fbase.svg)](https://www.npmjs.com/package/@rimbu/base)
![License](https://img.shields.io/github/license/rimbu-org/rimbu)
![Types Included](https://img.shields.io/badge/TypeScript-ready-blue)
![Node](https://img.shields.io/badge/Node-18+-6DA55F?logo=node.js&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg)
![ESM + CJS](https://img.shields.io/badge/modules-ESM%20%2B%20CJS-informational)

</div>

# `@rimbu/base`

**Foundational immutable array and utility primitives powering all other Rimbu collections.**

`@rimbu/base` exposes a small, efficient set of low-level utilities (array operations, tuple helpers, type predicates, error types) used internally across Rimbu’s high-level data structures. While primarily an implementation substrate, you can use these helpers directly for performance‑aware immutable array manipulation and advanced type constraints.

> Think: ultra-focused building blocks for persistent & type‑rich collections.

Full documentation: **[Rimbu Docs](https://rimbu.org)** · **[Rimbu API](https://rimbu.org/api)**

---

## Table of Contents

1. [Why Rimbu Base?](#why-rimbu-base)
2. [Feature Highlights](#feature-highlights)
3. [Quick Start](#quick-start)
4. [Immutable Array Operations (`Arr`)](#immutable-array-operations-arr)
5. [Tuple & Token Utilities](#tuple--token-utilities)
6. [Type Utilities (`plain-object`)](#type-utilities-plain-object)
7. [Error Types (`RimbuError`)](#error-types-rimbuerror)
8. [Installation](#installation)
9. [FAQ](#faq)
10. [Contributing](#contributing)
11. [License](#license)
12. [Attributions](#attributions)
13. [Quick Reference](#quick-reference-api-surface)

---

## Why Rimbu Base?

High‑level persistent collections depend on fast, predictable low‑level primitives. Instead of rewriting array cloning, sparse copying, index‑safe mutation, and structured error handling in every package, `@rimbu/base` centralizes these operations:

- **Consistency** – shared implementations eliminate subtle divergence.
- **Performance** – leverages modern `Array` prototype methods (`toSpliced`, `toReversed`, `with`, `at`) when available; falls back gracefully.
- **Immutability by default** – every operation returns a new array only when changes occur (structural sharing where possible).
- **Sparse array awareness** – preserves sparsity for specialized internal block layouts.
- **Type guards & predicates** – compile‑time discrimination for plain objects vs. functions/iterables.
- **Focused surface** – zero external runtime dependencies (aside from internal Rimbu type modules).

Use it directly if you need ergonomic immutable array helpers without pulling in full collection abstractions.

---

## Feature Highlights

- **`Arr` Immutable Ops** – `append`, `prepend`, `concat`, `reverse`, `update`, `mod`, `insert`, `splice`, `tail`, `init`, `last`, `mapSparse`, `copySparse`.
- **Conditional Optimization** – automatically chooses modern O(1) helpers when your runtime supports them.
- **Tuple Helpers** – `Entry.first`, `Entry.second` for lightweight entry handling in map-like structures.
- **Type Predicates** – `IsPlainObj`, `IsArray`, `IsAny`, plus runtime `isPlainObj`, `isIterable`.
- **Structured Errors** – clear error signaling via custom error classes (e.g. `InvalidStateError`).
- **Sentinel Token** – a shared `Token` symbol for internal identity and tagging.
- **Tree-shakable** – import only what you use: `import { Arr } from '@rimbu/base';`.

---

## Quick Start

```ts
import { Arr } from '@rimbu/base';

const base = [1, 2, 3];

// Pure modification: only clones when the value actually changes
const incremented = Arr.mod(base, 1, (v) => v + 1); // [1, 3, 3]

// Structural no-op returns original reference for efficiency
const same = Arr.mod(base, 5, (v) => v); // index out of range → original

// Append without mutating
const appended = Arr.append(incremented, 4); // [1, 3, 3, 4]

// Reverse slice
const reversed = Arr.reverse(appended); // [4, 3, 3, 1]

console.log(base); // [1, 2, 3]
```

---

## Immutable Array Operations (`Arr`)

All functions accept a `readonly T[]` input and return either the original array (when unchanged) or an optimized clone.

| Function             | Purpose                                                   |
| -------------------- | --------------------------------------------------------- |
| `append`             | Add element at end (non-empty array optimization).        |
| `prepend`            | Add element at start efficiently.                         |
| `concat`             | Smart concat – reuses original when one side empty.       |
| `reverse`            | Fast reversed copy (range slice optional).                |
| `forEach`            | Controlled traversal with optional reverse + halt state.  |
| `map` / `reverseMap` | Indexed transformation forward or backward.               |
| `last`               | O(1) last element access (uses `.at(-1)` when available). |
| `update`             | Apply `Update<T>` logic at index (no-op preserved).       |
| `mod`                | Lightweight element modification via `(value)=>value'`.   |
| `insert`             | Insert at index.                                          |
| `tail` / `init`      | Drop first / last element.                                |
| `splice`             | Immutable variant of native splice.                       |
| `copySparse`         | Preserve holes in sparse arrays.                          |
| `mapSparse`          | Transform only present indices, keeping sparsity.         |

Design details:

- Uses native **copy-on-write** style helpers when available for speed.
- Avoids unnecessary cloning when an update is identity.
- Preserves array holes for internal block structures requiring sparse layout semantics.

---

## Tuple & Token Utilities

```ts
import { Entry, Token } from '@rimbu/base';

const pair: readonly [string, number] = ['age', 42];
Entry.first(pair); // 'age'
Entry.second(pair); // 42

// Shared sentinel for internal tagging / identity
if (someValue === Token) {
  /* special branch */
}
```

---

## Type Utilities (`plain-object`)

Compile-time predicates for discriminating plain data objects from complex / functional structures:

| Type              | Description                                                                        |
| ----------------- | ---------------------------------------------------------------------------------- |
| `IsPlainObj<T>`   | True only for non-iterable, non-function object types without function properties. |
| `PlainObj<T>`     | Narrows to T if `IsPlainObj<T>`; otherwise `never`.                                |
| `IsArray<T>`      | Resolves to `true` if T is a (readonly) array type.                                |
| `IsAny<T>`        | Detects `any`.                                                                     |
| `isPlainObj(obj)` | Runtime guard for plain data objects.                                              |
| `isIterable(obj)` | Runtime guard for `Iterable`.                                                      |

Use these when building APIs that must reject iterables or functions while retaining strong type discrimination.

---

## Error Types (`RimbuError`)

Structured error classes provide meaningful failure contexts internally and externally:

| Error Class                              | Trigger Scenario                               |
| ---------------------------------------- | ---------------------------------------------- |
| `EmptyCollectionAssumedNonEmptyError`    | An operation expected a non-empty collection.  |
| `ModifiedBuilderWhileLoopingOverItError` | Mutating a builder mid-iteration.              |
| `InvalidStateError`                      | Internal invariant breach (should not happen). |
| `InvalidUsageError`                      | Consumer used an API incorrectly.              |

Helper throw functions exist for concise signaling (`throwInvalidStateError()`, etc.). Prefer them for consistency.

---

## Installation

### Compabitity

- [`Node` ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?logo=node.js&logoColor=white)](https://nodejs.org)
- [`Bun` ![Bun](https://img.shields.io/badge/Bun-%23000000.svg?logoColor=white)](https://bun.sh/)
- `Web` ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?logoColor=white)

### Package Managers

**Yarn:**

```sh
yarn add @rimbu/base
```

**npm:**

```sh
npm install @rimbu/base
```

**Bun:**

```sh
bun add @rimbu/base
```

**Deno:**

```sh
deno add npm:@rimbu/base
```

## Usage

```ts
import { Arr } from '@rimbu/base';

const arr = [1, 2, 3];
console.log(Arr.mod(arr, 1, (v) => v + 1));
// [1, 3, 3]

console.log(arr);
// [1, 2, 3]
```

## Author

Created and maintained by [Arvid Nicolaas](https://github.com/vitoke).

## Contributing

We welcome contributions! Please read our [Contributing guide](https://github.com/rimbu-org/rimbu/blob/main/CONTRIBUTING.md).

## Contributors

<img src = "https://contrib.rocks/image?repo=rimbu-org/rimbu"/>

_Made with [contributors-img](https://contrib.rocks)._

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) for details.
