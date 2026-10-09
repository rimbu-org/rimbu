# 03 — Review-Anatomy (Package Shape)

**What to build:** Diagnose-only skill that checks every package's shape against `AGENTS.md` §3/§4/§5 and `biome.json` import rules.

**Blocked by:** 01 — Scaffold Skill Template

**Status:** ready-for-agent

- [ ] Create `.opencode/skills/review-anatomy/SKILL.md` + `references/checklist.md` + `scripts/` per template
- [ ] Checklist covers: `exports` (`"."`, `"./*"`, `"./advanced/*"` → `dist/...`), `imports` (`#<pkg>/*`), `files: ["dist","src"]`, `sideEffects:false`, `workspace:*` deps, `tsconfig.json` / `tsconfig.esm.json` / `tsconfig.common.json` shapes per `AGENTS.md:155-284`, layout `src/<name>.ts` / `src/public/` / `src/advanced/` / `src/internal/` per `AGENTS.md:79-113`, and `biome.json:27-35` ban on `../` relative imports (`AGENTS.md:138-152`)
- [ ] Diagnose: accept `<pkg>` (single package) or `--workspace` (all 23); run `biome:check` and `typecheck` (scoped) as evidence per Q10 and cite tool output; emit report per shared template with `Normative ref` column (`AGENTS.md §3/§4/§5/§9`)
- [ ] Severity: shape violations = `error`, style drift = `warn`
- [ ] Verify on `packages/stream` and `packages/hashed` (dogfood): report is accurate vs. actual `package.json`/`tsconfig.*`; no false positives on compliant packages

**Notes:** Read-only. Fast enough for mid-task agent use. `maintain-skills` lints this skill's checklist against `AGENTS.md`.
