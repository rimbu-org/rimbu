---
severity: low
impact: package
complexity: trivial
pass: api
package: multimap
confidence: high
effort_estimate: 0.25d
status: solved
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

## Resolution — solved by the capability rewrite (2026-10-09)

The premise is now inverted: the design settled on `getValues`, and the guide is
correct. The single-value-looking `valuesAt` name was retired; the capability is
`MultiMapCollection.Capability.WithGetValues`, whose `Api` and `BuilderApi` both
declare `getValues<UK = K>(key)` (`packages/multimap/src/advanced/multimap-base.ts:291-304`),
and the public doc comment uses `getValues`
(`packages/multimap/src/public/multimap.ts:14`). `AGENTS.md:152` matches the code.
The only surviving `valuesAt` mention is the historical rename list at
`AGENTS.md:286`, which is accurate as history. Nothing to fix.
