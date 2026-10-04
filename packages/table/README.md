<p align="center">
  <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" height="96" alt="Rimbu Logo" />
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/@rimbu%2Ftable.svg)](https://www.npmjs.com/package/@rimbu/table)
![License](https://img.shields.io/github/license/rimbu-org/rimbu)
![Types Included](https://img.shields.io/badge/TypeScript-ready-blue)
![Node](https://img.shields.io/badge/Node-18+-6DA55F?logo=node.js&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg)
![ESM + CJS](https://img.shields.io/badge/modules-ESM%20%2B%20CJS-informational)

</div>

# `@rimbu/table`

**Immutable, spreadsheet‑like tables for TypeScript & JavaScript.**

`@rimbu/table` provides efficient, type‑safe **Table** collections: immutable 2‑dimensional maps indexed by **row keys** and **column keys**, where each `(row, column)` pair has at most one value. It also ships concrete variants backed by hashed or sorted maps for both rows and columns.

Use it whenever you need **grid‑like data**, **2D indexing**, or want to avoid juggling nested maps manually.

---

## Table of Contents

1. [Why `@rimbu/table`?](#why-rimbu-table)
2. [Feature Highlights](#feature-highlights)
3. [Quick Start](#quick-start)
4. [Core Concepts & Types](#core-concepts--types)
5. [Working with Hash & Sorted Tables](#working-with-hash--sorted-tables)
6. [Performance Notes](#performance-notes)
7. [Installation](#installation)
8. [FAQ](#faq)
9. [Ecosystem & Integration](#ecosystem--integration)
10. [Contributing](#contributing)
11. [License](#license)

---

## Why `@rimbu/table`?

Plain maps give you **key → value** lookups, but some datasets are naturally **2‑dimensional**:

- **Spreadsheets and matrices** – cells addressed by `(row, column)` keys.
- **Time‑series grids** – `userId × day`, `metric × timeBucket`, etc.
- **Indexing external data** – look up a value by two dimensions without nested maps.

`@rimbu/table` focuses on:

- **Row/column semantics** – explicit 2D API instead of nested `Map<Map<…>>`.
- **Immutable operations** – updates return new instances with structural sharing.
- **Configurable backing maps** – choose hash or sorted maps for rows and columns.
- **Rich traversal utilities** – stream by entries, rows, or values.

If you find yourself nesting maps or objects to simulate a grid, a `Table` is usually a better fit.

---

## Feature Highlights

- **2D lookups** – efficient `(row, column) → value` access.
- **Row‑level operations** – get, filter, or remove entire rows at once.
- **Hash or sorted contexts** – choose between hashed or ordered semantics for rows and columns, independently.
- **Immutable & persistent** – structural sharing for fast copies and diffs.
- **Configurable contexts** – use `Table.createContext` or one of the four ready-made contexts to control the underlying map types.
- **Builder support** – mutable builders for efficient bulk construction.

---

## Quick Start

```ts
import { HashTableHashColumn } from '@rimbu/table/hash-row/hash-column';

// Create a hash-based table: hashed rows, hashed columns.
// The type parameter is the *cell* type: `readonly [row, column, value]`.
const table = HashTableHashColumn.of<readonly [number, string, boolean]>(
  [1, 'a', true],
  [1, 'b', false],
  [2, 'a', false],
);

// Look up a single cell
console.log(table.get(1, 'a')); // => true
console.log(table.get(1, 'z', 'fallback')); // => 'fallback'

// Check presence — of a cell, and of a row
console.log(table.hasRow(2)); // => true
console.log(table.has(1, 'c')); // => false

// Immutable updates
const updated = table.set(2, 'b', true);
console.log(updated.get(2, 'b')); // => true

// `size` counts cells; `amountRows` counts rows holding at least one cell
console.log(table.size); // => 3
console.log(table.amountRows); // => 2
```

You can also work with the generic `Table` value via a custom context:

```ts
import { HashMap } from '@rimbu/hashed/map';
import { Table } from '@rimbu/table';

// A table needs a context for rows *and* one for columns; both are required,
// because which map backs which axis is an independent choice.
const ctx = Table.createContext({
  rowContext: HashMap.collectionContext,
  columnContext: HashMap.collectionContext,
});

const t = ctx.of<readonly [number, string, boolean]>([1, 'a', true], [2, 'b', false]);

console.log(t.get(2, 'b')); // => false
console.log(t.amountRows); // => 2
```

Try Rimbu (including `@rimbu/table`) live in the browser using the
[Rimbu Sandbox on CodeSandbox](https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main?previewwindow=console&view=split&editorsize=65&moduleview=1&module=/src/index.ts).

---

## Core Concepts & Types

### Exported Types (main package)

From `@rimbu/table`:

| Name                             | Description                                                                                                    |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `Table<R, C, V>`                 | Type‑invariant immutable table of row key type `R`, column key type `C`, and value type `V`.                   |
| `Table.NonEmpty<R, C, V>`        | Non‑empty refinement of `Table<R, C, V>` with stronger guarantees.                                             |
| `Table.Context<UR, UC>`          | Factory/context for creating `Table` instances for upper row type `UR` and upper column type `UC`.             |
| `Table.Builder<R, C, V>`         | Mutable builder for efficiently constructing or mutating a `Table` before freezing it into an immutable value. |
| `Table.CollectionContext<UR, UC>` | A ready-made context value — the type of the four exported constants and of `Table.createContext`.             |

There is a single collection type. Which map backs the rows and which backs the
columns is chosen by the **context**, not by the type, so there are no variant
collection types and no type‑variant (covariant) view.

See the full [Table docs](https://rimbu.org/docs/collections/table) and
[API reference](https://rimbu.org/api/rimbu/table) for all operations.

---

## Working with Hash & Sorted Tables

The package exports four ready-made **contexts** from sub-paths:

- `@rimbu/table/hash-row/hash-column` — `HashTableHashColumn`: **hashed rows**, **hashed columns**.
- `@rimbu/table/hash-row/sorted-column` — `HashTableSortedColumn`: **hashed rows**, **sorted columns**.
- `@rimbu/table/sorted-row/hash-column` — `SortedTableHashColumn`: **sorted rows**, **hashed columns**.
- `@rimbu/table/sorted-row/sorted-column` — `SortedTableSortedColumn`: **sorted rows**, **sorted columns**.

Each is a `Table.CollectionContext`, so each carries the full factory surface
(`empty`, `of`, `from`, `builder`, `reducer`, `defaultContext`,
`createContext`). They differ only in ordering — and ordering is the only thing
they *promise*: `rowMap` is the generic
`MapCollection<R, MapCollection.NonEmpty<C, V>>`, so the concrete backing is an
implementation detail.

```ts
import { HashTableHashColumn } from '@rimbu/table/hash-row/hash-column';
import { HashTableSortedColumn } from '@rimbu/table/hash-row/sorted-column';
import { SortedTableHashColumn } from '@rimbu/table/sorted-row/hash-column';
import { SortedTableSortedColumn } from '@rimbu/table/sorted-row/sorted-column';

// Hash rows + hash columns
const hh = HashTableHashColumn.empty<readonly [number, string, boolean]>();

// Hash rows + sorted columns
const hs = HashTableSortedColumn.of<readonly [number, string, number]>(
  [1, 'a', 1],
  [1, 'b', 2],
);

// Sorted rows + hash columns
const sh = SortedTableHashColumn.from<readonly [number, string, boolean]>([
  [1, 'a', true],
  [2, 'b', false],
]);

// Sorted rows + sorted columns — `streamRows()` is now in comparator order
const ss = SortedTableSortedColumn.builder<readonly [number, string, number]>();
```


// Hash rows + hash columns
const hh = HashTableHashColumn.empty<number, string, boolean>();

// Hash rows + sorted columns
const hs = HashTableSortedColumn.of<[number, string, number]>(
  [1, 'a', 1],
  [1, 'b', 2]
);

// Sorted rows + hash columns
const sh = SortedTableHashColumn.from([
  [1, 'a', true],
  [2, 'b', false],
]);

// Sorted rows + sorted columns
const ss = SortedTableSortedColumn.builder<number, string, number>();
```

Choose the context based on whether you need **ordering** for rows and/or columns (use sorted) or just **fast hash‑based lookup** (use hashed). Note that with hashed backings the *order* of `streamRows()` and of `getRow(row)` is unspecified, even though `rowMap` still reports a stable `size`.

---

## Performance Notes

- Tables in Rimbu are built on **persistent data structures** – updates are typically \\(O(\log n)\\) and share most of their structure.
- Row and column operations are designed to behave similarly to their underlying map implementations (`HashMap` / `SortedMap`).
- Many bulk operations accept generic `StreamSource` inputs, letting you construct and transform tables efficiently from arrays, iterables, or streams.

For detailed performance characteristics and benchmarks, see the main Rimbu documentation at [rimbu.org](https://rimbu.org).

---

## Installation

### Node / Bun / npm / Yarn

```sh
npm install @rimbu/table
# or
yarn add @rimbu/table
# or
bun add @rimbu/table
# or
deno add npm:@rimbu/table
```

### Browser / ESM

`@rimbu/table` ships both **ESM** and **CJS** builds. Use it with any modern bundler
(Vite, Webpack, esbuild, Bun, etc.) or directly in Node ESM projects.

---

## FAQ

**Q: How is a `Table` different from a nested `Map<Map<…>>`?**  
A `Table` gives you a dedicated 2D API (`get`, `set`, `getRow`, `removeRow`, etc.), row/column semantics, and consistent immutability guarantees, while still exposing row/column maps when needed.

**Q: What happens if I set a value at an existing `(row, column)`?**  
The new value **replaces** the previous one and returns a new table instance; the original is unchanged.

**Q: Is the structure mutable?**  
No. All updates return new table instances; existing ones remain unchanged and can be safely shared across your application.

**Q: Can I iterate rows or values separately?**  
Yes. Use methods like `stream`, `streamRows`, `streamValues`, `forEach`, or convert to arrays/maps via `toArray` / `rowMap`.

---

## Ecosystem & Integration

- Part of the broader **Rimbu** collection ecosystem – interoperates with `@rimbu/hashed`,
  `@rimbu/sorted`, `@rimbu/collection-types`, and `@rimbu/stream`.
- Ideal for modelling grids, cross‑product indices, availability matrices, and more.
- Works seamlessly with other Rimbu collections and utilities for building rich, immutable data models.

Explore more at the [Rimbu documentation](https://rimbu.org) and the
[Table API docs](https://rimbu.org/api/rimbu/table).

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
