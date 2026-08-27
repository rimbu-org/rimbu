---
name: _template
description: Shared template for all rimbu repo-health skills — do not invoke directly; copy to .opencode/skills/<kebab>/SKILL.md and replace placeholders
disable-model-invocation: true
---

# <Skill Title> — Template

> Copy this file to `.opencode/skills/<kebab>/SKILL.md` and replace every `<placeholder>`.
> The template itself (`_template`) has `disable-model-invocation: true` in its own file header — do not invoke it directly. Real skills set `disable-model-invocation: false` so agents can call them on demand, or `true` if they must be explicitly requested.

## Purpose

Describe what this skill does in one paragraph. State the single concern it owns (one skill = one concern), whether it is **diagnose-only** (read-only) or **hybrid** (diagnose by default, fix with `--fix`/`--force`), and its scope (single package `<pkg>` by default, optional `--workspace` only if the skill explicitly supports it).

This template enforces the repo-health skill contract from `.scratch/rimbu-health-skills/spec.md:2.11` and the grilling decisions Q1–Q17.

## Normative refs

List only canonical sources. `AGENTS.md` wins > `docs/adr/` > skill checklist (spec §2.5, Q5). Do not invent normative refs outside these two.

- `AGENTS.md:16-31` §1.1 API Design Goals (naming, math indices, `OptLazy`, `NonEmpty`, overload order) — cite if the skill checks public API
- `AGENTS.md:76-284` §3/§4/§5 Per-Package Anatomy & `package.json`/`tsconfig` shapes — cite if the skill checks package shape
- `AGENTS.md:287-478` §6 Core Code Patterns (Interface+Namespace, `NonEmpty`, `OptLazy`, HKT `Types`, `Reducer`, `const`/`NoInfer`, `Module`) — cite if the skill checks type/impl patterns
- `AGENTS.md:546-573` §9 Tooling Reference (Bun, Biome, `build:seq`/`typecheck:seq`, lint rules `noRestrictedImports` etc.) — cite if the skill invokes tooling or checks lint rules
- `AGENTS.md:138-152` import rule (package paths `#pkg/*`/`@rimbu/*`, never relative) — mandatory for any `src/` inspection
- `docs/adr/<nnnn>-*.md` — list the ADR(s) this skill implements, if any. If `docs/adr/` does not yet exist, proceed silently per `docs/agents/domain.md:11-12`; note the gap for `maintain-skills` to propose an ADR.

If a rule you want to enforce is not in `AGENTS.md` or an ADR, do not enforce it — emit a proposal for `maintain-skills` to patch `AGENTS.md`/ADR instead.

## When to use

One-line agent trigger — copy-paste ready:

> When you edit `packages/*` or review a package's public surface, consider invoking `<skill-name>` in diagnose mode (`--out` optional). Run fix mode only when the task explicitly asks for `--fix`/`--force`.

Add any additional triggers (e.g. "invoke `review-api` before publishing a new public method", "invoke `scout-dead-code` after removing an export").

## Procedure

### Diagnose (read-only, default)

1. Resolve target: single package `<pkg>` (e.g. `packages/stream`) is the default. If `--workspace` is passed and the skill supports it, expand to all 23 published packages (`packages/*` per `AGENTS.md:45-68`).
2. Collect evidence **without mutating** the repo:
   - Use only allowed runtime: `bun`, `rg` (ripgrep), `jq` (see `scripts/README.md`). Do not assume `gh`/`fd`/`yq`/`bat` are present unless the skill explicitly declares them.
   - For `src/` inspection, respect `AGENTS.md:138-152` — flag relative imports `./`/`../` as `error` per `biome.json:27-35`.
   - Cite tool output verbatim when you run `biome:check`, `typecheck`, or `docs:verify-examples` (Q10).
3. Emit the report per **Output contract** below to **stdout** by default; if `--out <path>` is given, also write the same markdown to that path (convention: `.scratch/reports/<skill>/<pkg>.md` per Q8). Never write outside the repo root and `/tmp` (`AGENTS.md:601-625` sandbox).
4. Be **idempotent** and safe to re-run — same input produces same report (Q6).

### Fix (opt-in, `--fix` / `--force`)

Only implement if this skill is hybrid (spec §2.2). Diagnose-only skills omit this section or state "This skill has no fix mode."

1. Require explicit `--fix` (or `--force` to overwrite hand-written files). Without it, refuse to mutate and emit the diagnose report instead.
2. Apply the minimal patch: gap-fill only. Never overwrite hand-written files (`test/*.test.ts`, `test-d/*.test-d.ts`, JSDoc) without `--force` (Q11/Q13). For `write-*` skills, append `*.generated.*` files.
3. Post-check: run the scoped tool that validates the fix and report pass/fail in the findings:
   - `review-anatomy` → `biome:check` + `typecheck`
   - `write-unit-tests` → `bun test <generated>`
   - `write-type-tests` → `tsc -p tsconfig.json --noEmit`
   - `write-docs` → `docs:verify-examples`
4. Re-emit the report with updated counts. The report must still be written to stdout and optionally `--out`.

## Output contract

Every skill — diagnose or fix — emits markdown that conforms to the shared report template at `../_template/references/report-template.md` (spec §2.8). The contract is harness-independent (plain markdown, no JSON v1).

Required structure:

```markdown
# <skill> — <pkg>
## Summary
One paragraph + counts by severity: X error, Y warn, Z info. State whether the package is clean for this concern.

## Findings
| Severity | Rule | Location | Evidence | Suggested fix | Normative ref |
|---|---|---|---|---|---|

## Next actions
Bullet list of concrete follow-ups (e.g. "run with --fix", "open ADR", "re-run after patch"). If no findings, state "No action required."
```

Severity semantics (Q8/Q9):

- `error` — contract break that must be fixed before merge (e.g. `review-api` naming/index/`OptLazy`/`NonEmpty` order/tier leakage; `review-anatomy` shape violation; broken `docs:verify-examples` example).
- `warn` — should fix, but not blocking (e.g. HKT `Types` nuance, `any`/`!` in impl, potential dead code, missing JSDoc).
- `info` — advisory (e.g. `test-random` gap, arch opportunity).

Location convention: `file:line` (e.g. `packages/hashed/src/hashmap.ts:42`) or `package: <name>` for package-level findings. Evidence is the verbatim `rg`/`biome`/`tsc` snippet; Suggested fix is a one-line patch hint; Normative ref is `AGENTS.md:XX-YY §Z` or `docs/adr/NNNN`.

Output location: stdout markdown is the default. When `--out .scratch/reports/<skill>/<pkg>.md` is given, write the identical markdown there (create parent dirs if needed). This is the `--out` convention from Q8.

## Examples

```bash
# Diagnose single package to stdout (default, safe for agent auto-invoke)
bun .opencode/skills/<kebab>/scripts/run.ts -- packages/stream

# Diagnose with file output
bun .opencode/skills/<kebab>/scripts/run.ts -- packages/hashed --out .scratch/reports/<kebab>/hashed.md

# Fix mode (only if this skill is hybrid — requires explicit opt-in)
bun .opencode/skills/<kebab>/scripts/run.ts -- packages/stream --fix
bun .opencode/skills/<kebab>/scripts/run.ts -- packages/stream --fix --force  # overwrite hand-written files

# Workspace sweep (only if the skill declares --workspace support)
bun .opencode/skills/<kebab>/scripts/run.ts -- --workspace --out .scratch/reports/<kebab>/workspace.md
```

## Allowed runtime

Scripts in `scripts/` may only assume `bun`, `rg`, `jq` are present (Q3/Q14). Do not rely on harness-specific JS APIs. See `scripts/README.md` for the runtime contract and the `AGENTS.md:138-152` package-path import rule.
