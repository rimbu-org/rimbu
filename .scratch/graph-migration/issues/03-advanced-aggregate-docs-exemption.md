# 03 — Write the `advanced/` aggregate docs exemption

**Spec:** `.scratch/graph-migration-plan.md` §7, third bullet.

**What to build:** Write the required prose-only exemption into
`packages/graph/AGENTS.md`. The plan commits to documenting the aggregate
`Advanced` types (`Api`, `Family`, `FamilyBase`) with **one** worked end-to-end
example per suite namespace, and giving the individual `With*` interfaces prose
only. That was a deliberate trade: 15 near-identical snippets is noise, and one
worked example teaches more.

**Blocked by:** nothing.

**Status:** ready-for-agent

- [ ] `packages/graph/AGENTS.md` states that `GraphCollection.Advanced.*` and
      `ValuedGraphCollection.Advanced.*` aggregates are exempt from the
      per-export `@example` requirement, and that each `Capability.With*`
      interface is intentionally prose-only.
- [ ] The exemption names `review-docs` as the skill that would otherwise flag
      it, so a future reader knows why the note exists.
- [ ] Each suite namespace actually has its one worked example, or the exemption
      says which ones do and which do not.

## Notes

This is a five-minute write that was missed because `review-docs` had not been
run against `packages/graph/src/advanced/` yet. Until it is written, the
exemption the plan promised is unwritten — so running `review-docs` will produce
a finding that looks like a regression rather than a known, accepted trade.

Worth pairing with an actual `review-docs` run over `packages/graph`, so the
rest of the `advanced/` tier's coverage is confirmed rather than assumed.
