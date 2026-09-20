---
'@rimbu/multiset': major
'@rimbu/core': major
---

# Migrate `@rimbu/multiset` to the capability/HKT model

**Breaking:** `MultiSet` is now a `ValuedCollection` built from the capability mixins,
with a package-local `MultiSetCollection.Capability` suite for the count-aware API and an
`advanced/` tier (`@rimbu/multiset/advanced/multiset-base`).

### Removed

- `VariantMultiSet` and the `@rimbu/multiset/variant` subpath (and its `@rimbu/core`
  re-export). Read-only use is served by the normal types and `asNormal()`.
- `toJSON`, `_types`, `Elem`/`WithElem`, the `Omit`-based `NonEmpty` reconstruction, and
  the legacy `RMap`/`VariantMap`/`EmptyBase`/`NonEmptyBase` imports.

### Changed

- `remove(value, { amount })` → `remove(value, amount?)` (positional; default `1`).
- `removeAll(values, { amount })` → `removeAll(values)`, which removes **all** occurrences
  of every value. `removeAllSingle`/`removeAllEvery` consolidation is reverted; use
  `remove(value, amount)` for partial removal.
- `intersect` → `intersection`; `symDifference` → `symmetricDifference`.
- `add(value)` / `add(value, amount)` now use the literal-amount type
  `0 extends N ? normal : nonEmpty`.
- `filterWithCounts` keeps its type-guard overloads; `count`/`sizeDistinct` live on the
  new `WithCount` capability.
- `countMap` is typed `MapCollection<T, number>` (`MapCollection.NonEmpty` on non-empty
  instances) rather than the concrete `HashMap`/`SortedMap`; `HashMultiSet`/`SortedMultiSet`
  still default their `countMapContext` to `HashMap`/`SortedMap`.
- `forEach` now takes only the element; indexed iteration moved to `forEachIndexed`.
- `HashMultiSet`/`SortedMultiSet` contexts and factories follow the `HashMap`/`SortedMap`
  shape (`defaultContext`, `createContext`, `reducer`), and their `Advanced.Family`
  replaces the old `Types` record.
