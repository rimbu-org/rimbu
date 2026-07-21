---
severity: medium
impact: cross-package
complexity: medium
pass: tests
package: collection-types
confidence: high
effort_estimate: 1d
title: "Type-level tests for collection-types omit transform() return types and merge/reducer factories"
---

## Summary
The `test-d` type suites for `collection-types` (`map.test-d.ts`, `set.test-d.ts`) are reasonably thorough for core operations (`add`, `set`, `filter`, `stream`, `mapValues`, `toBuilder`, variance) but never exercise `.transform(...)`, nor the higher-level factory results `merge`/`mergeWith`/`mergeAll`/`mergeAllWith`/`reducer`. This leaves the most error-prone HKT machinery — especially the NonEmpty-preserving overload resolution of `transform` — completely unverified at the type level, which is how `collection-types-map-transform-overload-order` slipped through.

## Evidence
- `packages/collection-types/test-d/map.test-d.ts` — no `.transform(` assertion anywhere; the file ends at `toBuilder().build()` (line 237).
- `packages/collection-types/test-d/set.test-d.ts` — likewise no `.transform(` assertion; ends at `union`/`toBuilder` (line 161).
- Neither file references `WithKeyValue`/`WithElem` NonEmpty resolution through `transform`, nor `RMap.Context`/`RSet.Context` `.merge*`/`.reducer` type results.
- Contrast: the `VariantSetBase.NonEmpty.transform` overload ordering (correct) vs `VariantMapBase.NonEmpty.transform` (wrong) is exactly the kind of defect a single `expectTypeOf(nonEmpty.transform(...)).toEqualTypeOf<NonEmpty>()` would catch.

## Impact
Cross-package. Since every concrete map/set package re-uses these abstract base types, a regression in the `Types` slot resolution or overload ordering would not be caught here and would surface only as downstream type errors in consumers. The foundation tier deserves the strictest type-test coverage.

## Recommendation
Add `expectTypeOf` assertions in both `map.test-d.ts` and `set.test-d.ts` for:
- `NonEmpty.transform(cb returning StreamSource.NonEmpty)` resolving to `NonEmpty` (this directly guards `collection-types-map-transform-overload-order`).
- `Empty.transform(cb returning StreamSource.NonEmpty)` resolving to `NonEmpty`.
- `transform(cb returning plain StreamSource)` resolving to `normal`.
- `Context.reducer(source)` and `Context.mergeWith(...)(...)`/`mergeAll(...)` resulting types.
Also add the `NoInfer`/overload-order checks described in AGENTS.md §6.4/§6.6 so future changes are pinned.
