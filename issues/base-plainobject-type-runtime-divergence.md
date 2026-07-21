---
severity: low
impact: package
complexity: trivial
pass: api
package: base
confidence: medium
effort_estimate: 0.5d
title: "plain-object: type-level IsPlainObj excludes function-valued properties but runtime isPlainObj does not check them"
---

## Summary
The `IsPlainObj<T>` type predicate and the `PlainObj<T>` helper exclude any object whose properties include function types, but the runtime companion `isPlainObj()` explicitly does **not** verify that properties are non-functions (its own doc comment admits this). So a value that passes the runtime `isPlainObj()` check may be rejected by the type-level `PlainObj<T>` guard, and a generic constrained by `PlainObj<T>` can receive a runtime value that isn't "plain" by the runtime semantics. The type-level and runtime notions of "plain object" diverge.

## Evidence
- `packages/base/src/public/plain-object.ts:31-50` — `IsPlainObj<T>` resolves to `false` for any `T` whose properties include a function (`IsObjWithoutFunctions`); `PlainObj<T>` requires `IsPlainObj<T>` to be `true`.
- `packages/base/src/public/plain-object.ts:81-89` — `isPlainObj(obj)` only checks `typeof === 'object'`, `constructor`, and iterable/async-iterable symbols; it never inspects property types, and the doc note states "does not verify whether object properties are functions."
- Used downstream by `@rimbu/deep` (`match`, `patch`, `protected`, `path-internal`), which relies on this distinction for plain-object discrimination.

## Impact
Package (base), with downstream effect on `deep`. A consumer who narrows a generic with `PlainObj<T>` and then validates with `isPlainObj()` can end up with a value whose function-valued properties violate the type-level assumption, or vice-versa. The asymmetry is a leaky abstraction at the foundation level.

## Recommendation
Either (a) make `isPlainObj` actually verify that no own enumerable property is a function (closing the gap, at some runtime cost), or (b) clearly document that the runtime check is intentionally coarser than the type predicate and that `PlainObj<T>` provides strictly stronger compile-time guarantees. Prefer aligning the runtime check with the documented type-level contract where feasible.
