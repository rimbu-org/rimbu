<p align="center">
  <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" height="96" alt="Rimbu Logo" />
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/@rimbu%2Fcollection-types.svg)](https://www.npmjs.com/package/@rimbu/collection-types)
![License](https://img.shields.io/github/license/rimbu-org/rimbu)
![Types Included](https://img.shields.io/badge/TypeScript-ready-blue)
![Node](https://img.shields.io/badge/Node-18+-6DA55F?logo=node.js&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg)
![ESM + CJS](https://img.shields.io/badge/modules-ESM%20%2B%20CJS-informational)

</div>

# `@rimbu/collection-types`

**Core collection interfaces for maps and sets in the Rimbu ecosystem.**

`@rimbu/collection-types` provides the shared **public interfaces and higher‑kind utility types** used by all Rimbu collection implementations.  
It defines the common contracts for:

- **Maps** – via `@rimbu/collection-types/map`
- **Sets** – via `@rimbu/collection-types/set`

Concrete implementations such as `HashMap`, `SortedMap`, `HashSet`, and `SortedSet` (from packages like `@rimbu/hashed`, `@rimbu/sorted`, etc.) implement these interfaces.

For a high‑level overview, see the [Immutable Collections docs](https://rimbu.org/docs/collections).  
For full API details, see the [Collection Types API reference](https://rimbu.org/api/rimbu/collection-types).

You can also [try Rimbu in the browser](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts).

---

## Table of Contents

1. [Sub‑packages](#sub-packages)
2. [Core Concepts & Types](#core-concepts--types)
3. [Quick Start](#quick-start)
4. [Map Interfaces](#map-interfaces)
5. [Set Interfaces](#set-interfaces)
6. [Installation](#installation)
7. [Ecosystem & Integration](#ecosystem--integration)
8. [Contributing](#contributing)
9. [License](#license)

---

## Sub‑packages

This package acts as a **convenience entry point** that re‑exports the following sub‑packages:

- **`@rimbu/collection-types/map`** – interfaces for:
  - `RMap<K, V>` – type‑invariant immutable map
  - `VariantMap<K, V>` – type‑variant immutable map
- **`@rimbu/collection-types/set`** – interfaces for:
  - `RSet<T>` – type‑invariant immutable set
  - `VariantSet<T>` – type‑variant immutable set

Each of these sub‑packages is implemented by concrete data structures in packages like `@rimbu/hashed`, `@rimbu/ordered`, `@rimbu/sorted`, etc.

---

## Core Concepts & Types

### Utility Higher‑Kind Types

The `@rimbu/collection-types/common` module exposes reusable higher‑kind helper types:

| Name                     | Description                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| `Elem<T>`                | Describes a collection that has an element type `T` (used by set‑like collections).       |
| `WithElem<Tp, T>`        | Binds a higher‑kind `Tp` to a concrete element type `T`.                                  |
| `KeyValue<K, V>`         | Describes a collection that has key type `K` and value type `V` (used by map‑like types). |
| `WithKeyValue<Tp, K, V>` | Binds a higher‑kind `Tp` to concrete key and value types.                                 |
| `Row<R, C, V>`           | Describes row/column/value types (used by table‑like collections).                        |
| `WithRow<Tp, R, C, V>`   | Binds a higher‑kind `Tp` to concrete row, column, and value types.                        |

These types are used to express **higher‑kinded collection families**, such as the `Types` helpers on `RMap`, `VariantMap`, `RSet`, and `VariantSet`.

---

## Quick Start

Although `@rimbu/collection-types` itself only contains **types and interfaces**, you’ll mostly encounter it indirectly when using concrete collections such as `HashMap` or `HashSet`:

```ts
import { HashMap } from '@rimbu/hashed'; // implements RMap
import type { RMap } from '@rimbu/collection-types/map';

const m: RMap<number, string> = HashMap.of([1, 'one'], [2, 'two']);

console.log(m.get(2)); // 'two'
```

For sets:

```ts
import { HashSet } from '@rimbu/hashed';
import type { RSet } from '@rimbu/collection-types/set';

const s: RSet<number> = HashSet.of(1, 2, 3);

console.log(s.has(2)); // true
console.log(s.toArray()); // [1, 2, 3] (order depends on implementation)
```

---

## Map Interfaces

From `@rimbu/collection-types/map`:

### Exported Types

| Name                        | Description                                                                                                           |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `RMap<K, V>`                | Type‑invariant immutable map of keys `K` to values `V`. Each key has exactly one value; no duplicate keys.            |
| `RMap.NonEmpty<K, V>`       | Non‑empty refinement of `RMap<K, V>` with stronger guarantees (e.g. `isEmpty` is always `false`).                     |
| `RMap.Context<UK>`          | Factory/context for creating `RMap` instances with upper‑bounded key type `UK`.                                       |
| `RMap.Builder<K, V>`        | Mutable builder used to efficiently construct or mutate an `RMap` before freezing it into an immutable instance.      |
| `VariantMap<K, V>`          | Type‑variant immutable map of keys `K` to values `V`. Supports safe key/value widening; excludes mutating operations. |
| `VariantMap.NonEmpty<K, V>` | Non‑empty refinement of `VariantMap<K, V>`.                                                                           |

### Key Operations (via `RMapBase` / `VariantMapBase`)

Concrete map implementations share a common core API:

```ts
import { HashMap } from '@rimbu/hashed';

const m = HashMap.of<[number, string]>([1, 'a'], [2, 'b']);

// Size & emptiness
m.size; // 2
m.isEmpty; // false
m.nonEmpty(); // true (narrows type)

// Lookups
m.get(2); // 'b'
m.hasKey(1); // true

// Transform / filter
const onlyB = m.filter(([k, v]) => v === 'b');
const lengths = m.mapValues((v) => v.length);

// Bulk operations (implementation‑specific)
const m2 = m.set(3, 'c').removeKey(1);
```

For the full list of operations and overloads, see:

- [Map docs](https://rimbu.org/docs/collections/map)
- [`@rimbu/collection-types/map` API](https://rimbu.org/api/rimbu/collection-types/map)

---

## Set Interfaces

From `@rimbu/collection-types/set`:

### Exported Types

| Name                     | Description                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| `RSet<T>`                | Type‑invariant immutable set of values `T`. No duplicate values.                                 |
| `RSet.NonEmpty<T>`       | Non‑empty refinement of `RSet<T>`.                                                               |
| `RSet.Context<UT>`       | Factory/context for creating `RSet` instances with upper‑bounded element type `UT`.              |
| `RSet.Builder<T>`        | Mutable builder for efficiently constructing or mutating an `RSet` before freezing it.           |
| `VariantSet<T>`          | Type‑variant immutable set of values `T`. Allows safe value widening; excludes mutating methods. |
| `VariantSet.NonEmpty<T>` | Non‑empty refinement of `VariantSet<T>`.                                                         |

### Key Operations (via `RSetBase` / `VariantSetBase`)

Concrete set implementations share a common core API:

```ts
import { HashSet } from '@rimbu/hashed';

const s = HashSet.of(1, 2, 3);

// Size & emptiness
s.size; // 3
s.isEmpty; // false

// Membership
s.has(2); // true

// Combining sets
const other = HashSet.of(2, 4);
const union = s.union(other); // {1, 2, 3, 4}
const diff = s.difference(other); // {1, 3}
const inter = s.intersect(other); // {2}

// Builders
const builder = s.toBuilder();
builder.add(5);
const s2 = builder.build();
```

See also:

- [Set docs](https://rimbu.org/docs/collections/set)
- [`@rimbu/collection-types/set` API](https://rimbu.org/api/rimbu/collection-types/set)

---

## Installation

### Node / Bun / npm / Yarn

```sh
npm install @rimbu/collection-types
# or
yarn add @rimbu/collection-types
# or
bun add @rimbu/collection-types
# or
deno add npm:@rimbu/collection-types
```

Then you can import relative modules, for example:

```ts
import { HashMap } from '@rimbu/hashed/mod.ts';
import { RMap } from '@rimbu/collection-types/map/mod.ts';
```

> Replace `<version>` with the desired Rimbu version.

### Browser / ESM

`@rimbu/collection-types` ships both **ESM** and **CJS** builds.  
Use it with any modern bundler (Vite, Webpack, esbuild, Bun, etc.) or directly in Node ESM projects.

---

## Ecosystem & Integration

- Part of the broader **Rimbu** collection ecosystem – interoperates with packages like `@rimbu/core`, `@rimbu/hashed`, `@rimbu/ordered`, `@rimbu/sorted`, `@rimbu/bimap`, and others.
- The interfaces in this package define the **shared contracts** that all map/set implementations conform to.
- Many Rimbu utilities (`@rimbu/stream`, `@rimbu/common`, etc.) are designed to work with these interfaces directly.

Explore more at the [Rimbu documentation](https://rimbu.org) and the  
[Collection Types API docs](https://rimbu.org/api/rimbu/collection-types).

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
