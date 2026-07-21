---
severity: medium
impact: cross-package
complexity: small
pass: api
package: list
confidence: high
effort_estimate: 0.5d
title: "List.repeat(negative) reverses the list, while Stream.repeat documents negative as normalized to 1"
---

## Summary

`List.repeat(amount)` treats a negative `amount` as "reverse and repeat": `if (amount <= -1) return this.reversed().repeat(-amount)` (packages/list/src/internal/immutable/outer-base.ts:293-294). So `List.of(3,2,1).repeat(-1)` returns the reversed list `[3,2,1]` → `List.of(1,2,3)` (per packages/list/test/list.test.ts:503-506, which asserts `repeat(-1)` yields the reversed sequence).

By contrast, `Stream.repeat` documents: "amount < 1 will be normalized to amount = 1" and returns the stream unchanged (packages/stream/src/stream.ts:789-792; also AsyncStream, packages/stream/src/public/async.ts:801-803).

The two packages therefore give opposite meaning to a negative `repeat` amount, and the List behavior is undocumented in the public API doc comment (packages/list/src/internal/list-base.ts:412-417 only shows non-negative examples). For a user fluent in the Stream convention, `list.repeat(-1)` silently reversing is a surprising sharp edge.

## Evidence

- `packages/list/src/internal/immutable/outer-base.ts:293-295` — `repeat(amount)`: `if (amount <= -1) return this.reversed().repeat(-amount); if (amount <= 1) return this;`
- `packages/list/test/list.test.ts:503-506` — asserts `list3_1.repeat(-1).toArray()` equals `[3, 2, 1]` (i.e. reversed), and `repeat(-2)` likewise.
- `packages/stream/src/stream.ts:789-792` — `Stream.repeat`: "amount < 1 will be normalized to amount = 1".
- `packages/stream/src/public/async.ts:801-803` — same normalization for `AsyncStream.repeat`.
- `packages/list/src/internal/list-base.ts:412-417` — `ListBase.repeat` doc only shows `repeat(0)`/`repeat(2)` examples; no negative-index note.

## Impact

Cross-package inconsistency in a numeric option's semantics (mirroring/negating vs. normalizing) leading to silent, hard-to-spot behavior differences when code is ported between `List` and `Stream`. Also an undocumented List sharp edge.

## Recommendation

Either (a) document the negative-`repeat` semantics explicitly in `ListBase.repeat`'s doc comment and call out the deliberate difference from `Stream.repeat`, or (b) reconsider whether List should follow the same "normalize negative to 1" rule for consistency across the collection/sequence packages. At minimum, the doc comment should mention that `amount < 0` reverses.
