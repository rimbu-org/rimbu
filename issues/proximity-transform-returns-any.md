---
severity: medium
impact: package
complexity: trivial
pass: api
package: proximity
confidence: high
effort_estimate: 0.2d
status: wontfix
title: "ProximityMapNonEmpty.transform returns `any`, losing return-type safety"
---

## Summary
`ProximityMapNonEmpty.transform` is declared with a return type of `any`, so callers lose all type information about the resulting collection. Every other map transform in the library preserves the concrete return type (`ProximityMap<K2, V2>` or similar). This is an avoidable type-safety regression in the public API.

## Evidence
`packages/proximity/src/internal/non-empty.ts:120-126`
```ts
transform<V2, K2 extends K>(
  transformFun: (
    stream: Stream.NonEmpty<readonly [K, V]>,
  ) => StreamSource<[K2, V2]>,
): any {
  return this.context.from(transformFun(this.stream()));
}
```
`context.from(...)` returns the proper `ProximityMap<K2, V2>` (non-empty when the source is non-empty), so the `any` is unnecessary.

## Impact
TypeScript cannot catch misuse of the `transform` result; downstream code silently widens to `any`. Inconsistent with the rest of the Rimbu map surface.

## Recommendation
Type the return as `ProximityMap<K2, V2>` (or `ProximityMap.NonEmpty<K2, V2>` where the input stream is non-empty). Align with how `RMapBase.transform` / sibling maps express the result type via the `Types` slot.

## Resolution — moot (2026-10-09)

`transform` was removed library-wide in the capability rewrite; there is no
`transform` symbol anywhere under `packages/proximity/src`. The method that
replaced it, `recompose`, is declared once on
`KeyedCollection.Capability.WithRecompose.Api` and typed via the `Types` slot,
so `ProximityMap` inherits a precise return type rather than `any`. The
hand-written `any`-returning override this issue targeted no longer exists
(confirmed: `rg transform packages/proximity/src` → no matches). Nothing to
fix; closing as `wontfix` (moot by removal).
