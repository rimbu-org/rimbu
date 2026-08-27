# 07 — Audit-Type-Tests (Type-Level Gaps)

**What to build:** Diagnose-only skill that inventories `test-d/` / `expectTypeOf` gaps.

**Blocked by:** 01 — Scaffold Skill Template

**Status:** ready-for-agent

- [ ] Create `.opencode/skills/audit-type-tests/SKILL.md` + `references/checklist.md` + `scripts/` per template
- [ ] Checklist per `AGENTS.md:424-463` §6.6 (`const` type params, `NoInfer<T>`), `AGENTS.md:335-352` NonEmpty refinements, `AGENTS.md:375-398` HKT `Types`, and `AGENTS.md:29-30` overload order: verify each public generic method has a `test-d/*.test-d.ts` (or `test-d/` equivalent) asserting precise return types, `NonEmpty` narrowing, and fallback inference
- [ ] Rules: type tests must use `expectTypeOf` only; flag any `as`-based assertions as `warn` (ban in generated tests per Q11); cite `test-d/` file:line or absence
- [ ] Diagnose: single-package `<pkg>`; emit shared report; `test-random` not in scope
- [ ] Verify on `packages/stream` and `packages/hashed`: findings align with existing `test-d/` coverage and do not false-flag packages that use `expectTypeOf` correctly

**Notes:** Read-only. Feeds `write-type-tests` (12). `noExplicitAny`/`noNonNullAssertion` rules from `biome.json:15-44` are informational only here.
