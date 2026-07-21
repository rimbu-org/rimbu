---
severity: low
impact: package
complexity: trivial
pass: api
package: proximity
confidence: medium
effort_estimate: 0.2d
title: "ProximityMap.hasKey uses exact match while at() uses nearest match (inconsistent)"
---

## Summary
For a `ProximityMap` configured with a custom `DistanceFunction`, `hasKey(key)` performs an exact (`===`-style, via the backing `HashMap`) membership test, whereas `at(key)` performs a nearest-neighbour match and will return a value for a key at distance `0` even when it is not `===` the stored key. Thus `map.hasKey(k)` can be `false` while `map.at(k)` returns a value — a confusing, inconsistent contract.

## Evidence
- `packages/proximity/src/internal/non-empty.ts:144-146` — `hasKey` delegates to `this.internalMap.hasKey(key)` (exact).
- `packages/proximity/src/internal/non-empty.ts:132-142` — `at` delegates to `findNearestKeyMatch` (nearest, distance `0` accepted).
- `packages/proximity/src/public/distance-function.ts:23-26` — default function returns `0` only on `===`, but a custom function may return `0` for non-`===` keys.

## Impact
With a custom `DistanceFunction`, querying presence and value yield contradictory answers, which is surprising and easy to misuse.

## Recommendation
Decide and document the intended semantics. If `hasKey` should mean "a key at distance 0 exists", implement it via the distance function (e.g. return truthiness of `findNearestKeyMatch(key)?.distance === 0`), and document the divergence from exact-key maps. If exact membership is intended, document that `hasKey` is exact-only and that `at` may find a nearer-but-not-equal key.
