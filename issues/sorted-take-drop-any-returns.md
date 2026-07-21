---
severity: medium
impact: package
complexity: small
pass: implementation
package: sorted
confidence: medium
effort_estimate: 0.5d
title: "SortedMap/SortedSet take/drop/transform implementations return '| any', weakening internal type safety"
---

## Summary
Several `SortedMap`/`SortedSet` implementation methods declare `| any` (or bare `any`) return types in the concrete classes, even though the public interface declares precise types. Because internal helpers chain these methods, the `any` can mask type errors and silently defeat the precise NonEmpty/normal return types that the interface promises. The clearest chain is `sliceIndex` = `this.drop(start).take(end - start + 1)` (map/immutable.ts:484), where `drop` returns `SortedMap<K,V> | any` and `take` returns `SortedMap<K,V> | any`, even though both `drop` and `take` are implemented in the same class and could return the precise `SortedMap<K,V>`/`NonEmpty` types.

## Evidence
- `packages/sorted/src/internal/map/immutable.ts:460` `take(amount: number): SortedMap<K, V> | any`
- `packages/sorted/src/internal/map/immutable.ts:468` `drop(amount: number): SortedMap<K, V>` (note: `drop` even drops the `| any`, but `transform` at `:452` `transform(...): any`)
- `packages/sorted/src/internal/map/immutable.ts:484` `sliceIndex` = `this.drop(start).take(end - start + 1)` — chains the loosened returns.
- `packages/sorted/src/internal/set/immutable.ts:300` `take(amount: number): SortedSet<T> | any`, `:308` `drop(amount: number): SortedSet<T>`, `:456` `transform(...): any`.

## Impact
The public interface types remain correct for external callers, but the `any` escapements (a) hide mistakes inside the implementation (e.g. a wrong return flowing through `sliceIndex`/`slice`), and (b) make future refactors fragile because the compiler will not catch type regressions within these methods. This is the same `any`-escapement style called out as "by-design" in `bimultimap/AGENTS.md`, but here it affects a core, widely-used package.

## Recommendation
Replace `| any`/`any` returns on `take`, `drop`, and `transform` with their precise declared types (e.g. `take(amount: number): SortedMap<K, V>` — the `NonEmpty` override already refines it via `0 extends N ? ... : NonEmpty`). Where a single implementation must satisfy both `normal` and `NonEmpty` overloads, return the concrete class type rather than `any`. Add a type test asserting `sliceIndex`/`slice`/`take`/`drop` preserve NonEmpty where statically provable.
