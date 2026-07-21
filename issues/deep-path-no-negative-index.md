---
severity: medium
impact: package
complexity: small
pass: api
package: deep
confidence: high
effort_estimate: 0.5d
title: "getAt/select/patchAt path array indexing ignores negative-index (from-end) convention"
---

## Summary
Per the Rimbu conventions in `AGENTS.md`, "Negative indices count from the end, mirroring JavaScript's `Array.prototype.at()`" for "any other API that accepts positional indices." The deep path API (`getAt`, `select`, `selectAt`, `patchAt`) accepts array-index tokens like `a.b[0]`, but it does **not** honor negative indices: `getAt(obj, 'a[-1]')` returns `undefined` instead of the last element.

## Evidence
- `packages/deep/src/internal/string-split.ts:4` — path split on `.`, `?.`, `[`, `]`. The token for `-1` is the string `'-1'`.
- `packages/deep/src/deep.ts:68-84` — `getAt` iterates tokens and does `result = result[item]`, where `item` is a string. `obj['-1']` (and `obj[-1]`) is a property access that returns `undefined`; it does **not** use `Array.prototype.at`, so the last element is never reached.
- `select`/`patchAt` funnel through the same `stringSplit` + property-access logic (`select.ts`, `patch.ts:366-397`), so they share the gap.

## Impact
Users expecting `Array.prototype.at`-style negative indexing in deep paths get `undefined` (or an accidental property lookup), contradicting the documented library-wide convention. Silently wrong results.

## Recommendation
When a path token is a numeric index (including negative), use `Array.prototype.at` (or compute `index < 0 ? length + index : index`) so negative indices count from the end, consistent with `List`/`fromArray`/`IndexRange`. Add type-level and runtime tests for `getAt(obj, 'a[-1]')` on arrays/tuples.
