---
severity: medium
impact: cross-package
complexity: medium
pass: api
package: ordered
confidence: high
effort_estimate: 1d
title: "OrderedMap/OrderedSet lack the positional/order methods present on SortedMap/SortedSet"
---

## Summary
`OrderedMap` and `OrderedSet` maintain a defined element order (insertion order, backed by a `List`/indicator in ordered/src/internal). `SortedMap`/`SortedSet` expose a rich set of order/positional operations because they too have a well-defined order. The ordered collections expose none of them, even though the same operations are meaningful for insertion order (e.g. "the 3rd inserted entry", "last inserted entry", "entries from index 2 to 5"). Methods present on `SortedMap`/`SortedSet` but entirely absent on `OrderedMap`/`OrderedSet` include: `atIndex`, `streamSliceIndex`, `sliceIndex`, `slice`, `take`, `drop`, `min`, `max`, `minKey`/`maxKey`/`minValue`/`maxValue`, `findIndex`, `streamRange`, `lowerBound`, `upperBound`, `nextEntry`/`previousEntry` (and the `reversed` `stream`/`streamKeys`/`streamValues` option). Users who switch from `SortedMap` to `OrderedMap` (or who want insertion-order slicing) lose all positional access without warning.

## Evidence
- `packages/sorted/src/public/map.ts:37-56` — `SortedMap.Advanced.Api` extends
  `MapCollection.Advanced.Api`, **`IndexedSortedCollection.Advanced.Api<readonly [K, V], K, Tp>`**
  and `IndexedCollection.Capability.WithRemoveAt.Api`, which is where the positional
  family now lives (`packages/collection-types/src/public/collection/indexed-sorted.ts`
  and `.../indexed.ts`): `at(index)`, `take`/`drop`, `sliceIndex`/`slice`,
  `min`/`max`, `streamRange`, `lowerBound`/`upperBound`, and the `{reversed}` stream
  options. `SortedSet`'s `Advanced.Api` composes the same capabilities.
- `packages/ordered/src/public/map.ts:75-79` — `OrderedMap.Advanced.Api extends
  MapCollection.Advanced.Api<K, V, Tp> {}` and **nothing else**: no
  `IndexedCollection`, no `IndexedSortedCollection`, no order-edit capability.
  `packages/ordered/src/public/set.ts` is the same for `OrderedSet`.
- Confirmed by grep: no `at`/`atIndex`/`streamSliceIndex`/`sliceIndex`/`take`/`drop`/
  `min`/`max`/`streamRange`/`lowerBound`/`upperBound` appears in `packages/ordered/src`.
- (Historical note: the old evidence cited `OrderedMapBase extends RMapBase` at
  `packages/ordered/src/internal/map/base.ts:8`; that whole base tier has been
  deleted, and the capability composition above is the replacement.)

## Impact
Cross-package API surprise: a method that exists on `SortedMap` does not exist on `OrderedMap` even though both are "ordered" maps. Insertion-order slicing/positional access is a commonly expected capability for an insertion-ordered collection.

## Recommendation
Either (a) add a positional/order method subset to `OrderedMap`/`OrderedSet` operating by *insertion* order (at minimum `at`, `streamSliceIndex`, `sliceIndex`, `take`, `drop`, `min`/`max` by first/last insertion), or (b) document prominently in `ordered` that positional access is intentionally unavailable and why, so the gap is a conscious choice rather than an omission. If added, keep negative-index semantics consistent with `SortedMap` (`at(-1)` = last).

## Repointed 2026-10-09

Still open. The capability rewrite deleted the `OrderedMapBase`/`RMapBase` tier the
old evidence pointed at but did **not** add an indexed/order-edit capability to
`OrderedMap`/`OrderedSet`: their `Advanced.Api` still composes only
`MapCollection.Advanced.Api`. This is the same outstanding work tracked as
`.scratch/collection-capabilities/issues/09-migrate-ordered-collections.md`
("the *ordered-specific* work has not started at all"). The method list above was
renamed to the target vocabulary (`atIndex` → `at`, key lookup → `get`). Keep this
issue as the user-facing symptom of issue 09; do not treat it as independent work.
