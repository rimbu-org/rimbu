---
'@rimbu/multiset': major
'@rimbu/core': major
---

Multiset API improvements and breaking renames:

- Added set algebra: `union`, `intersect`, `difference`, and `symDifference` (count-based semantics: max, min, max(0, a−b), and |a−b| respectively).
- Added `streamWithCounts()` to iterate distinct values together with their count.
- Renamed `filterEntries` → `filterWithCounts` and `addEntries` → `addAllWithCounts` for consistency with the `addAll` family.
- Consolidated `removeAllSingle` and `removeAllEvery` into a single `removeAll(values, { amount })` method, mirroring the existing `remove` options object.
- Fixed the incorrect `@note O(log(N))` complexity annotation on `toArray()` (it is `O(N)`).
