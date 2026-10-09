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
> 1. ~~**`packages/collection-types/src/advanced/map/base.ts`** — the legacy
>    `RMapBase` file (715 lines) with `removeKeyAndGet` / `updateAtAndGet` and
>    their `WithValueResult` returns.~~ **DONE 2026-10-09.** Deleted together with
>    `advanced/set/base.ts`, both `base-module.ts` files, and
>    `internal/{map,set}/types/{generic,variant}.ts` — the whole `RMap` / `RSet` /
>    `VariantMap` / `VariantSet` surface (~2,300 lines). See
>    `.changeset/remove-legacy-map-set-surface.md` and the root
>    `packages/collection-types/src/collection-types.ts` package doc.
>
>    The **one survivor of that surface is still present**:
>    `packages/collection-types/src/advanced/common/empty-base.ts`, which three
>    graph files still `extend`. Tracked separately as
>    `.scratch/graph-migration/issues/01-delete-legacy-empty-base.md` — it was
>    deliberately left out of the deletion above because graph's own inheritance
>    had to be unwound first, and unwinding it is behaviour-changing.
> 2. ~~**The inert type tests.**~~ **DONE 2026-10-09.** All four
>    (`hashed`/`sorted` × `map`/`set`) are live again. Three of their assertions
>    were wrong and had rotted unnoticed: maps are **invariant** in `V`, not
>    covariant, and `union`'s result is not nominally `Set.NonEmpty` for either
>    receiver shape. Corrected and asserted with `toExtend` where `toEqualTypeOf`
>    could not express the real type.
> 3. **Sorted aliases still present:** `sliceIndex` (2 files), `findIndex` (8 files)
>    in `packages/sorted/src`. `atIndex`/`minKey`/`maxKey`/`hasKey`/`addEntry` are
>    already gone.
> 4. ~~**`packages/collection-types/AGENTS.md:7-29`** documents the
>    pre-capability layout.~~ **DONE 2026-10-09.** Rewritten: full `src/` layout
>    including `public/*` and `advanced/collection/*`, a "Removed" section
>    explaining what went and why, and the named-family rule. The sibling
>    `README.md` was updated in the same pass.
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

---

## Comments

### 2026-10-09 — legacy surface landed; two items moved

`.changeset/remove-legacy-map-set-surface.md` (major, `@rimbu/collection-types` +
`@rimbu/core`) removes the whole `RMap` / `RSet` / `Variant*` tier. Items 1
(partly), 2 and 4 above are closed by it.

Still open here:

- **Item 8** (`MultiSetCreators` `@deprecated` at
  `packages/multiset/src/public/multiset.ts:92`) — **not** done. The graph
  migration's commit 2 scoped "drop the last `@deprecated` in any
  `packages/*/src`", but only the `collection-types` half was actioned.
  Unrelated to legacy removal, so it was left rather than folded in silently.
- **Item 7** (capability matrix missing the eight specialized packages) — still
  open.
- Item 1's **remainder**, plus items 3, 5 and 6, are unchanged.

Graph-plan-specific leftovers that are not this issue's scope are filed under
`.scratch/graph-migration/issues/`: `01-delete-legacy-empty-base.md` (ready),
`02-advanced-api-public-rewiring.md` (needs-triage — a design decision, not
work), `03-advanced-aggregate-docs-exemption.md` (ready).
