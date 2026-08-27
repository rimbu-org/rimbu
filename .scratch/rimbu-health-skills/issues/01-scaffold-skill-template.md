# 01 — Scaffold Skill Template & Shared Report Contract

**What to build:** Create the shared authoring template and report contract that all 12 repo-health skills must conform to. This is the prerequisite for every other ticket.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Create `.opencode/skills/_template/SKILL.md` with frontmatter (`name`, `description`, `disable-model-invocation`) + sections `## Purpose`, `## Normative refs`, `## When to use`, `## Procedure` (Diagnose / Fix), `## Output contract`, `## Examples` per spec §2.11
- [ ] Create `.opencode/skills/_template/references/report-template.md` with the exact report skeleton from spec §2.8 (`# <skill> — <pkg>` → `## Summary` → `## Findings` table with `Severity | Rule | Location | Evidence | Suggested fix | Normative ref` → `## Next actions`)
- [ ] Template references only `AGENTS.md` (§1.1/§3-6/§9) and `docs/adr/` as normative sources; document severity semantics (`error`/`warn`/`info`) and the `stdout` default + `--out` file convention (Q8)
- [ ] Add `scripts/` stub showing the allowed runtime (Bun + `rg`/`jq` only) and package-path import rule (`AGENTS.md:138-152`)
- [ ] Verify that `maintain-skills` (02) can lint a dummy skill against this template (dry run)

**Notes:** Harness-independent: plain Markdown + Bun scripts, no OpenCode/Claude JS APIs. `AGENTS.md` wins > ADR > checklist (Q5).
