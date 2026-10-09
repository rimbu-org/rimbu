# 13 — Scout-Improvements (Architecture & Design Opportunities)

**What to build:** Advisory-only skill that surfaces pattern-level improvement opportunities, not line nits.

**Blocked by:** 01 — Scaffold Skill Template

**Status:** ready-for-agent

- [ ] Create `.opencode/skills/scout-improvements/SKILL.md` + `references/checklist.md` + `scripts/` per template
- [ ] Scope: package-scoped `<pkg>`; checks architecture patterns (§6 Interface+Namespace, HKT `Types`, `Reducer`, `Module`, `NonEmpty` ergonomics), API ergonomics (§1.1 consistency), and perf anti-patterns (e.g. unnecessary materialization of `Stream`); **no line-level Biome nits** (those are `review-impl` per Q12)
- [ ] Output: advisory backlog per package with columns `Opportunity | Rationale | Effort (S/M/L) | ADR sketch | AGENTS.md impact`; severity all `info` (or `warn` for high-leverage arch debt); contradictions to `docs/adr/*` flagged explicitly per `docs/agents/domain.md:32-36`
- [ ] Verify on `packages/list` and `packages/graph`: report contains at least one actionable arch suggestion with an ADR sketch and does not repeat `review-impl` findings

**Notes:** Purely diagnostic; feeds future ADRs via `maintain-skills`. Idempotent.
