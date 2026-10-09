# 05 — Migrate Map/Set Families and Hash Collections

**What to build:** Migrate the generic map/set families and HashMap/HashSet to the new capability vocabulary while preserving concrete, `NonEmpty`, `RelatedTo`, `OptLazy`, context, builder, and reducer behavior.

**Blocked by:** 03 — Build Collection Capability Foundation

**Status:** done

- [x] HashMap and HashSet use MapCollection and SetCollection family types.
- [x] Map and set method renames and set algebra renames are implemented consistently.
- [x] Contexts, builders, reducers, fallback inference, and `NonEmpty` behavior remain correct.
- [x] Shared map/set runtime and type contracts pass for HashMap and HashSet.
- [x] Direct consumers can begin migrating without requiring legacy generic names in new declarations.

> **Evidence (verified 2026-10-04).** `HashMap.Advanced.Family` at
> `packages/hashed/src/public/map.ts:75`, `HashSet.Advanced.Family` at
> `public/set.ts:48`; `WithMixin` chains in all four immutable classes.
> `packages/hashed` typechecks clean and tests pass.
> **Caveat carried into issue 10:** `packages/hashed/test-d/map.test-d.ts:1` and
> `packages/sorted/test-d/map.test-d.ts:1` both begin with
> `// @ts-nocheck legacy RMap variance checks suppressed until 10`. Their
> `expectTypeOf` calls are therefore **inert** — hashed typechecks *because* of
> the suppression, not in spite of it. Do not count them as coverage; issue 10 owns
> rewriting them.
