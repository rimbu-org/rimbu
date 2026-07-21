---
severity: medium
impact: package
complexity: medium
pass: api
package: stream
confidence: high
effort_estimate: 1d
title: "AsyncStream Constructors omit many factory methods present on sync Stream"
---

## Summary

`AsyncStream` exposes a much smaller set of constructors than the sync `Stream`. The sync `Stream.Constructors` interface (packages/stream/src/stream.ts:1679-2073) provides `fromArray`, `fromString`, `fromObject`, `fromObjectKeys`, `fromObjectValues`, `range`, `random`, `randomInt`, `applyForEach`, `applyMap`, and `applyFilter`. The `AsyncStreamConstructors` interface (packages/stream/src/internal/async/constructors.ts:9-137) provides none of these — only `of`, `from`, `fromResource`, `zip`, `zipAll`, `flatten`, `unzip`, `empty`, `always`, and `unfold`.

This is a Stream/AsyncStream parity gap. Users who build an async stream from an array/string with `range`/`reversed` options (including the mathematically-conventional negative range index), or who want `range`/`random`/`randomInt` async sources, have no dedicated API and must awkwardly wrap a sync stream: `AsyncStream.from(Stream.fromArray(arr, { range }))`.

## Evidence

- `packages/stream/src/stream.ts:1725-1843` — sync `Stream.fromArray`, `fromString`, `fromObject*`, `range`, `random`, `randomInt`, `applyForEach/Map/Filter`.
- `packages/stream/src/internal/async/constructors.ts:9-137` — `AsyncStreamConstructors` has no `fromArray`/`fromString`/`fromObject*`/`range`/`random`/`randomInt`/`apply*`.
- `packages/stream/src/public/async.ts:1734-1737` — `AsyncStream` value is typed by `AsyncStreamConstructors`.

## Impact

AsyncStream consumers lose ergonomic, well-documented creation helpers and the `range`/`reversed` (negative-index) flexibility that sync `Stream` offers. Increases perceived inconsistency between the two streams the AGENTS guide explicitly says should be kept in parity.

## Recommendation

Mirror the sync constructors on `AsyncStreamConstructors`: add `fromArray`/`fromString`/`fromObject`/`fromObjectKeys`/`fromObjectValues` (accepting `AsyncStreamSource`/async `range`), plus `range`/`random`/`randomInt` and the `apply*` helpers (or at least document explicitly that these are intentionally sync-only and must be wrapped via `AsyncStream.from(Stream...)`).
