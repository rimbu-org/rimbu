# @rimbu/bimultimap — Package Agent Guide

An immutable **bidirectional** many-to-many map. A pair `(k, v)` can be looked up from either
side, and both directions are stored. The package is built on the **capability system** of
`@rimbu/collection-types`: a `BiMultiMap<K, V>` is a *keyed* collection whose element is a
`readonly [K, V]` entry, extended with a package-local `BiMultiMapCollection.Capability`
suite for the two-directional operations. There is no type-variant base and no `Types` HKT
interface.

> For workspace-wide conventions (biome rules, `build:seq` before typecheck/test, the
> Interface + Namespace pattern, capability families, `NonEmpty` tracking, `OptLazy`, and the
> changeset workflow) see the **root `AGENTS.md`**. This file covers only what is specific to
> `@rimbu/bimultimap`. The design decisions, with the full method-by-method table, are in
> `.scratch/bimultimap-migration-plan.md`.

## Source layout

```
src/
├── bimultimap.ts                  # exports["."]           — re-exports advanced + public
├── advanced/                      # exports["./advanced/*"]
│   └── bimultimap-base.ts         # BiMultiMapCollection.Capability.*, Advanced.{Api,BuilderApi,ContextApi,FamilyBase,Family}
├── public/                        # exports["./*"]
│   ├── bimultimap.ts              # @rimbu/bimultimap/bimultimap — BiMultiMap + NonEmpty/Builder/Context/Advanced + const
│   ├── hashed.ts                  # @rimbu/bimultimap/hashed  — HashBiMultiMap (context)
│   └── sorted.ts                  # @rimbu/bimultimap/sorted  — SortedBiMultiMap (context)
└── internal/                      # NEVER exported; "#bimultimap/*" only
    ├── builder.ts                 # BiMultiMapBuilder
    ├── context-factory.ts         # BiMultiMapContextImpl
    └── immutable/
        ├── empty.ts               # BiMultiMapEmpty
        └── non-empty.ts           # BiMultiMapNonEmpty
```

### Key rule: imports inside `src/`

- `@rimbu/bimultimap/advanced/*` for anything in `src/advanced/*`.
- `#bimultimap/*` for anything in `src/internal/*`.
- `@rimbu/bimultimap` (and sub-paths) for the public types.
- **Never** relative imports — banned by Biome.

`#bimultimap/immutable/*` is a separate alias mapping to `src/internal/immutable/*.ts`, declared
in **both** `tsconfig.common.json` (for `tsc`) and `package.json` `imports` (for Bun at
runtime). Adding a nested internal folder therefore needs **both** entries: the tsconfig path
alone typechecks but fails at runtime with `Cannot find module`, because Bun resolves `#`
specifiers through `package.json` `imports`, not through tsconfig paths.

## Architecture

### One collection type, two contexts

There is a **single** `BiMultiMap<K, V>` type. The former variants `HashBiMultiMap` and
`SortedBiMultiMap` are no longer distinct types — they are `BiMultiMap.Context` instances:

| Export | Forward map (`K`→values) | Reverse map (`V`→keys) |
|---|---|---|
| `HashBiMultiMap` | `HashMultiMapHashValue` | `HashMultiMapHashValue` |
| `SortedBiMultiMap` | `SortedMultiMapSortedValue` | `SortedMultiMapSortedValue` |

So `HashBiMultiMap.of([1, 'a'])` still works verbatim, but it *returns* a
`BiMultiMap<number, string>`. `BiMultiMap.typeTag` is therefore uniformly `'BiMultiMap'`: the
tag describes the collection, not the backing. Any other combination is
`BiMultiMap.createContext({ keyValueMultiMapContext, valueKeyMultiMapContext })`.

### The central invariant

The two backing maps are **exact inverses** of one another:

```text
for all k, v:  v ∈ keyValueMultiMap[k]  ⟺  k ∈ valueKeyMultiMap[v]
```

Every mutation must update both in lockstep. **Nothing may recompute the reverse map from the
forward one** — that would be O(n) per mutation, which is precisely what storing both exists to
avoid. `BiMultiMapContextImpl.createNonEmpty` therefore performs **no validation**: passing
non-inverse maps yields a collection that violates its own invariant, and `getKeys`,
`hasValue` and `invert` will report accordingly.

This is what the randomized differential tests assert after every single operation.

### Why a BiMultiMap is not a `MapCollection`

Both directions are *set*-valued, so the shared keyed capabilities that hand back or accept a
single `V` would lie about the stored shape:

| Capability | Why not adopted |
|---|---|
| `WithGet` | `get(key): V \| undefined` — we need the whole value set |
| `MapCollection.Capability.WithSet` | `set(key, value: V)` would mean "replace the set with a singleton" |
| `MapCollection.Capability.WithUpdateAtKey` | updates one value; we update a set |
| `MapCollection.Capability.WithModifyAtKey` | its sentinel `ModifyOptions<T>` carries one value |

Those four are re-declared locally as `WithSetEachValue`, `WithSetEachKey`,
`WithModifyValuesAt` and `WithModifyKeysAt`, operating against a value **set**.

`KeyedCollection.Capability.WithRemoveKey` **is** adopted wholesale — see the slots below.

### Family / HKT

`BiMultiMapCollection.Advanced.Family<K, V>` (in `advanced/`) is the default family and the
place the slots are pinned. `BiMultiMap.Advanced.Family<K, V>` (in `public/`) extends it and
narrows the API slots (`_NORMAL`, `_NON_EMPTY`, `_BUILDER`, `_CONTEXT`, `_KEYED_CONTEXT`) to
the concrete `BiMultiMap` types.

Three pins are load-bearing:

- **`_UPPER_E` is `readonly [K, V]`** and **`_UPPER_K`/`_UPPER_V` are pinned to `K`/`V`**, not
  widened to `any`. Methods that build new values in the *same* context — `mapValues` — must
  constrain their result to a subtype of `V`, which is what keeps the "same context" guarantee
  checkable.
- **`_INVARIANT: (e: readonly [K, V]) => readonly [K, V]`** — invariant because `addTo`,
  `mapValues` and friends take `(value: V, key: K) => …` callbacks.
- **`_REMOVED_AT_KEY` / `_FOUND_AT_KEY` are pinned to `SetCollection<V>`** (multimap pins them
  the same way; a plain map uses `V | undefined` and `V`). Absence is signalled by the separate
  "no result" arm of the `Op.DynamicResult`.

#### Only the *non-invariant* keyed capabilities are in the family `extends` clause

A capability that makes its collection invariant declares `_INVARIANT`; a covariant one does
not (it inherits `(e: any) => any`). Two bases in one `extends` clause must agree on every
shared property *identically*, so mixing the two kinds is a `TS2320`. The family therefore
lists only `WithStreamKeys`, `WithStreamValues`, `WithHas`, `WithRemoveKey`, `WithRemoveKeys`
and `WithRecompose`. The invariant ones — keyed `WithMap`, `WithMapIndexed`, `WithFlatMap`,
`WithFlatMapIndexed`, `WithMapValues`, and the element-level `WithAddEach`/`WithToBuilder`/
`WithMutate` — are claimed through the `Api`/`BuilderApi` aggregates instead.

Note `WithMapValues` is in the **aggregate** but **not** the family `extends` clause. Its
*family* interface binds `_BUILDER` to `WithMapValues.BuilderApi`, whose `buildMapValues`
returns a `MapCollection<K, V2>` — and a BiMultiMap context carries two `MultiMap` contexts,
not a `MapCollection`, so there is nothing to build one with. Dropping that one family base
(entry and all) is what lets the collection keep `mapValues`, which has no such problem: it
rebuilds a BiMultiMap.

**Consequence: `mapValues` exists on the collection but not on the builder.** A forced
Api/BuilderApi asymmetry, documented at the `BuilderApi` declaration.

## Core API semantics (deliberate — do not "fix")

### Data model

- `size` = number of **entries** (pairs); `keySize` = number of **distinct keys**. Note
  `keySize` must read `keyValueMultiMap.keySize`, **not** `.size` — for a `MultiMap`, `.size`
  counts pairs. Getting this wrong is easy and the test suite catches it (`mapDouble` has 4
  pairs and 2 keys).
- Adding an existing `(key, value)` pair is a **no-op returning the same instance**; callers
  rely on `===`.
- `getValues(key)` returns the **empty** set for an absent key, never `undefined`.
- An **empty value set removes the key**. Storing one would leave the forward and reverse maps
  disagreeing about which keys exist.
- `invert()` needs no rebuild: since the maps are exact inverses, `valueKeyMultiMap` *is*
  already a valid `K → V` multimap for the inverted collection.

### `modifyValuesAt` / `modifyKeysAt` options

They keep their own `BiMultiMapCollection.Advanced.ModifySetOptions<T, TS>` — deliberately
**not** the shared `ModifyOptions<T>`, which carries a single value plus `skip`/`remove`
sentinels, whereas these replace a whole *set*.

**Returning an empty `StreamSource` from `create`/`update` removes the key** (respectively the
value). That is the preserved pre-refactor semantic, and it is why the shared shape's sentinels
would only duplicate it. `ifExists` fires only when the key is present, so its `update`
callback receives a `SetCollection.NonEmpty<T>`; `ifNew` runs first, and `ifExists` then sees
whatever `ifNew` just created.

### `setEachValue` / `setEachKey` may empty the collection

Neither assumes the result is non-empty. Writing an empty set to the only key removes the key
and yields the empty collection — this was defect **B4**, where both methods threw.

### `filterIndexed` has no `halt`

The shared `Collection` capability declares `filterIndexed` as `(element, index) => boolean`.
Do **not** shadow it with a local `halt`-taking capability: the shared base class already
declares the 2-parameter form, so shadowing is a `TS2320` in both directions. To stop early,
return `false` past the wanted prefix.

### Builder removals return sets

`Builder.removeKey` returns `SetCollection<V>` and `Builder.removeValue` returns
`SetCollection<K>`. **An empty set means "not present"** — the MultiMap counterpart of the
`undefined` a map returns. Since the return is now a set rather than a boolean,
`Builder.removeKeys`/`removeValues` cannot use `filterPure({ pred })`; they count non-empty
results instead.

## Naming deviations from the shared vocabulary

`getValues`/`getKeys` (not bimap's `get`/`getKey`): the return is a **set**, not a single
value, and the plural says so. `addTo(key, value)` adds one pair;
`addEach(entries)` adds each of many; `setEachValue(key, values)` replaces a key's whole value
set; `setEachKey(value, keys)` is its reverse-direction twin.

The backing property names `keyValueMultiMap` / `valueKeyMultiMap` are kept rather than
switched to bimap's `keyMap` / `valueKeyMap`, because here both are MultiMaps of the *same*
pair shape and the directional names are what keep the invariant legible.

## Deliberate shadows

Each is intentional and documented so `review-api` does not read as a defect:

1. **`addTo` vs `Collection.Capability.WithAdd.add(element)`.** The adoptable form is
   `add([k, v])`; a two-argument call is the overwhelmingly common case and a tuple allocation
   per call is a bad trade. The family simply does not include `WithAdd`.
2. **`removeEntry`/`removeEntries` stay local** while `addEach` is adopted. Forced by shape:
   `ValuedCollection.Capability.WithRemoveEach` takes
   `StreamSource<RelatedTo<readonly [K, V], UE>>`, which is *narrower* than
   `StreamSource<[RelatedTo<K, UK>, RelatedTo<V, UV>]>` — adopting it would lose the
   independent inference of the tuple's halves.
3. **`mapValues` on the collection but not the builder** — see the family note above.

## Known deviations in `@rimbu/collection-types`

- `WithRemoveKeys.BuilderApi`'s collector overload
  (`removeKeys(keys, collector): R`) was **removed**. It was declared in the shared capability
  but implemented by none of the seven packages that inherit it, so it was dead surface.
- `BiMultiMapContextImpl` implements `of`/`from`/`builder`/`empty` itself instead of extending
  `ContextBaseWithAddEach`, for the `TS2320` reason given in multimap's guide.
- `BiMultiMapEmpty`/`BiMultiMapNonEmpty` compose only the `Collection` seeds and implement the
  rest directly: `KeyedCollectionNonEmpty` requires `get` and `MapCollectionNonEmpty` requires
  `get`/`add(element)`/`modifyAtKey` — all single-value, all of which a BiMultiMap must not
  expose.
- `NonEmpty.assumeNonEmpty(): this` is inherited but the base cannot prove bimultimap's entry
  shape, so the class narrows it at the boundary.

## Testing

| Directory | Purpose |
|---|---|
| `test/` | Runtime tests — `runWith(name, context)`, run for both contexts |
| `test-d/` | Type-level tests (`expectTypeOf`), one file |
| `test-random/` | Randomized differential tests against an independent `Model`, plus bidirectional-invariant checks |

The randomized harness is the important one. `Model` is a plain `Map`-backed reference
implementation and `Entangled` mirrors the collection; each run applies a thousand operations
and re-verifies the **whole collection** afterwards, including the inverse invariant, so the
cases are O(n²) by construction and carry an explicit timeout. Regression cases for the four
fixed defects are named `B1`–`B4`.

## Tooling

Always `bun run build:seq` (from the repo root) before `typecheck`/`test`.

| Command | Purpose |
|---|---|
| `bun run typecheck` | `tsc -p tsconfig.json --noEmit` (src + test + test-d + test-random) |
| `bun run test` | `bun test test/*` |
| `bun run test:random` | `bun test ./test-random` — **note the `./`** |
| `bun run build` | emit this package to `dist/` |
| `bun run biome:check` / `biome:fix` | lint + format `src` |

`test-random` needs a **build** first — it imports through `dist`.

### Do not run `bun test test-random` without the `./`

Without a leading `./`, `test-random` is a **filter**, not a path: Bun then matches that
substring against test files in the whole repository. From `packages/bimultimap` that is
harmless, but from the repo root it pulls in **18 files across 8 packages** (bimap, bimultimap,
hashed, multimap, multiset, proximity, sorted, table). Those suites are each O(n²) by
construction — a thousand operations, re-verifying the whole collection after each — so the run
takes minutes and looks exactly like a hang. Use `./test-random` (which the `test:random`
script does) or pass explicit files.

The `noExplicitAny` warnings from `BiMultiMap.Context<any, any>` in the two context entries
are the same pattern `bimap` and `multimap` use for a polymorphic context, and are accepted.

## How to add a method

1. Decide where it belongs: an existing shared capability, or a new
   `BiMultiMapCollection.Capability.WithX` in `advanced/bimultimap-base.ts`.
2. Add the `Api` (and `BuilderApi` if the builder can do it) to that capability, and include it
   in `BiMultiMapCollection.Advanced.Api` / `.BuilderApi`.
3. If it is a **non-invariant keyed** capability, also add it to
   `BiMultiMapCollection.Advanced.Family`'s `extends` clause. If it is invariant, do **not** —
   see "Only the non-invariant keyed capabilities…".
4. **If the capability needs `_BUILDER`, check a BiMultiMap context can actually build the
   result.** `buildMapValues` is the cautionary example.
5. Implement it in `internal/immutable/empty.ts` and `non-empty.ts`, and in
   `internal/builder.ts` if it belongs on the builder. `empty.ts` needs an entry for every
   collection method; `non-empty.ts` needs the `NonEmpty` overloads, with the
   **non-empty-preserving overload first** (root `AGENTS.md` §1.1).
6. Preserve the data-model invariants above: keep both directions in lockstep, never rebuild
   the reverse map, never store an empty value set, return the same instance for a no-op, and
   never assume a mutation leaves the collection non-empty.
7. Add runtime coverage to `test/bimultimap.test.ts` and type coverage to
   `test-d/bimultimap.test-d.ts`. For anything touching both directions, add a randomized
   differential case.
8. If a new capability is needed, add a row to the capability list in this file.

## Changesets

Renaming `hasKey`/`add`/`addEntries`/`setValues`/`setKeys`/`valuesAt`/`keysAt`, splitting the
3-parameter `forEach`/`filter` into `forEachIndexed`/`filterIndexed`, changing
`Builder.removeKey`/`removeValue` to return removed sets, removing `toJSON` and the per-variant
`defaultContext<UK, UV>()` factory, switching the element type to `readonly [K, V]`, and
turning the two variant *types* into contexts are all **breaking** and require a `major` bump.
Because all Rimbu packages are lockstep-fixed, the existing changeset listing
`@rimbu/bimultimap` bumps everything.
