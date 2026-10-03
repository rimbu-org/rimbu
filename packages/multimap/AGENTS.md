# @rimbu/multimap — Package Agent Guide

An immutable map where each key is associated with **one or more** values. A key maps to a
non-empty value `Set`, so a MultiMap never stores a key without at least one value.

The package is built on the **capability system** of `@rimbu/collection-types`: a
`MultiMap<K, V>` is a *keyed* collection whose element is a `readonly [K, V]` entry, extended
with a package-local `MultiMapCollection.Capability` suite for the value-set-aware
operations. There is no type-variant base and no `Types` HKT interface anymore.

> For workspace-wide conventions (biome rules, `build:seq` before typecheck/test, the
> Interface + Namespace pattern, capability families, `NonEmpty` tracking, `OptLazy`, and the
> changeset workflow) see the **root `AGENTS.md`**. This file covers only what is specific
> to `@rimbu/multimap`. The design decisions behind the current shape, with the full
> method-by-method table, are in `.scratch/multimap-migration-plan.md`.

## Source layout

```
src/
├── multimap.ts                 # exports["."]      — re-exports advanced + public
├── advanced/                   # exports["./advanced/*"] — extension API
│   └── multimap-base.ts        # MultiMapCollection.Capability.*, Advanced.{Api,BuilderApi,ContextApi,FamilyBase,Family}
├── public/                     # exports["./*"]
│   ├── multimap.ts             # @rimbu/multimap/multimap — MultiMap + NonEmpty/Builder/Context/Advanced + const
│   ├── hash-key/
│   │   ├── hash-value.ts       # @rimbu/multimap/hash-key/hash-value    — HashMultiMapHashValue
│   │   └── sorted-value.ts     # @rimbu/multimap/hash-key/sorted-value  — HashMultiMapSortedValue
│   └── sorted-key/
│       ├── hash-value.ts       # @rimbu/multimap/sorted-key/hash-value  — SortedMultiMapHashValue
│       └── sorted-value.ts     # @rimbu/multimap/sorted-key/sorted-value — SortedMultiMapSortedValue
└── internal/                   # NEVER exported; "#multimap/*" only
    ├── builder.ts              # MultiMapBuilder
    ├── context-factory.ts      # MultiMapContextImpl
    └── immutable/
        ├── empty.ts            # MultiMapEmpty
        └── non-empty.ts        # MultiMapNonEmpty
```

### Key rule: imports inside `src/`

- `@rimbu/multimap/advanced/*` for anything in `src/advanced/*`.
- `#multimap/*` for anything in `src/internal/*`.
- `@rimbu/multimap` (and sub-paths) for the public types.
- **Never** relative imports — banned by Biome.

## Architecture

### One collection type, four contexts

There is a **single** `MultiMap<K, V>` type. The former four variants
(`HashMultiMapHashValue` and friends) are no longer distinct types — they are
`MultiMap.Context` instances differing only in which map backs the keys and which set backs
the values:

| Export | Key map | Value set |
|---|---|---|
| `HashMultiMapHashValue` | `HashMap` | `HashSet` |
| `HashMultiMapSortedValue` | `HashMap` | `SortedSet` |
| `SortedMultiMapHashValue` | `SortedMap` | `HashSet` |
| `SortedMultiMapSortedValue` | `SortedMap` | `SortedSet` |

So `HashMultiMapHashValue.of([1, 'a'])` still works verbatim, but it *returns* a
`MultiMap<number, string>`. The collection type is no longer narrowed per variant, and
`keyMap` is always the generic `MapCollection<K, SetCollection.NonEmpty<V>>` — the loss of
the per-variant `keyMap` narrowing is deliberate (one type instead of four), and it is what
lets `@rimbu/bimultimap` typecheck again.

`MultiMap.typeTag` is therefore uniformly `'MultiMap'`: the tag describes the collection,
not the backing. The backing choice is no longer visible in `toString()`; the four names
remain as ergonomic defaults.

Any other combination is `MultiMap.createContext({ keyMapContext, keyMapValuesContext })`.

### Why a MultiMap is not a `MapCollection`

A MultiMap's value slot is a *set*, so the shared keyed capabilities that accept or return a
single `V` would lie about the shape of what is stored:

| Capability | Why not adopted |
|---|---|
| `WithGet` | `get(key): V \| undefined` — we need the whole value set |
| `MapCollection.Capability.WithSet` | `set(key, value: V)` would mean "replace the set with a singleton" |
| `MapCollection.Capability.WithUpdateAtKey` | updates one value; a MultiMap updates a set |
| `MapCollection.Capability.WithModifyAtKey` | its sentinel `ModifyOptions<T>` carries one value |
| `ValuedCollection.Capability.*` | `StreamSource<E>` operands and `has(element)` describe no MultiMap operation |

`KeyedCollection.Capability.WithRemoveKey` **is** adopted wholesale — see the slots below.

### Family / HKT

`MultiMapCollection.Advanced.Family<K, V>` (in `advanced/`) is the default family and the
one place the slots are pinned; `MultiMap.Advanced.Family<K, V>` (in `public/`) extends it
and narrows the four API slots (`_NORMAL`, `_NON_EMPTY`, `_BUILDER`, `_CONTEXT`,
`_KEYED_CONTEXT`) to the concrete `MultiMap` types.

Two pins are load-bearing:

- **`_UPPER_K`/`_UPPER_V` are pinned to `K`/`V`**, not widened to `any`. Methods that build
  new values in the *same* context — `mapValues`, `flatMapValues` — must constrain their
  result to a subtype of `V`, which is what keeps the "result is built by the same context"
  guarantee checkable. Widening would permit mapping to an unrelated value type, which the
  backing value set cannot represent.
- **`_INVARIANT: (e: readonly [K, V]) => readonly [K, V]`** — a MultiMap is invariant in
  `readonly [K, V]`, because `addTo`, `mapValues` and friends take
  `(value: V, key: K) => …` callbacks.

#### Only the *non-invariant* keyed capabilities are in the family `extends` clause

This is a constraint of the capability system, not a style choice. A capability that makes
its collection invariant declares `_INVARIANT: (e: readonly [K, V]) => readonly [K, V]`;
a covariant one does not declare it at all (it inherits `(e: any) => any`). Two bases in one
`extends` clause must agree on every shared property *identically*, so mixing the two kinds
is a `TS2320`. The family therefore lists only `WithStreamKeys`, `WithStreamValues`,
`WithHas`, `WithRemoveKey`, `WithRemoveKeys`, `WithMapValues` and `WithRecompose`.

The invariant capabilities — keyed `WithMap`, `WithMapIndexed`, `WithFlatMap`,
`WithFlatMapIndexed`, and the element-level `WithAddEach`/`WithToBuilder`/`WithMutate` —
are claimed through the `Api`/`BuilderApi` aggregates in `MultiMapCollection.Advanced`,
which is where the method surface they contribute is actually typed. `MultiMap.Advanced.Family`
still declares `_INVARIANT` explicitly so the invariance is visible where it is pinned.

### The two keyed remove slots

`MultiMap.Advanced.Family` overrides two slots added to
`KeyedCollection.Advanced.FamilyBase` in this change:

| Slot | MultiMap value | A `MapCollection` value |
|---|---|---|
| `_REMOVED_AT_KEY` | `SetCollection<V>` | `V \| undefined` |
| `_FOUND_AT_KEY` | `SetCollection<V>` | `V` |

`_REMOVED_AT_KEY` is what `Builder.removeKey` hands back; `_FOUND_AT_KEY` is what
`removeKeyAndReturn` reports as `result` when the key **was** present. Absence itself is
signalled by the separate "no result" arm of the `Op.DynamicResult`.

This is what lets a MultiMap adopt `KeyedCollection.Capability.WithRemoveKey` **instead of
shadowing it**, and it encodes the rule that **an empty value set plays the role `undefined`
plays for a map**: it means "this key was not present".

## Core API semantics (deliberate — do not "fix")

### Data model

- `keyMap: MapCollection<K, SetCollection.NonEmpty<V>>`. **Never store an empty value set**:
  a key whose value set empties is removed.
- `size` = number of **entries**; `keySize` = number of **distinct keys**. Both are kept,
  because `size` is what `Collection.Advanced.Api` means by "size" for an element-addressed
  collection, and `keySize` is the natural companion.
- Adding an existing `(key, value)` pair is a **no-op returning the same instance**;
  callers rely on `===`.
- `getValues(key)` returns the **empty** set for an absent key, never `undefined`.
- Value-producing methods (`mapValues`, `flatMapValues`, `modifyValuesAt`, `union`, …)
  build new value sets through `context.keyMapValuesContext`, because the value set has its
  own context and equality.
- `flatMapValues` **drops** a key whose values all map away, rather than storing an empty
  set.
- `size` is maintained incrementally (`newSize - oldSize` on every value-set mutation),
  never recomputed from scratch.

### `modifyValuesAt` options

Keeps its own `MultiMapCollection.Advanced.ModifyValuesOptions` — deliberately **not** the
shared `ModifyOptions<T>`, which carries a single value plus `skip`/`remove` sentinels,
whereas a MultiMap replaces a whole *set* of values.

**Returning an empty `StreamSource` from `create`/`update` removes the key.** That is the
preserved pre-refactor semantic, and it is why the sentinels of the shared shape would only
duplicate it.

### `setEachValue` reports *replacement*, not "the contents differ"

Writing the values a key already has still reports `true`. Only an absent key reports
`false`. This is long-standing behaviour, deliberately preserved: a refactor should not
silently change what a `boolean` return means.

### Set algebra

Operands are the abstract `MultiMapCollection.Collection<K, U>` (and `…CollectionNonEmpty`
for `union`), so any two MultiMaps interoperate, hashed or sorted. All four operate per key
on the value sets. `union` is the only one with a non-empty-preserving overload; the other
three return the normal type.

### Naming deviations from the shared vocabulary

`addTo` and `addEachValue`/`setEachValue` are singular-noun methods taking a
`StreamSource`; `addTo(key, value)` adds one value, `addEachValue(key, values)` adds each of
many, `setEachValue(key, values)` replaces. `count(key)` is *set cardinality* — it shares a
name with `MultiSet`'s `count(value)` (multiplicity) but is a different concept, and
renaming it to match would be the opposite of consistency.

## Deliberate shadows

Each is intentional and documented so `review-api` does not read as a defect:

1. **`addTo` vs `Collection.Capability.WithAdd.add(element)`.** The adoptable form is
   `add([k, v])`; a two-argument call is the overwhelmingly common case and a tuple
   allocation per call is a bad trade. `MultiMap.Advanced.Family` simply does not include
   `WithAdd`.
2. **The four algebra ops vs `ValuedCollection.Capability.*`.** Banned entirely; their
   `StreamSource<E>` operands describe no MultiMap operation.
3. **`removeEntry`/`removeEntries` stay local** while `addEach` is adopted. The asymmetry is
   forced by shape: `ValuedCollection.Capability.WithRemoveEach` takes
   `StreamSource<RelatedTo<readonly [K, V], UE>>`, which is *narrower* than multimap's
   `StreamSource<[RelatedTo<K, UK>, RelatedTo<V, UV>]>` — adopting it would lose the
   independent inference of the tuple's halves.
4. **`count`** — see above.

## Known deviations in `@rimbu/collection-types`

- `MultiMapContextImpl` implements `of`/`from` itself instead of extending
  `ContextBaseWithAddEach`, whose constraint requires the family to extend
  `Collection.Advanced.Family` — an `extends` clause that cannot also carry the capability
  families, because their `_BUILDER` slots are narrower and the two bases disagree
  (`TS2320`).
- `MultiMapContextImpl` also does **not** use a capability mixin for its immutable classes.
  `KeyedCollectionNonEmpty` requires `get` and `MapCollectionNonEmpty` requires
  `get`/`add(element)`/`modifyAtKey` — all single-value, all of which a MultiMap must not
  expose. So `MultiMapEmpty`/`MultiMapNonEmpty` compose only the `Collection` seeds and
  implement the rest directly.
- `Advanced.ContextApi` restates the inherited `merge*` members loosely, exactly as `BiMap`
  does: a MultiMap pins `_UPPER_E` to `readonly [K, V]`, so the `WithMerge` return types
  (which recurse through `_UPPER_V`) cannot be structurally satisfied. The members *are*
  implemented at runtime (as a union of the given sources); only the declared types are
  widened.

## Testing

| Directory | Purpose |
|---|---|
| `test/` | Runtime tests — `runMultiMapTestsWith(name, context)`, shared by all four contexts |
| `test-d/` | Type-level tests (`expectTypeOf`), one file |
| `test-random/` | Randomized differential tests against a `Map` model |

The runtime runner takes a `MultiMap.Context`, so it exercises all four contexts unchanged.
`test-d` asserts **invariance** (there is no covariant `Variant` tier to compare against
any more) and covers the renamed methods, the `NonEmpty` refinements, the builder's
value-set-returning `removeKey`, and the same-context constraint on `mapValues`.

The randomized cases check the O(1) size invariants on each of 1000 operations and re-verify
the whole collection every `CHECK_FULL_EVERY` operations, finishing each case with an explicit
`ent.checkFull()`. Verifying everything after every operation made the suite O(n²) and it
dominated the repo-wide `test:random` runtime (46.8 s and 1.15 GB for this package alone,
across its four contexts); scheduled verification brought it to 2.8 s and 254 MB with no loss of
coverage. Note that `test-random` was **broken before this refactor** (its shims called
`.defaultContext()` as a function, which is not one) — it now runs.

## Tooling

Always `bun run build:seq` (from the repo root) before `typecheck`/`test`.

| Command | Purpose |
|---|---|
| `bun run typecheck` | `tsc -p tsconfig.json --noEmit` (src + test + test-d) |
| `bun run test` | `bun test test/*` |
| `bun run test:random` | `bun test ./test-random` (requires a build) |
| `bun run build` | emit this package to `dist/` |
| `bun run biome:check` / `biome:fix` | lint + format `src` |

The `noExplicitAny` warnings from `MultiMap.Context<any, any>` in the four context entries
are the same pattern `bimap` and `bimultimap` use for a polymorphic context, and are
accepted.

## How to add a method

1. Decide where it belongs: an existing shared capability, or a new
   `MultiMapCollection.Capability.WithX` in `advanced/multimap-base.ts`.
2. Add the `Api` (and `BuilderApi` if the builder can do it) to that capability, and
   include it in `MultiMapCollection.Advanced.Api` / `.BuilderApi`.
3. If it is a **non-invariant keyed** capability, also add it to
   `MultiMapCollection.Advanced.Family`'s `extends` clause. If it is invariant, do **not** —
   see "Only the non-invariant keyed capabilities…".
4. Implement it in `internal/immutable/empty.ts` and `non-empty.ts`, and in `internal/builder.ts`
   if it belongs on the builder. `empty.ts` needs an entry for every collection method;
   `non-empty.ts` needs the `NonEmpty` overloads, with the **non-empty-preserving overload
   first** (see root `AGENTS.md` §1.1).
5. Preserve the data-model invariants above: never store an empty value set, keep `size`
   exact by diffing, return the same instance for a no-op, build value-producing results in
   the same context.
6. Add runtime coverage to `test/multimap-test-standard.ts` and type coverage to
   `test-d/multimap.test-d.ts`.
7. If a new capability is needed, add a row to the capability table in this file.

## Changesets

Renaming `add`/`addEntries`/`valuesAt`/`hasKey`/`transform`/`intersect`/`symDifference`/
`modifyAt`/`setValues`/`addValues`/`removeKeyAndGet`, replacing `filter`'s 3-parameter form
with `filterIndexed`, changing `forEach` to 1-parameter, switching the element type to
`readonly [K, V]`, removing `VariantMultiMap`, removing `@rimbu/multimap/variant`, and
turning the four variant *types* into contexts are **breaking** and require a `major` bump.
Because all Rimbu packages are lockstep-fixed, a single changeset listing
`@rimbu/multimap`, `@rimbu/bimultimap`, `@rimbu/core`, `@rimbu/collection-types` and
`@rimbu/stream` bumps them all.
