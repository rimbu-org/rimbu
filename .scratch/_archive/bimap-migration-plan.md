# Plan: Migrate `@rimbu/bimap` to the capability/HKT style

**Goal:** bring `packages/bimap` to the same style as `packages/hashed`/`packages/sorted` —
a thin public `Family` façade over `@rimbu/collection-types` capability mixins, with a
`BiMap`-specific capability layer (`BiMapCollection`) defined inside the `bimap` package, an
`advanced/` extension tier, and internals implemented through the composed mixin bases.

**Reference (already migrated):** `packages/hashed/src/public/map.ts` +
`packages/hashed/src/internal/map/{context.ts,immutable/*,mutable/*}`.

**Scope:** `@rimbu/bimap` only. `bimultimap`, `multimap`, `multiset`, `table`, `graph` are
explicitly out of scope (separate decompositions of ticket
`.scratch/collection-capabilities/issues/06-migrate-specialized-generic-consumers.md`).

**Hard switch:** no deprecated aliases, no legacy `RMapBase`/`RMap`/`WithValueResult`
surface. Breaking change (`major` changeset).

---

## 1. Baseline and verification gate

The reference target is mid-migration. Measured on branch `feature/capability-use-mixins`
(commit `2137c9ce3`, 2026-09):

| Check | State |
|---|---|
| `collection-types/src` under `tsconfig.esm.json` | clean |
| `hashed/src` under `tsconfig.esm.json` | clean |
| `hashed` `test-d`/`test-random` | **red / stale** (`at`, `addEntry(s)`, `removeKeyAndGet`, `modifyAt`, `updateAt`, `defaultContext`) |
| `sorted/src` | mid-rewrite (see `.scratch/sorted-migration-plan.md`) |

**Gate for this work (decision Q2):** freeze the public/mixin contract as it exists in
`collection-types/src` + `hashed`/`sorted/src` today, and require:

- `bunx tsc -p packages/bimap/tsconfig.esm.json` clean;
- `bunx tsc -p packages/bimap/tsconfig.json` clean (src + test + test-d + test-random);
- `bun test test/*` green for `bimap`.

Repo-wide `typecheck:seq` remaining red (hashed/sorted tests) is pre-existing and out of
scope; record it in the changeset/PR notes.

---

## 2. Settled decisions

| # | Decision |
|---|---|
| Q1 | Only `@rimbu/bimap`. |
| Q2 | Freeze the current `collection-types`/`hashed`/`sorted` `src` contract; gate on bimap build + tests. |
| Q3 | BiMap is a **full `MapCollection`**; all transforms (`mapValues`/`map`/`mapIndexed`/`flatMap`/`flatMapIndexed`/`recompose`) are claimed and implemented via the builder. |
| Q4 | The bidirectional capability family (`BiMapCollection`) lives **inside the `bimap` package**, not `collection-types`. |
| Q5 | Key→value uses Keyed/Map names (`get`, `has`); value→key uses `getKey`, `hasValue`. |
| Q6 | Introduce `invert()`. |
| Q7 | Single generic `BiMap` with pluggable `keyValueContext`/`valueKeyContext` (mixed directions allowed). |
| Q8 | Expose an `advanced/` tier. |
| Q9 | Keep `keyValueMap`/`valueKeyMap` read-only views. |
| Q13 | Retyping bounds use the family slots: `V2 extends Tp['_UPPER_V']`, `K2 extends Tp['_UPPER_K']`. For BiMap this means refinement only (see Q25); it fixes `HashMap` (whose `_UPPER_V` is `any`). |
| Q14 | Group the bidirectional operations into a few capability families under `BiMapCollection.Capability`. |
| Q15 | Adopt `Op.DynamicResult` + `*AndReturn` on both directions; keep `removeEntry`. |
| Q16 | Drop `toJSON` and the `WithValueResult` re-export; keep concrete `toString`. |
| Q17 | Builder mirrors the immutable value-direction names. |
| Q18 | Keep `keyValueContext`/`valueKeyContext`/`typeTag`; add `isValidValue` and `_VALUE_KEYED_CONTEXT`. |
| Q19 | Collision/duplicate resolution = rebuild through the builder → **last-iterated entry wins** (the displacement `add`/`set` already use). |
| Q20 | Family upper bounds: instance `_UPPER_E: readonly [K, V]`; context family `_UPPER_E: readonly [UK, UV]`. |
| Q21 | Capability grouping as in §5; add `removeEntries(entries)`; rename `updateKeyAtValue` → `updateAtValue` (and `AndReturn`). |
| Q22 | `advanced/` exposes `BiMapBase`, the `BiMapCollection` capability namespace, and the composed abstract bases (may evolve later). |
| Q23 | Layout/packaging as in §7–§8; changeset = major. |
| Q24 | Port tests, add `test-random/`, update docs, write this plan at `.scratch/bimap-migration-plan.md`. |
| Q25 | Instance `_UPPER_E: readonly [K, V]` — `mapValues` is a refinement map; no extra family parameters. |
| Q26 | Delegate contexts typed as `MapCollection.Context<MapCollection.Advanced.Family<UK, any>>` (key) / `...<UV, any>` (value). **Verified**: `HashMap.Context<number>` is assignable to it, with tuple-element construction (`empty<readonly [K,V]>()`, `builder<readonly [K,V]>()`) and `isValidKey`. |

---

## 3. Target architecture

`BiMap` is a `MapCollection` (element `readonly [K, V]`, keyed by `K`) with a **second index
keyed by `V`** implemented by a parallel inverse map.

### 3.1 Family shape

```ts
export namespace BiMap {
  export namespace Advanced {
    export interface Family<K, V>
      extends MapCollection.Advanced.Family<K, V>,
        // value-direction capability families (see §5)
        BiMapCollection.Capability.WithGetKey<K, V>,
        BiMapCollection.Capability.WithHasValue<K, V>,
        BiMapCollection.Capability.WithRemoveValue<K, V>,
        BiMapCollection.Capability.WithRemoveEntries<K, V>,
        BiMapCollection.Capability.WithUpdateAtValue<K, V>,
        BiMapCollection.Capability.WithModifyAtValue<K, V>,
        BiMapCollection.Capability.WithInvert<K, V>,
        BiMapCollection.Capability.WithKeyValueMap<K, V>,
        BiMapCollection.Capability.WithValueKeyMap<K, V>,
        BiMapCollection.Capability.WithAndReturn<K, V>
    {
      _NORMAL: Api<K, V, this['_TYPES']>;
      _NON_EMPTY: Api<K, V, this['_TYPES_NON_EMPTY']>;
      _BUILDER: BuilderApi<K, V, this['_TYPES']>;
      _CONTEXT: ContextApi<K, V, this['_FAM']>;
      _KEYED_CONTEXT: KeyedContextApi<K, V, this['_FAM']>;

      _UPPER_E: readonly [K, V];
      _VALUE_KEYED_CONTEXT: unknown;            // inverse keyed context (V keyed)

      _FAM: Family<K, V>;
      _NEW_FAMILY: Family<this['_NEW_K'], this['_NEW_V']>;
    }

    export interface Api<K, V, Tp extends Collection.Advanced.Types<FamilyBase<K, V>, readonly [K, V]>>
      extends MapCollection.Advanced.Api<K, V, Tp>,
        /* + all value-direction capability Apis from §5 */ {}

    export type DefaultFactory = KeyedContextApi<any, any, Family<any, any>>;
  }
}
```

The public type fills the `Tp` slot exactly as `HashMap` does:

```ts
export interface BiMap<K, V>
  extends BiMap.Advanced.Api<
    K, V,
    Collection.Advanced.Types<BiMap.Advanced.Family<K, V>, readonly [K, V]>
  > {}
export interface BiMap.NonEmpty<K, V>
  extends BiMap.Advanced.Api<
    K, V,
    Collection.Advanced.TypesNonEmpty<BiMap.Advanced.Family<K, V>, readonly [K, V]>
  > {}
```

### 3.2 Delegate maps (Q7/Q26)

```ts
readonly keyValueMap: MapCollection<K, V>;   // K -> V
readonly valueKeyMap: MapCollection<V, K>;   // V -> K  (inverse)
```

Context delegates (verified assignable from concrete map collection contexts):

```ts
readonly keyValueContext: MapCollection.Context<MapCollection.Advanced.Family<UK, any>>;
readonly valueKeyContext: MapCollection.Context<MapCollection.Advanced.Family<UV, any>>;
```

`empty`/`of`/`from`/`builder` are invoked in the element-tuple shape
(`ctx.empty<readonly [K, V]>()`). `isValidKey` validates the key side, `isValidValue` the
value side.

---

## 4. Public API inventory

### 4.1 Immutable `BiMap<K, V>`

| Old | New | Action |
|---|---|---|
| `at(key[, otherwise])` | `get(key[, otherwise])` | rename (inherited) |
| `hasKey(key)` | `has(key)` | rename (inherited) |
| `atValue(value[, otherwise])` | `getKey(value[, otherwise])` | rename (BiMap cap) |
| `hasValue(value)` | `hasValue(value)` | keep (BiMap cap) |
| `set(k, v)` | `set(k, v)` | keep (inherited) |
| `setAndGet(k, v)` | `setAndReturn(k, v)` → `Op.DynamicResult<..., readonly [K,V]>` | rename + reshape |
| `addEntry(entry)` | `add(entry)` | rename (inherited) |
| `addEntryAndGet(entry)` | `addAndReturn(entry)` → `Op.DynamicResult<..., readonly [K,V]>` | rename + reshape |
| `addEntries(entries)` | `addAll(entries)` | rename (inherited) |
| `removeKey(key)` | `removeKey(key)` | keep (inherited) |
| `removeKeyAndGet(key)` | `removeKeyAndReturn(key[, otherwise])` → `Op.DynamicResult<..., V>` | rename + reshape (map contract) |
| `removeKeys(keys)` | `removeKeys(keys)` | keep (inherited) |
| `removeValue(value)` | `removeValue(value)` | keep (BiMap cap) |
| `removeValueAndGet(value)` | `removeValueAndReturn(value[, otherwise])` → `Op.DynamicResult<..., K>` | rename + reshape |
| `removeValues(values)` | `removeValues(values)` | keep (BiMap cap) |
| `removeEntry(entry)` | `removeEntry(entry)` | keep (BiMap cap) |
| — | `removeEntries(entries)` | introduce (BiMap cap, Q21) |
| `updateValueAtKey(key, f)` | `updateAtKey(key, f)` | rename (inherited) |
| `updateValueAtKeyAndGet(key, f)` | `updateAtKeyAndReturn(key, f)` | rename + reshape (map contract) |
| `updateKeyAtValue(f, value)` | `updateAtValue(f, value)` | rename (BiMap cap, Q21) |
| `updateKeyAtValueAndGet(f, value)` | `updateAtValueAndReturn(f, value)` | rename + reshape |
| `modifyAtKey(key, opts)` | `modifyAtKey(key, opts)` | keep (inherited) |
| `modifyAtValue(value, opts)` | `modifyAtValue(value, opts)` | keep (BiMap cap) |
| `stream()` / `streamKeys()` / `streamValues()` | same | keep |
| `forEach(f, opts?)` | `forEach(f)` + `forEachIndexed(f, opts?)` | split (inherited) |
| `filter(pred, opts?)` | `filter(pred, opts?)` + `filterIndexed(pred, opts?)` | reshape (inherited) |
| `toArray()` / `toBuilder()` / `toString()` | same | keep |
| `toJSON()` | — | **remove** |
| `keyValueMap` / `valueKeyMap` | `MapCollection<K,V>` / `MapCollection<V,K>` | keep, retyped |
| — | `asNormal()` | introduce (inherited, from `_NORMAL`/`_NON_EMPTY`) |
| — | `mutate(f)` | introduce (inherited) |
| — | `mapValues<V2 extends Tp['_UPPER_V']>(f)` | introduce (inherited; `V2 extends V`) |
| — | `map` / `mapIndexed` / `flatMap` / `flatMapIndexed` / `recompose` | introduce (inherited) |
| — | `invert()` | introduce (BiMap cap) |
| `BiMap.Types` / `BiMapFactory` / `BiMapCreators` / `WithValueResult` re-export | — | **remove** (replaced by `Advanced`) |

**NonEmpty overrides:** `_NON_EMPTY`-returning overloads come from `Tp`; `BiMap.NonEmpty`
overrides `invert(): BiMap.NonEmpty<V, K>`, `keyValueMap: MapCollection.NonEmpty<K,V>`,
`valueKeyMap: MapCollection.NonEmpty<V,K>`, and the `*AndReturn`/`map*` NonEmpty refinements.
Overload order: the `NonEmpty`-returning overload is declared **first** (AGENTS §1.1).

### 4.2 Builder

| Old | New | Action |
|---|---|---|
| `getValue(key[,o])` | `get(key[,o])` | rename (inherited) |
| `getKey(value[,o])` | `getKey(value[,o])` | keep (BiMap cap) |
| `hasKey(key)` | `has(key)` | rename (inherited) |
| `hasValue(value)` | `hasValue(value)` | keep (BiMap cap) |
| `addEntry(entry)` / `addEntries(entries)` | `add(entry)` / `addAll(entries)` | rename (inherited) |
| `removeKey` / `removeKeys` | same | keep (inherited) |
| `removeValue` / `removeValues` / `removeEntry` | same | keep (BiMap cap) |
| `forEach(f, opts?)` | `forEach(f)` + `forEachIndexed(f, opts?)` | split (inherited) |
| `build()` | `build()` | keep |
| — | `clear()`, `modifyAtKey`, `updateAtKey`, `updateAtKeyAndReturn`, `buildMapValues` | introduce (inherited) |
| — | `removeEntries(entries): boolean` | introduce (BiMap cap) |

### 4.3 Context / factory

| Old | New |
|---|---|
| `BiMap.empty/of/from/builder/reducer` | same, via `ContextApi`/`KeyedContextApi` |
| `BiMap.createContext({keyValueContext?, valueKeyContext?})` | same, `BiMap` = `BiMapCollectionContext.createDefault().keyedContext` (hashed style, no `Module`) |
| `BiMap.defaultContext()` | `defaultContext` property |
| `Context.keyValueContext` / `valueKeyContext` | retyped to `MapCollection.Context<...>` |
| `Context.typeTag: 'BiMap'` | keep |
| `Context._types` | replaced by family |
| — | `isValidValue(value)` introduce |

---

## 5. `BiMapCollection` capability families (in `src/advanced/bimap-base.ts`)

Each family follows the `MapCollection.Capability.WithX` shape (`_NORMAL`/`_NON_EMPTY`/
`_BUILDER`, `_FAM`/`_NEW_FAMILY`, nested `Api`/`BuilderApi`).

| Family | Api (immutable) | BuilderApi |
|---|---|---|
| `WithGetKey<K,V>` | `getKey<UV=V>(value): K \| undefined`; `getKey<UV,O>(value, otherwise: OptLazy<O>): K \| O` | same |
| `WithHasValue<K,V>` | `hasValue<UV=V>(value): boolean` | same |
| `WithRemoveValue<K,V>` | `removeValue<UV=V>(value): Tp['_NORMAL']`; `removeValues<UV=V>(values): Tp['_NORMAL']`; `removeValueAndReturn<UV=V>(value): Op.DynamicResult<Tp['_SELF'], undefined, K, Tp['_NORMAL']>`; `removeValueAndReturn<UV,O>(value, otherwise): Op.DynamicResult<Tp['_SELF'], O, K, Tp['_NORMAL']>` | `removeValue` → `K \| undefined`; `removeValues` → `boolean` |
| `WithRemoveEntries<K,V>` | `removeEntries(entries: StreamSource<readonly [K,V]>): Tp['_NORMAL']` | `removeEntries(entries): boolean` |
| `WithUpdateAtValue<K,V>` | `updateAtValue<UV=V>(keyUpdate: (key: K) => K, value): Tp['_SELF']`; `updateAtValueAndReturn<UV=V>(...): Op.DynamicResult<Tp['_SELF'], [undefined, undefined], [K, K], Tp['_NON_EMPTY']>` | — |
| `WithModifyAtValue<K,V>` | `modifyAtValue(atValue: V, options: ModifyOptions<K>): Tp['_NORMAL']` | `modifyAtValue(...): boolean` |
| `WithInvert<K,V>` | `invert(): Collection.Advanced.FamToTypes<Tp['_FAM'], readonly [V, K]>['_NORMAL']`; NonEmpty → `['_NON_EMPTY']` | — |
| `WithKeyValueMap<K,V>` | `readonly keyValueMap: MapCollection<K,V>` (NonEmpty → `MapCollection.NonEmpty<K,V>`) | — |
| `WithValueKeyMap<K,V>` | `readonly valueKeyMap: MapCollection<V,K>` | — |
| `WithAndReturn<K,V>` | `setAndReturn(key, value): Op.DynamicResult<Tp['_NON_EMPTY'], undefined, readonly [K,V], Tp['_NON_EMPTY']>`; `addAndReturn(entry): ...` | — |

`invert()` uses `FamToTypes<Tp['_FAM'], readonly [V, K]>` so the concrete `_NEW_FAMILY`
(`Family<this['_NEW_K'], this['_NEW_V']>`) yields `BiMap<V, K>` with no variance annotations.

---

## 6. Required `@rimbu/collection-types` adaptations

These are the "adapt regarding invariant types" changes (Q3/Q13/Q19); they are
behaviour-preserving for BiMap and fix an existing `HashMap` regression.

1. `KeyedCollection.Capability.WithMapValues.Api.mapValues` and
   `.BuilderApi.buildMapValues`: `V2 extends V` → `V2 extends Tp['_UPPER_V']`
   (`src/public/collection/keyed.ts`, ~L204–217).
2. `MapCollectionNonEmpty.RequiredClass.mapValues` and the abstract `Result.mapValues`
   (`src/advanced/map-base.ts`, ~L177 and ~L229): same constraint change.
3. `WithFlatMap` / `WithFlatMapIndexed` (`src/public/collection/keyed.ts`, ~L443–498):
   the declared `K2`/`V2` are unused — parameterise with `readonly [K2, V2]` so `flatMap`
   actually retypes (required for a usable `flatMap` on BiMap).

No module/structural changes to `MapCollection.Advanced` itself, and no new top-level
collection kind in `collection-types`. After the change, re-run `hashed`/`sorted` `src`
builds to confirm no regression.

---

## 7. Internal implementation layout

```
src/
├── bimap.ts                       # root: export * from '@rimbu/bimap/bimap';
│                                  #        export * from '@rimbu/bimap/advanced/bimap-base';
├── public/
│   └── bimap.ts                   # BiMap + NonEmpty/Builder/Context + Advanced namespace + const
├── advanced/
│   └── bimap-base.ts              # BiMapBase, BiMapCollection.Capability.*, composed abstract bases
└── internal/
    └── bimap/
        ├── context.ts             # BiMapCollectionContext, BiMapKeyedContext, createDefault
        ├── immutable/
        │   ├── empty.ts           # BiMapEmpty
        │   └── non-empty.ts       # abstract BiMapNonEmptyBase + concrete BiMapImpl
        └── mutable/
            └── builder.ts         # BiMapBuilder
```

Composition mirrors hashed:

```ts
const BiMapEmptyBase = MapCollectionEmpty.WithMixin(
  KeyedCollectionEmpty.WithMixin(CollectionEmpty.Constructor));
export class BiMapEmpty<K, V>
  extends BiMapEmptyBase<K, V, BiMap.Advanced.Family<K, V>>
  implements BiMap<K, V> {}

const NonEmptyBase = MapCollectionNonEmpty.WithMixin(
  KeyedCollectionNonEmpty.WithMixin(CollectionNonEmpty.Constructor));
export abstract class BiMapNonEmptyBase<K, V>
  extends NonEmptyBase<K, V, BiMap.Advanced.Family<K, V>>
  implements BiMap.NonEmpty<K, V> {
  // the 3 map obligations the mixins leave abstract:
  abstract add(entry: readonly [K, V]): BiMap.NonEmpty<K, V>;
  abstract modifyAtKey(key: K, options: ModifyOptions<V>): BiMap<K, V>;
  abstract mapValues<V2 extends V>(f: (v: V, k: K) => V2): BiMap<K, V2>;
  // plus all value-direction capability members (§5)
}
```

Invariant maintenance reuses the existing two-map reconciliation logic
(`addEntry`/`set` displacement across both maps, reference-preserving `copy`/`copyE`,
empty short-circuit) — ported from `src/internal/immutable.ts` and
`src/internal/builder.ts`, adapted to the new names and `Op.DynamicResult`.

`mapValues`/`map`/`flatMap`/`recompose` are **not** re-implemented: the mixins derive them
via `toBuilder()`/`from()`, so collisions fall out of the builder's existing displacement
rule (last-iterated wins).

Drop `src/internal/factory.ts` and the `Module`-based `context-factory.ts`; the context is a
plain class hierarchy (hashed style) whose `keyedContext` is the public `BiMap` const.

---

## 8. Packaging

`package.json`:
- exports: add `"./*"` → `./dist/public/*` and `"./advanced/*"` → `./dist/advanced/*`
  (keep `"."` → `./dist/bimap.*`).
- imports: `"#bimap/*"` stays `./dist/internal/*`; add `"#bimap-bimap/*"`? No — put map
  internals under `./src/internal/bimap/*` and map `#bimap/*` to `./dist/internal/*`
  (matches the `internal/bimap/...` layout without an extra alias).
- bump to major via changeset `feat!: migrate BiMap to capability families`.

`tsconfig.common.json`: add `@rimbu/bimap/advanced/*` → `./src/advanced/*.ts` before the
`@rimbu/bimap/*` → `./src/public/*.ts` wildcard; keep `#bimap/*` → `./src/internal/*.ts`.

`@rimbu/core` re-export (`packages/core/src/bimap.ts`) is unchanged.

---

## 9. Tests and docs

- Rewrite `test/bimap.test.ts` to the new names and `Op.DynamicResult` shapes; cover
  `invert`, both-direction `*AndReturn`, pluggable/mixed contexts, and collision displacement
  for `addAll`/`mapValues`/`flatMap`.
- Rewrite `test-d/bimap.test-d.ts`: `NonEmpty` propagation, `OptLazy` overloads,
  `invert()` returning `BiMap<V,K>` (NonEmpty-refined), `getKey`/`hasValue`, and
  `map`/`mapValues` retyping to `BiMap<K,V2>` (refinement).
- Add `test-random/` property tests: 1-to-1 invariant holds after arbitrary add/remove/set;
  `invert().invert()` round-trips; `keyValueMap`/`valueKeyMap` agree.
- Update `packages/bimap/AGENTS.md`: new three-tier layout, remove the "No `mapValues`"
  deviation (now claimed with displacement semantics), document the `advanced/` tier.
- Update `README.md` examples; add `@example` JSDoc on every new public member (per
  `review-docs`).
- Changeset: major.

---

## 10. Workstreams and execution order

```
T1 collection-types adaptations (§6)  ──► re-verify hashed/sorted src builds
T2 public façade + BiMapCollection capabilities (§3, §5)   (settles the contract)
T3 context + immutable internals (§7)
T4 builder (§7)
T5 package plumbing: package.json/tsconfig tiers (§8)
T6 tests + test-d + test-random (§9)
T7 docs + AGENTS + changeset (§9)
T8 verify: build:seq (bimap), typecheck (bimap), bun test (bimap), biome
```

T2 must settle the public contract before T3/T4 finalise the contexts/builders (mirrors the
sorted plan's T6→T4 ordering). T1 is independent and should land first.

---

## 11. Acceptance

- [ ] `BiMap<K, V>` extends `MapCollection.Advanced.Api` and satisfies every abstract
      obligation of the composed empty/non-empty mixin bases.
- [ ] `BiMapCollection.Capability.*` value-direction operations present on both immutable
      (`_NORMAL`/`_NON_EMPTY`) and builder, with `Op.DynamicResult` side results.
- [ ] `invert()` returns `BiMap<V,K>` (`NonEmpty` refined) via `FamToTypes`, no variance
      annotations.
- [ ] Collisions from `addAll`/`mapValues`/`map`/`flatMap`/`recompose` are repaired
      last-iterated-wins; the 1-to-1 invariant holds.
- [ ] `keyValueMap`/`valueKeyMap` are `MapCollection` views; `keyValueContext`/
      `valueKeyContext` accept `HashMap.Context`/`SortedMap.Context` (mixed allowed).
- [ ] No legacy names (`at`, `atValue`, `hasKey`, `addEntry(s)`, `*AndGet`,
      `updateValueAtKey`, `updateKeyAtValue`, `toJSON`, `WithValueResult`) remain.
- [ ] `bunx tsc -p packages/bimap/tsconfig.esm.json` + `tsconfig.json` clean;
      `bun test test/*` green for `bimap`; `biome check src` clean.

---

## 12. Open items / risks

- `collection-types` is itself mid-migration (see ticket 08); the §6 edits must not disturb
  the `hashed`/`sorted` `src` builds.
- The `flatMap`/`flatMapIndexed` retyping fix is a shared-code change; confirm it does not
  break the existing (stale) hashed/sorted test expectations beyond the already-red baseline.
- `MapCollection.Context` delegate construction uses the element-tuple shape
  (`empty<readonly [K,V]>()`); verify ergonomics when writing the context class.
- `_VALUE_KEYED_CONTEXT` is introduced for the inverse context; if it proves unused after
  T3, remove it (Q22 permits evolution).
```