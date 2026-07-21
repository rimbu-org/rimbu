---
severity: high
impact: cross-package
complexity: small
pass: api
package: bimap
confidence: high
effort_estimate: 0.5d
title: "BiMap.Builder lookup methods use getKey/getValue, diverging from immutable at/atValue"
---

## Summary
On the immutable `BiMap`, key/value lookups are `at(key)` and `atValue(value)` (bimap.ts:165, bimap.ts:182). On `BiMap.Builder` the equivalent methods are named `getValue(key)` and `getKey(value)` (bimap.ts:949, bimap.ts:966). This breaks the builder↔immutable API parity that every other keyed collection in this group maintains, and is inconsistent with the `at`-by-key convention used by `RMapBase.Builder.at` (collection-types/src/advanced/map/base.ts:989) and `MultiMap.Builder.valuesAt` (multimap/src/internal/types.ts:958). A caller who learns `m.at(k)` on the immutable collection must learn a completely different name `b.toBuilder().getValue(k)` on the builder.

## Evidence
- `packages/bimap/src/bimap.ts:165` `at<UK = K>(key)` and `:182` `atValue<UV = V>(value)` — immutable API.
- `packages/bimap/src/bimap.ts:949` `getValue<UK = K>(key)` and `:966` `getKey<UV = V>(value)` — Builder API.
- `packages/collection-types/src/advanced/map/base.ts:989` `RMapBase.Builder.at` uses `at` (consistent with immutable).
- `packages/multimap/src/internal/types.ts:958` `MultiMap.Builder.valuesAt` matches immutable `valuesAt` (types.ts:168).

## Impact
Users writing builder-based code must remember a different lookup vocabulary than for the immutable collection, increasing cognitive load and the chance of compile errors. Also weakens the cross-package convention that builder methods mirror immutable ones.

## Recommendation
Rename `BiMap.Builder.getValue` → `at` (with `at<UK,O>` OptLazy overload) and `getKey` → `atValue`, matching the immutable surface. Keep the current names only as deprecated aliases if back-compat is required. Apply the same fix to `BiMultiMap.Builder` (see `bimultimap-builder-getvalues-getkeys-inconsistent`).
