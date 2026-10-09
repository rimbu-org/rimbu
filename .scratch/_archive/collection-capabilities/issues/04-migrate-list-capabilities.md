# 04 — Migrate List Capabilities

**What to build:** Make every List variant and builder expose the new indexed vocabulary and semantics, including precise `NonEmpty` behavior, `swapAt`, validated numeric operations, and immutable no-op identity guarantees.

**Blocked by:** 03 — Build Collection Capability Foundation

**Status:** done

- [x] All List variants compose Collection, Indexed, Filterable, RemovableAt, and SwappableAt capabilities.
- [x] List and builder names use `size`, `setAt`, `insertAt`, `removeAt`, and `streamSlice` as specified.
- [x] Positional slicing no longer accepts reversed collection output; reverse projections remain stream behavior.
- [x] Negative indices, invalid values, amounts, ranges, and no-op edits follow the shared contracts.
- [x] Immutable Lists and builders support `swapAt`.
- [x] Removed List aliases and method-form `*AndGet` APIs are absent from the public surface.

> **Evidence (verified 2026-10-04).** `packages/list` composes the capability
> families via the `WithMixin` chain (`src/advanced/immutable/{empty,non-empty}-base.ts`)
> with its `Family` at `src/list.ts:69`. `size`/`setAt`/`insertAt`/`removeAt`/
> `streamSlice`/`swapAt` are all present across `src`; the old `with(` and `insert(`
> spellings are gone (0 files each).
> Two leftovers are **implementation-internal, not public surface**: a
> `streamRange` method on `BitOuterChildrenOps` (`src/advanced/children-ops.ts:65`)
> and `{ length: number }` options on the internal context
> (`src/internal/context.ts:256`). Both are private to the block-tree internals.
