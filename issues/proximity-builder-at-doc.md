---
severity: low
impact: package
complexity: trivial
pass: api
package: proximity
confidence: high
effort_estimate: 0.1d
title: "ProximityMapBuilder.at doc comment contradicts its own implementation"
---

## Summary
`ProximityMapBuilder.at` carries a doc comment stating "Applying `at()` to the Builder does NOT apply the proximity algorithm", but the implementation does apply the proximity algorithm whenever the builder still wraps a `source` `ProximityMap.NonEmpty` (it delegates to `source.at(key, otherwise)`). The comment is only true after the builder has been mutated (which clears `source`).

## Evidence
`packages/proximity/src/internal/builder.ts:42-52`
```ts
/**
 * Applying `at()` to the Builder does NOT apply the proximity algorithm - which would
 * be pointless at this construction stage; the internal, hash-based builder
 * is queried instead
 */
at = <UK, O>(key, otherwise?) => {
  if (undefined !== this.source) return this.source.at(key, otherwise!);  // proximity IS applied
  return this.internalBuilder.at(key, otherwise!);
};
```
Note also that `at` behavior silently changes once any mutating method (`addEntry`/`set`/`modifyAt`/`updateAt`/`removeKey`/`removeKeys`) clears `source` — after that it becomes exact-key.

## Impact
Misleading documentation; the builder's lookup semantics are state-dependent (proximity while sourced, exact once mutated), which is surprising and undocumented beyond the inaccurate comment.

## Recommendation
Fix the doc comment to describe the actual behavior (proximity lookup while the builder still reflects a source map; exact lookup after mutation), and consider documenting the state-dependent `at`/`updateAt` semantics explicitly.
