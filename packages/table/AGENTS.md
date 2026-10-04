# @rimbu/table — Package Agent Guide

This package provides Rimbu's **immutable `Table`**: a row × column → value
structure backed internally by two nested maps (`Map<R, Map<C, V>>`).

There is **one** collection type, `Table<R, C, V>`. Which map backs the rows and
which backs the columns are independent choices made by a **context**, so the
package ships four ready-made contexts and no variant types.

> For workspace-wide conventions (biome rules, `build:seq` before typecheck/test,
> the Interface + Namespace pattern, capability families, `NonEmpty` tracking,
> `OptLazy`, `RelatedTo`, and the changeset workflow) see the **root
> `AGENTS.md`**. This file only covers what is specific to `@rimbu/table`.

## Source layout

```
src/
├── table.ts                    # exports["."]   — Table + Advanced + the Table value
├── advanced/                   # exports["./advanced/*"]
│   └── table-base.ts           # TableCollection: Capability.*, Advanced.*
├── public/                     # exports["./*"]  → dist/public/*
│   ├── hash-row/
│   │   ├── hash-column.ts      # HashTableHashColumn
│   │   └── sorted-column.ts    # HashTableSortedColumn
│   └── sorted-row/
│       ├── hash-column.ts      # SortedTableHashColumn
│       └── sorted-column.ts    # SortedTableSortedColumn
└── internal/                   # NEVER exported; "#table/*" only
    ├── context.ts              # TableContext — the structural context alias
    ├── context-factory.ts      # TableCollectionContext
    ├── creators.ts             # TableCreators
    ├── builder.ts              # TableBuilder
    └── immutable/
        ├── empty.ts            # TableEmpty
        └── non-empty.ts        # TableNonEmptyBase
```

### Key rule: imports inside `src/`
- `#table/*` for `src/internal/*`, `#table/immutable/*` for `src/internal/immutable/*`.
- `@rimbu/table/advanced/*` for the capability suite.
- `@rimbu/table/hash-row/*` and `@rimbu/table/sorted-row/*` for the contexts.
- Never relative paths.

## Why a Table is not a keyed collection

`KeyedCollection<K, V>` binds its element to `readonly [K, V]` and every one of
its capabilities (`get`, `has`, `streamKeys`, `streamValues`) assumes two
coordinates. A table's element is a **cell**, `readonly [R, C, V]`, and every
operation is addressed by *two* coordinates. Adopting the keyed capabilities
would force a choice between two wrong answers: bind `V` to a whole column map
(turning `stream`/`filter`/`toArray` into row-shaped operations), or bind `V` to
one cell value (leaving `get(key)` undefined, since a key alone does not identify
a cell).

So `Table<R, C, V>` is a `Collection<readonly [R, C, V]>` — a **flat-triple
element** — plus a package-local `TableCollection.Capability.*` suite. This is the
same shape as `MultiSetCollection`, `MultiMapCollection` and `BiMapCollection`.

### Banned capability suites (each needs a reason here, per `review-api`)

| Suite | Why it is banned |
|---|---|
| `KeyedCollection` | Its element is `readonly [K,V]`; a table's is `readonly [R,C,V]`, and every keyed operation takes one coordinate. |
| `ValuedCollection` | Its algebra (`union`, `intersection`, `difference`, `symmetricDifference`) and `has(element)` are defined over a single value type. A table has no single value type. |
| `IndexedCollection` | `at`/`slice`/`first`/`last`/`prepend`/`append` are defined over a positional order. A table has none: cells are addressed by coordinate, and row/column ordering comes from the backing contexts. Note `at` is *already* a coordinate accessor here (`get(row, column)`) — the opposite of what the indexed contract means. |
| `SortedCollection` | `min`/`max`/`next`/`previous` need a total order on the *element*. A cell has no meaningful order; only its row key or column key does, and which one is a property of the backing context. |

### Adopted from the shared suite

Only those whose operand is the *cell* or a *stream of cells*: `filter`,
`add`, `addEach`, `toBuilder`, `mutate`, `reducer`, `recompose`.

The element-level transforms are deliberately **not** adopted. `WithMap`,
`WithMapIndexed`, `WithFlatMap`, `WithFlatMapIndexed` and `WithRecompose` would
all operate cell-to-cell — "rebuild this 3-tuple" and "explode one cell into N
cells" — which is not a useful table operation and would be actively misleading.
Value-level transformation is `TableCollection.Capability.WithMapValues`, whose
callback receives the value **and both coordinates**.

## Data-model invariants — do not break

Each is a behavioural contract the runtime harness relies on. The
`row-pruning invariant` is the one most easily broken by a rewrite.

1. **Two fields of state.** `TableNonEmptyBase` holds `rowMap` (non-empty) and
   `size`, the **cell** count. `amountRows` is `rowMap.size` — a different number,
   which is why both exist.
2. **Row pruning (the important one).** Inner row maps are *always* non-empty. A
   row is removed the moment its last cell goes, in **four** places:
   `TableNonEmptyBase.modify`, `#removeAndReturn`, `TableBuilder.modify`, and
   `TableBuilder.remove`. This is what makes `MapCollection.NonEmpty` in
   `rowMap`'s inner position an invariant rather than an approximation.
3. **Identity on no-op.** `copy`/`copyE` return `this` when the new `rowMap` is
   reference-identical; `modify` returns `this` when `checkEmptyModifyOptions`
   says both branches are absent; `filter` short-circuits when the builder size
   is unchanged.
4. **`modify` delegates to nested `modifyAtKey`**, threading a `newSize` counter.
   The `create` branch honours the skip token, so a `create` returning the token
   leaves the table untouched.
5. **Key validity is checked before removal** (`isValidRow` / `isValidColumn`),
   so a `NaN` key is rejected rather than silently added.
6. **Every builder mutator calls `checkLock()`** — *including `clear()`*, and
   *including `modify` before its empty-options early return*. All eleven were
   missing one or both during development; the harness
   (`operations throw while traversing`) is what caught them.
7. **`forEach` locks in `try`/`finally`** via `startIteration`/`endIteration`.
   `f` is user code and `halt()` is implemented by throwing a sentinel that the
   traversal swallows — without `finally` a legal `halt()` leaves the builder
   rejecting every later mutation. `forEachIndexed` is overridden (not inherited)
   because it must thread `halt` into both levels of the nested iteration.
8. **Copy-on-write against `source`.** `source` is set to `undefined` by the
   first real mutation; while it is live, reads delegate to it and `build()`
   returns it unchanged.
9. **`Builder.set` reports `changed` by `Object.is`**, so re-setting an identical
   value is a no-op and leaves `source` intact.
10. **Builder members are arrow-function properties**, not prototype methods, so
    `this` survives destructuring. Preserve this when editing.

## Architecture

- **`Table<R, C, V>`** (`table.ts`) — the public interface, an `extends` alias
  for `Table.Advanced.Api` with the family bound. `Table.NonEmpty` adds the
  refinements (`rowMap` non-empty, `streamRows`/`streamValues` non-empty).
- **`Table.Advanced.Family<R, C, V>`** (`table.ts`) — the concrete HKT record.
  Pins `_NORMAL` / `_NON_EMPTY` / `_BUILDER` / `_CONTEXT`, `_UPPER_E` as
  `readonly [any, any, any]`, `_ROW_CONTEXT` / `_COLUMN_CONTEXT`, and ties
  `_NEW_E` to the three `_NEW_*` coordinate projections in **one** place.
- **`TableCollection`** (`advanced/table-base.ts`) — the capability suite.
- **`TableCollectionContext`** (`internal/context-factory.ts`) — the concrete
  context; frozen on construction.
- **The four exported constants** (`public/{hash,sorted}-row/*.ts`) — each is a
  `Table.CollectionContext` with a different row/column backing.

### Why `_UPPER_E`/`_NEW_E` are pinned in the concrete family

`TableCollection.Advanced.FamilyBase` declares the coordinate slots as
*independent* `unknown`s rather than as projections of `_UPPER_E`. Projecting
would require redeclaring `_UPPER_E` as a concrete triple, and
`Collection.Advanced.Family<E>` — which the framework's own base classes require
a family to extend — leaves it `unknown`, so the merge fails with **TS2320**. The
concrete family therefore ties them together in one place. Same reason the shared
`WithAdd`/`WithAddEach`/`WithToBuilder` capability *families* are not in the
concrete family's `extends` clause even though their `Api`s are adopted: their
`_NEW_E`/`_INVARIANT` declarations are the conflict. The invariant is stated once
instead.

### Why capability `Tp` is bound to the concrete family

`TableCollection.Advanced.TypesRecord` binds `Tp` to the **aggregate** family, not
`FamilyBase`. `ReTyped` and `FamToTypes` pivot through `_NEW_E` into
`_NEW_FAMILY` and read `_NORMAL` off the result; `FamilyBase._NEW_FAMILY` is a
`FamilyBase`, whose `_NORMAL` is `unknown`. A capability bound to `FamilyBase`
therefore cannot re-type anything, and `mapValues` would return `unknown`.

### No column axis (deliberate)

Rows are exposed (`rowMap`, `getRow`, `hasRow`, `amountRows`, `removeRow`,
`streamRows`, `filterRows`); **columns are not** — there is no `columnMap`,
`hasColumn`, `removeColumn` or `amountColumns`. The storage is symmetric, but a
transposed `columnMap` is not free and `amountColumns` is O(cells), so adding
them is feature work with new invariants. File it separately. (An earlier version
of this file falsely advertised `removeColumn` and `columnMap`; they never
existed.)

## Testing

- `test/table-standard-test.ts` — the shared suite, parameterised by **context**,
  not by collection type. Every assertion must hold for all four contexts;
  nothing may depend on iteration order unless the context is sorted.
- Four adapters, one per context: `test/{hash,sorted}-table-{hash,sorted}-column.test.ts`.
- `test/smoke.test.ts` — cross-cutting behaviour (context derivation, `toString`
  tag, no-op identity, `NaN` keys).
- `test-d/table.test-d.ts` — the one canonical type suite. There is deliberately
  **no per-variant `test-d`**: the four old ones were near-verbatim copies and were
  deleted rather than patched.
- No `test-random/`. Not yet written; a 2-D structure's row-pruning invariant
  would genuinely benefit from it.

### Two assertions to keep in mind when editing the type tests

- Whole-interface comparisons of `Table` / `Table.Builder` / `Table.Context` use
  `toExtend`, not `toEqualTypeOf`. These are recursive generic interfaces, and
  `expectTypeOf` reports `"Expected: function, Actual: function"` — it cannot
  prove two instantiations identical even when they are. The migrated packages
  (`hashed/test-d`, `multiset/test-d`) assert these relations the same way. Pin
  exact types **per member** where precision matters.
- `typecheck` is the only gate for `test-d`: no package declares `test:types`, so
  `bun test` skips `*.test-d.ts` by filename convention and never runs them.

## Tooling

All commands run from this package directory. Per the root guide, **always
`bun run build:seq` (from the repo root) before `typecheck`/`test`** so dependent
`dist/` outputs are current.

| Command | Purpose |
|---|---|
| `bun run typecheck` | `tsc -p tsconfig.json --noEmit` (includes `src`, `test`, `test-d`) |
| `bun run test` | `bun test test/* --tsconfig-override tsconfig.common.json` |
| `bun run build` | emit this package to `dist/` |
| `bun run biome:check` / `biome:fix` | lint + format |