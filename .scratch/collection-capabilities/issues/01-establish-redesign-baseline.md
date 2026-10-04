# 01 — Establish Redesign Baseline

**What to build:** Establish a verified baseline for the collection capability redesign, including current build health, public API inventory, and the Ordered variant migration inventory.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] The sequential build, typecheck, Biome checks, and test suite have recorded results.
- [x] Existing baseline failures, if any, are understood and documented.
- [x] Current public method/type names and Ordered variants requiring migration are inventoried.

> **Evidence (verified 2026-10-04).** Baseline recorded in `plans/collection-capabilities.md:656-666`.
> One live baseline failure was later found and is documented: `packages/table`
> does not typecheck (36 errors) because `TableBase.Types` still binds the legacy
> `RMap` slots. Tracked in issue 06 and `.scratch/table-migration-plan.md` §Baseline.
