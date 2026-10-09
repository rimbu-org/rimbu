# Plan: Migrate `@rimbu/multimap` to the capability/Family style

**Goal:** bring `packages/multimap` to the same style as `packages/multiset` and
`packages/bimap` — one `MultiMap<K, V>` type closed over its own `Advanced.Family`,
built on `@rimbu/collection-types` capabilities, plus a package-local
`MultiMapCollection.Capability` suite in an `advanced/` tier, with internals
implemented through the composed mixin bases.

**Reference (already migrated):** `packages/multiset/src/{advanced,public,internal}`
and `packages/bimap/src/{advanced,public,internal}`.

**Scope:** `@rimbu/multimap` plus mechanical fixes in `@rimbu/bimultimap` (which
imports `MultiMap` and two variant names at 9 sites). `bimultimap`'s own capability
migration is deferred. `graph` and `table` are independent legacy packages — out of
scope (they import nothing from multimap).

**Hard switch:** no deprecated aliases, no legacy `RMap`/`RSet`/`WithKeyValue`/
`VariantMultiMap` surface. Breaking change (`major` changeset).

---

## 1. Settled decisions

| # | Decision |
|---|---|
| Q1 | multimap + mechanical bimultimap, one change. |
| Q2 | Big-bang. Methods match their capability's signature **exactly**; no phase split, no legacy shims. |
| Q3/Q10/Q21 | **Model A** — root is `KeyedCollection.Advanced.FamilyBase<K, V>`; `V` is a *value*, the value set is an implementation detail. |
| Q4 | `modifyAt` → `modifyValuesAt`, keeps the `StreamSource`-payload options. **An empty `StreamSource` from `create`/`update` removes the key.** |
| Q5/Q19 | One `MultiMap<K, V>` type. The four names survive as exported `MultiMap.Context` constants. `typeTag` becomes uniformly `'MultiMap'`. |
| Q6 | `forEach`→`forEachIndexed`, `filter`→`filterIndexed` (forced: the names are occupied by the inherited API). |
| Q7 | Delete `VariantMultiMap` + `src/public/variant.ts`. |
| Q8 | Keep `keySize` as-is, paired against `size`. |
| Q9 | ~16 local capabilities, one per method group (multiset granularity). |
| Q11/Q20 | collection-types is read-only **except one additive slot**: `_REMOVED_AT_KEY`. |
| Q12/Q15/Q24 | `add` → `addTo(key, value)` via a local `WithAddTo` (no collection-types change). |
| Q13 | bimultimap's own migration deferred; it must stay compiling and green. |
| Q14 | Additive-then-swap commits; tree green throughout. |
| Q16/Q20 | Builder `removeKey` returns `SetCollection<V>`; **empty set = "was not present"**. |
| Q17 | Adopt `WithAddEach` as `addEach`; keep `removeEntry`/`removeEntries` local (their tuple-permissiveness does not survive `RelatedTo<readonly [K,V], …>`). |
| Q18 | Adopt the nine additive capabilities multimap lacks today. |
| Q22 | Four separate algebra capabilities + a shared operand helper type. |
| Q23 | `hasKey`→`has`, `valuesAt`→`getValues`, `modifyAt`→`modifyValuesAt`; `count` keeps its name. |
| Q24 | `addValues`→`addEachValue`, `setValues`→`setEachValue`; `flatMapValues` unchanged. |
| Q25 | `keyMap` stays public, generic as `MapCollection<K, SetCollection<V>>`. |

---

## 2. Method table

`E` = `readonly [K, V]`. **Free** = inherited from a capability the family adopts.

### 2.1 `MultiMap<K, V>` (collection)

| today | after | source |
|---|---|---|
| `isEmpty` | `isEmpty` | free `Collection.Advanced.Api` (`_isEmpty`) |
| `size` | `size` | free (entry count) |
| `context` | `context` | free |
| `assumeNonEmpty` / `nonEmpty` | same | free |
| — | `asNormal` | free (**new**) |
| `stream()` | `stream()` | free; element becomes `readonly [K, V]` |
| `toArray()` | `toArray()` | free |
| `forEach(e, i, halt)` | `forEachIndexed` | free (**rename**) |
| `filter(e, i, halt)` | `filterIndexed` | free (**rename**) |
| — | `filter` | free `WithFilter` (**new**, Q18) |
| `[Symbol.iterator]` | same | free `FastIterable<readonly [K, V]>` |
| `streamKeys()` | `streamKeys` | `WithStreamKeys` |
| `streamValues()` | `streamValues` | `WithStreamValues` |
| `hasKey(key)` | `has(key)` | `WithHas` (**rename**) |
| `hasEntry(k, v)` | `hasEntry` | local `WithHasEntry` |
| `valuesAt(key)` | `getValues(key)` | local `WithGetValues` (**rename**) |
| `removeKey(key)` | `removeKey` | `WithRemoveKey` |
| `removeKeyAndGet(key)` | `removeKeyAndReturn` | `WithRemoveKey` (**rename**; found type → `SetCollection<V>`; gains `OptLazy` overload) |
| `removeKeys(keys)` | `removeKeys` | `WithRemoveKeys` (gains builder `collector` overload) |
| `removeEntry(k, v)` | `removeEntry` | local `WithRemoveEntry` |
| `removeEntries(entries)` | `removeEntries` | local `WithRemoveEntries` |
| `add(k, v)` | `addTo(k, v)` | local `WithAddTo` (**rename**, shadows `WithAdd.add(element)`) |
| `addEntries(entries)` | `addEach(entries)` | `WithAddEach` (**rename**) |
| `addValues(k, values)` | `addEachValue` | local (**rename**) |
| `setValues(k, values)` | `setEachValue` | local (**rename**) |
| `mapValues(f)` | `mapValues(f)` | `WithMapValues` (gains builder `buildMapValues`) |
| `flatMapValues(f)` | `flatMapValues` | local `WithFlatMapValues` |
| `flatMap(e, i, halt)` | `flatMapIndexed` | `WithFlatMapIndexed` (**rename**; loses `halt`) |
| `transform(f)` | `recompose(f)` | keyed `WithRecompose` (**rename**) |
| `modifyAt(k, o)` | `modifyValuesAt(k, o)` | local `WithModifyValuesAt` (**rename**) |
| `union(other)` | `union` | local `WithUnion` |
| `intersect(other)` | `intersection` | local `WithIntersection` (**rename**) |
| `difference(other)` | `difference` | local `WithDifference` |
| `symDifference(other)` | `symmetricDifference` | local `WithSymmetricDifference` (**rename**) |
| `toBuilder()` | `toBuilder()` | `WithToBuilder` |
| `count(key)` | `count(key)` | local `WithCount` |
| `keySize` | `keySize` | local `WithKeySize` |
| `keyMap` | `keyMap` | local `WithKeyMap` (generic; Q25) |
| `toString()` | `toString()` | declared on `Advanced.Api` (concrete impl) |
| `toJSON()` | — | **dropped** (bimap precedent Q16) |
| — | `map`, `mapIndexed`, `flatMap`, `mutate` | keyed `WithMap`/`WithMapIndexed`/`WithFlatMap`, `WithMutate` (**new**, Q18) |

### 2.2 `MultiMap.Context<UK, UV>`

| today | after | source |
|---|---|---|
| `typeTag` | `typeTag: 'MultiMap'` | `Advanced.ContextApi` |
| `defaultContext` | same | free `Collection.Advanced.ContextApi` |
| `empty` / `of` / `from` / `builder` | same | free |
| `reducer(source?)` | same | keyed `WithReducer` |
| `keyMapContext` | same | `Advanced.ContextApi` |
| `keyMapValuesContext` | same | `Advanced.ContextApi` |
| `createContext(o)` | same | `Advanced.KeyedContextApi` |
| — | `merge`, `mergeEach`, `mergeWith`, `mergeEachWith` | keyed `WithMerge` (**new**, Q18) |

### 2.3 `MultiMap.Builder<K, V>`

Free from `Collection.Advanced.BuilderApi`: `context`, `isEmpty`, `size`, `forEach`
(1-param), **`forEachIndexed`** (rename from today's 3-param `forEach`), `clear`
(**new**), `build`.

| today | after | source |
|---|---|---|
| `add(k, v)` | `addTo` | `WithAddTo.BuilderApi` |
| `addEntries` | `addEach` | `WithAddEach.BuilderApi` |
| `addValues` / `setValues` | `addEachValue` / `setEachValue` | local |
| `valuesAt` | `getValues` | `WithGetValues.BuilderApi` |
| `hasKey` | `has` | `WithHas.BuilderApi` |
| `hasEntry` | `hasEntry` | local |
| `count(key)` | `count` | local |
| `removeKey(k)` | `removeKey(k): SetCollection<V>` | `WithRemoveKey.BuilderApi` via `_REMOVED_AT_KEY` (empty = absent) |
| `removeKeys` | `removeKey` + `collector` overload | `WithRemoveKeys.BuilderApi` |
| `removeEntry` / `removeEntries` | same | local |
| `mapValues` | `buildMapValues` | `WithMapValues.BuilderApi` (**new**) |

### 2.4 Deliberate shadows (documented in `multimap/AGENTS.md`)

1. `addTo` vs `Collection.Capability.WithAdd.add(element)`.
2. The four algebra ops vs `ValuedCollection.Capability.*` — **`ValuedCollection`
   capabilities are banned entirely** (Q17); their `StreamSource<E>` operands and
   `has(element)` do not describe multimap operations.
3. `removeEntry`/`removeEntries` local while `addEach` is adopted — asymmetry forced
   by `RelatedTo<readonly [K, V], UE>` narrowing the accepted tuple type.
4. `count(key)` (set cardinality) shares a name with `multiset`'s `count(value)`
   (multiplicity). Deliberate: different concepts, and renaming to match would be
   the opposite of consistency.

---

## 3. `collection-types` change (the only one)

Add `_REMOVED_AT_KEY` to `KeyedCollection.Advanced.FamilyBase<K, V>` (`unknown`),
pin it to `V | undefined` in `KeyedCollection.Advanced.Family`, and substitute it at
the two sites in `WithRemoveKey` where the *stored* type appears:
`BuilderApi.removeKey`'s return and `Api.removeKeyAndReturn`'s found position.

Default is exactly today's type, so `HashMap`/`SortedMap`/`OrderedMap`/`ProximityMap`
are byte-identical. multimap's family sets it to `SetCollection<V>`, which is what
lets multimap adopt `WithRemoveKey` wholesale instead of shadowing it.

---

## 4. Data model invariants (from the pre-refactor AGENTS.md — do not break)

- `keyMap: MapCollection<K, SetCollection.NonEmpty<V>>`. **Never store an empty value
  set**: a key whose value set empties is removed.
- `size` = entry count; `keySize` = distinct key count. `size` is adjusted by
  `newSize - oldSize` on every value-set mutation — never recomputed from scratch.
- Adding an existing `(key, value)` pair is a **no-op returning the same instance**;
  callers rely on `===`.
- `getValues` returns the **empty** set for an absent key, never `undefined`.
- `mapValues`/`flatMapValues`/`modifyValuesAt`/`union`/… build new value sets through
  `context.keyMapValuesContext` (same context ⇒ `V2 extends V`).
- Builder mutation during iteration throws `RimbuError.ModifiedBuilderWhileLoopingOverItError`.
