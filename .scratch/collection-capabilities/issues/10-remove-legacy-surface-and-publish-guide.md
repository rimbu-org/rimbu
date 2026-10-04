# 10 — Remove Legacy Surface and Publish Migration Guide

**What to build:** Complete the public API redesign by removing temporary aliases, updating exports and documentation, and publishing the migration guidance and major release changeset.

**Blocked by:** 04 — Migrate List Capabilities; 06 — Migrate Specialized Generic Consumers; 07 — Separate Proximity Exact and Nearest Lookup; 08 — Migrate Sorted Collections; 09 — Migrate Ordered Collections

**Status:** ready-for-agent

- [ ] Temporary generic and method aliases are removed from source, tests, and emitted declarations.
- [ ] Core exports, examples, comments, package guides, and capability matrix use the target vocabulary.
- [ ] The migration guide covers List, Map, Sorted, Set algebra, Ordered reordering, and Proximity lookup changes.
- [ ] A major changeset describes the breaking redesign and migration mappings.
- [ ] Repository-wide build, typecheck, Biome, and test commands pass.
- [ ] No deprecated public names remain in the final emitted declarations.

> **Outstanding work inventory (verified 2026-10-04).** This issue is the
> catch-all and is now the largest single item, because 06 and 09 are still open.
>
> 1. **`packages/collection-types/src/advanced/map/base.ts`** — the legacy `RMapBase`
>    file (715 lines) with `removeKeyAndGet` / `updateAtAndGet` and their
>    `WithValueResult` returns. Deleted as part of the Table plan step 2, or here.
> 2. **The inert type tests.** `packages/hashed/test-d/map.test-d.ts` and
>    `packages/sorted/test-d/map.test-d.ts` both carry
>    `// @ts-nocheck … suppressed until 10` at line 1. Their `expectTypeOf` calls
>    verify nothing today — this is the single largest hole in type-level coverage
>    in the repo and it is named in both files.
> 3. **Sorted aliases still present:** `sliceIndex` (2 files), `findIndex` (8 files)
>    in `packages/sorted/src`. `atIndex`/`minKey`/`maxKey`/`hasKey`/`addEntry` are
>    already gone.
> 4. **`packages/collection-types/AGENTS.md:7-29`** documents the pre-capability
>    layout; it omits `advanced/collection/*`, `advanced/collection-base.ts`,
>    `advanced/map-base.ts`, `advanced/set-base.ts`, and `src/public/*`.
> 5. **`Row` / `WithRow`** are removed by the Table plan (step 2), including the two
>    doc rows at `packages/collection-types/README.md:76-77`.
> 6. **`@rimbu/table` is an unused `@rimbu/core` dependency.** It is declared at
>    `packages/core/package.json:93` and as a keyword at `:17`, but there is no
>    `packages/core/src/table.ts` and `src/core.ts` does not re-export it. Either
>    add the entry file or drop the dependency. (`@rimbu/ordered` and
>    `@rimbu/proximity` are in the same position — reachable only transitively via
>    graph — so this is consistent existing practice rather than a new defect.)
> 7. **Capability matrix.** `plans/collection-capabilities.md:887-903` has rows for
>    List, HashSet, HashMap, SortedSet, SortedMap, OrderedSet, OrderedMap and
>    ProximityMap — but none for MultiMap, MultiSet, BiMap, BiMultiMap, Table or
>    Graph. Phase 7 work item 5 (`:812`) requires the matrix to be published; the
>    eight specialized packages are missing from it.
> 8. **MultiSet carries a live `@deprecated`** at
>    `packages/multiset/src/public/multiset.ts:92` (`createContext` moved onto the
>    shared tier). It is the **only** `@deprecated` left in any `packages/*/src`.
