# 06 — Migrate Specialized Generic Consumers

**What to build:** Update specialized collection packages that depend on the generic map/set families so they compile and test against MapCollection and SetCollection without claiming unsupported capabilities.

**Blocked by:** 05 — Migrate Map/Set Families and Hash Collections

**Status:** in-progress — Graph remains

- [ ] BiMap, BiMultiMap, MultiMap, MultiSet, Table, and Graph use the new generic family names.
      — BiMap ✅, MultiMap ✅, MultiSet ✅, BiMultiMap ✅ (family-level only: no `WithMixin`,
        by design — its `get` would have to return a set).
      **Table ✅** — `.scratch/table-migration-plan.md`; root is a flat-triple
      `Collection<readonly [R, C, V]>` plus a package-local
      `TableCollection.Capability.*` suite, because `KeyedCollection<K, V>` binds
      its element to `readonly [K, V]` and a table's element is the *cell*
      `readonly [R, C, V]`.
      **Graph ❌ not started** — the last remaining legacy holdout.
- [x] Their existing supported behavior and type-level contracts remain intact.
      — BiMap / MultiMap / MultiSet / BiMultiMap on their own migrations.
      **Table: 290 runtime tests (1442 assertions) across all four contexts, plus a
      fresh canonical `test-d` suite; `build` + `typecheck` + `biome:check` clean.**
      Three defects were found by the rewrite and fixed: `TableEmpty.streamValues`
      was missing entirely (runtime throw, `tsc` satisfied), `TableBuilder.clear`
      skipped the traversal lock, and `TableBuilder.modify` checked the lock after
      its empty-options early return.
- [x] No specialized collection claims a capability that has not passed a semantic audit.
      — Each documented its refusals: `multimap/AGENTS.md` bans `ValuedCollection`
      outright and refuses `WithGet`; `bimultimap` §3 tabulates five deviations
      ("*single-value ops do not survive sets*"); `table/AGENTS.md` bans
      `KeyedCollection`, `ValuedCollection`, `IndexedCollection` and
      `SortedCollection` with a reason each.
- [ ] Package and repository builds find no stale generic map/set type references in these consumers.
      — Clean for the four migrated packages and for **Table** (`Row`/`WithRow`
      deleted from `collection-types`; `WithValueResult` deleted from `common`).
      **Blocked on Graph.**

> **Pre-existing failures elsewhere in the repo** (not caused by these migrations;
> re-verified 2026-10-04, all independent of `WithValueResult` / `Row`):
> `@rimbu/graph` does not build at all (64 `tsc` errors, legacy `RMap` slots);
> `packages/list/test-types/family.ts` expects `Advanced.Types` /
> `Advanced.TypesNonEmpty` that the capability rewrite removed (39 errors);
> `packages/deep/test/patch.test.ts` still calls the renamed `with` (1 error).
> Because `scripts/run-workspace-serial.ts` aborts on the first failure,
> `bun run build:seq` / `typecheck:seq` cannot currently reach a clean tree because
> of **graph**, which sits at position 16 of 23.