---
severity: low
impact: package
complexity: trivial
pass: api
package: deep
confidence: high
effort_estimate: 0.1d
title: "select selector function type returns `any`; Select.Result widens to any"
---

## Summary
The public `Select` types and `select`/`patch` APIs use `any` in user-facing positions, weakening type inference for the most common selector form (a function). `Select<T>` allows `(value: Protected<T>) => any`, and `Select.Result` infers via `SL extends (...args: any[]) => infer R`. While this keeps the implementation permissive, function selectors lose precise return typing and downstream code widens to `any`.

## Evidence
- `packages/deep/src/public/select.ts:17` — `| ((value: Protected<T>) => any)`
- `packages/deep/src/public/select.ts:44-57` — `Select.Result` uses `SL extends (...args: any[]) => infer R`.
- `packages/deep/src/public/patch.ts:75-79` — `Patch.Func` returns `Protected<S>` (good), but `patchEntry` implementations cast through `any` internally.

## Impact
Minor: function selectors don't get precise result types; inconsistency with Rimbu's otherwise strict typing. Most selectors are still typed via the path/object/tuple branches.

## Recommendation
Narrow the function selector return to the inferred `R` (already done in `Select.Result`) and avoid `any` in the `Select<T>` union by typing it as `(value: Protected<T>) => unknown` plus a tighter `Select.Shape`/`Select.Result` flow. Low priority; mainly cosmetic for the public surface.
