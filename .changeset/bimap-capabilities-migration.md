---
'@rimbu/bimap': major
'@rimbu/collection-types': major
'@rimbu/hashed': major
'@rimbu/sorted': major
'@rimbu/core': major
---

# Migrate `@rimbu/bimap` to the capability/HKT model

**Breaking:** `BiMap` is now a full `MapCollection` built from the capability mixins, with a
`BiMap`-specific `BiMapCollection.Capability` layer for the value direction and an
`advanced/` tier (`@rimbu/bimap/advanced/bimap-base`). Public subpaths `@rimbu/bimap/bimap`
and `@rimbu/bimap/advanced/bimap-base` are added.

### Naming

| before | after |
|---|---|
| `at(key)` | `get(key)` |
| `hasKey(key)` | `has(key)` |
| `atValue(value)` | `getKey(value)` |
| `addEntry` / `addEntries` | `add` / `addAll` |
| `setAndGet` / `addEntryAndGet` | `setAndReturn` / `addAndReturn` |
| `removeKeyAndGet` / `removeValueAndGet` | `removeKeyAndReturn` / `removeValueAndReturn` |
| `updateValueAtKey` / `updateValueAtKeyAndGet` | `updateAtKey` / `updateAtKeyAndReturn` |
| `updateKeyAtValue` / `updateKeyAtValueAndGet` | `updateAtValue` / `updateAtValueAndReturn` |
| `modifyAt` | `modifyAtKey` |
| builder `getValue` / `hasKey` | `get` / `has` |
| `toJSON` | removed |

`*AndGet`'s `WithValueResult` 3-tuple is replaced by `Op.DynamicResult`
(`{ collection, hasResult, result, hasChanged }`). `removeEntry`/`removeEntries` are
retained as BiMap-specific operations. This supersedes the `@rimbu/bimap` portion of the
`andget-with-value-result` changeset.

### New/inherited surface

- `invert(): BiMap<V, K>` (NonEmpty-refined), `mapValues`, `map`/`mapIndexed`,
  `flatMap`/`flatMapIndexed`, `recompose`, `mutate`, `filterIndexed`, `forEachIndexed`,
  `asNormal`, `clear`, `buildMapValues`.
- `filter`/`forEach` take only the element; indexed forms live on `filterIndexed`/
  `forEachIndexed`.
- `keyValueMap`/`valueKeyMap` are typed `MapCollection<K, V>` / `MapCollection<V, K>`.
- Delegate contexts are pluggable `MapCollection.Context`s (default `HashMap`), so mixed
  hash/sorted directions remain possible.

`mapValues` is refinement-only (`V2 extends V`, via `_UPPER_E: readonly [K, V]`) and, like
`add`/`set`, repairs collisions by last-iterated-wins displacement — it can therefore shrink
a `BiMap`.

### collection-types fixes

- `WithMapValues`/`buildMapValues` retyping bound is now the family slot
  `Tp['_UPPER_V']` instead of `V` (restores `HashMap` value widening).
- `WithFlatMap`/`WithFlatMapIndexed` now actually retype through their declared `K2`/`V2`.
