# 11 — Write-Unit-Tests (Focused Unit Test Generation)

**What to build:** Fix-mode skill that generates focused `bun:test` cases from `audit-tests` (06) gaps.

**Blocked by:** 01 — Scaffold Skill Template, 06 — Audit-Tests

**Status:** ready-for-agent

- [ ] Create `.opencode/skills/write-unit-tests/SKILL.md` + `scripts/` per template; Diagnose reuses 06, Fix generates
- [ ] Fix: append only `test/*.generated.test.ts` (never edit hand-written `test/*.test.ts` without `--force` per Q11); follow existing `test/` patterns in the target package (`bun test` style, no `console`); keep tests concise and isolated per public method
- [ ] Guardrails: run `bun test test/<generated>` scoped to the new file and report pass/fail in the shared report; on failure, leave file but mark finding as `error` with reproduction note
- [ ] Use `audit-tests` output as the gap list; one generated file per package run, one test suite per uncovered method
- [ ] Verify on `packages/hashed` or `packages/list`: generated file passes `bun test` and `audit-tests` (06) re-run shows reduced gaps

**Notes:** Hybrid diagnose-by-default. Wave 2.
