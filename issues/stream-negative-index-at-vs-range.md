---
severity: medium
impact: package
complexity: small
pass: api
package: stream
confidence: high
effort_estimate: 0.5d
title: "Inconsistent negative-index handling: fromArray/fromString ranges honor negatives, Stream.at(-1) does not"
---

## Summary

Within the sync `Stream` package the negative-index rule is applied inconsistently. The documented exception ("Stream does not support negative indices — `at(-1)` returns the fallback, not the last element") applies only to positional access via `at`. However, `Stream.fromArray`/`fromString` `range.start` DO honor negative indices, counting from the end exactly like `Array`/`List`/`IndexRange`.

This means `Stream.fromArray([1,2,3], { range: { start: -2 } })` returns `[2,3]` (negative range = from end, stream.ts:1741), while `Stream.of(1,2,3).at(-1)` returns `undefined` (negative = out of bounds, base.ts:301-304). A user who learns "negative indices count from end" from the `fromArray` examples will be surprised that `at(-1)` silently returns the fallback.

## Evidence

- `packages/stream/src/stream.ts:1741` — `Stream.fromArray([1, 2, 3], { range: { start: -2 } }).toArray()` documented as `[2, 3]`.
- `packages/stream/src/stream.ts:1813` — `Stream.fromString('marmot', { range: { start: -3 } })` documented as `['m','o','t']`.
- `packages/stream/src/stream.ts:541-544` / `packages/stream/src/internal/base.ts:301-304` — `at(-1)` returns the `otherwise` fallback, not the last element.
- Same split exists on async: `packages/stream/src/public/async.ts:552` vs `packages/stream/src/internal/async/stream-base.ts:382-383`.

## Impact

A sharp, under-documented edge that can cause silent logic errors: code that works on a finite array-derived stream via `range:{start:-1}` will behave differently when later switched to `.at(-1)`, returning `undefined` instead of the last element. The asymmetry is principled (ranges are known-finite; `at` is used on possibly-infinite streams) but not surfaced to users.

## Recommendation

Add an explicit `@note` near `Stream.at`/`AsyncStream.at` clarifying the distinction: "Negative `range.start` (in `fromArray`/`fromString`) counts from the end; `at(-n)` does NOT — it returns the fallback because a Stream may be infinite. Use `last()` to get the final element." Consider cross-linking the `fromArray`/`fromString` range docs to the same note.
