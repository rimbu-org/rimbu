---
severity: low
impact: package
complexity: trivial
pass: implementation
package: stream
confidence: high
effort_estimate: 0.5d
title: "Async at/find/first/last/single use `otherwise!` non-null assertion unlike sync OptLazy(otherwise)"
---

## Summary

The async implementations of the fallback-bearing terminal methods use a non-null assertion on the `otherwise` parameter before handing it to `AsyncOptLazy.toPromise`. The sync equivalents do not use a `!` and simply pass `OptLazy(otherwise)`.

A non-null assertion here is a Biome warning (per root AGENTS.md lint rules) and also obscures the fact that `otherwise` may legitimately be `undefined`: when omitted, `at(-1)`/`find` should resolve to `Promise<undefined>`. The `!` implies the value is always present and would need to be revisited if `toPromise`'s signature tightens.

## Evidence

- `packages/stream/src/internal/async/stream-base.ts:383` — `if (index < 0) return AsyncOptLazy.toPromise(otherwise!);`
- `packages/stream/src/internal/async/stream-base.ts:1784` — `return AsyncOptLazy.toPromise(otherwise!);` (empty-stream `find`)
- `packages/stream/src/internal/async/stream-base.ts:1787` — `return AsyncOptLazy.toPromise(otherwise!);` (empty-stream `at`)
- Sync counterpart: `packages/stream/src/internal/base.ts:302-303` — `if (index < 0) return OptLazy(otherwise) as O;` (no `!`).

## Impact

Lint noise (warning) and a misleading signal about the fallback contract. Functionally correct today because `AsyncOptLazy.toPromise(undefined)` returns `Promise<undefined>`.

## Recommendation

Drop the `!` and pass `otherwise` directly (it is already `AsyncOptLazy<O> | undefined`, which `toPromise` accepts), matching the sync `OptLazy(otherwise)` style:
```ts
if (index < 0) return AsyncOptLazy.toPromise(otherwise);
```
