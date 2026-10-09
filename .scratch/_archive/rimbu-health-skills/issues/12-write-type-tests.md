# 12 — Write-Type-Tests (Concise Type-Level Test Generation)

**What to build:** Fix-mode skill that generates concise `expectTypeOf` type tests from `audit-type-tests` (07) gaps.

**Blocked by:** 01 — Scaffold Skill Template, 07 — Audit-Type-Tests

**Status:** ready-for-agent

- [ ] Create `.opencode/skills/write-type-tests/SKILL.md` + `scripts/` per template; Diagnose reuses 07, Fix generates
- [ ] Fix: append only `test-d/*.generated.test-d.ts` (or `test-d/` equivalent); **use `expectTypeOf` only, ban `as` assertions** per Q11; cover `NonEmpty` narrowing, `OptLazy` fallback inference, HKT `Types` preservation, overload order (`AGENTS.md:29-30`, `429-444` `const` params, `445-463` `NoInfer`)
- [ ] Guardrails: never edit hand-written `test-d/*` without `--force`; run `tsc -p tsconfig.json --noEmit` (or `typecheck:seq` scoped) and report pass/fail; mark failure as `error` with evidence
- [ ] Verify on `packages/stream` or `packages/sorted`: generated file typechecks and `audit-type-tests` (07) re-run shows reduced gaps

**Notes:** Hybrid. Wave 2. Keep generated type tests concise — one `expectTypeOf` per uncovered generic/overload.
