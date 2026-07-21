---
severity: low
impact: cross-package
complexity: trivial
pass: api
package: common
confidence: high
effort_estimate: 0.5d
title: "Eq.stringCaseInsentitive is misspelled (should be 'Insensitive'), inconsistent with Comp.stringCaseInsensitive"
---

## Summary
The public `Eq` factory exposes `stringCaseInsentitive` (note the doubled/transposed "Insentitive") while the parallel `Comp.stringCaseInsensitive` is spelled correctly. This is a public API name typo that breaks the "consistent naming across packages" principle from AGENTS.md §1.1 and is an easy trap for users who expect symmetry between `Eq` and `Comp`.

## Evidence
- `packages/common/src/public/eq.ts:123` — `stringCaseInsentitive: Eq<string>;` (typo) and `:308` — `stringCaseInsentitive: Module.lazyGetter(...)`.
- `packages/common/src/public/comp.ts:245` — `stringCaseInsensitive: Comp<string>;` (correct spelling).
- Real consumers already depend on the typo: `packages/stream/test/stream.test.ts:258` and `packages/stream/test/async-stream.test.ts:281` both call `Eq.stringCaseInsentitive` (so a rename is breaking and must be handled with a deprecation alias).

## Impact
Cross-package. Users writing `Eq.stringCaseInsensitive` get a compile error and must discover the misspelling; the asymmetry between `Eq`/`Comp` violates Rimbu's naming consistency goal. Repo-wide documentation/codegen that assumes name symmetry will be wrong.

## Recommendation
Add a deprecated alias `stringCaseInsensitive` on `Eq.Factory` (and the module) that forwards to `stringCaseInsentitive`, document the deprecated name, and (eventually, as a breaking change) remove the typo. At minimum, document the inconsistency so it is not copied into new packages.
