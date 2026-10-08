# 06 — Migrate Specialized Generic Consumers

**What to build:** Update specialized collection packages that depend on the generic map/set families so they compile and test against MapCollection and SetCollection without claiming unsupported capabilities.

**Blocked by:** 05 — Migrate Map/Set Families and Hash Collections

**Status:** graph compiles, tests, and randomizes — but is only *partly* migrated
(the capability `Api` is not yet the public surface; see "What is still open").

- [x] BiMap, BiMultiMap, MultiMap, MultiSet, Table, and Graph use the new generic family names.
      — BiMap ✅, MultiMap ✅, MultiSet ✅, BiMultiMap ✅ (family-level only: no `WithMixin`,
        by design — its `get` would have to return a set).
      **Table ✅** — `.scratch/table-migration-plan.md`; root is a flat-triple
      `Collection<readonly [R, C, V]>` plus a package-local
      `TableCollection.Capability.*` suite, because `KeyedCollection<K, V>` binds
      its element to `readonly [K, V]` and a table's element is the *cell*
      `readonly [R, C, V]`.
      **Graph ◐ compiles and passes everything** — `.scratch/graph-migration-plan.md`.
      The `advanced/graph-base.ts` capability suite and its family-carrying
      storage aliases are in place and used by all eight concrete families
      (`linkMap` resolves to `HashMap<N, HashSet<N>>` / `SortedMap<N, SortedSet<N>>`,
      and to the valued equivalents). What is *not* done is the final rewiring:
      the public interfaces still extend the internal `VariantGraphBase` /
      `GraphConnect` hierarchy rather than `GraphCollection.Advanced.Api`, so the
      capability aggregates do not yet reach users. See "What is still open".
- [x] Their existing supported behavior and type-level contracts remain intact.
      — BiMap / MultiMap / MultiSet / BiMultiMap on their own migrations.
      **Table: 290 runtime tests (1442 assertions) across all four contexts, plus a
      fresh canonical `test-d` suite; `build` + `typecheck` + `biome:check` clean.**
      Three defects were found by the rewrite and fixed: `TableEmpty.streamValues`
      was missing entirely (runtime throw, `tsc` satisfied), `TableBuilder.clear`
      skipped the traversal lock, and `TableBuilder.modify` checked the lock after
      its empty-options early return.
      **Graph: 481 runtime tests (2097 assertions), a per-variant `test-d`
      covering all eight concrete families, and a new `test-random/` differential
      suite; `build` + `typecheck` + `test` + `test:random` + `biome:check` clean.**
      The randomized suite found two defects the set-comparison harnesses could not
      reach, both fixed and pinned in `packages/graph/test/regression.test.ts`:
      `connectionSize` drifted upwards after `removeNode` on a directed graph (only
      incoming arcs were subtracted), and `Builder.forEach` emitted a spurious
      isolated-node element for every *connected* node, so it disagreed with
      `Builder.build().stream()`.
- [x] No specialized collection claims a capability that has not passed a semantic audit.
      — Each documented its refusals: `multimap/AGENTS.md` bans `ValuedCollection`
        outright and refuses `WithGet`; `bimultimap` §3 tabulates five deviations
        ("*single-value ops do not survive sets*"); `table/AGENTS.md` bans
        `KeyedCollection`, `ValuedCollection`, `IndexedCollection` and
        `SortedCollection` with a reason each; `graph/AGENTS.md` bans
        `KeyedCollection`/`ValuedCollection`/`IndexedCollection` and refuses
        `WithFilter` (twice over) and the element re-typing transforms, whose
        `ReTyped` pivots on `_NEW_E` into a `_NEW_FAMILY` keyed on the *node* type.
- [ ] Package and repository builds find no stale generic map/set type references in these consumers.
      — Clean for the four migrated packages and for **Table** (`Row`/`WithRow`
        deleted from `collection-types`; `WithValueResult` deleted from `common`).
      **Graph's own `src/` is clean** — no `RMap`, `RSet`, `VariantMap`,
        `VariantSet`, `hasKey`, `updateAt`, or `defaultContext()` call sites remain.
        The legacy `RMap`/`RSet` surface itself still exists in
        `collection-types/src/advanced/{map,set}/base.ts`, but nothing in
        `@rimbu/graph` references it; deleting it is issue 10's commit 2.

## What is still open in graph

1. **Wire the public families onto the capability aggregates.** `ArrowGraphHashed`,
   `EdgeGraphSorted`, and the six other concrete families still extend
   `VariantGraphBase`/`GraphConnect`. They should extend
   `GraphCollection.Advanced.Api` / `.NonEmptyApi` / `.BuilderApi` / `.ContextApi`.
   A user-visible symptom: the capability `Api` declares `toArray()` and
   `forEachIndexed()`, but **graphs have no `toArray()`** today (use
   `stream().toArray()`).
2. **Delete the `Variant*` tier** — `internal/variant-base.ts` and
   `internal/valued/variant-base.ts`. Follows automatically from (1).

Plan: `.scratch/graph-migration-plan.md` §2.3 and §2.7.

> **Pre-existing failures elsewhere in the repo — now all resolved.**
> Re-verified 2026-10-08: `bun run build:seq` builds all 23 packages,
> `bun run typecheck:seq` is clean across all 22, and `bun run test` /
> `bun run test:random` / `bun run biome:check` all exit 0.
>
> What these were, for the record:
> - `@rimbu/graph` did not build (**72** `tsc` errors, not the 64 recorded
>   earlier, plus 57 legacy method-name call sites).
> - `packages/list/test-types/family.ts` expected `Advanced.Types` /
>   `Advanced.TypesNonEmpty` that the capability rewrite removed, and 30 more
>   errors sat in `packages/list/test/` (`ListContext`'s type parameter is now the
>   *family*, not the element type; `stream({reversed})` became
>   `streamSlice(range, {reversed})`; `List` is invariant, not covariant).
> - `packages/deep/test/patch.test.ts` called the renamed `with` (now `setAt`).
>
> Because `scripts/run-workspace-serial.ts` aborts on the first failure, the graph
> breakage had been hiding three *further* build failures downstream that nobody
> had seen: `@rimbu/multimap` (set-algebra operands narrowed to the concrete
> `MultiMap`, inverting contravariance against the capability's abstract operand),
> `@rimbu/multiset` (`createContext` bridging two unrelated `UT`/`UT2` generics),
> and `@rimbu/bimultimap` (`createContext` options declared without `| undefined`,
> which `exactOptionalPropertyTypes` rejects).