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
- [ ] Bulk position options and duplicate-source rules are implemented for ordered maps and sets.
      — **NOT DONE.** No `setAll`/`addAll` exists on the current surface; the bulk method is `addEach`.
      Adding the `position` option requires an ordered-local overload/override of `addEach`.
- [~] Mutable builders mirror the ordered vocabulary and position options.
      — vocabulary done (`at`/`first`/`last`/`indexOf`/`prepend`/`append`/`prependEach`/`appendEach`/
      `placeAt`/`moveTo`/`swapAt`/`removeAt`/`removeAmountAt`/`removeAllAt`); **position options NOT DONE**.
- [~] Deterministic boundary tests and randomized model tests pass for every Ordered variant.
      — deterministic suite added (`test/ordered-indexed.test.ts`, 15 cases, map + set); **randomized
      Array+Map model tests NOT DONE**.

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
