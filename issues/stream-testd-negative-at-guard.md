---
severity: low
impact: package
complexity: small
pass: tests
package: stream
confidence: medium
effort_estimate: 0.25d
title: "No type-level test guards that Stream.at(-1) returns the fallback, not the last element"
---

## Summary

The runtime behavior that `Stream.at(-1)` returns the `otherwise` fallback rather than the last element is covered by runtime tests (packages/stream/test/stream.test.ts:870-872 and packages/stream/test/async-stream.test.ts:1034-1036). However, there is no `test-d` type-level assertion that, at the type level, a negative index does NOT get treated as "from the end."

Because all other collections in Rimbu (List, etc.) support negative indices that count from the end, a future refactor of `Stream.at`/`AsyncStream.at` could accidentally make `at(-1)` resolve to the *last* element's type (`T`) instead of the fallback (`T | O`). Without a type-level guard, such a regression would pass the runtime test (which only checks `undefined`) while silently changing the type contract — exactly the sharp edge called out in the package AGENTS guide.

## Evidence

- `packages/stream/test/stream.test.ts:870-872` — runtime only: `expect(Stream.of(1, 2, 3).at(-1)).toBe(undefined);` and `at(-1, 'a')` → `'a'`.
- `packages/stream/test/async-stream.test.ts:1034-1036` — same runtime-only coverage for AsyncStream.
- `packages/stream/test-d/stream.test-d.ts` and `packages/stream/test-d/async-stream.test-d.ts` — no `expectTypeOf(... .at(-1) ...)` assertion exists.
- Contrast: `packages/stream/test-d/reducer.test-d.ts` and `packages/stream/test-d/async-reducer.test-d.ts` do contain `expectTypeOf` shape checks, showing the `test-d` pattern is used elsewhere in this package.

## Impact

A type-level regression in `at`/`AsyncStream.at` (treating negative as from-end) would not be caught, weakening the guarantee that Stream is the one collection that deliberately does NOT support negative indices.

## Recommendation

Add a `test-d` assertion such as:
```ts
expectTypeOf(Stream.of(1, 2, 3).at(-1)).toEqualTypeOf<number | undefined>();
expectTypeOf(Stream.of(1, 2, 3).at(-1, 'a')).toEqualTypeOf<number | string>();
```
(and the async equivalent) to pin the contract that a negative index resolves to the fallback type, never the last-element type.
