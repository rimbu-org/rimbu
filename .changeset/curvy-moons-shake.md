---
'@rimbu/multimap': major
'@rimbu/bimultimap': major
'@rimbu/core': major
'@rimbu/collection-types': major
'@rimbu/stream': major
---

Migrate `@rimbu/multimap` to the capability/Family style used by `@rimbu/multiset` and
`@rimbu/bimap`.

`MultiMap<K, V>` is now a keyed collection whose element is a `readonly [K, V]` entry,
closed over its own `Advanced.Family` and built from `@rimbu/collection-types` capabilities
plus a package-local `MultiMapCollection.Capability` suite. The 1155-line hand-rolled
`internal/types.ts`, the `Types` HKT interface and the covariant `VariantMultiMap` tier are
gone.

**One collection type, four contexts.** `HashMultiMapHashValue`, `HashMultiMapSortedValue`,
`SortedMultiMapHashValue` and `SortedMultiMapSortedValue` are no longer distinct *types* —
they are `MultiMap.Context` instances that differ only in which map backs the keys and which
set backs the values. `HashMultiMapHashValue.of([1, 'a'])` still works and now returns
`MultiMap<number, string>`; any other combination is
`MultiMap.createContext({ keyMapContext, keyMapValuesContext })`. `keyMap` is therefore
always the generic `MapCollection<K, SetCollection.NonEmpty<V>>` rather than a per-variant
narrowing, and `MultiMap.typeTag` is uniformly `'MultiMap'`.

**Renamed methods** (big bang, no deprecated aliases):

| before | after |
|---|---|
| `add(key, value)` | `addTo(key, value)` |
| `addEntries(entries)` | `addEach(entries)` |
| `addValues(key, values)` | `addEachValue(key, values)` |
| `setValues(key, values)` | `setEachValue(key, values)` |
| `valuesAt(key)` | `getValues(key)` |
| `hasKey(key)` | `has(key)` |
| `transform(f)` | `recompose(f)` |
| `modifyAt(key, options)` | `modifyValuesAt(key, options)` |
| `intersect(other)` | `intersection(other)` |
| `symDifference(other)` | `symmetricDifference(other)` |
| `removeKeyAndGet(key)` | `removeKeyAndReturn(key)` |
| `forEach(f)` (3 params) | `forEachIndexed(f)` |
| `filter(f)` (3 params) | `filterIndexed(f)` |

`forEach` is now the shared 1-parameter form; `filterIndexed` has no `halt` (use `forEachIndexed`
if you need early exit). `removeKeyAndReturn` returns an `Op.DynamicResult`
(`{ collection, hasResult, result, hasChanged }`) instead of a tuple.

**`removeKey` on the builder now returns the removed value set**, where an **empty set** means
"this key was not present" — the MultiMap counterpart of the `undefined` a map returns. This
is what lets a MultiMap adopt `KeyedCollection.Capability.WithRemoveKey` unchanged.

**Gained** by adopting the shared capabilities: `map`, `mapIndexed`, `flatMap`,
`flatMapIndexed`, `mutate`, `filter` (1-parameter, with type-guard overloads), and
`merge`/`mergeEach`/`mergeWith`/`mergeEachWith` on the context. `Builder` also gains `clear`
and `buildMapValues`.

**Other breaking changes:** the element type is `readonly [K, V]` rather than `[K, V]`;
`@rimbu/multimap/variant` is removed; `toJSON` is removed from `MultiMap`; and a MultiMap is
now **invariant** in `readonly [K, V]` (it already was in practice — `mapValues` and
`flatMapValues` were never available on the covariant tier).

**`@rimbu/collection-types`:** two additive family slots, `_REMOVED_AT_KEY` and
`_FOUND_AT_KEY`, on `KeyedCollection.Advanced.FamilyBase` (pinned to `V | undefined` and `V`
in `KeyedCollection.Advanced.Family`, so every existing collection is unchanged). They let a
keyed collection whose key holds a *collection* of values adopt
`KeyedCollection.Capability.WithRemoveKey` with the right types. No existing signature
changed.

**`@rimbu/bimultimap`** is updated for the new multimap surface (including
`RSet` → `SetCollection` in its own type vocabulary), which also fixes a pre-existing
typecheck failure. Its own API is unchanged.

The full design record, including every deliberate shadow, is in
`packages/multimap/AGENTS.md`; the decision log and method table are in
`.scratch/multimap-migration-plan.md`.
