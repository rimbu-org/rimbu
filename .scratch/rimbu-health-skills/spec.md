# Rimbu Repo-Health Skills — Spec

**Feature slug:** `rimbu-health-skills`
**Status:** `ready-for-agent` — grilled 2026-08-27, frontier empty, confirmed by owner
**Monorepo:** `/workspace/rimbu-worktree` — 23 published packages (`packages/*` per `AGENTS.md:45-68` + unpublished `list2`), Bun-only, Biome, `build:seq`/`typecheck:seq`

---

## 1. Context & Problem

The monorepo is in a messy state with no executable skills today (verified: no `.opencode/skills/`, no `.claude/`, no `opencode.json`; only 3 markdown contracts in `docs/agents/` referenced from `AGENTS.md:626-638`). A 38-issue backlog in `issues/` + `API_SURFACE.md` (784 entities) catalogs API/impl/test gaps, but there is no repeatable, agent-invocable way to keep the repo in shape. `CONTEXT.md`/`docs/adr/` do not yet exist (single-context repo per `docs/agents/domain.md:14-24`).

Goal: a suite of narrow, harness-independent skills that agents can call on demand (when touching `packages/*`) or humans can invoke manually, to systematically review, scout, and — when opted in — fix the repo.

## 2. Design Decisions (Grilling Q1–Q17, confirmed)

### 2.1 Quality pillars & waves (Q1)
- **Wave 1 load-bearing:** A API consistency + D test coverage (unit + type) + E dead-code / package-anatomy drift.
- **Wave 2:** B impl quality/perf + C docs coverage.
- **Meta last:** F `AGENTS.md`/skill coherence & architecture.
- **Measure of done:** Wave 1 skills pass clean on `stream`/`hashed`/`list` dogfood packages; no `error` findings remain in Wave 1 categories.

### 2.2 Mode (Q2)
- **Hybrid diagnose-by-default.** Diagnose = read-only report. Fix/mutate = only with explicit `--fix` / `--force`. Agents may run diagnose unattended; fix only when the task explicitly asks.

### 2.3 Portability (Q3/Q14)
- Authored as **`.opencode/skills/<kebab>/SKILL.md` + `scripts/` + `references/`** — OpenCode spec, but content is plain Markdown + Bun scripts, degradable to `docs/skills/` or `skills/` elsewhere.
- Guarantee: runs on **Bun ≥ 1** with only `rg`/`jq`/`bun` present. No harness-specific JS APIs. All imports follow `AGENTS.md:138-152` package-path rule (`#pkg/*`, `@rimbu/*`), never relative.

### 2.4 Granularity (Q4)
- **11 micro-skills + 1 added `write-docs` = 12 narrow skills** + thin orchestrator. Each concern is its own skill; `audit-*` (read-only) and `write-*` (mutating) are split so audits are safe to auto-invoke.
- A meta orchestrator aggregates but never hides narrow entry points.

### 2.5 Authority (Q5)
- **`AGENTS.md` wins > ADR > skill checklist.** Every skill's `## Normative refs` cites `AGENTS.md` § and ADR if exists. A skill may not silently enforce a rule absent from `AGENTS.md`; it must propose an ADR/`AGENTS.md` patch via `maintain-skills`.

### 2.6 Invocation & lifecycle (Q6)
- **Human + agent on-demand**, single-package-scoped (`<pkg>` arg), idempotent, safe to re-run. CI gate and periodic `.scratch` sweeps deferred to after Wave 1 dogfooding.
- **Caretaker:** `maintain-skills` reconciles skill checklists ↔ `AGENTS.md`/ADRs.

### 2.7 Roster (Q7 + Q13)

| # | Skill | Wave | Mode | Normative refs | Purpose |
|---|---|---|---|---|---|
| 1 | `review-api` | 1 | diagnose | `AGENTS.md:16-31` §1.1, §6.1-6.7 | Public API: naming consistency, math indices (`-1`=last, `Stream.at(-1)` fallback), `OptLazy` overload pair, `NonEmpty` overload order, HKT `Types` slot, `Module` sealing, tier exports |
| 2 | `review-anatomy` | 1 | diagnose (+tool evidence) | `AGENTS.md:76-284` §3-5, `biome.json:27-35` | Package shape: `exports` (`"."`, `"./*"`, `"./advanced/*"`), `imports` (`#pkg/*`), `tsconfig.*`, `scripts`, `sideEffects:false`, `workspace:*`, no-relative-imports; runs `biome:check`/`typecheck` as evidence |
| 3 | `scout-dead-code` | 1 | diagnose | §3 tiers, `tsconfig` paths | Unused exports, orphan `internal/` files, stale `advanced/` re-exports; package-scoped default, `--workspace` cross-package `rg` graph; `warn` not `error` until confirmed |
| 4 | `audit-tests` | 1 | diagnose | `AGENTS.md:213-224`, §7 | Unit gaps (`test/*.test.ts`, `bun test`); `test-random` gaps = `info` |
| 5 | `audit-type-tests` | 1 | diagnose | `AGENTS.md:424-463` §6.6 | Type gaps (`test-d/`, `expectTypeOf`); ban `as` in checks |
| 6 | `review-impl` | 2 | diagnose | `AGENTS.md:287-478` §6, `biome.json:15-44` §9 | Impl quality: Biome correctness/style, mutation leaks, `NonEmpty` narrowing, `Reducer` misuse, `any`/`!`/`console`; static, no heavy build |
| 7 | `review-docs` | 2 | diagnose | `AGENTS.md:546-573`, `package.json:56-64` | JSDoc/TypeDoc + `docs:verify-examples` runnable examples |
| 8 | `write-docs` | 2 | fix | §1.1/§6 + docs pipeline | Fill missing JSDoc with runnable `@example`; gap-fill only, `--force` to overwrite; post-check `docs:verify-examples` |
| 9 | `write-unit-tests` | 2 | fix | §7 | Generate `*.generated.test.ts` from `audit-tests`; never edits hand-written files w/o `--force`; scoped `bun test` |
| 10 | `write-type-tests` | 2 | fix | §6.2-6.4, §6.6 | Generate `*.generated.test-d.ts` (`expectTypeOf` only, no `as`) |
| 11 | `scout-improvements` | meta | diagnose (advisory) | §1.1, `CONTEXT.md`/`docs/adr/` | Pattern-level opportunities: `Opportunity | Rationale | Effort | ADR sketch | AGENTS.md impact`; no line nits |
| 12 | `maintain-skills` | meta | diagnose+fix (orchestrator/caretaker) | `AGENTS.md:626-638`, `docs/agents/*.md` | Lints skills vs template, aggregates suite report, proposes `AGENTS.md`/ADR patches |

### 2.8 Report contract (Q8)
- **Location:** stdout markdown by default; optional `--out .scratch/reports/<skill>/<pkg>.md`.
- **Template (shared `references/report-template.md`):**
  ```md
  # <skill> — <pkg>
  ## Summary (counts by severity)
  ## Findings
  | Severity | Rule | Location (file:line) | Evidence | Suggested fix | Normative ref |
  ## Next actions
  ```
- Severity `error`/`warn`/`info`. `review-api`: (a)(b)(c)(d)(g)=`error`, (e)(f)=`warn` (Q9). No JSON v1; add `--json` later if needed.

### 2.9 Skill detail refinements (Q9–Q12)
- **Q9 `review-api` depth:** See severity split above; every finding cites `AGENTS.md` §.
- **Q10 `review-impl` vs `review-anatomy`:** `review-anatomy` may invoke `biome:check`/`typecheck` and cite output; `review-impl` stays static/fast for mid-task agent use; orchestrator can chain both.
- **Q11 `audit` vs `write` safety:** `write-*` appends `*.generated.*` files, never overwrites hand-written without `--force`; runs scoped `bun test`/`tsc` and reports pass/fail; type tests use `expectTypeOf` only.
- **Q12 `scout-dead-code`/`scout-improvements` seams:** dead-code package-scoped default, `--workspace` optional with `rg`+`tsconfig` graph; `scout-improvements` never repeats line nits (those are `review-impl`).

### 2.10 Added `write-docs` (Q13)
- Covers **(a) JSDoc + (b) runnable examples** only; no README/TypeDoc generation (left to `support/docs-extractor`). Gap-fill; `--force` to overwrite.

### 2.11 Authoring & discovery (Q15–Q16)
- **Layout:** `.opencode/skills/<kebab>/SKILL.md` + `scripts/` + `references/` + shared `_template/SKILL.md`.
- **Skeleton per `SKILL.md`:** frontmatter (`name`, `description`, `disable-model-invocation`) + `## Purpose` + `## Normative refs` + `## When to use` (one-line agent trigger) + `## Procedure` (Diagnose / Fix) + `## Output contract` + `## Examples`.
- **`maintain-skills` enforces skeleton** and that `Normative refs` only cite `AGENTS.md`/ADRs.
- **Naming:** bare kebab (`review-api`, not `rimbu-review-api`). Discovery: one `AGENTS.md` table linking to `.opencode/skills/*/SKILL.md`.

### 2.12 Rollout (Q17)
- `_template` + `maintain-skills` first (freeze contract) → Wave 1 `review-anatomy` → `review-api` → `scout-dead-code` → `audit-tests`/`audit-type-tests` → Wave 2 → `scout-improvements`. Dogfood on `stream`, `hashed`, `list`. CI/periodic sweeps deferred.

## 3. Non-Goals (explicit)
- No harness-specific runtime (no OpenCode/Claude JS APIs inside skills).
- No JSON output v1, no auto-PR, no destructive `--force` by default.
- No README/TypeDoc generation in `write-docs`; no cross-package fix-all without explicit `--workspace --fix`.

## 4. File Map
```
.scratch/rimbu-health-skills/
├── spec.md
└── issues/
    ├── 01-scaffold-skill-template.md
    ├── 02-maintain-skills-caretaker.md
    ├── 03-review-anatomy.md
    ├── 04-review-api.md
    ├── 05-scout-dead-code.md
    ├── 06-audit-tests.md
    ├── 07-audit-type-tests.md
    ├── 08-review-impl.md
    ├── 09-review-docs.md
    ├── 10-write-docs.md
    ├── 11-write-unit-tests.md
    ├── 12-write-type-tests.md
    ├── 13-scout-improvements.md
    └── 14-integrate-skills-into-agents-md.md
.opencode/skills/
├── _template/
│   ├── SKILL.md
│   └── references/report-template.md
├── review-api/...
├── review-anatomy/...
└── ... (12 skills)
```

## 5. Acceptance Criteria (suite)
- [ ] `_template` + `maintain-skills` lint all 12 skills against the skeleton and report contract.
- [ ] Each skill is idempotent, single-package-scoped, diagnose-by-default, and cites `AGENTS.md` § per finding.
- [ ] `review-anatomy`/`review-api`/`scout-dead-code` produce clean `error`-free reports on at least 2 dogfood packages after fixes applied with `--fix`.
- [ ] `audit-*` findings are reproducible via `bun test`/`tsc`; `write-*` generated files pass their scoped checks.
- [ ] `write-docs` generated examples pass `docs:verify-examples`.
- [ ] `AGENTS.md` contains the skills discovery table with correct links.

## 6. Risks & Mitigations
- **Checklist drift vs `AGENTS.md`:** mitigated by `maintain-skills` as the only writer of normative deltas.
- **Harness lock-in:** mitigated by Markdown+Bun-only rule and `_template` enforcement.
- **Noise from `scout-*`:** mitigated by `warn`/`info` defaults and package-scoped runs.

## 7. References
- `AGENTS.md:1-638` — primary normative source
- `biome.json:1-85` — formatter/linter rules
- `package.json:48-74` root scripts (`build:seq`, `typecheck:seq`, `test`, `docs:*`)
- `config/tsconfig.*` — TS baselines
- `docs/agents/issue-tracker.md`, `triage-labels.md`, `domain.md`
- `.scratch/collection-capabilities/` — prior wayfinder usage example
- `issues/` + `API_SURFACE.md` — existing gap backlog (38 issues, 784 entities)
