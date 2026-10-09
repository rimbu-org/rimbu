# 10 — Write-Docs (Public API Documentation Generation)

**What to build:** Fix-mode skill that generates missing JSDoc with runnable examples for `public/` exports. Counterpart to `review-docs` (09).

**Blocked by:** 01 — Scaffold Skill Template, 09 — Review-Docs

**Status:** ready-for-agent

- [ ] Create `.opencode/skills/write-docs/SKILL.md` + `scripts/` per template; `## Procedure` has Diagnose (reuse 09) + Fix sections
- [ ] Fix: gap-fill only — add missing `/** ... @example ... */` blocks for uncovered `public/` exports; **never overwrite** existing JSDoc without `--force` (Q13); examples must be `docs:verify-examples`-runnable
- [ ] Guardrails: generate one JSDoc block at a time, preserving existing formatting (`biome.json:11-14` tabs, `46-50` single quotes); do not generate README/TypeDoc frontmatter (left to `support/docs-extractor`)
- [ ] Post-check: run `docs:verify-examples` scoped to touched files and report pass/fail in the shared report; revert or warn on failure
- [ ] Verify on a dogfood package (e.g. `packages/hashed`): after `--fix`, `review-docs` (09) reports fewer `warn` and `docs:verify-examples` passes

**Notes:** Hybrid (Q2): diagnose by default, mutate only with `--fix`. Harness-independent.
