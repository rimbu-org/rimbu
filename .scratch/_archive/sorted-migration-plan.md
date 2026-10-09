# Plan: Finish the `@rimbu/sorted` capability migration

**Goal:** bring `packages/sorted` to the same end state as `packages/hashed` — thin public
`Family` façades over `@rimbu/collection-types` capability mixins, with concrete nodes,
contexts and builders implementing the mixin contracts — so the package builds, typechecks,
and passes its runtime/type tests.

**Reference (already migrated):** `packages/hashed/src/public/{map,set}.ts` +
`packages/hashed/src/internal/{map,set}/{context.ts,immutable/*,mutable/*}`.

**Acceptance gate:** `.scratch/collection-capabilities/issues/08-migrate-sorted-collections.md`
(the alias-removal checkbox is explicitly deferred to ticket `10`).

---

## 1. Current state (measured 2026-09)

The public façades are already on the new pattern, but the internals are mid-rewrite.

| Check | Result |
|---|---|
| `bunx tsc -p packages/sorted/tsconfig.esm.json --noEmit` | **172 errors** across 19 files |
| `bunx tsc -p packages/sorted/tsconfig.json --noEmit` | 172 src + test-utils/test errors |
| `bun test test/*` (run from `packages/sorted`) | 80 pass, 42 fail, 6 errors |
| `bunx tsc -p packages/collection-types/tsconfig.esm.json` | clean (`src` baseline ok) |
| `bunx tsc -p packages/hashed/tsconfig.esm.json` | clean (`src` baseline ok) |
| `collection-types` / `hashed` full `tsconfig.json` | pre-existing failures in `test-utils` / `test-random`, unrelated to sorted |

### 1.1 Error inventory (`tsc tsconfig.esm.json`)

| File | Errors | Primary cause |
|---|---:|---|
| `internal/set/immutable/leaf.ts` | 46 | `mutateEntries` missing on node classes; `SortedSetNode`/`mutateEntries` contract |
| `internal/set/immutable/inner.ts` | 30 | same, plus missing `filter`/`map` on non-empty node |
| `internal/map/immutable/inner.ts` | 29 | `SortedMapNode` not imported; `mutateEntries`; over-wide `any` |
| `internal/map/immutable/node.ts` | 24 | duplicate/legacy members vs mixin requirements; `@ts-expect-error` misuse; abstract-vs-concrete ordering |
| `internal/map/immutable/leaf.ts` | 17 | `SortedMapNode` not imported; `mutateEntries`; `mutateEntries` direct access on line 156 |
| `internal/set/builder.ts` | 10 | imports `ContextImpl`/`#set/immutable` that don't exist; builder missing API |
| `internal/map/builder.ts` | 9 (+7 unused `@ts-expect-error`) | builder missing `lowerBound`/`upperBound` etc. |
| `internal/set/context.ts` | 5 | `SortedSetContext` generic variance (`UE` vs `E`); builder API |
| `internal/map/immutable/empty.ts` | 1 | `modifyAt` returns `SortedMapLeaf`, not assignable to `SortedMap` |
| `internal/map/context-factory.ts` | 1 | `builder()` returns a builder missing `lowerBound`/`upperBound` |
| `test/*`, `test-d/*` | ~30 | tests still reference legacy names / removed exports |

Highest-frequency messages:
- `Property 'mutateEntries' is missing in ... InnerMutateSource/LeafMutateSource` (~40).
- `Type 'SortedMapBuilder<K,V>' is missing ... lowerBound, upperBound` (~9, cascades into `toBuilder()`/`asNormal()`).
- `Cannot find name 'SortedMapNode'` (~10).
- `SortedSetInner/Leaf is missing implementations ... 'filter', 'map'` (TS2654).
- `@ts-expect-error` is unused (~12) — stale suppressions that must be deleted.

Runtime failures are all of the shape `context.empty().<method> is not a function`
(`slice`, `min`, `max`, `next`, …) — the empty mixin base is not composed with the
sorted/indexed/valued capabilities, so the empty instance is missing the methods.

---

## 2. Target architecture

### 2.1 Nodes extend the capability mixins

Public `Family` records (already written) bind the concrete types; the abstract node base
classes are built by composing the `@rimbu/collection-types/advanced/...` mixins. Concrete
leaf/inner/empty classes implement only the members the mixins leave abstract. All generic
methods (`filter`, `map`, `mapValues`, `removeKey(s)`, `addAll`, `set`, `updateAtKey`,
`difference`, `union`, …) come from the mixins — **do not re-implement them on the nodes**.

Compare `hashed/src/internal/{map,set}/immutable/{empty,non-empty}.ts` (11–51 lines each) to
`sorted/src/internal/map/immutable/node.ts` (441 lines): the latter still carries a legacy
hand-rolled API.

Set composition already used by the compiling `SortedSetEmpty`
(`set/immutable/empty.ts:10-12`):
```ts
IndexedSortedCollectionEmpty.WithMixin(
  ValuedCollectionEmpty.WithMixin(CollectionEmpty.Constructor))
```
The non-empty node should mirror this with `IndexedSortedCollectionNonEmpty` +
`SetCollectionNonEmpty` (for `union`/`difference`/`intersection`/`removeAll`/`mapIndexed`),
and **drop** the redundant `IndexedCollectionNonEmpty` layer currently in
`set/immutable/node.ts:16-22`.

Map composition in `map/immutable/node.ts:29-33` mirrors the compiling `SortedMapEmpty`
(`map/immutable/empty.ts:18-22`); keep `IndexedKeyedSortedCollectionNonEmpty` and drop any
duplicate `MapCollection`/`KeyedCollection` layers only if the overloads allow.

### 2.2 Contexts

Follow `hashed/src/internal/map/context.ts` / `set/context.ts`:
- one concrete context class implementing `{SortedMap,SortedSet}.Advanced.ContextApi`;
- `static createDefault(options?)` returning the **collection** context;
- map additionally exposes `get keyedContext()` (implements `KeyedContextApi`);
- `empty`/`builder`/`leaf`/`inner`/`isNonEmptyInstance`/`reducer`/`defaultContext`/`comp`
  implemented on the class;
- **delete** the `Module` shim (`map/context-factory.ts:350-371`) and the legacy
  `creators.ts` interface; the public const becomes
  `HashMap`-style: map `SortedMapContext.createDefault().keyedContext`, set
  `SortedSetContext.createDefault()`.

The context's own type parameters must stay generic (`empty<E extends UK>()`,
`leaf<E extends UK>()`) so that `E extends UE` nodes are assignable — the current
`SortedSetContext` errors (`context.ts:72,80`) come from `<UE>`-typed returns being
invariant against `<E>`.

### 2.3 Builders

Follow `hashed/src/internal/map/mutable/block-builder.ts`:
- extend `CollectionBuilderBase<..., Family>` and `implements SortedMap.Builder`/`SortedSet.Builder`;
- implement the full `Advanced.BuilderApi` surface (`build`, `size`, `isEmpty`, `clear`,
  `forEach`, `forEachIndexed`, `add`/`addAll`, `set`/`modifyAtKey`/`updateAt*`,
  `removeKey(s)`/`remove`/`removeAll`, `indexOf`, `at`/`first`/`last`, `min`/`max`,
  `lowerBound`/`upperBound`, `removeAt`/`removeAmountAt`/`removeAllAt`);
- remove every `@ts-expect-error` and `Object.getPrototypeOf` prototype hack.

### 2.4 `#sorted/base.ts` helper contract

The extracted pure helpers (`SortedNode.*`, `innerGetAtIndex`, `innerStreamSliceIndex`, …)
are fine. The `*MutateSource` helpers still require a mutable `mutateEntries` field that the
immutable nodes used to expose via the legacy `SortedNonEmptyBase`
(`get mutateEntries() { return this.entries as E[] }`, removed by the refactor).

**Recommended fix (minimal, matches pre-refactor semantics):** add
```ts
get mutateEntries(): E[] { return this.entries as E[]; }
```
to the abstract `SortedMapNode` / `SortedSetNode` classes (and keep the existing
`get mutateChildren()`). The helpers always operate on nodes that are immediately re-wrapped
through `copy()`, so in-place array edits are the intended legacy contract.

**Alternative (cleaner, larger):** rewrite the `*Mutate*` helpers to be pure
(array-in/array-out) and delete the `*MutateSource` interfaces. Only choose this if there is
appetite to touch `base.ts` broadly; it is not required to unblock the migration.

---

## 3. Workstreams

### T1 — Repair node-helper contract (`#sorted/base.ts` + node bases)
- Add `get mutateEntries()` to `SortedMapNode`/`SortedSetNode` (or make helpers pure).
- `map/immutable/{leaf,inner}.ts`: add the missing `import { SortedMapNode } from '#map/immutable/node'`.
- Add `internal/set/immutable.ts` barrel re-exporting `empty/leaf/inner/node`
  (tests and `set/builder.ts` import `#set/immutable`), or change those imports to
  `#set/immutable/node`.
- Export `ContextImpl` from the set context module (map already does via `#map/context-factory`).
- Remove stale `@ts-expect-error` directives.

### T2 — Set node hierarchy
Files: `set/immutable/{node,leaf,inner,empty}.ts`.
- Fix composition (drop redundant index mixin), add `mutateEntries`.
- Implement mixin-required members with exact signatures, notably:
  - `filter`, `map` on the non-empty node (currently TS2654 for `SortedSetInner`),
  - `add`, `remove<UE>`, `has<UE>`, `recompose`,
  - sorted specifics: `min`/`max`, `previous`/`next`, `indexOf`, `lowerBound`/`upperBound`,
    `at`, `streamSlice`, `take`/`drop`/`splitAt`/`slice`, `removeAt`, `toBuilder`.
- Seed requires `forEach(f: (value) => void)`; keep the indexed traversal in an overridden
  `forEachIndexed` for efficiency.
- `empty.ts`: rely on `ValuedCollectionEmpty` for `toBuilder`/`mutate`; only override what is
  sorted-specific.

### T3 — Map node hierarchy
Files: `map/immutable/{node,leaf,inner,empty}.ts`.
- Delete legacy duplicates that the mixins now provide: the second `get` (node.ts:364),
  `has` (371), `hasKey`, `addEntry`/`addEntries`/`add`/`addAll`, `set`, `updateAt`/`updateAtAndGet`,
  `removeKey`/`removeKeys`/`removeKeyAndReturn`/`removeKeyAndGet`, `modifyAtKey`/`updateAtKey`
  aliases, `filter` (wrong indexed signature), `filterIndexed`, `forEachIndexed`.
- Keep/implement the required/overridden members with **exact** signatures:
  `get<UK,O>`, `mapValues<V2 extends V>` (note `MapCollectionNonEmpty.RequiredClass` constrains
  `V2 extends V` and returns `ReTyped<Tp, readonly [K,V2]>`), `add`, `modifyAtKey`, `min()`/`max()`
  (methods, not getters), `previous`/`next`, `indexOf`, `lowerBound`/`upperBound`, `at`,
  `streamSlice`, `take`/`drop`/`splitAt`/`slice`, `removeAt`, `toBuilder`, `stream`, `forEach`,
  `size`, `context` (typed `ContextImpl<K>`), plus sorted-only `streamRange`/`streamSliceIndex`.
- Declare abstract members consecutively / not twice (fixes `TS2512`/`TS2516` at node.ts:52).
- `empty.ts`: `modifyAt` returns `this.context.leaf(...)` — becomes assignable once the node
  implements `SortedMap`.

### T4 — Contexts
Files: `map/context-factory.ts`, `set/context.ts`.
- Rewrite as in §2.2; delete `Module`/`getDefinition`.
- Provide `createDefault` / `createContext`; ensure `of`/`from` come from
  `ContextBaseWithAddAll` and `reducer` powers `Collection.Capability.WithReducer`.
- Map: `KeyedContextApi` with `mergeAll`/`mergeAllWith`/`merge`/`mergeWith` (port unchanged
  logic, drop `as unknown as` casts where possible).
- Ensure the `ContextApi` declares `typeTag`, `comp`, `blockSizeBits`, `isValidKey`/`isValidValue`
  (needed downstream — cf. hashed test-random errors referencing `_fixedElementType`, `_types`,
  `isValidValue`).

### T5 — Builders
Files: `map/builder.ts`, `set/builder.ts`.
- Rebase on `CollectionBuilderBase`; implement the full `BuilderApi` per §2.3.
- Fix imports (`#set/immutable`, `ContextImpl`).
- Reuse the working B-tree mutation logic already present (it is correct; only the type
  surface and method set need aligning).

### T6 — Public façades
Files: `public/map.ts`, `public/set.ts`.
- Confirm/adjust `Advanced.Family`, `Api`, `BuilderApi`, `ContextApi`, `KeyedContextApi`
  against `IndexedKeyedSortedCollection` / `IndexedValuedSortedCollection`.
- Decide aliases (see §4). To match ticket `08`'s "kept `@deprecated` … for compatibility"
  and keep the existing test suite compiling, expose deprecated aliases on the public
  `Api`: `findIndex`→`indexOf`, `atIndex`→`at`, `sliceIndex`→`slice`, `streamSliceIndex`→`streamSlice`,
  `nextEntry`/`previousEntry`, `minKey`/`maxKey`/`minValue`/`maxValue`, `hasKey`→`has`,
  `addEntry`/`addEntries`→`add`/`addAll`. Ticket `10` removes them later.
- Terminal consts: map `createDefault().keyedContext`; set `createDefault()`.

### T7 — Tests, type tests, random tests
- `test/sortedset-inner.test.ts`, `test/sortedset-leaf.test.ts`: replace
  `createSortedSetContextModule` with `SortedSetContext.createDefault()`, import nodes from
  `#set/immutable/node` (or the new barrel).
- `test/base.test.ts`: `SortedEmpty` no longer exported — retarget at `SortedBuilder` /
  `SortedNode` helpers.
- `test/sortedset-builder.test.ts`: fix the `Expected 1 arguments, but got 0` constructor call.
- `test/*-specific.test.ts`: legacy `sliceIndex`/`findIndex`/`atIndex`/`nextEntry` usage —
  resolved by the deprecated aliases (T6) or by updating calls to the new names. Note the
  known `sortedmap-specific.test.ts` `number[][]` type error.
- `test-d/{map,set}.test-d.ts`: remove `// @ts-nocheck`, retarget from `RMap`/`RSet` to the
  new family types, and add coverage for `NonEmpty` inference, `OptLazy`, `mapValues`
  precision, and comparator preservation.
- `test-random/*`: verify imports and context API still resolve.

### T8 — Downstream and shared harness
- `collection-types/test-utils/{map,set}/*-collection-standard.ts` currently fails (44 errors)
  when compiled against `collection-types` **source** (sorted maps `@rimbu/collection-types/*`
  to source in `tsconfig.common.json`; hashed maps to `dist`). Since sorted tests call
  `runMapTestsWith`/`runSetTestsWith`, resolve this — either fix the test-utils to the new
  builder/API signatures or confirm it is only an artifact of the source mapping.
- `@rimbu/core` re-exports sorted: run `build:seq` then `typecheck:seq`.
- Note `hashed/test-random` failures are pre-existing and independent.

### T9 — Verification and release
- `bun run build:seq` (sequential, per `AGENTS.md` §9) — `src` build must pass for
  `collection-types`, `sorted`, `core`.
- `bun run typecheck:seq` — sorted `src` + tests must pass (shared harness caveat in T8).
- `bun test` filtered to `sorted`, `collection-types`, `hashed`.
- `bun run biome:check` (no relative imports, no unused, import order).
- Add a changeset: `feat: migrate SortedMap/SortedSet to capability families`.

---

## 4. Decisions to record

1. **Helper contract:** restore the `mutateEntries` getter (recommended) vs rewrite the
   `*Mutate*` helpers as pure functions.
2. **Alias policy:** keep `@deprecated` aliases now, remove in ticket `10` (recommended) vs
   remove immediately (breaking, forces test rewrites).
3. **Internal layout:** unify map and set on hashed's layout (`internal/<x>/context.ts`,
   no `creators.ts`, no `context-factory.ts`) vs leave the current asymmetry.
4. **Set base composition:** whether `SetCollectionNonEmpty` is required on top of
   `IndexedSortedCollectionNonEmpty` (it supplies the set algebra) — validate by mirroring the
   compiling `SortedSetEmpty` composition.
5. **`SortedBuilder`:** keep the shared abstract builder base (currently has `any`-typed
   `removeAt*` stubs) or fold its logic into each concrete builder as hashed does.

---

## 5. Suggested execution order

```
T6 (settle public contract)
  → T4 (contexts implement ContextApi)
  → T1 (node-helper contract, parallel with T4)
  → T2 + T3 (set/map node hierarchies, parallel)
  → T5 (builders)
  → T7 (tests + type tests)
  → T8 (downstream/shared harness)
  → T9 (verify + changeset)
```

T1 is isolated and can be done first to collapse ~70 errors. T2 and T3 are independent and
can be split between agents. T4/T6 are mutually constraining, so settle the façades before
finalising contexts.

---

## 6. Acceptance (from ticket 08)

- [ ] `SortedMap`/`SortedSet` compose `IndexedKeyedSorted`/`IndexedValuedSorted` +
      `MapCollection`/`SetCollection` + removal capabilities and pass the shared
      map-/set-collection suites.
- [ ] Positional API (`at`/`slice`/`streamSlice`/`removeAt`, negative indices) and
      comparator-range API (`streamRange`/`slice`) behave consistently.
- [ ] `lowerBound`/`upperBound`/`next`/`previous` and `min`/`max` are present with correct
      `NonEmpty` overloads.
- [ ] `comp` is visible on both context and instance, with the concrete comparator type
      preserved.
- [ ] `removeAt` uses order-statistic access with correct no-op behaviour.
- [ ] No stale `findIndex`/`atIndex`/`sliceIndex`/`minKey` names remain un-deprecated
      (removal itself is ticket `10`).
- [ ] `bun run build:seq && bun run typecheck:seq && bun run test` green for `sorted`,
      `collection-types`, `core`.

---

*References:* hashed public façades `hashed/src/public/{map,set}.ts`; hashed internals
`hashed/src/internal/{map,set}/{context.ts,immutable/*,mutable/*}`; collection-types mixins
`collection-types/src/advanced/collection-base.ts`,
`.../advanced/collection/{indexed-base,valued-base,sorted-base,indexed-sorted-base,indexed-keyed-sorted-base}.ts`,
`.../advanced/{map-base,set-base}.ts`; sorted internals
`sorted/src/internal/{map,set}/immutable/*`, `sorted/src/internal/sorted/base.ts`; tickets
`05`, `08`, `10` under `.scratch/collection-capabilities/issues/`.
