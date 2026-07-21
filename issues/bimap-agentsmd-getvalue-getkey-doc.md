---
severity: low
impact: package
complexity: trivial
pass: api
package: bimap
confidence: high
effort_estimate: 0.25d
title: "bimap AGENTS.md documents the public API as getKey/getValue, but the immutable API is at/atValue"
---

## Summary
`packages/bimap/AGENTS.md` "Intentional API deviations" states: "BiMap exposes `getKey(value)` and `getValue(key)` rather than a single overloaded `get`." That statement describes the **Builder** method names, not the public immutable `BiMap` API, which is `at(key)` and `atValue(value)` (bimap.ts:165, :182). A contributor reading the package guide will believe the public API is `getKey`/`getValue` and write incorrect code against the immutable collection.

## Evidence
- `packages/bimap/AGENTS.md:30-32` — "**`getValue` / `getKey` instead of a single `get`:** … `getKey(value)` and `getValue(key)` rather than a single overloaded `get`."
- `packages/bimap/src/bimap.ts:165` `at<UK = K>(key)` and `:182` `atValue<UV = V>(value)` — the actual immutable public methods.
- `packages/bimap/src/bimap.ts:949` `getValue` and `:966` `getKey` — these exist only on `BiMap.Builder`, not on the immutable `BiMap`.

## Impact
The package guide misrepresents the public surface, which (a) confuses contributors and (b) papers over the very builder/immutable naming divergence flagged in `bimap-builder-getvalue-getkey-inconsistent`.

## Recommendation
Reword the AGENTS.md deviation note to clarify that the **immutable** `BiMap` uses `at(key)`/`atValue(value)` and the **Builder** currently uses `getValue(key)`/`getKey(value)` (and reference the plan to align them). Avoid implying `getKey`/`getValue` are the public immutable API.
