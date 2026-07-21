---
severity: low
impact: cross-package
complexity: trivial
pass: api
package: collection-types
confidence: medium
effort_estimate: 0.5d
title: "RMapBase.updateAt takes (value: V) => V while updateAtAndGet/Builder use VariantUpdate<V>, an inconsistent update callback type"
---

## Summary
Within `RMapBase`, the mutation-update methods disagree on the shape of the update callback. `updateAt` accepts a plain `(value: V) => V`, whereas `updateAtAndGet` (same interface) and `RMapBase.Builder.updateAt` accept the more specific `VariantUpdate<V>` (`<T2 extends V>(value: V & T2) => V`). `VariantSetBase` has the analogous split. This inconsistency makes the API surprising: a callback written for one method is not obviously usable for the other, and the richer `VariantUpdate` contract is only half-adopted.

## Evidence
- `packages/collection-types/src/advanced/map/base.ts:551-554` — `updateAt<UK = K>(key, update: (value: V) => V): ...['normal'];`
- `packages/collection-types/src/advanced/map/base.ts:576-583` — `updateAtAndGet<UK = K>(key, update: VariantUpdate<V>): ...`
- `packages/collection-types/src/advanced/map/base.ts:1145-1146` — `Builder.updateAt(key, update: VariantUpdate<V>)`.
- `VariantUpdate<V>` is defined in `packages/collection-types/src/internal/common/utils.ts:71` as `<T2 extends T>(value: T & T2) => T`.

## Impact
Cross-package. Consumers implementing or calling concrete map/set APIs encounter two different update-callback type shapes for what is conceptually the same operation, which harms the "consistent naming/behavior across packages" goal (AGENTS.md §1.1) and complicates extension classes that must satisfy both.

## Recommendation
Standardize on a single update-callback type across `updateAt`, `updateAtAndGet`, and `Builder.updateAt` (and the set equivalents). Either adopt `VariantUpdate<V>` everywhere or use the simpler `(value: V) => V` everywhere, and document the rationale. Add type tests asserting the chosen shape is accepted by all three.
