---
'@rimbu/collection-types': major
'@rimbu/bimap': major
'@rimbu/hashed': major
'@rimbu/list': major
'@rimbu/multiset': major
'@rimbu/ordered': major
'@rimbu/proximity': major
'@rimbu/sorted': major
'@rimbu/core': major
---

Rename the bulk-operation methods of the capability-based collections from `*All` to `*Each`, and give `MultiSet` a literal `removeAll`:

- `addAll` → `addEach` (`Collection.Capability.WithAddAll` → `WithAddEach`)
- `removeAll(values)` → `removeEach(values)` on valued collections
  (`ValuedCollection.Capability.WithRemoveAll` → `WithRemoveEach`)
- `mergeAll` / `mergeAllWith` → `mergeEach` / `mergeEachWith` on keyed contexts
- `prependAll` / `appendAll` → `prependEach` / `appendEach` on indexed builders
- `addAllWithCounts` → `addEachWithCounts` on `MultiSet`
  (`MultiSetCollection.Capability.WithAddAllWithCounts` → `WithAddEachWithCounts`)

`*All` read as "the whole collection" rather than "each element of this source", which is
what these methods actually do. `MultiSet` keeps the name `removeAll` for a new
single-value overload: `removeAll(value)` removes **all occurrences of that one value**
(setting its count to `0`), which is not expressible as `removeEach`. The former
`removeAll(values)` is now `removeEach(values)`.

The advanced helper `ContextBaseWithAddAll` is renamed `ContextBaseWithAddEach`, and
`defaultAddAll` / `defaultFlatMapByAddAll` become `defaultAddEach` /
`defaultFlatMapByAddEach`.
