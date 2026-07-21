---
severity: medium
impact: cross-package
complexity: small
pass: implementation
package: common
confidence: high
effort_estimate: 0.5d
title: "Comp.number.compare is not a consistent total order for NaN vs Infinity"
---

## Summary
`Comp.number.compare` assigns NaN a position that is simultaneously greater than `+Infinity` and less than `-Infinity`, which is impossible in a consistent total order. As a result `compare(NaN, -Infinity)` and `compare(-Infinity, NaN)` both return `-1`, violating the fundamental contract that `compare(a, b) === -compare(b, a)` for distinct `a`, `b`.

## Evidence
- `packages/common/src/public/comp.ts:473-491` (the `number` comparator):
  - For `compare(NaN, -Infinity)`: `Number.isNaN(v1)` true, `v2 === NEGATIVE_INFINITY` true → `return -1`.
  - For `compare(-Infinity, NaN)`: falls through to the "only infinities remain" branch; `v1 === NEGATIVE_INFINITY` → `return v2 === NEGATIVE_INFINITY ? 0 : -1`; `v2` is `NaN`, so returns `-1` again.
  - Thus `compare(NaN, -Inf) = -1` AND `compare(-Inf, NaN) = -1`; they are not opposites.
- The NaN/vs-`+Infinity` ordering is internally contradictory too: `compare(NaN, +Inf)` returns `1` (NaN > +Inf) while `compare(NaN, -Inf)` returns `-1` (NaN < -Inf). A single value cannot be both above +Inf and below -Inf.
- `packages/common/test/comp.test.ts:85-103` asserts only the `compare(NaN, ...)` direction (e.g. line 88 `compare(NaN, NEGATIVE_INFINITY) < 0`); the inverse `compare(-Infinity, NaN)` is never tested, so the contradiction is undetected.

## Impact
Cross-package. `Comp.number` is the default ordering for number-keyed sorted collections (`sorted`, `ordered`, `proximity`, etc.). A comparator that is not antisymmetric can produce undefined/incorrect ordering or unstable behavior when NaN (or mixed NaN/Infinity) values are used as keys, and breaks any algorithm that relies on `compare(a,b) === -compare(b,a)`.

## Recommendation
Define a single, explicit total ordering for the extended number domain (e.g. `-Inf < finite < +Inf < NaN`, or group NaN with one end) and implement both branches to honor `compare(a,b) === -compare(b,a)`. Add inverse-direction assertions (`compare(-Inf, NaN)`, `compare(NaN, finite)` from both sides) to `comp.test.ts`.
