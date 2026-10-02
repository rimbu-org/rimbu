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

**`@rimbu/bimultimap`** gets the same treatment: one `BiMultiMap<K, V>` type plus two
contexts (`HashBiMultiMap`, `SortedBiMultiMap`), its own
`BiMultiMapCollection.Capability` suite in `advanced/`, and the `internal/immutable/`
empty/non-empty split. `typeTag` is uniformly `'BiMultiMap'`.

**BiMultiMap renames** (big bang, no aliases):

| before | after |
|---|---|
| `hasKey(key)` | `has(key)` |
| `add(key, value)` | `addTo(key, value)` |
| `addEntries(entries)` | `addEach(entries)` |
| `setValues(key, values)` | `setEachValue(key, values)` |
| `setKeys(value, keys)` | `setEachKey(value, keys)` |
| `valuesAt(key)` | `getValues(key)` |
| `keysAt(value)` | `getKeys(value)` |
| `forEach(f)` (3 params) | `forEachIndexed(f)` |
| `filter(f)` (3 params) | `filterIndexed(f)` |

**`BiMultiMap.Builder.removeKey` / `removeValue` now return the removed set**
(`SetCollection<V>` / `SetCollection<K>`), where an empty set means "not present" — the same
convention multimap adopted. **Gained:** `modifyValuesAt`, `modifyKeysAt`, `invert`, and —
by adopting the shared keyed capabilities — `map`, `mapIndexed`, `flatMap`,
`flatMapIndexed`, `mutate` and a 1-parameter `filter` with type-guard overloads. **Removed:**
`toJSON`, and the per-variant `defaultContext<UK, UV>()` factory (the context still exposes
the inherited `defaultContext` self-reference). `HashBiMultiMap` and `SortedBiMultiMap` are
contexts, not types.

**Four defects fixed** in the process (all pre-existing, all with test coverage):

- `removeValue` returned the stale reverse map rather than the pruned one.
- `hasEntry(k, v)` reported `true` for any pair whose key *and* value were both present — a
  cross-product check, not a membership check.
- `Builder.forEach` leaked its reentrancy lock when the callback threw.
- `setValues` / `setKeys` threw instead of returning an empty collection when the new value
  set emptied the map.

The full design record, including every deliberate shadow, is in
`packages/multimap/AGENTS.md` and `packages/bimultimap/AGENTS.md`; the decision logs are in
`.scratch/multimap-migration-plan.md` and `.scratch/bimultimap-migration-plan.md`.
