---
severity: low
impact: cross-package
complexity: trivial
pass: api
package: collection-types
confidence: medium
effort_estimate: 0.5d
title: "EmptyBase.filter/remove/asNormal return `any`, leaking the concrete type for extenders"
---

## Summary
`EmptyBase` (exported in the `advanced` tier for concrete packages to subclass) declares `filter(): any`, `remove(): any`, and `asNormal(): any`. Because these return `any`, any concrete empty collection that does not override them loses all type information, and Biome flags `any` as a warning (AGENTS.md §9). While the concrete packages (hashed/sorted/etc.) do override these, the abstract base class itself is a leaky, weakly-typed extension point.

## Evidence
- `packages/collection-types/src/advanced/common/empty-base.ts:78` — `filter(): any { return this; }`
- `packages/collection-types/src/advanced/common/empty-base.ts:85` — `remove(): any { return this; }`
- `packages/collection-types/src/advanced/common/empty-base.ts:145` — `asNormal(): any { return this; }`
- `EmptyBase` is exported via `advanced/common` (the implementer API), so external consumers who subclass it inherit these loose signatures.

## Impact
Cross-package (advanced/extension surface). Extenders who forget to override these methods get silently-widened `any` results, and the `any` return types undermine the type safety the foundation is supposed to guarantee for all collections.

## Recommendation
Parameterize `EmptyBase` (e.g. `EmptyBase<T>` or a small HKT slot) and have `filter`/`remove`/`asNormal` return the appropriate concrete/NonEmpty type via the `Types` slot instead of `any`, mirroring how `NonEmptyBase` already uses `this['_NonEmptyType']`. At minimum, replace `any` with the generic element/collection type to satisfy Biome and preserve type information.
