# 06 — Migrate Specialized Generic Consumers

**What to build:** Update specialized collection packages that depend on the generic map/set families so they compile and test against MapCollection and SetCollection without claiming unsupported capabilities.

**Blocked by:** 05 — Migrate Map/Set Families and Hash Collections

**Status:** in-progress

- [ ] BiMap, BiMultiMap, MultiMap, MultiSet, Table, and Graph use the new generic family names.
      — BiMap ✅, MultiMap ✅, MultiSet ✅, BiMultiMap ✅ (family-level only: no `WithMixin`,
        by design — its `get` would have to return a set).
      **Table ⏳ in progress** (`.scratch/table-migration-plan.md`).
      **Graph ❌ not started** — the last remaining legacy holdout.
- [x] Their existing supported behavior and type-level contracts remain intact.
      — For the four migrated packages. **Table is a live exception: it does not
      typecheck today** (36 errors), because `TableBase.Types` still binds `rowMap` /
      `rowContext` / `columnContext` to the removed legacy `RMap` slots.
- [x] No specialized collection claims a capability that has not passed its semantic audit.
      — Each documented its refusals: `multimap/AGENTS.md` bans `ValuedCollection`
      outright and refuses `WithGet`; `bimultimap` §3 tabulates five deviations
      ("*single-value ops do not survive sets*").
- [ ] Package and repository builds find no stale generic map/set type references in these consumers.
      — Clean for the four migrated packages. **Blocked on Table and Graph.**

> **Plan of record for Table:** `.scratch/table-migration-plan.md`. Root is a
> flat-triple `Collection<readonly [R, C, V]>` plus a package-local
> `TableCollection.Capability.*` suite — `Collection.Advanced.FamilyBase<E>` admits
> a 2-tuple keyed element only, and `plans/collection-capabilities.md` is silent on
> triples. No new capability is added to `collection-types`.
