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
- `packages/sorted/src/public/map.ts:336` `atIndex`, `:354` `take`, `:371` `drop`, `:385` `sliceIndex`, `:398` `slice`, `:87` `min`, `:150` `max`, `:191` `findIndex`, `:48` `streamRange`, `:209` `lowerBound`, `:226` `upperBound`, `:250` `nextEntry`, `:283` `previousEntry`; `stream(options?: {reversed})` at `:31`.
- `packages/sorted/src/public/set.ts` carries the same positional family.
- `packages/ordered/src/public/map.ts` and `packages/ordered/src/public/set.ts` declare only `extends OrderedMapBase`/`OrderedSetBase` with no positional methods (confirmed via grep — no `atIndex`/`streamSliceIndex`/`take`/`drop`/`findIndex`/`min`/`max`/`streamRange`/`lowerBound`/`upperBound` in `ordered/src`).
- `packages/ordered/src/internal/map/base.ts:8` `OrderedMapBase extends RMapBase` — only the key-based base API is surfaced.

## Impact
Cross-package API surprise: a method that exists on `SortedMap` does not exist on `OrderedMap` even though both are "ordered" maps. Insertion-order slicing/positional access is a commonly expected capability for an insertion-ordered collection.

## Recommendation
Either (a) add a positional/order method subset to `OrderedMap`/`OrderedSet` operating by *insertion* order (at minimum `atIndex`, `streamSliceIndex`, `sliceIndex`, `take`, `drop`, `min`/`max` by first/last insertion), or (b) document prominently in `ordered` that positional access is intentionally unavailable and why, so the gap is a conscious choice rather than an omission. If added, keep negative-index semantics consistent with `SortedMap` (`atIndex(-1)` = last).
