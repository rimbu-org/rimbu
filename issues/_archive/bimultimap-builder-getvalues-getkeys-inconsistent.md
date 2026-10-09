---
severity: high
impact: cross-package
complexity: small
pass: api
package: bimultimap
confidence: high
effort_estimate: 0.5d
status: solved
title: "BiMultiMap.Builder lookup methods use getValues/getKeys, diverging from immutable valuesAt/keysAt"
---

## Summary
On the immutable `BiMultiMap` the directional lookups are `valuesAt(key)` and `keysAt(value)` (base.ts:240, base.ts:254). On `BiMultiMap.Builder` the same operations are `getValues(key)` and `getKeys(value)` (base.ts:710, base.ts:727). This is the same builder↔immutable naming divergence seen in `BiMap`, and it is inconsistent with the `MultiMap` family where the builder method `valuesAt` matches the immutable `valuesAt` exactly (multimap/src/internal/types.ts:168, :958). Both bidirectional packages introduce a `get*` vocabulary on the builder that exists nowhere on the immutable side.

## Evidence
- `packages/bimultimap/src/internal/base.ts:240` `valuesAt<UK>(key)` and `:254` `keysAt<UV>(value)` — immutable API.
- `packages/bimultimap/src/internal/base.ts:710` `getValues<UK>(key)` and `:727` `getKeys<UV>(value)` — Builder API.
- `packages/multimap/src/internal/types.ts:168` immutable `valuesAt` vs `:958` builder `valuesAt` — consistent across the immutable/builder tiers.
- See sibling issue `bimap-builder-getvalue-getkey-inconsistent` for the same pattern in `BiMap`.

## Impact
Breaks the builder↔immutable parity convention shared by every other keyed collection, forcing callers to learn two different lookup vocabularies. Increases the chance of type errors when converting between builder and immutable code paths.

## Recommendation
Rename `BiMultiMap.Builder.getValues` → `valuesAt` and `getKeys` → `keysAt`, with the same OptLazy-free (set-returning) semantics as the immutable side.

## Resolution
`BiMultiMap.Builder` now exposes only `valuesAt` and `keysAt`, matching the immutable API. Builder tests cover both source-backed and mutable builders.
