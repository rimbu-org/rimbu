# Plan: Migrate SortedMap / SortedSet to `collection-types` capability families

**Target:** `packages/sorted/src/public/map.ts` & `set.ts` → compose `packages/collection-types/src/public/collection/indexed-valued-sorted.ts` / `indexed-keyed-sorted.ts` like `packages/hashed/src/public/map.ts` / `set.ts` do for `hash`.

**Source of truth for “hashed pattern”:** `HashMap` in `packages/hashed/src/public/map.ts:1-107` and `HashSet` in `packages/hashed/src/public/set.ts:1-91` – thin `Family`-based façades over `MapCollection` / `SetCollection` + `Collection.Capability.*` / `KeyedCollection.Capability.*` / `ValuedCollection.Capability.*`.

**Current `sorted` state:** `SortedMap` / `SortedSet` still extend legacy invariant bases `RMapBase` / `RSetBase` from `packages/collection-types/src/advanced/map/base.ts:461` and `packages/collection-types/src/advanced/set/base.ts:340`, plus ad-hoc sorted extras (`streamRange`, `findIndex`, `lowerBound`, `atIndex`, etc.) in `packages/sorted/src/public/map.ts:1-609` / `set.ts:1-467`.

**Capability tickets this unblocks:** `collection-capabilities/issues/08-migrate-sorted-collections.md:1` (blocked by `05`). The checklist there – unified indexed+sorted API, positional/range/neighbor identities, `comp` preservation, `removeAt` order-statistic, negative indexing / `NonEmpty`, removal of aliases – is the acceptance gate.

---

## 1. Inventory & Gap Analysis

### 1.1 Existing public contracts to preserve or rename

| Area | `SortedMap` today (`src/public/map.ts`) | `SortedSet` today (`src/public/set.ts`) | Mapping to capability vocabulary |
|---|---|---|---|
| identity / membership | `hasKey`, `at(key)` (`RMapBase`) | `has` (`RSetBase`) | `KeyedCollection.Advanced.Api.has` / `ValuedCollection.Advanced.Api.has` + `IndexedValuedCollection.indexOf` / `IndexedKeyedCollection.indexOf` |
| index of key/value | `findIndex(key): number | undef` (`map.ts:191`) | `findIndex(value)` (`set.ts:124`) | → `indexOf` (see `indexed-valued.ts:27`, `indexed-keyed.ts:35`) – keep `findIndex` as deprecated alias or remove per `08` (“Removed sorted aliases … are absent”) |
| positional | `atIndex(i)`, `take`, `drop`, `sliceIndex(range)` (`map.ts:336-385`), same for set | → `IndexedCollection.Advanced.Api.at`, `take`, `drop`, `slice` (`indexed.ts:56-71`) + `streamSlice` |
| range streaming | `streamRange(Range<K>)`, `streamSliceIndex(IndexRange)` (`map.ts:48-67`) | same for set | Keep as sorted-specific extension; no capability yet – stays in `SortedMap/Map` `Advanced.Api` as we did for `HashMap` extras |
| order bounds | `lowerBound`, `upperBound`, `nextEntry`, `previousEntry` (`map.ts:194-292`) | `lowerBound`, `upperBound`, `next`, `previous` (`set.ts:126-225`) | Belong to `SortedCollection` range/neighbor; will remain in sorted-specific surface but align names to `08` target (positional, comparator-range, neighbor, endpoint). Do not rename `nextEntry`→`next` without ticket 08 approval – plan documents the rename. |
| endpoints | `min`/`max`/`minKey`/`maxKey`/`minValue`/`maxValue` (`map.ts:87-313`, `set.ts:64-105`) | `min`/`max` | → `SortedCollection.Advanced.Api.min`/`max` (`sorted.ts:41-44`) + `previous`/`next` for builder |
| builder endpoints | `Builder.min`/`max`/`atIndex` (`map.ts:524-591`, `set.ts:383-449`) | → `SortedCollection.Advanced.BuilderApi.min`/`max` + `IndexedCollection.Advanced.BuilderApi.at`/`first`/`last`. `08` requires `comp` on collection & builder; keep `atIndex`→`at` if renaming. |
| mutation | `set`, `addEntry`, `addEntries`, `modifyAt`, `updateAt`, `removeKey*` | `add`, `addAll`, `remove`, etc. | Map to `MapCollection.Capability.WithSet`, `KeyedCollection.Capability.WithRemove`, `WithMapValues`, `WithUpdateAtKey`, `WithModifyAtKey`, `Collection.Capability.WithAdd` / `WithMutate` / `WithToBuilder` – same set `HashMap` uses (`hashed/src/public/map.ts:42-54`). `SortedSet` mirrors `HashSet` (`hashed/src/public/set.ts:33-46`). |

### 1.2 Base types to compose

- `SortedSet` ≡ `IndexedValuedSortedCollection` (`indexed-valued-sorted.ts:5-49`: `IndexedValuedCollection.Advanced.Api` + `SortedCollection.Advanced.Api`)
- `SortedMap` ≡ `IndexedKeyedSortedCollection` (`indexed-keyed-sorted.ts:5-72`: `IndexedKeyedCollection.Advanced.Api` + `SortedCollection.Advanced.Api`)

Both should additionally extend `SetCollection` / `MapCollection` (valued/keyed contracts not fully covered by indexed+sorted alone – `SetCollection` gives `difference`/`intersection`/`union` intent, `MapCollection` gives `streamKeys`/`streamValues`). Follow `HashSet` which extends `SetCollection.Advanced.Api` even though it also has `Valued` capabilities, and `HashMap` which extends `MapCollection.Advanced.Api`.

### 1.3 Context

Current `ContextImpl` in `sorted/src/internal/map/context-factory.ts:1-147` and `set/context-factory.ts:1-141` implement `RMapContextBaseModule` / `RSetContextBaseModule` and expose `comp: Comp<UK>`, `blockSizeBits`, `findIndex`, `isValidKey`. New `ContextApi` should mirror `hashed/src/public/map.ts:65-87` / `set.ts:55-64`:

```ts
// for SortedSet
ContextApi<UE, FAM extends IndexedValuedSortedCollection.Advanced.Family<UE>>
  extends IndexedValuedSortedCollection.Advanced.ContextApi<FAM>, // which embeds Indexed+Valued + Sorted
          Collection.Capability.WithReducer.ContextApi<FAM> {
  readonly comp: Comp<UE>;
  readonly blockSizeBits: number;
}
```

Retain `findIndex` as internal helper (`ContextImpl.findIndex`) – not part of public `ContextApi`.

---

## 2. Target Public Shape (mirrors `hashed`)

### 2.1 `src/public/set.ts` – after

```ts
import type { Collection } from '@rimbu/collection-types/collection';
import type { SetCollection } from '@rimbu/collection-types/set';
// optionally keep Comp for context, but prefer deriving from ContextApi
import type { Comp } from '@rimbu/common/comp';
import { SortedSetContext } from '#set/context'; // analogous to HashSetContext

export interface SortedSet<E> extends SortedSet.Advanced.Api<E, Collection.Advanced.Types<SortedSet.Advanced.Family<E>, E>> {}
export namespace SortedSet {
  export interface NonEmpty<E> extends Advanced.Api<E, Collection.Advanced.TypesNonEmpty<Advanced.Family<E>, E>> {}
  export interface Builder<E> extends Advanced.BuilderApi<E, Collection.Advanced.Types<Advanced.Family<E>, E>> {}
  export interface Context<UE> extends Advanced.ContextApi<UE, SortedSet.Advanced.Family<UE>> {}

  export namespace Advanced {
    export interface Api<E, Tp extends Collection.Advanced.TypesBase>
      extends SetCollection.Advanced.Api<E, Tp>,
              IndexedValuedSortedCollection.Advanced.Api<E, Tp>, // gives Indexed+Valued+Sorted base
              Collection.Capability.WithAdd.Api<E, Tp>,
              Collection.Capability.WithMutate.Api<E, Tp>,
              Collection.Capability.WithToBuilder.Api<E, Tp>,
              // keep existing Valued algebra until unified
              ValuedCollection.Capability.WithRemove.Api<E, Tp>,
              ValuedCollection.Capability.WithDifferenceAndIntersection.Api<E, Tp>,
              ValuedCollection.Capability.WithSymmetricDifferenceAndUnion.Api<E, Tp>,
              // plus any Sorted extras that are not yet a capability
              // (streamRange, streamSliceIndex, lowerBound/upperBound, etc. as explicit members,
              //  or move them to a new SortedSet-specific capability if you introduce one)
              SortedExtras.Api<E, Tp> {}

    export interface BuilderApi<E, Tp extends Collection.Advanced.TypesBase>
      extends SetCollection.Advanced.BuilderApi<E, Tp>,
              IndexedValuedSortedCollection.Advanced.BuilderApi<E, Tp>,
              Collection.Capability.WithAdd.BuilderApi<E, Tp>,
              ValuedCollection.Capability.WithRemove.BuilderApi<E, Tp>,
              SortedExtras.BuilderApi<E, Tp> {}

    export interface ContextApi<UE, F extends Collection.Advanced.FamilyBase<UE>>
      extends SetCollection.Advanced.ContextApi<F>, // or IndexedValuedSortedCollection.ContextApi
              Collection.Capability.WithReducer.ContextApi<F> {
      readonly comp: Comp<UE>;
      readonly blockSizeBits: number;
    }

    export interface Family<E> extends IndexedValuedSortedCollection.Advanced.Family<E> {
      // IndexedValuedSorted already is Family<E> (= IndexedValued+Sorted), so extend it
      // to also satisfy SetCollection where needed; alternately extend SetCollection and add Indexed+Sorted:
      // pick ONE parent and intersect the rest via Api/BuilderApi, keep _NORMAL/_NON_EMPTY pointing to SortedSet types:
      _NORMAL: SortedSet<E>;
      _NON_EMPTY: SortedSet.NonEmpty<E>;
      _BUILDER: SortedSet.Builder<E>;
      _CONTEXT: SortedSet.Context<E>;
      _FAM: Family<E>;
      _NEW_FAMILY: Family<this['_NEW_E']>;
      _UPPER_E: E; _INVARIANT: ...;
    }

    export type DefaultFactory = Pick<Context<any>, 'builder'|'empty'|'from'|'of'|'reducer'>
      & { createContext<E>(options:{ comp?: Comp<E>; blockSizeBits?: number }): Context<E>; }
  }
}
export const SortedSet: SortedSet.Advanced.DefaultFactory = SortedSetContext.createDefault();
```

*Alternative validated in `hashed`: `Family<E> extends SetCollection.Advanced.Family<E>` and `Api` simply also extends `IndexedValuedSortedCollection.Advanced.Api`. Choose whichever gives cleanest `_UPPER_E`/`_NEW_E` wiring; both are equivalent if `IndexedValuedSorted.Family` already extends `Collection.Advanced.Family`. Prefer `Family extends SetCollection.Advanced.Family` + intersecting `IndexedValuedSorted` via `Api` if you want `SetCollection` to be the primary parent (matches HashSet pattern).*

### 2.2 `src/public/map.ts` – after

Mirror `HashMap` in `hashed/src/public/map.ts:10-103` but with `IndexedKeyedSorted`:

```ts
import type { Collection } from '@rimbu/collection-types/collection';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { Comp } from '@rimbu/common/comp';
import { SortedMapCollectionContext } from '#map/context';

export interface SortedMap<K,V> extends SortedMap.Advanced.Api<K,V, Collection.Advanced.Types<SortedMap.Advanced.Family<K,V>, readonly [K,V]>> {}
export namespace SortedMap {
  export interface NonEmpty<K,V> extends Advanced.Api<K,V, Collection.Advanced.TypesNonEmpty<Advanced.Family<K,V>, readonly [K,V]>> {}
  export interface Builder<K,V> extends Advanced.BuilderApi<K,V, Collection.Advanced.Types<Advanced.Family<K,V>, readonly [K,V]>> {}
  export interface Context<UK> extends Advanced.ContextApi<UK, SortedMap.Advanced.Family<UK, any>> {}

  export namespace Advanced {
    export interface Api<K,V, Tp extends Collection.Advanced.Types<KeyedCollection.Advanced.Family<K,V>, readonly [K,V]>>
      extends MapCollection.Advanced.Api<K,V, Tp>,
              IndexedKeyedSortedCollection.Advanced.Api<K,V, Tp>,
              Collection.Capability.WithAdd.Api<readonly [K,V], Tp>,
              Collection.Capability.WithMutate.Api<readonly [K,V], Tp>,
              Collection.Capability.WithToBuilder.Api<readonly [K,V], Tp>,
              KeyedCollection.Capability.WithRemove.Api<K,V, Tp>,
              KeyedCollection.Capability.WithMapValues.Api<K,V, Tp>,
              KeyedCollection.Capability.WithRecompose.Api<K,V, Tp>,
              MapCollection.Capability.WithSet.Api<K,V, Tp>,
              MapCollection.Capability.WithUpdateAtKey.Api<K,V, Tp>,
              MapCollection.Capability.WithModifyAtKey.Api<K,V, Tp>,
              SortedMapExtras.Api<K,V, Tp> {} // streamRange etc.

    export interface BuilderApi<K,V, Tp extends Collection.Advanced.TypesBase>
      extends MapCollection.Advanced.BuilderApi<K,V, Tp>,
              IndexedKeyedSortedCollection.Advanced.BuilderApi<K,V, Tp>,
              Collection.Capability.WithAdd.BuilderApi<readonly [K,V], Tp>,
              KeyedCollection.Capability.WithRemove.BuilderApi<K,V, Tp>,
              KeyedCollection.Capability.WithMapValues.BuilderApi<K,V, Tp>,
              MapCollection.Capability.WithSet.BuilderApi<K,V, Tp>,
              /* ... */ {}

    export interface ContextApi<UK, FAM extends KeyedCollection.Advanced.Family<UK, any>>
      extends MapCollection.Advanced.ContextApi<FAM>,
              Collection.Capability.WithReducer.ContextApi<FAM> {
      readonly comp: Comp<UK>;
      readonly blockSizeBits: number;
    }
    export interface KeyedContextApi<UK, FAM extends KeyedCollection.Advanced.Family<UK, any>>
      extends KeyedCollection.Advanced.KeyedContextApi<FAM>,
              KeyedCollection.Capability.WithMerge.KeyedContextApi<FAM>,
              KeyedCollection.Capability.WithReducer.KeyedContextApi<FAM> {
      createContext<K>(options:{ comp?: Comp<K>; blockSizeBits?: number }): Context<K>;
    }

    export interface Family<K,V> extends MapCollection.Advanced.Family<K,V> {
      _NORMAL: SortedMap<K,V>;
      _NON_EMPTY: SortedMap.NonEmpty<K,V>;
      _BUILDER: SortedMap.Builder<K,V>;
      _CONTEXT: SortedMap.Context<K>;
      _KEYED_CONTEXT: KeyedContextApi<K, this['_FAM']>;
      _UPPER_E: readonly [K, any];
      _FAM: Family<K,V>;
      _NEW_FAMILY: Family<this['_NEW_K'], this['_NEW_V']>;
    }
    export type DefaultFactory = KeyedContextApi<any, Family<any,any>>;
  }
}
export const SortedMap: SortedMap.Advanced.DefaultFactory = SortedMapCollectionContext.createDefault().keyedContext;
```

**Where to put “SortedExtras”:** Option A – inline the ad-hoc sorted methods directly in `Advanced.Api` (simplest, mirrors current `map.ts:30-399` extras but typed against `Tp`). Option B – introduce `packages/collection-types/src/public/collection/sorted.ts` capability extensions (`WithRangeSlice`, `WithBounds`, `WithNeighbor`) and consume via capabilities. Prefer A for minimal churn; B is justified only if `08` explicitly wants those as reusable capabilities across `sorted` + `ordered`.

### 2.3 What to do with legacy names

- `findIndex` → `indexOf` (see `indexed-valued.ts:27`, `indexed-keyed.ts:35`). Provide deprecation re-export `/** @deprecated use indexOf */ findIndex(...)` or remove outright per `08` last checkbox.
- `atIndex` → `at` (from `IndexedCollection`). Same decision.
- `sliceIndex` → `slice` (from `IndexedCollection`). `slice(Range<K>)` stays for comparator-range (already needed for `slice({ start, end })` on maps).
- `streamSliceIndex` → `streamSlice` (from `IndexedCollection`).
- `minKey`/`maxKey`/`minValue`/`maxValue` → superseded by `min`/`max` + `stream` projections; `08` says “Removed sorted aliases and min/max projection APIs are absent”. So `SortedSet` `min`/`max` remain via `SortedCollection`; `SortedMap` `minKey`/`maxKey` etc. are aliases to remove after migration (keep internally if needed, delete from public `Advanced.Api`).
- Document each rename in `CHANGELOG.md` / changeset.

---

## 3. Phased Execution

### Phase 0 — Pre-flight (½ day)

- [ ] Run `bun run build:seq && bun run typecheck:seq` baseline (no changes). Confirm green (`collection-types` currently builds, `sorted` has one known `sortedmap-specific.test.ts` type error – note it).
- [ ] Snapshot `dist` exports for `SortedMap`/`SortedSet` (typecheck output) to diff later.
- [ ] Decide extras strategy (inline vs new capabilities) and alias-removal timing; record in this plan or ADR.

### Phase 1 — `collection-types` readiness check (½ day)

- [ ] Verify `IndexedValuedSortedCollection` and `IndexedKeyedSortedCollection` expose the expected `_CONTEXT` / `_FAM` slots (`indexed-valued-sorted.ts:31-48`, `indexed-keyed-sorted.ts:39-70`). They already correctly extend `Indexed{Valued|Keyed}+Sorted`.
- [ ] If `SetCollection` / `MapCollection` context requirements changed in feat/capabilities branch, add any missing `WithReducer` / `WithMerge` plumbing to `sorted`’s `ContextApi`. No new files in `collection-types` needed unless a reusable sorted capability is introduced.

### Phase 2 — Rewrite `packages/sorted/src/public/set.ts` (1–1.5 days)

1. Replace imports of `RSetBase`/`RSet` with `Collection`, `SetCollection`, `IndexedValuedSortedCollection`, `ValuedCollection.Capability.*`, `Collection.Capability.*`.
2. Define `SortedSet` / `SortedSet.NonEmpty` / `Builder` / `Context` shell interfaces delegating to `Advanced.*` exactly like `HashSet` (`hashed/src/public/set.ts:10-30`).
3. Craft `Advanced.Api` – start from “target shape” above; pull in every method currently in `sorted/src/public/set.ts:29-311` that is *not* already covered by `SetCollection`/`IndexedValuedSorted`/`SortedCollection`/capabilities:
   - Keep `stream(options?:{reversed?:boolean})`, `streamRange`, `streamSliceIndex` (or rename), `findIndex`/`indexOf`, `lowerBound`/`upperBound`, `next`/`previous`, `atIndex`/`take`/`drop`/`sliceIndex`/`slice` as needed; type them against `Tp` (`Tp['_IS_NON_EMPTY']` for `min`/`max` overloads, `Tp['_NORMAL']`/`Tp['_NON_EMPTY']` for `take` – follow `indexed.ts:62-71`).
   - Ensure `min`/`max` signatures use `SortedCollection.Advanced.MinMax` style (`sorted.ts:36-39`) so `NonEmpty` can drop the fallback overload.
4. Mirror `Advanced.BuilderApi` and `ContextApi` / `Family` from target shape. Set `_UPPER_E`, `_INVARIANT`, `_FAM`, `_NEW_FAMILY` like `HashSet` Family (`hashed/src/public/set.ts:63-74`).
5. Replace terminal export `export const SortedSet: SortedSetCreators = createSortedSetContextModule().build()` with `SortedSetContext.createDefault()`-style default factory (see `hashed/src/public/set.ts:90`). Requires context file to expose `createDefault()`.

**Checkpoint:** `bun run typecheck:seq --filter=@rimbu/collection-types --filter=@rimbu/sorted` should pass with stub context.

### Phase 3 — Rewrite `packages/sorted/src/public/map.ts` (1–1.5 days)

Analogous, using `MapCollection` + `IndexedKeyedSortedCollection` + `Keyed/Map` capabilities per “target shape” §2.2. Preserve current `map.ts:30-399` extras similarly; ensure `Context` exposes `comp` and `KeyedContextApi.createContext`.

### Phase 4 — Internal `src/internal/*` adaptation (2–3 days, biggest)

- [ ] **`src/internal/sorted/base.ts`** – unchanged (B-tree primitives), but ensure it no longer imports `RMapBase`/`RSetBase` helpers; replace `MapCollectionEmptyBase`/`NonEmptyBase` usage if present.
- [ ] **`src/internal/map/immutable.ts` & `src/internal/set/immutable.ts`** (`sorted/src/internal/map/immutable.ts:1-1120`, `set/immutable.ts`): 
  - Change `extends SortedEmpty implements SortedMap` to implement new `SortedMap` Api (`Collection.Advanced.Types<Family, ...>`). Usually only the `implements` clause changes; method bodies stay.
  - Update method return types to use `Tp`-derived aliases (`SortedMap<K,V>` vs `WithKeyValue<Tp,...>` becomes `Collection.Advanced.FamToTypes<FAM, ...>`). Follow `hashed/src/internal/map/immutable/non-empty.ts:1-219` after its capability migration for exact signature shape (search for `WithKeyValue` removal).
  - Keep `normalize`, `stream`, `findIndex`/`getInsertIndexOf`, sorted extras – their logic is independent of the capability typings.
- [ ] **`src/internal/map/builder.ts` (`builder.ts:1-367`) & `set/builder.ts:1-202`**: make builders implement new `SortedMap.Builder` / `SortedSet.Builder` (`Advanced.BuilderApi`). Add missing `indexOf`/`at`/`removeAt` if `08` requires order-statistic removal. Ensure `build()` returns correct `_NORMAL` type.
- [ ] **Context factories** (`map/context-factory.ts:1-147`, `set/context-factory.ts:1-141`): 
  - Stop extending `RMapContextBaseModule`/`RSetContextBaseModule`; instead extend/implement new `MapCollection`/`SetCollection` context base or `Hashed`-style concrete `Context` class (`hashed/src/internal/map/context.ts:1` – see `a8240ed8a` diff: now uses `HashMapContext` class implementing `HashMap.Advanced.ContextApi` and holding `hasher`/`eq`/`blockSizeBits`). Mirror for `SortedMapContext`/`SortedSetContext`, keeping `comp`, `blockSizeBits`, `findIndex`, `isValidKey`/`isValidValue`.
  - Provide `createDefault()` factory and `keyedContext` / `collectionContext` bridging if using `KeyedContextApi` (map needs `keyedContext` indirection like `HashMap`; set can expose factory directly like `HashSet`).
  - Implement `empty`, `of`, `from`, `builder`, `reducer` via base helpers (`CollectionContextBaseWithAddAll` in `collection-types/src/advanced/collection-base.ts:251` or `MapCollectionContextBase`) – copy pattern from final `hashed` context.

### Phase 5 — Creators / Module wiring (½ day)

- [ ] Update `src/internal/map/creators.ts` & `set/creators.ts` / `#map/creators` re-exports to produce `SortedMap.Advanced.DefaultFactory` / `SortedSet.Advanced.DefaultFactory` instead of old `SortedMapCreators`. Follow `hashed` final export (`map.ts:106`).
- [ ] Update `src/sorted.ts` barrel (`packages/sorted/src/sorted.ts`) to re-export from new `public/*`. No API change to consumers besides types.

### Phase 6 — Builders & Extras completeness (½ day)

- [ ] Add `removeAt` (order-statistic) if not present – `08` explicitly calls it out (“`removeAt` uses order-statistic access”). This should delegate to `IndexedCollection.Capability.WithRemoveAt` if that capability is chosen, otherwise a direct method on `SortedSet`/`SortedMap` `Advanced.Api`.
- [ ] Ensure `comp` is exposed on **collection instances** (`collection.comp`) as well as on `context.comp`, per `08` checkbox 3 – add `readonly comp: Comp<E>` to `Advanced.Api` if not inherited.
- [ ] Decide on `streamSlice` vs `streamSliceIndex` etc. naming parity with `Ordered` migration (`09`) so both families converge.

### Phase 7 — Type-level tests (½ day)

- [ ] Update / add `test-d/sorted-map.test-d.ts` & `sorted-set.test-d.ts`: cover `NonEmpty` inference (`take(0)` vs `take(1)`), `OptLazy` fallback (`at(key, 'fallback')`, `indexOf`, `min(otherwise)`), `Family` rebinding (`filter`, `mapValues` preserves `SortedMap` not `RMapBase`), and comparator type preservation (`Comp<string>` stays `Comp<string>` through `from`).
- [ ] Copy patterns from `hashed/test-d/*` after its capability migration.

### Phase 8 — Runtime tests (½–1 day)

- [ ] Keep existing `test/sorted*.test.ts` – they exercise B-tree invariants independent of typings.
- [ ] Add shared family tests: `collection-types/test-utils/map/map-collection-standard.ts` and `set/set-collection-standard.ts` – run them with `runMapTestsWith('SortedMap', SortedMap)` same as `HashMap` in `05`. Add indexed/positional/neighbor/range coverage (negative indices, `IndexRange`, reversed streams, `NonEmpty` returns).
- [ ] Run property tests in `test-random/` if any.

### Phase 9 — Verification & Release (½ day)

- [ ] `bun run build:seq` (sequential, per `AGENTS.md:550`) then `bun run typecheck:seq` – must pass for `collection-types`, `sorted`, and downstream `core`, `ordered`, `hashed`.
- [ ] `bun run test` filtered to `sorted` + `collection-types` + `hashed`.
- [ ] `biome check src` / `review-api` diagnose run (optional) to catch export drift.
- [ ] Create changeset (`bunx changeset`) – `feat: migrate SortedMap/SortedSet to capability families`.

---

## 4. File Change Checklist

| File | Action |
|---|---|
| `packages/collection-types/src/public/collection/indexed-valued-sorted.ts` | READ-ONLY reference – already exists (`:1-49`). If needed, add missing `_INVAR` or capability Context plumbing. |
| `packages/collection-types/src/public/collection/indexed-keyed-sorted.ts` | READ-ONLY reference – already exists (`:1-72`). Confirm `_KEYED_CONTEXT` wiring matches map expectations. |
| `packages/sorted/src/public/map.ts` | **REWRITE** to `Family` pattern (delete `RMapBase` import, add `MapCollection`/`IndexedKeyedSortedCollection`/`Capability` imports). |
| `packages/sorted/src/public/set.ts` | **REWRITE** similarly with `SetCollection` + `IndexedValuedSortedCollection`. |
| `packages/sorted/src/sorted.ts` | Update barrel if needed. |
| `packages/sorted/src/internal/map/immutable.ts` | Update `implements` + return types. |
| `packages/sorted/src/internal/set/immutable.ts` | Same. |
| `packages/sorted/src/internal/map/builder.ts` | Implement new `BuilderApi`. |
| `packages/sorted/src/internal/set/builder.ts` | Same. |
| `packages/sorted/src/internal/map/context-factory.ts` | Replace `RMapContextBaseModule` with capability-based context class + `createDefault`. |
| `packages/sorted/src/internal/set/context-factory.ts` | Same. |
| `packages/sorted/src/internal/map/context.ts` *(new, if split like `hashed`)* | Extract concrete `SortedMapCollectionContext` class (optional, matches `hashed/src/internal/map/context.ts`). |
| `packages/sorted/src/internal/set/context.ts` *(new)* | Same. |
| `packages/sorted/src/internal/{map,set}/creators.ts` | Adapt to produce `Advanced.DefaultFactory`. |
| `packages/sorted/tsconfig.common.json` | Add `#map/*`, `#set/*` alias if introducing `context.ts` path; keep existing `#sorted/*`. |
| `packages/sorted/test/**` | Add standard family test invocations. |
| `packages/sorted/test-d/**` | Add capability family type tests. |

---

## 5. Risks & Decisions to Record

- **Alias retention vs removal:** `08` requires “Removed sorted aliases … are absent” – so a **breaking** release. Call out in plan whether you do a one-shot removal (simpler) or a deprecation period with `@deprecated` shims (safer). Hashed migration kept legacy names behind for one minor; sorted could do the same – decide and document.
- **Builder `atIndex`/`indexOf` parity:** If `indexOf` lives on `IndexedValued`/`IndexedKeyed`, the sorted builder must expose the same. Ensure internal builder’s `findIndex` helper is not confused with public `indexOf`.
- **Context duality (Map needs `KeyedContextApi` vs Set’s direct `Context`):** Follow `HashMap`’s `KeyedContextApi` + `keyedContext` pattern for `SortedMap` so `createContext(comp)` and `merge`/`reducer` keyed APIs resolve correctly. `SortedSet` can follow `HashSet`’s simpler `Context` + `createContext`.
- **B-tree `comp` covariance:** `Comp<UK>` must stay `Comp<UK>` not `Comp<unknown>` after generic rebinding – verify `Family._UPPER_E` flows through `ContextApi`.
- **Performance of `addAll` via builder:** After migrating `from`/`of` to use `CollectionContextBaseWithAddAll` helper (`collection-base.ts:251`), verify B-tree bulk insertion still benefits from sorting vs per-element `add`.

---

## 6. Acceptance (from `08`)

- [ ] `SortedMap`/`SortedSet` `extends Indexed{Valued|Keyed}SortedCollection.Advanced.Family` and pass `map-collection-standard` / `set-collection-standard` suites.
- [ ] Positional API uses `at`/`slice`/`streamSlice`/`removeAt` with negative-index support; comparator-range API uses `streamRange`/`slice` consistently.
- [ ] `lowerBound`/`upperBound`/`next`/`previous` neighbor API and `min`/`max` endpoint API present with correct `NonEmpty` overloads.
- [ ] `comp` visible on both context and instance with concrete comparator types.
- [ ] No stale `findIndex`/`atIndex`/`sliceIndex`/`minKey` aliases remain in `public/*` (or are explicitly deprecated with a removal note).
- [ ] `bun run build:seq && bun run typecheck:seq && bun run test` green for `sorted`, `collection-types`, `core`.

---

*References:* `hashed` capability shape (`hashed/src/public/map.ts:1-107`, `hashed/src/public/set.ts:1-91`), indexed/sorted families (`collection-types/src/public/collection/indexed-valued-sorted.ts:1-49`, `indexed-keyed-sorted.ts:1-72`, `sorted.ts:1-110`), legacy sorted surface (`sorted/src/public/map.ts:1-609`, `sorted/src/public/set.ts:1-467`), context factories (`sorted/src/internal/map/context-factory.ts:1-147`, `sorted/src/internal/set/context-factory.ts:1-141`), internal tree (`sorted/src/internal/map/immutable.ts`, `sorted/src/internal/set/builder.ts:1-202`, `sorted/src/internal/map/builder.ts:1-367`). Related effort tickets `05` & `08` in `.scratch/collection-capabilities/issues/`.
