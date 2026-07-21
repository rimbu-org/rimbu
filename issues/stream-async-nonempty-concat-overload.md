---
severity: low
impact: package
complexity: small
pass: api
package: stream
confidence: medium
effort_estimate: 0.5d
title: "AsyncStream.NonEmpty.concat lacks the non-empty-source overload present on Stream.NonEmpty.concat"
---

## Summary

`Stream.NonEmpty.concat` declares two overloads: one accepting `ArrayNonEmpty<StreamSource.NonEmpty<T2>>` and another accepting `ArrayNonEmpty<StreamSource<T2>>`, so the element-type `T2` is correctly refined when non-empty sources are passed (packages/stream/src/stream.ts:1526-1528). `AsyncStream.NonEmpty.concat` (packages/stream/src/public/async.ts:1579-1581) declares only the single `ArrayNonEmpty<AsyncStreamSource<T>>` overload.

The practical effect is minor (the async result is always `AsyncStream.NonEmpty` regardless), but the refinement of the concatenated element type `T2` from non-empty sources is lost, reducing type precision relative to the sync API and creating a small Stream/AsyncStream parity gap.

## Evidence

- `packages/stream/src/stream.ts:1526-1528` — sync `Stream.NonEmpty.concat` has both the `StreamSource.NonEmpty<T2>` and `StreamSource<T2>` overloads.
- `packages/stream/src/public/async.ts:1579-1581` — `AsyncStream.NonEmpty.concat` has only `...others: ArrayNonEmpty<AsyncStreamSource<T>>`.

## Impact

AsyncStream callers passing non-empty async stream sources do not get the same `T2` type narrowing as sync Stream callers. Cosmetic type-precision inconsistency; no runtime impact.

## Recommendation

Add the analogous overload to `AsyncStream.NonEmpty.concat`:
```ts
concat<T2 = T>(...others: ArrayNonEmpty<AsyncStreamSource.NonEmpty<T2>>): AsyncStream.NonEmpty<T | T2>;
concat<T2 = T>(...others: ArrayNonEmpty<AsyncStreamSource<T>>): AsyncStream.NonEmpty<T | T2>;
```
to match `Stream.NonEmpty.concat`.
