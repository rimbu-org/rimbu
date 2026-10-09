# 02 — Maintain-Skills Caretaker & Orchestrator

**What to build:** The meta skill that lints all other skills against the template, aggregates suite reports, and reconciles checklist drift with `AGENTS.md`/ADRs.

**Blocked by:** 01 — Scaffold Skill Template

**Status:** ready-for-agent

- [ ] Create `.opencode/skills/maintain-skills/SKILL.md` per `_template` skeleton
- [ ] Implement diagnose: scan `.opencode/skills/*/SKILL.md` for skeleton compliance, `Normative refs` validity (only `AGENTS.md:1-638` § refs + `docs/adr/*`), and report-contract adherence; cite `AGENTS.md:626-638` and `docs/agents/*.md`
- [ ] Implement orchestrator mode: run all Wave 1 (+ optionally Wave 2) skills in dependency order on a given `<pkg>` and emit an aggregated `## Summary` + rolled-up findings table to stdout and optionally `--out .scratch/reports/maintain-skills/<pkg>.md`
- [ ] Implement drift check: if a skill enforces a rule absent from `AGENTS.md`, emit a `warn` proposing an ADR/`AGENTS.md` patch instead of silently enforcing (Q5)
- [ ] Fix mode: with `--fix`, auto-patch skill `SKILL.md` frontmatter/sections to match `_template` and update `references/report-template.md` links
- [ ] Verify by linting 01's template against itself and running orchestrator in diagnose on `packages/stream` (no mutations)

**Notes:** Idempotent, single-package-scoped by default; `--workspace` sweep optional. Hybrid diagnose-by-default (Q2).
