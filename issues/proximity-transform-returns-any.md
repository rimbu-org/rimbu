---
severity: medium
impact: package
complexity: trivial
pass: api
package: proximity
confidence: high
effort_estimate: 0.2d
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
