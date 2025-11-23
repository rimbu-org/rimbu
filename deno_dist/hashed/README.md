<p align="center">
  <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" height="96" alt="Rimbu Logo" />
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/@rimbu%2Fhashed.svg)](https://www.npmjs.com/package/@rimbu/hashed)
![License](https://img.shields.io/github/license/rimbu-org/rimbu)
![Types Included](https://img.shields.io/badge/TypeScript-ready-blue)
![Node](https://img.shields.io/badge/Node-18+-6DA55F?logo=node.js&logoColor=white)
![Deno](https://shield.deno.dev/x/rimbu)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg)
![ESM + CJS](https://img.shields.io/badge/modules-ESM%20%2B%20CJS-informational)

</div>

# `@rimbu/hashed`

**Fast, immutable hash-based maps and sets for TypeScript & JavaScript.**

`@rimbu/hashed` provides efficient, type-safe **HashMap** and **HashSet** implementations. These use configurable `Hasher` instances and `Eq` equality comparers under the hood, giving you predictable hashing and fast lookups for arbitrary keys and values – from primitives to complex objects and streams.

Use it whenever you need **hash-based collections**, **custom hashing/equality**, or want to build rich immutable models backed by persistent data structures.

---

## Table of Contents

1. [Why `@rimbu/hashed`?](#why-rimbu-hashed)
2. [Feature Highlights](#feature-highlights)
3. [Quick Start](#quick-start)
4. [Core Concepts & Types](#core-concepts--types)
5. [Configuring Hashers & Contexts](#configuring-hashers--contexts)
6. [Installation](#installation)
7. [Ecosystem & Integration](#ecosystem--integration)
8. [Contributing](#contributing)
9. [License](#license)
10. [Attributions](#attributions)

---

## Why `@rimbu/hashed`?

Plain JavaScript `Map` / `Set` give you basic hash semantics, but you often need:

- **Stable hashing for complex values** – objects, arrays, tuples, dates, streams.
- **Custom equality** – case-insensitive strings, domain-specific identity, etc.
- **Immutable semantics** – structural sharing, safe reuse across your app.

`@rimbu/hashed` focuses on:

- **Configurable hashing** via `Hasher` utilities – choose how values are hashed.
- **Pluggable equality** via `Eq` – control when values are considered equal.
- **Immutable collections** – operations return new `HashMap` / `HashSet` instances.
- **Context-based factories** – `HashMap.Context` and `HashSet.Context` let you tune performance characteristics (block size, collision strategy).

If you outgrow the default `Map` / `Set`, or need consistent hashing across environments, `@rimbu/hashed` is a solid fit.

---

## Feature Highlights

- **HashMap & HashSet** – immutable, type-invariant collections with O(1)-style lookups.
- **Non-empty variants** – `HashMap.NonEmpty` / `HashSet.NonEmpty` for stronger type guarantees.
- **Builders** – `HashMap.Builder` / `HashSet.Builder` for efficient bulk construction and mutation before freezing.
- **Configurable contexts** – use `HashMap.createContext` / `HashSet.createContext` to plug in custom `Hasher`, `Eq`, and block sizing.
- **Rich hasher utilities** – `Hasher.numberHasher`, `Hasher.stringHasher`, `Hasher.anyDeepHasher`, `Hasher.objectHasher`, and more in `@rimbu/hashed/common`.
- **Stream integration** – many APIs accept `StreamSource` inputs and expose `Stream` outputs for composable data flows.

---

## Quick Start

```ts
import { HashMap, HashSet } from '@rimbu/hashed';

// HashSet: unique values
const users = HashSet.of('alice', 'bob', 'alice');
console.log(users.toString()); // HashSet('alice', 'bob')

// HashMap: key → value entries
const scores = HashMap.of(
  [1, 'low'],
  [2, 'medium'],
  [3, 'high']
);

console.log(scores.get(2)); // 'medium'
console.log(scores.hasKey(4)); // false

// Immutable updates
const updated = scores.set(2, 'mid');
console.log(updated.get(2)); // 'mid'
console.log(scores.get(2)); // 'medium' (original unchanged)
```

Try Rimbu (including `@rimbu/hashed`) live in the browser using the
[Rimbu Sandbox on CodeSandbox](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts).

---

## Core Concepts & Types

### Exported Types (main package)

From `@rimbu/hashed`:

| Name                       | Description                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------- |
| `HashMap<K, V>`            | Immutable, type-invariant hash map from keys `K` to values `V`.                                      |
| `HashMap.NonEmpty<K, V>`   | Non-empty refinement of `HashMap<K, V>` with stronger type guarantees.                               |
| `HashMap.Context<UK>`      | Factory/context for creating `HashMap` instances for keys up to type `UK`.                           |
| `HashMap.Builder<K, V>`    | Mutable builder for efficiently constructing or mutating a `HashMap` before freezing it.            |
| `HashSet<T>`               | Immutable, type-invariant hash set of values `T`.                                                    |
| `HashSet.NonEmpty<T>`      | Non-empty refinement of `HashSet<T>`.                                                                |
| `HashSet.Context<UT>`      | Factory/context for creating `HashSet` instances for values up to type `UT`.                         |
| `HashSet.Builder<T>`       | Mutable builder for efficiently constructing or mutating a `HashSet` before freezing it.            |
| `Hasher<UK>`               | Interface describing a hasher for values up to type `UK`.                                           |
| `Hasher.*` helpers         | A family of hasher factories (e.g. `numberHasher`, `stringHasher`, `anyFlatHasher`, `objectHasher`). |

The package also re-exports the sub-packages:

- `@rimbu/hashed/map` – `HashMap`-specific interfaces and helpers.
- `@rimbu/hashed/set` – `HashSet`-specific interfaces and helpers.
- `@rimbu/hashed/common` – shared hasher utilities and low-level building blocks.

### Basic Operations (HashMap)

```ts
import { HashMap } from '@rimbu/hashed';

// Construction
const empty = HashMap.empty<number, string>();
const fromEntries = HashMap.of(
  [1, 'one'],
  [2, 'two']
);

// Size & emptiness
empty.isEmpty; // true
fromEntries.size; // 2

// Lookups
fromEntries.hasKey(1); // true
fromEntries.get(2); // 'two'

// Removing keys (returns new map)
const without = fromEntries.removeKey(1);
without.hasKey(1); // false
```

### Basic Operations (HashSet)

```ts
import { HashSet } from '@rimbu/hashed';

const s1 = HashSet.of('a', 'b', 'c', 'a');

s1.size; // 3
s1.has('b'); // true

const s2 = s1.add('d'); // new set
const s3 = s2.remove('a'); // new set

console.log(s1.toString()); // HashSet('a', 'b', 'c')
console.log(s3.toString()); // HashSet('b', 'c', 'd')
```

See the [Map docs](https://rimbu.org/docs/collections/map),
[Set docs](https://rimbu.org/docs/collections/set),
and the [Hashed API reference](https://rimbu.org/api/rimbu/hashed)
for the complete API surface.

---

## Configuring Hashers & Contexts

One of the strengths of `@rimbu/hashed` is full control over **how values are hashed**.

### Using Built-in Hashers

```ts
import { Hasher } from '@rimbu/hashed/common';

const numHasher = Hasher.numberHasher();
const strHasher = Hasher.stringHasher();
const deepHasher = Hasher.anyDeepHasher();

numHasher.hash(42); // 32‑bit hash
strHasher.hash('Hello');
deepHasher.hash({ a: [1, 2, 3], b: { c: 5 } });
```

There are many helpers for common scenarios:

- `Hasher.numberHasher()` / `Hasher.booleanHasher()` / `Hasher.bigintHasher()`
- `Hasher.stringHasher()` / `Hasher.stringCaseInsensitiveHasher()`
- `Hasher.arrayHasher()` / `Hasher.streamSourceHasher()`
- `Hasher.objectHasher()` / `Hasher.objectShallowHasher()` / `Hasher.objectDeepHasher()`
- `Hasher.anyFlatHasher()` / `Hasher.anyShallowHasher()` / `Hasher.anyDeepHasher()`

### Custom Contexts for HashMap

```ts
import { HashMap } from '@rimbu/hashed';
import { Hasher } from '@rimbu/hashed/common';

// Case-insensitive string keys
const ctx = HashMap.createContext<string>({
  hasher: Hasher.stringCaseInsensitiveHasher(),
});

const m = ctx.of(
  ['Key', 1],
  ['OTHER', 2]
);

m.hasKey('key'); // true
m.hasKey('other'); // true
```

### Custom Contexts for HashSet

```ts
import { HashSet } from '@rimbu/hashed';
import { Hasher } from '@rimbu/hashed/common';

// Deep structural hashing for objects
const ctx = HashSet.createContext<{ id: number; tags: string[] }>({
  hasher: Hasher.anyDeepHasher(),
});

const set = ctx.of(
  { id: 1, tags: ['a', 'b'] },
  { id: 2, tags: ['c'] }
);

set.has({ id: 1, tags: ['a', 'b'] }); // true (structurally equal)
```

For more on contexts, see the `HashMap.Context` and `HashSet.Context` sections in the
[API reference](https://rimbu.org/api/rimbu/hashed).

---

## Installation

### Node / Bun / npm / Yarn

```sh
npm install @rimbu/hashed
# or
yarn add @rimbu/hashed
# or
bun add @rimbu/hashed
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
import { HashMap, HashSet } from '@rimbu/hashed/mod.ts';
```

### Browser / ESM

`@rimbu/hashed` ships both **ESM** and **CJS** builds. Use it with any modern bundler
(Vite, Webpack, esbuild, Bun, etc.) or directly in Node ESM projects.

---

## Ecosystem & Integration

- Part of the broader **Rimbu** collection ecosystem – interoperates with `@rimbu/bimap`,
  `@rimbu/ordered`, `@rimbu/collection-types`, and `@rimbu/stream`.
- Ideal for modelling key/value stores, index structures, membership sets, caches, and more.
- Works seamlessly with other Rimbu collections and utilities for building rich, immutable data models.

Explore more at the [Rimbu documentation](https://rimbu.org) and the
[Hashed API docs](https://rimbu.org/api/rimbu/hashed).

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
