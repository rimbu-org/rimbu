# 09 — Migrate Ordered Collections

**What to build:** Make every OrderedMap and OrderedSet variant support indexed identity access, synchronized order editing, bulk position options, builder parity, and model-tested immutable semantics.

**Blocked by:** 08 — Migrate Sorted Collections

**Status:** ready-for-agent

- [x] All Ordered variants compose indexed identity, removal, swapping, order-editing, and reordering capabilities.
      — `OrderedMap` adopts `IndexedCollection.Advanced.Api` + `WithPrependAppend` + `WithRemoveAt` +
      `WithSwapAt` + `indexOf` + `placeAt`/`moveTo`; `OrderedSet` adopts `IndexedValuedCollection.Advanced.Api`
      + the same edit capabilities. New `collection-types` advanced base
      `advanced/collection/indexed-keyed-base.ts` supplies the keyed indexed mixin
      (the non-keyed generic one cannot wrap a keyed constructor).
- [x] Positional reads delegate through the indicator SortedMap while preserving dual-map invariants.
      — `at`/`first`/`last`/`take`/`drop`/`slice`/`streamSlice`/`splitAt`/`indexOf` all delegate to
      `indicatorKeyMap`; edits rebuild whichever map is not the source of truth.
- [x] Set, update, modify, prepend, append, place, move, remove, and swap semantics preserve identity and payload rules.
      — ordinary `set`/`add`/`updateAtKey`/`modifyAtKey` keep indicators; `moveTo` keeps payload; no-op and
      already-satisfied edits return the receiver.
- [x] Bulk position options and duplicate-source rules are implemented for ordered maps and sets.
      — `OrderedBulkOptions { position?: 'preserve' | 'append' | 'prepend' }` exported from
      `@rimbu/ordered/map`; `addEach(entries, options?)` overloaded on `OrderedMap`/`OrderedSet`.
      `preserve` is the default; `append`/`prepend` move supplied identities as one block in source order;
      first occurrence fixes relative position, last supplies the map value; empty source returns the
      receiver. (The plan's `setAll`/`addAll` names do not exist on the current surface — the bulk method
      is `addEach`.)
- [x] Mutable builders mirror the ordered vocabulary and position options.
      — `addEach(entries, options?)`, `at`/`indexOf`/`first`/`last`, `prepend`/`append`/`prependEach`/
      `appendEach`, `placeAt`/`moveTo`/`swapAt`, `removeAt`/`removeAmountAt`/`removeAllAt`.
- [x] Deterministic boundary tests and randomized model tests pass for every Ordered variant.
      — deterministic suite `test/ordered-indexed.test.ts` (19 cases, map + set); randomized
      Array/Map-model suite `test-random/ordered-model.test.ts` (5 seeds × 2000 steps × map + set,
      ~328k assertions); `test:random` script + `test-random` tsconfig include added.

> **Status 2026-10-09: complete for the checklist above.** `ordered` build/typecheck/test/test:random
> clean; `core` typecheck clean; `biome check src` exits 0 (warnings only).
>
> Known gaps deliberately left out of scope:
> - No `reversed()` / `stream({ reversed })` reverse-collection projection (only
>   `streamSlice(range, { reversed })` is supported).
> - No relabeling of unbounded rational `Indicator` values (per the plan's storage contract).

> **Correction (verified 2026-10-04).** This issue was previously left at
> `ready-for-agent`, which understated the position: the *structural* migration has
> landed, but the *ordered-specific* work has not started at all.
>
> Landed: `OrderedMap.Advanced.Family` / `OrderedSet.Advanced.Family`
> (`packages/ordered/src/public/{map,set}.ts:91`), `WithMixin` chains, and both
> packages typechecking.
>
> Not started: `OrderedMap.Advanced.Api` extends `MapCollection.Advanced.Api` and
> nothing else (`public/map.ts:76`) — no `IndexedCollection`, no order-edit
> capability. No `swapAt`, `moveTo`, `placeAt`, `prepend`/`append` appears in the
> ordered public surface, and `OrderedBulkOptions` does not exist. There is no
> `test-random/` directory for ordered, so the model-test requirement is entirely
> outstanding.
>
> The plan's Phase 6 gates this on "all Ordered variants pass shared capability
> suites, model tests, and existing generic map/set suites" — none of the
> order-edit half of that has been built.
