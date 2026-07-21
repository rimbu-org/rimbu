---
severity: low
impact: package
complexity: trivial
pass: api
package: sorted
confidence: high
effort_estimate: 0.25d
title: "SortedMap.at is key-based while SortedMap.atIndex is positional — an undocumented sharp edge"
---

## Summary
In `SortedMap`, `at(key)` is inherited from `RMapBase` and performs a *by-key* lookup (returns the value associated with `key`), whereas `atIndex(index)` performs a *positional* (sort-order) lookup. A user familiar with `List.at(index)` (which mirrors `Array.prototype.at`, including negative indices) will naturally try `sortedMap.at(0)` expecting the first entry, but instead receives the value stored under key `0` (or `undefined`). This is a genuine footgun and the public docs do not warn about it.

## Evidence
- `packages/collection-types/src/advanced/map/base.ts:127` `at<UK = K>(key): V | undefined` — by-key lookup, inherited by `SortedMap`.
- `packages/sorted/src/public/map.ts:336` `atIndex(index: number): readonly [K, V] | undefined` — positional lookup (note the doc at `:320` explicitly states negative indices count from the end).
- `packages/sorted/src/public/map.ts:122-124` example uses `source.at(2)` / `source.at(3)` purely as by-key lookups; no doc note clarifies the positional alternative is `atIndex`.

## Impact
New users are likely to call `at(0)`/`at(-1)` expecting positional access and get silently wrong results (or `undefined`), since both `at` and `atIndex` accept a number and differ only semantically.

## Recommendation
Add a short `@note` to `SortedMap.at` (and `SortedSet` positional equivalents if any) clarifying that `at` is key-based and that positional/index access uses `atIndex`/`streamSliceIndex`/`sliceIndex`, with a cross-reference. Optionally consider whether `at` accepting a key that is also a valid positional index warrants a lint-time note.
