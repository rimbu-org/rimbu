# 06 — Audit-Tests (Unit Coverage Gaps)

**What to build:** Diagnose-only skill that inventories unit-test gaps for `bun test`.

**Blocked by:** 01 — Scaffold Skill Template

**Status:** ready-for-agent

- [ ] Create `.opencode/skills/audit-tests/SKILL.md` + `references/checklist.md` + `scripts/` per template
- [ ] Checklist per `AGENTS.md:213-224` (`test` script = `bun test test/* --tsconfig-override tsconfig.common.json`) and §7 method checklist: for each public method on the package's main interface, check presence of at least one `test/*.test.ts` case; flag missing `test-random/` property tests as `info` (Q11)
- [ ] Diagnose: single-package `<pkg>`; cross-reference `src/public/` exports vs `test/` coverage via `rg` + file listing; cite `test/` file:line where coverage exists; emit shared report with `Severity | Rule | Location | Evidence`
- [ ] Verify on `packages/hashed` and `packages/list` (both have `test-random`): report distinguishes covered vs missing and does not flag `info` as `warn`

**Notes:** Read-only. Output feeds `write-unit-tests` (11). Idempotent.
