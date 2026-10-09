---
severity: medium
impact: package
complexity: trivial
pass: implementation
package: proximity
confidence: high
effort_estimate: 0.2d
status: solved
title: "findNearestKeyMatch treats NaN distance as an exact (distance-0) match"
---

## Summary
`findNearestKeyMatch` short-circuits on `if (!currentDistance)` to detect the exact-match case (distance `0`). Because `!NaN === true`, any distance function that returns `NaN` (e.g. comparing incompatible/incommensurable keys, or a malformed `DistanceFunction`) is silently treated as a perfect match and returned with `distance: 0`, overriding any genuinely closer finite-distance key scanned later.

## Evidence
`packages/proximity/src/public/key-matching.ts:48-54`
```ts
if (!currentDistance) {
  return {
    key: currentKey,
    value: currentValue,
    distance: 0,
  };
}
```
The `Distance` contract (`distance-function.ts:2-8`) defines distance as a non-negative number in `[0, +Infinity]`; `NaN` is not a valid distance and should be rejected/ignored, not accepted as `0`.

## Impact
A buggy or adversarial `DistanceFunction` returning `NaN` produces wrong lookups (matches a non-matching key with distance `0`) and corrupts proximity search results. The standard test suite does not cover the `NaN` case (`packages/proximity/test/key-matching.test.ts`).

## Recommendation
Replace `if (!currentDistance)` with an explicit `if (currentDistance === 0)` (or guard `Number.isNaN`), so `NaN` distances fall through to the normal `currentDistance < bestDistance` comparison (where `NaN < bestDistance` is `false`, correctly ignored). Add a test asserting `NaN` is not treated as a match.

## Resolution
The exact-match short circuit now checks `currentDistance === 0`, so invalid `NaN` distances are ignored by nearest-key selection. Regression coverage verifies that a valid finite match wins over an earlier `NaN` result.
