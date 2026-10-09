# 01 — Delete the legacy `EmptyBase` / `NonEmptyBase`

**Spec:** `.scratch/graph-migration-plan.md` (commit 2, §6) and its §9 definition of done.

**What to build:** Remove `packages/collection-types/src/advanced/common/empty-base.ts`
and the last three `extends` clauses that reference it. This is the final
piece of the legacy `collection-types` removal — the `RMap`/`RSet`/`Variant*`
tier is already gone (see `.changeset/remove-legacy-map-set-surface.md`), and
`empty-base.ts` is the only survivor of that surface.

**Blocked by:** nothing. The `RMap`/`RSet` deletion it depended on has landed.

**Status:** resolved

- [x] `packages/collection-types/src/advanced/common/empty-base.ts` is deleted.
- [x] `packages/graph/src/internal/common/base.ts` no longer imports or
      extends `EmptyBase`.
- [x] `packages/graph/src/internal/non-valued/non-empty.ts` no longer imports
      or extends `NonEmptyBase`.
- [x] `packages/graph/src/internal/valued/non-empty.ts` no longer imports or
      extends `NonEmptyBase`.
- [x] `packages/core/src/collection-types/advanced.ts` drops the
      `advanced/common/empty-base` re-export.
- [x] `packages/collection-types/src/collection-types.ts` drops the
      `./advanced/common/empty-base` link from its package-doc list.
- [x] `@rimbu/collection-types/advanced/common/empty-base` is removed from any
      `tsconfig.common.json` `paths` entry that lists it — there were none.
- [x] `packages/collection-types/AGENTS.md` layout updated, with a note on why a
      shared empty base should not come back.
- [x] Graph's empty/non-empty classes keep their behaviour.
- [x] `bun run build:seq` (23/23), `typecheck:seq` (22/22), `test` (exit 0,
      graph **518 pass / 0 fail** — unchanged), `test:random` (8 suites),
      `biome:check` (exit 0) all pass.

## Notes

### Why this is not already done

`EmptyBase` supplied two things to graph's empty classes: an `isEmpty: true`
brand and the "throw on mutation" behaviour of an empty collection. Both need a
replacement, and the replacement has to come from graph's own capability
aggregates rather than from a shared base class — that is the whole point of the
migration. §4.1 of the plan already recorded that `EmptyBase.filter(): any` and
`EmptyBase.remove(): any` had to go and not be reintroduced; both are already
absent from `packages/graph/src/internal/common/base.ts`.

### Do not confuse this with the other `EmptyBase`

Eight packages legitimately declare a *local* `const EmptyBase =
MapCollectionEmpty.WithMixin(...)` alias. Those are unrelated and must stay.
Only the legacy class in `collection-types/advanced/common/empty-base.ts` is in
scope. The plan's §9 wording conflates the two; this issue deliberately does
not.

### The behaviour contract is *not* throw-on-mutate

Worth stating plainly, because it is easy to assume the opposite. `EmptyBase`
never threw on mutation — it returned `this`, and graph's empty classes do the
same (`addNode(): this`, `connect(): this`, …). The only thing that throws is
`assumeNonEmpty()`, which raises
`RimbuError.EmptyCollectionAssumedNonEmptyError`.

So the contract to preserve is:

- every mutator on the empty form is a no-op returning `this`
- `assumeNonEmpty()` throws
- `size` / `nodeSize` / `connectionSize` are `0`, `isEmpty` is `true`,
  `stream()` / `toArray()` are empty, `[Symbol.iterator]()` yields nothing

All of it is already asserted in the four `*-graph-test-standard.ts` harnesses
(`assumeNonEmpty` throws on `graphEmpty`; `connectEach([])` returns `graphEmpty`;
`connectEach(arr3)` yields `arr3`). Re-run those four suites rather than adding
new tests.

## Answer

Done 2026-10-09. `empty-base.ts` is deleted; graph no longer imports anything
from it.

### What replaced it

Two graph-local bases in `packages/graph/src/internal/common/base.ts`, mirroring
the existing `GraphEmptyBase` naming:

- **`GraphEmptyBase`** no longer `extends EmptyBase`. It now declares the members
  graph actually used: `_NonEmptyType`, `[Symbol.iterator]`, `assumeNonEmpty`
  (which throws), `stream`, `size`, `isEmpty`, `nonEmpty`, `toArray`.
- **`GraphNonEmptyBase<E>`** is new, and replaces `NonEmptyBase`. Both
  `GraphNonEmpty` and `ValuedGraphNonEmpty` extend it instead. It carries the
  emptiness brand, `nonEmpty` / `assumeNonEmpty` / `asNormal`, the iterator, and
  an `abstract stream(): Stream.NonEmpty<E>` — abstract because only each graph
  knows how to derive its elements, and because the non-empty form must promise
  `Stream.NonEmpty`, which the empty form cannot.

### Three members deliberately dropped

- `filter()` — `WithFilter` is refused for graphs, so per `AGENTS.md` `filter`
  must not exist anywhere on one.
- `length` — a banned name. A graph's `toArray().length` is neither `size` nor
  `connectionSize`, so there is no honest meaning to inherit.
- `remove()` — `removeNode` / `removeNodes` / `disconnect` are graph's vocabulary.

So the deletion was a small **tightening**: graph no longer inherits three members
that were wrong for it.

### One incidental fix

`GraphEmptyBase.forEach` was `forEach(f?: (element: E) => void)` with a comment
explaining that the optionality existed only because `EmptyBase.forEach()` was
declared with zero parameters. That is gone; `f` is now required, matching the
capability `Api`. `forEachIndexed`'s `options` became `_options`, and both
traversal callbacks became `_f` — biome's `noUnusedFunctionParameters` fires on a
*required* unused parameter but not on an optional one, so the cleanup exposed
the pre-existing unused-parameter debt.

### Notes for the next person

- `packages/list/src/internal/immutable/empty-base.ts` is list's **own** empty
  base and is untouched. It matched a `empty-base` grep during this work.
- Graph still reports 134 biome *warnings* (`noExplicitAny` mostly). Those
  pre-date this change and are separate work.
