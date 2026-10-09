# 09 — Review-Docs (Documentation Coverage)

**What to build:** Diagnose-only skill that checks JSDoc/TypeDoc and runnable example coverage.

**Blocked by:** 01 — Scaffold Skill Template

**Status:** ready-for-agent

- [ ] Create `.opencode/skills/review-docs/SKILL.md` + `references/checklist.md` + `scripts/` per template
- [ ] Checklist: every `public/` export has JSDoc with at least one `@example` that is `docs:verify-examples`-runnable (`package.json:56-64`, `config/typedoc.json:1-16`); TypeDoc plugin (`support/typedoc-rimbu-plugin`) renders without warnings; `README` not in scope
- [ ] Diagnose: single-package `<pkg>`; use `rg` for JSDoc presence + run `docs:verify-examples` scoped to the package as evidence where cheap; emit shared report
- [ ] Severity: missing JSDoc = `warn`, broken example = `error`
- [ ] Verify on `packages/stream` (has `docs: rimraf docs && bunx typedoc`): report matches actual `docs:verify-examples` output

**Notes:** Feeds `write-docs` (10). Read-only. Wave 2 per Q1.
