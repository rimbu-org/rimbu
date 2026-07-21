---
severity: high
impact: cross-package
complexity: small
pass: api
package: collection-types
confidence: high
effort_estimate: 0.5d
status: solved
title: "VariantMapBase.NonEmpty.transform declares the nonEmpty-returning overload AFTER the normal one, losing NonEmpty types"
---

## Summary
In `VariantMapBase.NonEmpty.transform`, the two overloads are ordered with the `StreamSource<...>` (returns `normal`) overload **first** and the `StreamSource.NonEmpty<...>` (returns `nonEmpty`) overload **second**. TypeScript always selects the first overload whose parameters match, and since `StreamSource.NonEmpty` is assignable to `StreamSource`, a caller that passes a `StreamSource.NonEmpty` (and therefore should get a `nonEmpty` collection back) actually matches the first overload and receives the widened `normal` type. This is exactly the anti-pattern AGENTS.md §6.3 warns about, and it makes `VariantMapBase.NonEmpty.transform` inconsistent with `VariantSetBase.NonEmpty.transform`, which orders the overloads correctly.

## Evidence
- `packages/collection-types/src/advanced/map/base.ts:412-421` — first overload returns `(Tp & KeyValue<K2, V2>)['normal']`, second (NonEmpty) returns `['nonEmpty']`. Order is wrong.
- `packages/collection-types/src/advanced/set/base.ts:311-316` — contrast: the `StreamSource.NonEmpty` → `['nonEmpty']` overload is declared **first**, correctly.
- AGENTS.md §6.3: "the `NonEmpty`-returning overload MUST be declared **first**."
- Consequence: `HashMap.NonEmpty(...).transform(s => s.map(...))` where `s` (a `Stream.NonEmpty`) is mapped to a `StreamSource.NonEmpty` is inferred as possibly-empty, defeating the whole point of the NonEmpty variant.
- `RMapBase.NonEmpty` does not redeclare `transform`, so it inherits this buggy ordering (every concrete map is affected).

## Impact
Repo-wide. Any concrete map (`hashed`, `sorted`, `ordered`, `bimap`, `multimap`, etc.) built on `RMapBase` loses precise `NonEmpty` typing on `.transform()` when the transform yields a non-empty source. This forces users into casts and undermines the core type-level non-emptiness guarantee that Rimbu advertises. Also demonstrates an internal inconsistency between the map and set base classes that other packages may copy.

## Recommendation
Swap the two overloads in `VariantMapBase.NonEmpty.transform` so the `StreamSource.NonEmpty<[K2, V2]>` → `['nonEmpty']` overload comes first, mirroring `VariantSetBase.NonEmpty.transform`. Consider adding a type test (see `collection-types-transform-typetests-missing`) that asserts `NonEmpty.transform` returning a `NonEmpty` for a `StreamSource.NonEmpty` callback.

## Resolution

The `StreamSource.NonEmpty` overload now precedes the possibly-empty `StreamSource` overload in `VariantMapBase.NonEmpty.transform`. Type-level regression tests cover both return paths in `packages/collection-types/test-d/map.test-d.ts`.
