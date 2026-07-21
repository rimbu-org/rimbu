---
severity: medium
impact: package
complexity: small
pass: tests
package: bimultimap
confidence: high
effort_estimate: 0.5d
title: "BiMultiMap has no type-level (test-d) tests, unlike every other keyed package"
---

## Summary
`bimultimap` is the only package in the keyed-collections group with no `test-d/` directory. `hashed`, `sorted`, `ordered`, `bimap`, `multimap` (with 5 files), and `multiset` (3 files) all ship `expectTypeOf`-style type tests. `BiMultiMap` has a complex type surface — bidirectional `key↔value` mapping, four variants, and several `NonEmpty`/`normal` return-type distinctions (e.g. `add`/`addEntries` → `nonEmpty`, `setValues`/`setKeys` overloads, `removeKey`/`removeValue`) — exactly the kind of API where non-empty return-type regressions are easy to introduce and hard to catch with runtime tests alone.

## Evidence
- `ls packages/bimultimap/` shows only `src/`, `test/`, `public` paths; there is no `test-d/` directory (confirmed: `bimultimap/test-d` does not exist).
- Sibling packages each have `test-d/`: `hashed/test-d` (map, set), `sorted/test-d` (map, set), `ordered/test-d` (map, set), `bimap/test-d` (bimap.test-d.ts), `multimap/test-d` (5 files), `multiset/test-d` (3 files).
- `packages/bimultimap/src/internal/base.ts:181` `add` → `nonEmpty`, `:208`/`212` `setValues`/`setKeys` overloads, `:269`/`298` `removeKey`/`removeValue` → `normal` — all non-trivial NonEmpty distinctions that warrant type tests.

## Impact
Non-empty return-type and variance regressions in `BiMultiMap` (e.g. a `NonEmpty`-returning method silently downgraded to `normal`, or a broken overload order) would go undetected by the single runtime test file `packages/bimultimap/test/bimultimap.test.ts`.

## Recommendation
Add `packages/bimultimap/test-d/bimultimap.test-d.ts` covering, at minimum: `NonEmpty` vs `normal` return types for `add`/`addEntries`/`setValues`/`setKeys`, the `empty`/`of`/`from` factory return types, builder `build()` type, and the `valuesAt`/`keysAt` return types. Mirror the structure used by `packages/multimap/test-d/multimap.test-d.ts`.
