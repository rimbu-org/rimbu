---
'@rimbu/table': major
'@rimbu/collection-types': major
'@rimbu/common': major
---

# Migrate `@rimbu/table` to the capability/Family model

**Breaking:** `Table` is now a flat-triple `Collection<readonly [R, C, V]>` built from the
capability mixins, with a package-local `TableCollection.Capability` suite for the whole
2-dimensional API and a new `advanced/` tier (`@rimbu/table/advanced/table-base`).

A 2-D table has no home in the generic capability graph: `KeyedCollection<K, V>` binds its
element to `readonly [K, V]` unconditionally, while a table's element is the *cell*
`readonly [R, C, V]`. Every operation is addressed by two coordinates, so adopting the keyed
capabilities would force a choice between two wrong answers — bind `V` to a whole column map
and turn `stream`/`filter`/`toArray` into row-shaped operations, or bind `V` to one cell
value and leave `get(key)` undefined. Table therefore takes the plain `Collection` contract
plus the capabilities whose operand is a cell or a stream of cells, and supplies everything
else itself. Rationale per suite in `packages/table/AGENTS.md`; design in
`.scratch/table-migration-plan.md`.

### Removed

- `VariantTable` / `VariantTable.NonEmpty` and the `@rimbu/table/variant` re-export. There
  was no constructor for either — they were purely structural — and the capability model
  expresses variance through `_INVARIANT` on the family. Read-only use is served by the
  normal types and `asNormal()`.
- The four public variant *types* (`HashTableHashColumn<R, C, V>` and friends). They are now
  `Table.Context` **values**; see "Changed".
- `removeAndGet`, `removeRowAndGet` and the `WithValueResult` type they returned. The
  capability suite's convention is `*AndReturn` on `Op.DynamicResult`, whose `hasChanged`
  field reports change directly instead of requiring `result[0] === this`. A follow-up will
  add `removeAndReturn` / `removeRowAndReturn`; the committed shape is recorded in
  `.scratch/table-migration-plan.md` §6.
- `toJSON`. Nothing in the shared capability base carries it (bimap and bimultimap dropped it
  in their own migrations).
- `Row` / `WithRow` from `@rimbu/collection-types/advanced/common`. Three phantom HKT slots
  with no family counterpart, used by exactly one file in the repo (this package), and
  redundant now that `FamilyBase` carries `_NEW_E`. The name also collided head-on with
  table's own vocabulary: `WithRow<Tp, R, C, V>['rowMap']` read as "with a row" but meant
  "with the row-*key* type".
- `WithValueResult` from `@rimbu/common/types`, together with the legacy
  `removeKeyAndGet` / `updateAtAndGet` on `RMapBase`.

### Changed

- **One collection type, four contexts.** `HashTableHashColumn`, `HashTableSortedColumn`,
  `SortedTableHashColumn` and `SortedTableSortedColumn` survive as `Table.CollectionContext`
  values on unchanged subpaths (`@rimbu/table/hash-row/hash-column` etc.). They differ only
  in row/column backing. Matches `multiSet` D1, `multimap` Q5 and `bimultimap` Q1.
- `rowMap` loses its per-variant narrowing and is now the generic
  `MapCollection<R, MapCollection.NonEmpty<C, V>>`. The inner `NonEmpty` is an invariant of
  the storage — a row is pruned the moment its last cell is removed. Same trade `MultiSet`
  made with `countMap` (its "one *visible* API loss").
- Renames, following the map-family vocabulary: `at` → `get`, `hasValueAt` → `has`,
  `hasRowKey` → `hasRow`, `rowAt` → `getRow`, `addEntry` → `add`, `addEntries` → `addEach`,
  `modifyAt` → `modify`, `updateAt` → `update`, `removeEntries` → `removeEach`. Unchanged:
  `set`, `remove`, `removeRow`, `removeRows`, `filterRows`, `mapValues`, `streamRows`,
  `streamValues`, `amountRows`, `rowMap`.
- `remove(row, column)` returns nothing. Read the value with `get` first. The *builder's*
  `remove` still returns the removed value — a mutable builder has no result collection to
  return, so the information would otherwise be unrecoverable.
- `forEach` and `filter` are **1-arity**, with the old shapes moved to `forEachIndexed` and
  `filterIndexed`. Both splits are forced by the shared capability contract: `WithFilter` is
  unconditionally part of `Collection.Advanced.Api` and takes a 1-arity predicate, and the
  shared `filterIndexed` passes `(element, index)` with **no** `halt` — so `halt` remains
  reachable only through `forEachIndexed`.
- `typeTag` is uniformly `'Table'` on every context, so `toString()` output changes from
  `HashTableHashColumn(...)` to `Table(...)`. The tag describes the collection, not the
  backing (`MultiSet` D2).
- The generic `Table` value keeps `createContext` only — no `defaultContext`. A table has no
  default backing, because which map backs rows and which backs columns are independent
  choices; giving it one would invent a policy the API deliberately refuses to pick.
- `Table.Context` gains the shared context surface (`defaultContext`, `empty`, `of`, `from`,
  `builder`, `reducer`) with library-wide signatures, and `Table.Builder` gains `context` and
  `clear()`.
- Empty/of/from/builder factory methods now take the **cell** type:
  `HashTableHashColumn.of<readonly [number, string, boolean]>(...)` rather than
  `of<number, string, boolean>(...)`. This is the shared `ContextApi` convention
  (`empty<E>()`, `of<E>()`), which every migrated package follows.

### Added

- `TableCollection` in `@rimbu/table/advanced/table-base`: the capability suite, with
  `Advanced.{FamilyBase,Family,Api,NonEmptyApi,BuilderApi,ContextApi}` and a
  `Capability.*` namespace per method group — the extension point an external implementer
  needs to build a custom Table, which the package did not previously expose.
- `mutate`, `add`, `addEach` and `reducer` on the collection, from the adopted capabilities.
- `NonEmpty` refinements for `rowMap`, `streamRows` and `streamValues`.

### Fixed

Three defects the shared-harness rewrite surfaced, none of which were reachable through the
old test layout:

- `TableEmpty` did not implement `streamValues`, so calling it on an empty table threw at
  runtime. `tsc` was satisfied because the capability is declared on the interface.
- `TableBuilder.clear()` did not call `checkLock()`, so clearing a builder from inside its own
  traversal silently corrupted the row-builders instead of throwing.
- `TableBuilder.modify()` checked the traversal lock *after* its empty-options early return,
  so `modify(row, column, {})` was accepted during a traversal while every other mutator
  was correctly rejected.

### Not changed

- **No column axis.** Rows are exposed (`rowMap`, `getRow`, `hasRow`, `amountRows`,
  `removeRow`, `removeRows`, `streamRows`, `filterRows`); columns are not. The storage is
  symmetric, but a transposed `columnMap` is not free and `amountColumns` is O(cells), so
  adding them is feature work with new invariants. (`AGENTS.md` previously advertised
  `removeColumn` and `columnMap`; they never existed.)