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
4. [Capability matrix](#capability-matrix)
5. [Map Interfaces](#map-interfaces)
6. [Set Interfaces](#set-interfaces)
7. [Installation](#installation)
8. [Ecosystem & Integration](#ecosystem--integration)
9. [Contributing](#contributing)
10. [License](#license)

---

## Sub‑packages

This package acts as a **convenience entry point** that re‑exports the following sub‑packages:

- **`@rimbu/collection-types/collection`** – `Collection`, the capabilities shared by every collection
- **`@rimbu/collection-types/map`** – `MapCollection`, the map‑shaped capabilities
- **`@rimbu/collection-types/set`** – `SetCollection`, the set‑shaped capabilities
- **`@rimbu/collection-types/types`** – `TypesKey` and the HKT slot types

Each collection sub‑namespace is further split by *shape* under
`@rimbu/collection-types/collection/*`: `ValuedCollection`, `KeyedCollection`,
`IndexedCollection` and `SortedCollection`. These are implemented by concrete
data structures in packages like `@rimbu/hashed`, `@rimbu/ordered`,
`@rimbu/sorted`, etc.

> **Removed:** the `RMap` / `RSet` / `VariantMap` / `VariantSet` aliases and the
> `RMapBase` / `RSetBase` / `VariantMapBase` / `VariantSetBase` bases. The
> capability families above replace them, without the separate read‑only /
> invariant split and without a second `Types` record to keep in sync. See
> `MapCollection` below for the migration.

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

These types are used to express **higher‑kinded collection families**, such as the `_NORMAL` / `_NON_EMPTY` / `_BUILDER` / `_CONTEXT` slots on `MapCollection.Advanced.Family` and `SetCollection.Advanced.Family`.

---

## Quick Start

Although `@rimbu/collection-types` itself only contains **types and interfaces**, you’ll mostly encounter it indirectly when using concrete collections such as `HashMap` or `HashSet`:

```ts
import { HashMap } from '@rimbu/hashed'; // implements MapCollection
import type { MapCollection } from '@rimbu/collection-types/map';

const m: MapCollection<number, string> = HashMap.of([1, 'one'], [2, 'two']);

console.log(m.get(2)); // 'two'
```

For sets:

```ts
import { HashSet } from '@rimbu/hashed';
import type { SetCollection } from '@rimbu/collection-types/set';

const s: SetCollection<number> = HashSet.of(1, 2, 3);

console.log(s.has(2)); // true
console.log(s.toArray()); // [1, 2, 3] (order depends on implementation)
```

---

## Constraining a subset of capabilities

A *family* describes what a collection can do. To require only some of that, declare a **named** interface extending the aggregate `Advanced.Family` — never an ad‑hoc intersection of individual `Capability.*` families, which silently drops the `_BUILDER` / `_CONTEXT` / `_NORMAL` slots:

```ts
import type { SetCollection } from '@rimbu/collection-types/set';

interface Capabilities extends SetCollection.Advanced.Family<number> {}

declare const S: SetCollection.Context<Capabilities>;
```

---

## Capability matrix

Which capabilities each concrete family adopts. `Order edit` covers
`prepend` / `append` / `placeAt` / `moveTo`; `RemoveAt` and `SwapAt` are the
indexed edit capabilities.

| Family | Collection | Indexed | Valued/Keyed | Sorted | Filterable | RemoveAt | SwapAt | Order edit |
|---|---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| List variants | yes | yes | no | no | yes | yes | yes | no |
| HashSet | yes | no | valued | no | yes | no | no | no |
| HashMap | yes | no | keyed | no | yes | no | no | no |
| SortedSet | yes | yes | valued | yes | yes | yes | no | no |
| SortedMap | yes | yes | keyed | yes | yes | yes | no | no |
| OrderedSet variants | yes | yes | valued | no | yes | yes | yes | yes |
| OrderedMap variants | yes | yes | keyed | no | yes | yes | yes | yes |
| ProximityMap | yes | no | keyed | no | yes | no | no | no |
| MultiSet | yes | no | valued | no | yes | no | no | no |
| MultiMap | yes | no | keyed † | no | yes | no | no | no |
| BiMap | yes | no | keyed | no | yes | no | no | no |
| BiMultiMap | yes | no | keyed † | no | yes | no | no | no |
| Table | yes | no | **neither** ‡ | no | yes | no | no | no |
| Graph | *pending migration* | | | | | | | |

† Bi-directional and multi-valued collections adopt the keyed **family** but
refuse the single-value capabilities: a `MultiMap`'s `get` would have to return a
set, and a `BiMultiMap`'s would return a set in each of two directions. See the
`@rimbu/multimap` and `@rimbu/bimultimap` package guides.

‡ **A Table is neither keyed nor valued.** Its element is the *cell*
`readonly [R, C, V]` — three coordinates — and `KeyedCollection<K, V>` binds its
element to `readonly [K, V]` unconditionally. It adopts the plain `Collection`
contract plus `WithFilter`, `WithAdd`, `WithAddEach`, `WithToBuilder`,
`WithMutate`, `WithReducer` and `WithRecompose` — only the capabilities whose
operand is a cell or a stream of cells — and supplies every 2-dimensional
operation through a package-local `TableCollection.Capability.*` suite.
`ValuedCollection` and `IndexedCollection` are banned outright: there is no
single value type, and a table has no positional order. See the
`@rimbu/table` package guide.

## Map Interfaces

From `@rimbu/collection-types/map`:

### Exported Types

| Name                          | Description                                                                                                       |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `MapCollection<K, V>`         | Immutable map of keys `K` to values `V`. Each key has exactly one value; no duplicate keys.                       |
| `MapCollection.NonEmpty<K, V>`| Non‑empty refinement with stronger guarantees (e.g. `isEmpty` is always `false`).                                |
| `MapCollection.Context<F>`    | Factory/context for creating map instances. Takes a *family* rather than a key type, so it can be narrowed.        |
| `MapCollection.Builder<K, V>` | Mutable builder used to efficiently construct a map before freezing it into an immutable instance.                 |

### Key Operations (via `MapCollection.Advanced.Api`)

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

| Name                       | Description                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| `SetCollection<T>`         | Immutable set of values `T`. No duplicate values.                                          |
| `SetCollection.NonEmpty<T>`| Non‑empty refinement of `SetCollection<T>`.                                                |
| `SetCollection.Context<F>` | Factory/context for creating set instances. Takes a *family* rather than an element type.   |
| `SetCollection.Builder<T>` | Mutable builder for efficiently constructing a set before freezing it.                     |

### Key Operations (via `Collection.Capability.*` and `ValuedCollection.Capability.*`)

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
import type { MapCollection } from '@rimbu/collection-types/map';
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
