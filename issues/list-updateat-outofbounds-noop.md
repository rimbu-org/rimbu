---
severity: low
impact: package
complexity: small
pass: implementation
package: list
confidence: medium
effort_estimate: 0.5d
title: "List.updateAt/with silently no-ops on out-of-bounds indices instead of throwing"
---

## Summary

`List.updateAt` (and therefore `with`) treats any out-of-bounds index — including a negative index whose magnitude exceeds the length — as a silent no-op, returning `this` unchanged. A valid negative index (e.g. `-1`) correctly updates the last element, but an invalid one (`length` or beyond, or `-length-1`) is swallowed with no error.

This inconsistent failure mode can hide off-by-one or logic bugs: a caller expecting an updated value silently receives the original list. Most Rimbu mutating operations surface invalid indices via `RimbuError`, so the silent return is out of step with the rest of the library.

## Evidence

- `packages/list/src/internal/immutable/outer-tree.ts:90-97` — `updateAt`: `if (index >= length || -index > length) return this;` then `if (index < 0) return this.updateAt(length + index, update);`
- Same pattern in `packages/list/src/internal/immutable/outer-block.ts:99-100` — `if (index >= length || -index > length) {...}` (returns `this` in the no-op case for `updateAt`).
- Contrast: `get` at `packages/list/src/internal/immutable/outer-tree.ts:77-88` returns the `otherwise` fallback (the intended, safe behavior), while `updateAt` returns `this` with no signal that nothing changed.

## Impact

Silent data-loss/non-update when an index is out of range; harder-to-debug streams of transformations that "do nothing." Particularly risky for negative indices that are off by one from a valid position.

## Recommendation

Decide on a consistent policy for out-of-bounds `updateAt`/`with`:
- Either throw `RimbuError` (consistent with other invalid-index handling in the library), or
- Document clearly that out-of-bounds `updateAt` is a no-op and consider returning the source unchanged but with a runtime warning/assertion in dev builds.

At minimum, align the doc comment of `ListBase.updateAt`/`with` with the actual silent-no-op behavior.
