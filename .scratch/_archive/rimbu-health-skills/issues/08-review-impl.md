# 08 — Review-Impl (Implementation Quality)

**What to build:** Diagnose-only skill for judgmental impl review — correctness, mutation safety, and Biome §9 compliance.

**Blocked by:** 01 — Scaffold Skill Template

**Status:** ready-for-agent

- [ ] Create `.opencode/skills/review-impl/SKILL.md` + `references/checklist.md` + `scripts/` per template
- [ ] Checklist per `AGENTS.md:287-478` §6 and `biome.json:15-44`/`AGENTS.md:565-572`:
  - `noUnusedImports` error, `noExplicitAny` warn, `noNonNullAssertion` warn, `noConsole` error in `src/`, `noRestrictedImports` ban on `./`/`../`
  - Mutation leaks (methods returning `this` vs new instance), `NonEmpty` narrowing bugs, `Reducer` misuse, `Token`/`RimbuError` misuse (`packages/base`)
- [ ] Diagnose: single-package `<pkg>`, static analysis only — **do not** run `build:seq` (Q10) so it stays fast mid-task; `review-anatomy` (03) handles the heavy `biome:check`/`typecheck` evidence
- [ ] Emit shared report; severity follows `biome.json` config; every Biome finding cites rule + file:line
- [ ] Verify on `packages/list` (block-tree impl) and `packages/stream` (lazy impl): report surfaces real `any`/`!`/`console` hits without false-flagging tests (`biome.json:73-84` override)

**Notes:** Read-only advisory; line nits live here, not in `scout-improvements` (Q12). Orchestrator may chain 03+08 for a full sweep.
