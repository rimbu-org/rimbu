# 05 — Scout-Dead-Code

**What to build:** Diagnose-only skill that finds unused exports, orphan `internal/` files, and stale `advanced/` re-exports.

**Blocked by:** 01 — Scaffold Skill Template

**Status:** ready-for-agent

- [ ] Create `.opencode/skills/scout-dead-code/SKILL.md` + `references/checklist.md` + `scripts/` per template
- [ ] Scope: package-scoped default (`<pkg>`); optional `--workspace` builds a cross-package import graph via `rg` + `tsconfig` path aliases (`#pkg/*`, `@rimbu/*`) — never mutate
- [ ] Checks: unused `public/` exports (no importer in `src/` + `test/`), `internal/` files with zero importers, `advanced/` re-exports that no longer re-export anything private, `files` vs `exports` drift
- [ ] Severity: all `warn` until confirmed by `rg` evidence; never `error` (Q12); report includes `rg` command + match count as evidence
- [ ] Verify on `packages/list` and `packages/stream`: confirm a known live export is not flagged and a known orphan (if any) is flagged with evidence

**Notes:** Advisory; `maintain-skills` must not promote `warn` to `error` without grep confirmation. Single-package safe for agent auto-invoke.
