---
severity: medium
impact: cross-package
complexity: small
pass: tests
package: ordered
confidence: high
effort_estimate: 1d
title: "ordered, bimap, and bimultimap lack property-based (test-random) test suites"
---

## Summary
Three of the seven keyed-collections packages have no `test-random/` directory, while the other four do. Property-based / randomized tests are especially valuable for immutable persistent structures, where invariants (referential equality on no-ops, exact `size`, structural sharing, cross-variant `from` compatibility) are easy to assert statistically but tedious to cover exhaustively by hand.

## Evidence
- `ls <pkg>/test-random` file counts: `hashed`=2, `sorted`=2, `ordered`=0, `bimap`=0, `bimultimap`=0, `multimap`=5, `multiset`=3 (confirmed via directory listing).
- `packages/multimap/test-random/` contains `multimap-test-random.ts` plus per-variant files; `packages/multiset/test-random/` contains `multiset-test-random.ts` plus per-variant files — demonstrating the established pattern for this group.

## Impact
`ordered` (which composes two internal collections and is prone to `size`/equality bugs), `bimap` (1-to-1 invariant, displacement on `set`/`addEntry`), and `bimultimap` (dual many-to-many invariant) are the packages where invariant-preserving randomized tests are most valuable, yet they are the ones without them. Regressions in no-op referential equality, exact `size`, or cross-context `from` would not be caught.

## Recommendation
Add `test-random/` suites following the `multimap`/`multiset` pattern for `ordered`, `bimap`, and `bimultimap`, at minimum exercising: repeated add/remove producing correct `size` and referential-equality-on-no-op, and `from` between contexts/variants preserving all entries.
