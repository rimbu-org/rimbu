---
severity: low
impact: package
complexity: trivial
pass: api
package: multimap
confidence: high
effort_estimate: 0.25d
title: "multimap AGENTS.md documents a getValues(key) method that does not exist on the public API"
---

## Summary
`packages/multimap/AGENTS.md` repeatedly refers to a `getValues(key)` method (and lists `getValues` among the read-side methods and in the "Common pitfalls" section). The actual public API method is named `valuesAt(key)` (declared on both `VariantMultiMapBase` and `MultiMap.Builder`). The documentation is stale/wrong and will mislead contributors who search for or try to call `getValues`.

## Evidence
- `packages/multimap/AGENTS.md:70` "`- getValues(key)` returns the value set …"; `:92` lists `getValues` in the read-side method set; `:152` "**Don't return `undefined` from `getValues`** — return the empty `RSet`".
- Actual public method: `packages/multimap/src/internal/types.ts:168` `valuesAt<UK = K>(key): WithKeyValue<Tp, K, V>['keyMapValues']` (immutable) and `:958` `valuesAt<UK = K>(key)` (Builder). There is no `getValues` symbol anywhere in `multimap/src`.

## Impact
Contributors reading the package guide will look for / use a non-existent `getValues` API. Minor but a concrete doc/API drift.

## Recommendation
Update `multimap/AGENTS.md` to reference `valuesAt(key)` in place of `getValues(key)` (3 occurrences). Confirm no other guide (e.g. `bimultimap`) repeats the same stale name.
