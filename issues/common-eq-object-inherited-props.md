---
severity: low
impact: cross-package
complexity: trivial
pass: implementation
package: common
confidence: medium
effort_estimate: 0.5d
title: "Eq object equality uses `in` (prototype-chain) for key presence, can miscompare objects with inherited enumerable properties"
---

## Summary
`createObjectEq` (used by `Eq.object` and by deep equality via `_objectAnyInstance`) decides key presence with the `in` operator, which walks the prototype chain, but then compares values only over the keys enumerated by `for (const key in v1)` on the concrete object. An object that has an inherited *enumerable* property can therefore be reported equal/unequal incorrectly relative to the actual own-property set, and the value-comparison loop will compare a missing own value against an inherited one.

## Evidence
- `packages/common/src/public/eq.ts:178-184` — for both `v1` and `v2` it does `for (const key in v1) { if (!(key in v2)) return false; }`. `in` includes inherited enumerable keys, so an inherited enumerable key on `v2` satisfies `key in v2` even though `v2` has no own property `key`.
- `packages/common/src/public/eq.ts:186-191` — the value loop then runs `valueEq(v1[key], v2[key])`; if `v2` only has the key inherited, `v2[key]` is the inherited value, not a real data property, while `v1[key]` is the own value.
- The constructor check at `:176` (`v1.constructor !== v2.constructor`) reduces but does not eliminate the risk (subclass instances / objects with a shared constructor but different prototype enumerables).

## Impact
Cross-package. Any equality-backed feature (e.g. `Eq.defaultInstance` deep equality used by collection `Eq` contexts, `Eq.object` used by `SortedMap`/custom `Eq` users) can produce subtly wrong results for objects carrying inherited enumerable properties. Rare in typical Rimbu usage, but a correctness bug in a foundational equality primitive.

## Recommendation
Use `Object.prototype.hasOwnProperty.call(v2, key)` (and symmetric checks for both directions) instead of the `in` operator when verifying that both objects own the same set of keys. Add a test with an object that has an inherited enumerable property to `eq.test.ts`.
