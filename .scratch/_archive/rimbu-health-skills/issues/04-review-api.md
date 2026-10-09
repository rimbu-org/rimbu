# 04 — Review-API (Public API Consistency)

**What to build:** Diagnose-only skill that audits the public API surface for `AGENTS.md` §1.1/§6 contract compliance.

**Blocked by:** 01 — Scaffold Skill Template

**Status:** ready-for-agent

- [ ] Create `.opencode/skills/review-api/SKILL.md` + `references/checklist.md` + `scripts/` per template
- [ ] Checklist per Q9, citing `AGENTS.md:16-31` and `AGENTS.md:287-478`:
  - (a) naming consistency (`filter`/`map`/`flatMap`/`take`/`drop` identical everywhere)
  - (b) math-index contract (`-1`=last, mirrors `Array.at()`; `Stream`/`AsyncStream` `at(-1)` must return fallback §1.1)
  - (c) `OptLazy` overload pair existence per `AGENTS.md:354-373`
  - (d) `NonEmpty` overload order (`StreamSource.NonEmpty` first) per `AGENTS.md:29-30`
  - (e) HKT `Types` slot preservation per `AGENTS.md:375-398`
  - (f) `Module` pattern sealing per `AGENTS.md:467-476`
  - (g) tier leakage (`public`/`advanced`/`internal` per `AGENTS.md:104-113`)
- [ ] Severity: (a)(b)(c)(d)(g)=`error`, (e)(f)=`warn` (Q9); every finding cites `AGENTS.md` §
- [ ] Diagnose: single-package scope (`<pkg>`), optional `--workspace`; use `rg` + `API_SURFACE.md`/`support/docs-extractor` output as evidence where possible; emit shared report template
- [ ] Verify on `packages/stream` and `packages/hashed`: findings match known `issues/*.md` gaps and `API_SURFACE.md:1-10` aggregate

**Notes:** Read-only, static analysis + grep. No build required.
