# 02 — Make `Advanced.Api` the graph public surface

**Spec:** `.scratch/graph-migration-plan.md` §2.3, §2.1.

**What to build:** Make the public graph interfaces extend
`GraphCollection.Advanced.Api` / `ValuedGraphCollection.Advanced.Api` instead of
`GraphBase` / `ValuedGraphBase`. The capability aggregates already exist at
runtime and in the public types (`packages/graph/src/advanced/graph-base.ts`);
this is the last rewiring step, 2 of 2.

**Blocked by:** nothing mechanically — this is blocked on a *design* question,
below.

**Status:** needs-triage

- [ ] Graph's self-referential `Types` record is replaced with a `Family<N>`.
- [ ] The concrete `Families` are threaded through the internal classes
      (`_FAM` → `_CONTEXT` → `linkMapContext`).
- [ ] The 12 public interfaces that change parent are listed in the changeset as
      breaking.
- [ ] Graph contributes rows to the capability matrix in
      `plans/collection-capabilities.md` (issue 10 item 7).

## Notes

### Why it stalled

Attempted 2026-10-08 and reverted. Two invariance walls, in order:

1. A set is **invariant** in its element type, so the abstract `_LINK_MAP_FAM`
   cannot derive its value type from `_LINK_CONNECTIONS_FAM['_NORMAL']` the way
   §2.1 specifies. The widening in `plans/collection-capabilities.md` is the
   plan's own documented fallback, so this part is arguably settled — it just
   makes the design less precise than intended.
2. With the concrete `Families` wired into the internal classes, the same
   invariance reappears one level down, at `_FAM` → `_CONTEXT` →
   `linkMapContext`.

Neither wall is a bug. Both are the cost of modelling a map-valued graph whose
connection collection is itself a set of node-pairs.

### The decision that has to be made first

Is the remaining precision actually worth 12 breaking changes to graph's public
API? The concrete alternative is to close §2.3 as *won't-fix*, keep
`GraphBase`/`ValuedGraphBase` as the public surface, and reword §2.3 and §9 to
record that the capability `Api` aggregates are implemented and tested but are
deliberately not the public surface. That is a coherent end state — the graph
would then be the one collection in the repo not on the capability `Api`, which
needs saying out loud in `packages/graph/AGENTS.md`.

This is a maintainer call, not an implementation detail, so it is filed rather
than actioned.
