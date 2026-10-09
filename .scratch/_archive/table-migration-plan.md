# Plan: Migrate `@rimbu/table` to the capability/Family style

**Goal:** Move `@rimbu/table` onto the capability-based API in
`@rimbu/collection-types`, joining the migrated set
(hashed, sorted, ordered, proximity, list, bimap, multimap, multiset,
bimultimap). `graph` is the only remaining holdout.

**Reference (already migrated, use as templates):**
- `.scratch/multiset-migration-plan.md` — closest in shape: a package whose
  variant types collapsed into contexts.
- `.scratch/bimap-migration-plan.md` — fullest plan; shows the
  package-local capability namespace and the `*AndReturn` convention.
- `packages/multiset/src/advanced/multiset-base.ts` — the local
  `Advanced.{Api,BuilderApi,ContextApi,FamilyBase}` + `Capability.WithX`
  pattern this plan copies verbatim.

**Baseline gate (from the bimap plan §1, and it is load-bearing here):**
`packages/table` **does not compile today.** `tsc -p tsconfig.json --noEmit`
reports 36 errors (20×TS2344, 8×TS2339, 4×TS2430, 4×TS2345). Cause:
`TableBase.Types` binds `rowMap` / `rowContext` / `columnContext` to the legacy
`RMap` / `RMap.Context` slots, which `@rimbu/hashed` and `@rimbu/sorted`
deleted when they migrated. This migration is a **repair**, not a refactor —
the package cannot be released until it lands.

**Hard switch:** big bang, no aliases, no deprecation shims. Breaking change
(`major` changeset). No `Variant*` legacy surface, no `RMap` references, no
`WithValueResult`.

**Explicitly not this change:** a column axis (`columnMap`, `hasColumn`,
`removeColumn`, `amountColumns`); `test-random/`; any new capability in
`@rimbu/collection-types`.

---

## 0. Current state (measured)

| Metric | Value |
|---|---|
| `src/` | 5 766 lines across 12 files, 3 tiers absent (`no src/advanced/`) |
| `internal/types.ts` | 1 175 lines of hand-rolled HKT base interfaces |
| `internal/base.ts` | 893 lines, 3 classes in one file |
| Public method count | 35 on the variant tier + 8 on the invariant tier |
| Runtime tests | 4 adapters × 1 harness (59 `it`, 231 asserts) = 236 executed |
| Type tests | 5 `test-d` files, **431 `expectTypeOf` calls**, 4 near-identical |
| Capability adoption | none; zero `Family`, `WithMixin`, or `Capability` references |

## 1. The shape gap (why this is a migration, not a cleanup)

`plans/collection-capabilities.md` names Table exactly twice: as a non-goal
("*MultiMap, MultiSet, Table, BiMap, BiMultiMap, and Graph need separate
semantic audits*", `:32-33`) and as a "compile-only mechanical renaming" target
(`:751-758`). The semantic audit it defers is what this plan records.

The gap: **`Collection.Advanced.FamilyBase<E>` admits a 2-tuple keyed element
only.** `KeyedCollection<K,V>` binds `E = readonly [K, V]` unconditionally
(`keyed.ts:58-63`); `get`/`has`/`streamKeys`/`streamValues` all assume exactly
two coordinates. Table's element is `readonly [R, C, V]` — a cell. There is no
`KeyedCollection3`, and the plan document is silent on triples.

Everything 2-D therefore has to be a package-local capability, exactly as
`MultiSetCollection` / `MultiMapCollection` / `BiMapCollection` are.

---

## 2. Settled decisions

| # | Decision |
|---|---|
| Q1 | **Model B — flat-triple `Collection`.** `Table<R,C,V>` is `Collection<readonly [R,C,V]>` rooted at `Collection.Advanced.FamilyBase<readonly [R,C,V]>`, plus a package-local `TableCollection.Capability.*` suite in a new `src/advanced/` tier. **No new capability is added to `collection-types`.** Rejected: nested-keyed `MapCollection<R, Map<C,V>>` (rewrites every cell-shaped member — `stream`/`forEach`/`filter`/`toArray`/`toJSON` would emit `[R, Map<C,V>]`; `mapValues(value,row,column)` has no home); new upstream 3-keyed root (still needs every real capability locally, plus a new upstream concept for one consumer). |
| Q2 | **Collapse the four variant types into one `Table<R,C,V>`.** `HashTableHashColumn`, `HashTableSortedColumn`, `SortedTableHashColumn`, `SortedTableSortedColumn` survive as `Table.Context` consts with their subpaths unchanged. Precedent: `VariantMultiMap` deleted (multimap Q7); `MultiSet`/`HashMultiSet`/`SortedMultiSet` → one type + contexts (multiset D1); BiMultiMap → contexts (Q1). |
| Q3 | **Delete `VariantTable` and `src/internal/variant.ts`**, plus the `export * from '#table/variant'` in `src/table.ts:9`. It is a concrete public type with no creators at all — no const, no context, no construction path — and `VariantMultiMap` was deleted rather than migrated. ~60 of `test-d/table.test-d.ts`'s 139 assertions pin the covariant/invariant split and go with it. |
| Q4 | **Adopt only the semantically clean shared capabilities**: `filter`, `add`, `addEach`, `toBuilder`, `mutate`, `reducer`, `recompose`. **Ban wholesale**, with rationale written into `packages/table/AGENTS.md`: `KeyedCollection`, `ValuedCollection`, `IndexedCollection`, `SortedCollection`. Rationale, mirroring `multimap/AGENTS.md` §"Family / HKT" and bimultimap §3 ("*single-value ops do not survive sets*"): a cell's operands are 2-D and no shared capability is expressed in those terms. |
| Q5 | **Delete `Row` / `WithRow` from `collection-types`; add nothing upstream.** `Row` (`internal/common/types.ts:49-62`) is three phantom HKT slots with no family counterpart, redundant under a `Family` (which carries `_NEW_E`), and used by **exactly one file in the repo** — `packages/table/src/internal/types.ts`. Its name also collides head-on with table's own vocabulary: `WithRow<Tp,R,C,V>['rowMap']` reads "with a row" but means "with the row-*key* type", while a row in table *is* a `Map<C,V>`. |
| Q6 | **Renames (see §3).** Drop `toJSON`. |
| Q7 | **Delete `removeAndGet` / `removeRowAndGet`; `remove(row, column)` returns nothing.** Deferred, target shape committed to `*AndReturn` + `Op.WithResult` — see §6. Also delete `WithValueResult` (see §5). |
| Q8 | **Triple-family with local coordinate slots.** `TableCollection.Advanced.FamilyBase<R,C,V>` extends `Collection.Advanced.FamilyBase<readonly [R,C,V]>` and adds `_NEW_R`/`_NEW_C`/`_NEW_V` and `_UPPER_R`/`_UPPER_C`/`_UPPER_V`, mirroring `KeyedCollection.Advanced.FamilyBase<K,V>` (`keyed.ts:97-120`, which adds `_NEW_K`/`_NEW_V`/`_UPPER_K`/`_UPPER_V` plus `_REMOVED_AT_KEY`/`_FOUND_AT_KEY`). |
| Q9 | **Do not add a column axis.** Columns stay an implementation detail of the row maps. `packages/table/AGENTS.md` currently falsely advertises `removeColumn` and `columnMap` — they never existed; that text is corrected here. File the column axis separately. |
| Q10 | **`rowMap` widens** to `MapCollection<R, MapCollection.NonEmpty<C,V>>` (`MapCollection.NonEmpty<…>` on `NonEmpty`) — multiset's `countMap` trade, D3. **`Table` value stays `createContext`-only** (no `defaultContext`, so `HashTableHashColumn` is not made redundant). **`typeTag: 'Table'` uniformly.** **Create `src/advanced/`** and add `"./advanced/*"` to `exports` plus `#table/advanced/*` to `tsconfig.common.json`. |
| Q11 | **Harness moves into `test/`; four per-variant `test-d` files deleted, one canonical suite kept; `checklock` fixed; no `test-random/`.** |

---

## 3. Method table

`Free` = inherited from the shared base; `Local` = a new
`TableCollection.Capability.*`. `E = readonly [R, C, V]`.

### 3.1 `Table<R, C, V>` (collection)

| today | after | source |
|---|---|---|
| `rowMap` | `rowMap` | local `WithRowMap` (widened type, Q10) |
| `amountRows` | `amountRows` | local `WithRowMap` |
| `isEmpty` / `size` | same | `Free` (`Collection.Advanced.Api`) |
| `nonEmpty` / `assumeNonEmpty` / `asNormal` | same | `Free` |
| `stream()` | same | `Free` |
| `streamRows()` | same | local `WithStreamRows` |
| `streamValues()` | same | local `WithStreamValues` |
| `context` | same | `Free` |
| `forEach(f, {state})` *(3-arity)* | `forEach(f)` *(1-arity)* | `Free` — **split forced** |
| — | `forEachIndexed(f, {state})` | `Free` — carries the old 3-arity signature |
| `filter(pred, {negate})` *(3-arity)* | `filter(pred, {negate})` *(1-arity)* | `Collection.Capability.WithFilter` — **split forced** |
| — | `filterIndexed(pred, {negate?, indexOffset?})` | `Free` |
| `at(row, column)` | `get(row, column)` | local `WithGet` |
| `at(row, column, otherwise)` | `get(row, column, otherwise)` | local `WithGet` (`OptLazy` overload retained) |
| `hasValueAt(row, column)` | `has(row, column)` | local `WithHas` |
| `hasRowKey(row)` | `hasRow(row)` | local `WithRowMap` |
| `rowAt(row)` | `getRow(row)` | local `WithRowMap` |
| `mapValues(f)` | `mapValues(f)` | local `WithMapValues` (3-arity `(value, row, column)`) |
| `filterRows(pred, {negate})` | same | local `WithFilterRows` |
| `set(row, column, value)` | same | local `WithSetAt` |
| `modifyAt(row, column, options)` | `modify(row, column, options)` | local `WithModify` |
| `updateAt(row, column, update)` | `update(row, column, update)` | local `WithUpdate` |
| `remove(row, column)` | `remove(row, column)` | local `WithRemoveAt` — **returns nothing** |
| `removeRow(row)` | same | local `WithRemoveRow` |
| `removeRows(rows)` | same | local `WithRemoveRow` |
| `removeEntries(entries)` | `removeEach(entries)` | local `WithRemoveEach` |
| `removeAndGet(...)` | — | **deleted** |
| `removeRowAndGet(...)` | — | **deleted** |
| `addEntry(entry)` | `add(entry)` | `Collection.Capability.WithAdd` |
| `addEntries(source)` | `addEach(source)` | `Collection.Capability.WithAddEach` |
| `toBuilder()` | same | `Collection.Capability.WithToBuilder` (free on empty seed) |
| — | `mutate(f)` | `Collection.Capability.WithMutate` (free on empty seed) |
| `toArray()` | same | `Free` |
| `toString()` | same | tag becomes `'Table'` |
| `toJSON()` | — | **deleted** (bimap, bimultimap precedent) |

### 3.2 `Table.Context<UR, UC>`

| today | after | source |
|---|---|---|
| `typeTag` | `typeTag: 'Table'` | local; uniform (multiset D2) |
| `rowContext` | `rowContext` | new `_ROW_CONTEXT` slot |
| `columnContext` | `columnContext` | new `_COLUMN_CONTEXT` slot |
| `empty` / `of` / `from` | same | `Free` (`Collection.Advanced.ContextApi`) |
| `builder` | same | `Free` |
| `reducer(source?)` | same | `Collection.Capability.WithReducer` |
| — | `defaultContext` | `Free` (context tier only, see below) |
| `_fixedKeys` / `_types` | — | **deleted** — replaced by the `Family` slots |

**On `defaultContext`.** The shared `ContextApi` requires it, and the four
variant consts get it free. The root `Table` const does **not** expose it: the
generic table has no default row/column backing, which is precisely why it
requires two contexts to be supplied. Giving it one would invent a policy the
current API deliberately refuses to pick, and would make `HashTableHashColumn`
exactly redundant. So `Table` keeps `createContext`-only; each variant const is a
full `Table.Context<any, any>` (multiset D5, bimultimap Q1).

### 3.3 `Table.Builder<R, C, V>`

| today | after | source |
|---|---|---|
| `size` / `isEmpty` | same | `Free` |
| — | `context` | `Free` (new) |
| — | `forEach(f)` / `forEachIndexed(f, {state})` | `Free` (renamed split) |
| — | `clear()` | `Free` (new) |
| `get(row, column)` | `get(row, column)` | local `WithGet.BuilderApi` |
| `getRow(row)` | `getRow(row)` | local `WithRowMap.BuilderApi` |
| `hasValueAt` / `hasRowKey` | `has` / `hasRow` | local |
| `set` | `set` | local `WithSetAt.BuilderApi` |
| `addEntry` / `addEntries` | `add` / `addEach` | `WithAdd.BuilderApi` / `WithAddEach.BuilderApi` |
| `remove(row, column)` | `remove(row, column)` | local `WithRemoveAt.BuilderApi` — returns `V \| undefined` + `OptLazy` overload |
| `removeRow` / `removeRows` / `removeEntries` | `removeRow` / `removeRows` / `removeEach` | local |
| `modifyAt` | `modify` | local `WithModify.BuilderApi` |
| `updateAt` | `update` | local `WithUpdate.BuilderApi` |
| `build()` | `build()` | `Free` |
| `buildMapValues(f)` | `buildMapValues(f)` | local `WithMapValues.BuilderApi` |

Note the builder keeps a **returning** `remove` (`V | undefined`), unlike the
immutable collection. That asymmetry is intended and matches every other Rimbu
builder; the builder is mutable, so there is no "result collection" to return.

### 3.4 Deliberate API losses (each needs a line in the changeset)

| Loss | Precedent / reason |
|---|---|
| `toJSON` | bimap Q16, bimultimap §"Removed". Nothing in the shared base carries it. |
| `removeAndGet` / `removeRowAndGet` | bimap removed every `*AndGet`; `Op.WithResult` supersedes the tuple. Deferred target shape in §6. |
| `VariantTable` (covariant read-only tier) | `VariantMultiMap` deleted. No creators existed. |
| Four public variant *types* | multiset D1. The four consts remain. |
| `rowMap` per-variant narrowing | multiset D3 `countMap`, which it called "the one *visible* API loss". Now `MapCollection<R, MapCollection.NonEmpty<C,V>>` everywhere. |
| `remove`/`removeRow`/`removeRows` `*AndGet` value arm | superseded by `Op.WithResult.hasChanged`, which `WithValueResult` made you compute by hand. |

---

## 4. `collection-types` changes (deletions only)

Per Q5 this plan adds nothing. Three deletions:

1. **`Row` / `WithRow`** — `packages/collection-types/src/internal/common/types.ts:43-72`,
   re-exported via `advanced/common.ts:1-3` as
   `@rimbu/collection-types/advanced/common`. Sole consumer:
   `packages/table/src/internal/types.ts`. Also remove the two doc rows in
   `packages/collection-types/README.md:76-77`.
2. **`WithValueResult`** — `packages/common/src/public/types.ts:49-65`.
   Consumers are all dead or being removed:
   - `packages/table/src/{internal/types.ts,internal/base.ts}` — the
     `*AndGet` methods go away per Q7.
   - `packages/collection-types/src/advanced/map/base.ts:194, 579, 668` — the
     legacy `RMapBase` `removeKeyAndGet` / `updateAtAndGet`. This file is
     already targeted by issue 10 ("remove temporary aliases"); if issue 10 lands
     first, remove them there instead. **Do not let this block the table diff.**
   - `packages/hashed/test-d/map.test-d.ts` and `packages/sorted/test-d/map.test-d.ts`
     — line 1 of both is `// @ts-nocheck legacy RMap variance checks suppressed
     until 10`. **These 431 `expectTypeOf` calls are currently inert.** They
     already assert against the removed legacy `RMap` and against
     `WithValueResult` for a method (`removeKeyAndReturn`) whose real return type
     is `Op.DynamicResult`. `hashed` typechecks clean *because* of the
     `@ts-nocheck`. Do not treat them as coverage; issue 10 owns rewriting them.
3. **`_fixedKeys` / `_types`** on the table context — local to table, not upstream.

`Op.WithResult` / `Op.DynamicResult`
(`collection-types/src/public/types.ts:21-35`) are **kept** and become the target
shape for §6. Seven methods already use them: `removeKeyAndReturn`,
`updateAtKeyAndReturn`, `spliceAtAndReturn`, `removeAtAndReturn`,
`updateAtAndReturn`, `setAtAndReturn`, `swapAtAndReturn`.

---

## 5. `packages/table` layout

```
src/
├── table.ts                    # Table interface + Advanced + creators
├── advanced/                   # NEW — exports["./advanced/*"]
│   └── table-base.ts           # TableCollection namespace: Capability.*,
│                               # Advanced.{FamilyBase,Family,Api,BuilderApi,
│                               # ContextApi}; re-exports the abstract bases
├── public/
│   ├── hash-row/{hash-column,sorted-column}.ts
│   └── sorted-row/{hash-column,sorted-column}.ts
└── internal/
    ├── common/base.ts          # abstract Empty/NonEmpty/Builder bases
    ├── immutable/{empty,non-empty}.ts
    ├── builder.ts
    ├── context-factory.ts
    ├── creators.ts
    └── row-map.ts              # nested Map<R, Map.NonEmpty<C,V>> storage
```

`package.json`: add `"./advanced/*"` → `{"types": "./dist/advanced/*.d.ts",
"default": "./dist/advanced/*.js"}`. `tsconfig.common.json`: add
`"#table/advanced/*": ["./src/advanced/*.ts"]`.

The 3 implementation classes currently share `internal/base.ts` (893 lines);
split them as above to match `hashed`/`sorted`/`multimap`.

---

## 6. Deferred: `*AndReturn`

Committed shape, not implemented in this change. Recorded here so the question
is not re-litigated a third time.

| future method | signature |
|---|---|
| `removeAndReturn` | `removeAndReturn(row: RelatedTo<R,UR>, column: RelatedTo<C,UC>): Op.DynamicResult<Tp['_SELF'], undefined, V, Tp['_NORMAL']>` |
| `removeAndReturn` (fallback) | `… otherwise: OptLazy<O>): Op.DynamicResult<Tp['_SELF'], O, V, Tp['_NORMAL']>` |
| `removeRowAndReturn` | `removeRowAndReturn(row: RelatedTo<R,UR>): Op.DynamicResult<Tp['_SELF'], undefined, MapCollection<C,V>, Tp['_NORMAL']>` |

Why `*AndReturn` + `Op.WithResult`, not `*AndGet` + `WithValueResult`:

- `*AndReturn` is the naming convention the migrated capability suite already
  uses in **seven** places (listed in §4).
- `Op.WithResult` carries `hasChanged` as a **first-class field**.
  `WithValueResult`'s own doc comment states the opposite is the norm:
  "*It does **not** indicate whether the collection changed… To detect whether
  the collection actually changed, compare the result with the original
  collection via `result[0] === this`*" (`common/src/public/types.ts:51-58`).
  That is strictly less information, and for a table it matters — removing the
  last cell of a row changes `amountRows` while `size` falls by one.
- `hasResult: false` already encodes "the cell was not present", so a table
  needs no fourth piece of information beyond what the map version has.
- `NonEmpty` is forced in both arms, mirroring the bimultimap note (§4 of that
  plan): removing a cell from a non-empty table cannot produce an empty table,
  and removing a row cannot either.

---

## 7. Data-model invariants (from the pre-migration implementation — do not break)

Verified against `src/internal/base.ts` at plan time. Each is a behavioural
contract the 431 (currently inert) type tests and the runtime harness rely on.

1. **Storage is exactly two fields.** `TableNonEmpty` holds
   `rowMap: Map.NonEmpty<R, Map.NonEmpty<C, V>>` and `size: number`
   (`base.ts:157-163`). `size` is the **cell** count, not the row count.
2. **Inner row maps are always non-empty.** Enforced by the type *and* the
   implementation: a row is pruned when its last cell goes, in
   `modifyAt` (`base.ts:277-279`, `if (!newRow.nonEmpty()) return remove;`),
   in `removeAndGet` (`base.ts:368-370`), and in `Builder.remove`
   (`base.ts:699`, `if (columnMap.isEmpty) this.rowMap.removeKey(row)`).
   **Never store an empty value set.** This is what makes the
   `MapCollection.NonEmpty` inner type in `rowMap` an invariant rather than an
   approximation.
3. **Identity on no-op.** `copy`/`copyE` return `this` when the new `rowMap` is
   reference-identical (`base.ts:173-186`). `modifyAt` returns `this` when
   `checkEmptyModifyOptions` says both `ifNew` and `ifExists` are absent
   (`base.ts:261`) and propagates the inner `remove` sentinel unchanged.
   `filter` short-circuits to `this` when the builder size is unchanged
   (`base.ts:453-464`).
4. **`modify` is implemented *via* nested `modify`.** `modifyAt` delegates to
   `rowMap.modifyAt(row, {ifExists: {update: …}})` and threads a `newSize`
   counter (`base.ts:259-306`). The `create` branch honours the skip token so
   a `create` that returns the token leaves the table untouched.
5. **Key validity is checked before removal.** `removeAndGet`/`removeRowAndGet`
   bail out on `!context.rowContext.isValidKey(row)` /
   `!columnContext.isValidKey(column)` (`base.ts:350-353`, `389-390`), and
   `updateAt` guards the same way (`base.ts:308-319`). Post-migration the same
   guard must run before `isValidKey` is used to build a map key.
6. **Builder mutators all call `checkLock()`** (`base.ts:622, 668, 678, 709,
   725, 733, 745, 805`), which throws
   `RimbuError.throwModifiedBuilderWhileLoopingOverItError()`.
7. **Builder `forEach` locks in `try`/`finally`** (`base.ts:835-858`). The
   in-file comment is load-bearing: *"`finally` is load-bearing: `f` is user code
   and may throw, including via the `halt` plumbing. Without it the lock leaks
   and every later mutation on this builder is rejected forever."* This matches
   root `AGENTS.md` §9 and must survive the rename to `forEachIndexed`.
8. **The builder is copy-on-write against `source`.** `source` is set to
   `undefined` by the first real mutation (`base.ts:659`, `704`), and `build()`
   returns the untouched `source` when it is still defined
   (`base.ts:861-862`). Reads delegate to `source` while it is live
   (`base.ts:583-619`).
9. **`Builder.set` reports `changed` by `Object.is`** (`base.ts:648-651`) and
   returns `false` when re-setting an identical value, leaving `source` intact.
10. **`Builder` members are arrow-function properties**, not prototype methods
    (`base.ts:540+`), so `this` survives destructuring. Preserve this when
    splitting the file, or the lock/`source` invariants break.

---

## 8. Steps

Status legend: `[ ]` open · `[x]` done

- [ ] **1.** Baseline: confirm the 36 typecheck errors are exactly the ones
      listed above before changing anything (plan §Baseline).
- [ ] **2.** `collection-types`: delete `Row` / `WithRow`; remove the
      `README.md:76-77` doc rows. Delete `WithValueResult` from
      `common/src/public/types.ts` and its references in
      `collection-types/src/advanced/map/base.ts`. **Re-run `build:seq` —**
      cross-package `dist/*.d.ts` must be current or every downstream
      typecheck is misleading (root `AGENTS.md` §9).
- [ ] **3.** `packages/table`: add `src/advanced/table-base.ts` with
      `TableCollection.{Capability.*, Advanced.*}` per §2 Q4/Q8/Q10. Add
      `"./advanced/*"` to `exports` and `#table/advanced/*` to
      `tsconfig.common.json`.
- [ ] **4.** Declare `Table.Advanced.Family<R,C,V>` in `src/table.ts`, pinning
      `_NORMAL` / `_NON_EMPTY` / `_BUILDER` / `_CONTEXT`, `_UPPER_E:
      readonly [any,any,any]`, `_INVARIANT: (e: readonly [R,C,V]) => readonly [R,C,V]`,
      `_ROW_CONTEXT`, `_COLUMN_CONTEXT`, and `_NEW_FAMILY:
      Family<this['_NEW_R'], this['_NEW_C'], this['_NEW_V']>`. Name it — do not
      assemble it as an intersection of `Capability.*` families (root
      `AGENTS.md` §6.4, and `review-api` rule `family-adhoc-intersection`).
- [ ] **5.** Split `internal/base.ts` into `common/base.ts`,
      `immutable/{empty,non-empty}.ts`, `builder.ts`, `row-map.ts`. Use the
      `WithMixin` chain (as `hashed`/`sorted`/`multiset` do) so the shared base
      supplies `filter` / `mutate` / `toBuilder` / `context` / `stream` free.
      Honour all ten invariants in §7.
- [ ] **6.** Apply the §3 method table to the collection, builder and context.
      Delete `removeAndGet` / `removeRowAndGet` / `toJSON`. Delete
      `src/internal/variant.ts` and its re-export (Q3).
- [ ] **7.** Collapse the four variants: each `public/*/*.ts` becomes a
      `Table.Context<any, any>` const with `typeTag: 'Table'`. Fix the missing
      `typeTag` literal on `HashTableHashColumn` (Q2/Q10).
- [ ] **8.** Delete `src/internal/types.ts` (1 175 lines) and
      `src/internal/creators.ts`. The root `Table` const stays
      `createContext`-only.
- [ ] **9.** Tests: move `test-utils/table-standard-test.ts` into
      `test/`. Delete the four per-variant `test-d` files; keep one canonical
      `test-d/table.test-d.ts`. Fix the `checklock` block — **fresh builder per
      assertion**, a post-condition that a plain mutation still succeeds, and a
      separate `halt()` case. Add the missing `toString` coverage for the new
      `'Table'` tag.
- [ ] **10.** `packages/table/AGENTS.md`: new three-tier layout, the
      `TableCollection` capability rationale (Q4), the column-axis gap
      correction (Q9), the row-pruning invariant (§7.2), and the `rowMap`
      widening (Q10). Remove the false `removeColumn` / `columnMap` claims.
- [ ] **11.** `README.md`: update every example. Add `@example` JSDoc on every
      new public member (per `review-docs`).
- [ ] **12.** Add a `Table` row to the capability matrix in
      `plans/collection-capabilities.md:887-903` (Phase 7 work item 5) and tick
      `.scratch/collection-capabilities/issues/06-*.md`.
- [ ] **13.** Changeset: `major`, documenting the five deliberate API losses in
      §3.4.
- [ ] **14.** Verify: `bun run build:seq`, then `bun run typecheck:seq`, then
      `bun run biome:check`, then `bun run test` — from the repo root, in that
      order (root `AGENTS.md` §9).

---

## 9. Risks

| Risk | Mitigation |
|---|---|
| `_UPPER_E: readonly [any,any,any]` silently admits `V = never` at context factories | assert `context.empty<R,C,V>()` inference in `test-d`; mirror `HashMap`'s `readonly [K, any]` |
| The 431 inert `expectTypeOf` calls are mistaken for coverage | §4 documents the `@ts-nocheck`; the canonical `test-d` is written fresh, not ported |
| `remove` returning nothing loses the removed value with no replacement | §6 records the committed `*AndReturn` shape and the changeset names it |
| `_fixedKeys` / `_types` removal breaks context merging | `createContext` merge in `context-factory.ts:35-48` reads them today; rework in step 7, not 3 |
| Eight extra family slots cost typecheck time | named `Family` (not an intersection) per root `AGENTS.md` §6.4; run `tune-hkt --measure` before/after |
| Row-pruning invariant broken by a `modify`/`remove` rewrite | §7.2 is the contract; the `checklock` fix in step 9 exercises the builder paths |
| `defaultContext` missing on the root `Table` const looks like an oversight | §3.2 states it is deliberate; note it in `AGENTS.md` |

## 10. Acceptance

- [ ] `packages/table` typechecks and all tests pass; the 36 baseline errors are gone.
- [ ] No `RMap`, `VariantMap`, `RSet`, `Row`, `WithRow`, or `WithValueResult`
      reference remains in `packages/*/src`, `packages/*/test*`, or the emitted
      declarations of `@rimbu/table` (issue 06 checkbox 4).
- [ ] `Table` exposes only capabilities that passed a semantic audit; every
      ban in §2 Q4 is written down with its reason (issue 06 checkbox 3).
- [ ] Every public export has `@example` JSDoc; TypeDoc renders without warnings.
- [ ] `bun run build:seq && bun run typecheck:seq && bun run biome:check && bun run test`
      all pass from the repo root.
- [ ] A `major` changeset documents §3.4.
