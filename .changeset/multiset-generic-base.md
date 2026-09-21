---
'@rimbu/multiset': minor
'@rimbu/core': minor
---

# Add a generic, map-kind-parameterised `MultiSetBase`

`MultiSet` is now generic over the count-map family it is backed by:
`MultiSetBase<T, F extends MapCollection.Advanced.Family<T, number>>`. The default
`MultiSet<T>` is `MultiSetBase<T, MapCollection.Advanced.Family<T, number>>`, and the named
variants are thin aliases (`HashMultiSet` → `HashMap.Advanced.Family`, `SortedMultiSet` →
`SortedMap.Advanced.Family`). This makes it possible to define a concretely typed MultiSet
over any map with a one-line alias:

```ts
type MyMultiSet<T> = MultiSetBase<T, MyMap.Advanced.Family<T, number>>;
```

### Changed

- `countMap` / `countMapContext` are now concretely typed for a chosen family
  (`HashMap<T, number>` on `HashMultiSet`, `SortedMap<T, number>` on `SortedMultiSet`),
  and the kind is preserved through `map`/`flatMap`/`filter` via the family's `_NEW_FAMILY`.
  The default `MultiSet<T>` keeps exposing the generic `MapCollection<T, number>`.
- `MultiSet.Advanced.Family` takes an optional second parameter, the count-map family;
  `HashMultiSet.Advanced.Family<T>` / `SortedMultiSet.Advanced.Family<T>` are aliases that
  pin it.
- `MultiSetCollection.Advanced.{FamilyBase,Api,BuilderApi,ContextApi}` are parameterised
  by the count-map family (`FamilyBase<T, F>`); the family carries
  `_COUNT_MAP_FAMILY` / `_COUNT_MAP` / `_COUNT_MAP_NON_EMPTY` / `_COUNT_MAP_CONTEXT`.
  `MultiSetCollection.Advanced.CountMapType` is unchanged.

### Added

- `MultiSetBase<T, F>` plus its `NonEmpty` / `Builder` / `Context` namespaces.
- `MultiSetCollection.Advanced.CountMapFamily`, `AnyFamily`, `CountMapFrom`,
  `CountMapNonEmptyFrom`, and `CountMapContextFrom` helpers.
