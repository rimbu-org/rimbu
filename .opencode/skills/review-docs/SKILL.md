---
name: review-docs
description: Diagnose-only docs coverage — every public export has JSDoc with @example that is docs:verify-examples-runnable; TypeDoc renders without warnings
disable-model-invocation: false
---

# Review-Docs — Documentation Coverage

Diagnose-only skill that checks JSDoc/TypeDoc and runnable example coverage for `packages/<name>/src/public/**/*.ts` (and `src/<name>.ts` entry). Uses `rg` for JSDoc presence and `docs:verify-examples` scoped to the package as evidence where cheap. Reports missing JSDoc as `warn`, broken examples as `error`.

## Purpose

Single-concern docs coverage lint for `packages/<name>/`. Verifies that every public export in `src/public/**/*.ts` (and the main `src/<name>.ts` entry) has a `/** ... @example ... */` block that is `docs:verify-examples`-runnable (`package.json:56-64`, `config/typedoc.json:1-16`), and that the TypeDoc plugin (`support/typedoc-rimbu-plugin`) would render without warnings. `README` is not in scope. Scope is single package `<pkg>` by default, `--workspace` for all packages with `src/public/`. This skill is **diagnose-only** (never mutates) and feeds `write-docs` (10) per Wave 2.

## Normative refs

- `AGENTS.md:546-573` §9 Tooling Reference (`docs:verify-examples`, `typedoc`, `build:seq`)
- `package.json:56-64` docs scripts (`docs:extract`, `docs:verify-examples`, `docs:markdown`, `docs:build`)
- `config/typedoc.json:1-16` TypeDoc config (`entryPointStrategy: packages`, `plugin: support/typedoc-rimbu-plugin`, `theme: merged-landing`)
- `AGENTS.md:79-113` §3 Per-Package Anatomy (three tiers `public`/`advanced`/`internal`, `src/public/` → `dist/public/*`)
- `AGENTS.md:601-625` sandbox (`/tmp` + repo root)
- `docs/agents/domain.md:11-12` single-context repo (`CONTEXT.md`/`docs/adr/` may not yet exist, proceed silently)
- `docs/agents/issue-tracker.md` + `docs/agents/triage-labels.md` — issue lifecycle (not normative for lint, but for reporting)

`AGENTS.md` wins > ADR > checklist (spec §2.5, Q5). `README` not in scope.

## When to use

> When you edit `packages/*/src/public/**` or add a public export, invoke `review-docs` in diagnose mode (`--out` optional).

Additional triggers: after `review-api`/`review-impl`, before `write-docs` (10), when `maintain-skills` reports missing `@example`, when `docs:verify-examples` fails in CI.

## Procedure

### Diagnose (read-only, default)

1. Resolve target: single package `<pkg>` (e.g. `packages/stream`) is default. If `--workspace` is passed, expand to all packages with `src/public/` (or `src/<name>.ts` when no `public/` tier, exclude `list2`). Require `<pkg>` if no `--workspace`.
2. For each target package, collect evidence **without mutating** and **without `build:seq`** by default:
   - Enumerate public files: `src/public/**/*.ts` plus `src/<name>.ts` entry. For each file, enumerate top-level public exports via `rg -n "^\s*export\s+(type\s+)?(function|class|interface|type|const|let|var|namespace|enum)" src/public --no-heading` and manual scan for exports inside files.
   - For each export at `file:line`, inspect preceding 20 lines for `/**` and `@example`. Use `rg -n "@example" src/public --no-heading` for quick presence and file-read window for per-export decision. If no `/**` in window, emit `warn` `missing-jsdoc`; if `/**` present but no `@example`, emit `warn` `missing-example` (which also fails `docs:verify-examples` runnable). Evidence is the `rg` line or the export line itself, `file:line`.
   - TypeDoc render check: same as JSDoc — missing `/**` or missing `@param`/`@returns` where `AGENTS.md:546-573` expects typed tags is treated as `warn` `typedoc-warning`. Do not run `typedoc` by default (heavy); flag missing JSDoc as typedoc warning.
   - Runnable example check: if `--with-tools` is passed and `docs/api.aggregate.json` exists, run `bun ./support/docs-extractor/src/verify-examples.ts --filter=<pkg>/` scoped to the package and parse `docs/api.examples.verify.report.json` or stdout for mismatches whose `key` contains `<pkg>/`. Each mismatch (output comment vs actual, missing `// =>`, inferred-type) becomes `error` `broken-example` with evidence `console.log #N output mismatch: expected ... actual ...` and `key` as location. If `aggregate` missing, emit `warn` that verification was skipped.
   - Cite `rg` line and `docs:verify-examples` snippet verbatim as evidence (Q10). Every finding cites `file:line` and `AGENTS.md` or `package.json`/`config/typedoc.json`.
3. Emit report per **Output contract** to **stdout**; if `--out <path>` given, also write to that path (convention `.scratch/reports/review-docs/<pkg>.md`). Never write outside repo root and `/tmp` (`AGENTS.md:601-625`). Be idempotent and safe to re-run. No `build:seq` needed.
4. Severity follows checklist: missing JSDoc/`@example`/`typedoc-warning` = `warn`; broken `docs:verify-examples` = `error` (Q9).

### Fix

This skill has no fix mode — it is diagnose-only. Do not mutate. If `warn` (missing JSDoc/`@example`) or `error` (broken example) findings are reported, fix manually per `package.json:56-64` `docs:verify-examples` and `config/typedoc.json:1-16`, or invoke `write-docs` (10) which gap-fills `/** @example */` with runnable snippets and post-checks `docs:verify-examples`. Re-run `review-docs` to verify. `README` not in scope.

## Output contract

Conforms to `../_template/references/report-template.md` (spec §2.8).

```markdown
# review-docs — <pkg>

## Summary

Docs <clean|has issues> for JSDoc/@example/typedoc. Counts: X error, Y warn, Z info.

## Findings

| Severity | Rule | Location | Evidence | Suggested fix | Normative ref |
|---|---|---|---|---|---|

## Next actions

- No action required — package is clean for review-docs.  OR  Fix warn/error then re-run.
```

Severity for this skill (spec §2.7, ticket 09):

- `warn` — missing `/**` (`missing-jsdoc`), `/**` without `@example` (`missing-example`), TypeDoc would warn (`typedoc-warning` — missing JSDoc tag)
- `error` — `@example` exists but `docs:verify-examples` reports mismatch/missing `// =>` (`broken-example`)
- `info` — advisory (e.g. `README` not in scope, `typedoc.json` entryPoints gap)

Location: `file:line` for the export (`src/public/...:line`) or `package: <name>` for package-level (`docs:verify-examples` summary). Evidence is `rg` line or `docs:verify-examples` snippet. `Normative ref` is `AGENTS.md:546-573 §9` or `package.json:56-64` or `config/typedoc.json:1-16`.

Output to stdout by default; with `--out .scratch/reports/review-docs/<pkg>.md` also write there (Q8).

## Examples

```bash
# Diagnose single package to stdout (default, safe for agent auto-invoke, rg only)
bun .opencode/skills/review-docs/scripts/run.ts -- packages/stream

# Diagnose with file output
bun .opencode/skills/review-docs/scripts/run.ts -- packages/stream --out .scratch/reports/review-docs/stream.md

# With runnable-ex verification (scoped docs:verify-examples, matches ticket 09 verify)
bun .opencode/skills/review-docs/scripts/run.ts -- packages/stream --with-tools
bun .opencode/skills/review-docs/scripts/run.ts -- packages/stream --with-tools --out .scratch/reports/review-docs/stream.md

# Workspace sweep (all packages with src/public/)
bun .opencode/skills/review-docs/scripts/run.ts -- --workspace
bun .opencode/skills/review-docs/scripts/run.ts -- --workspace --out .scratch/reports/review-docs/workspace.md
bun .opencode/skills/review-docs/scripts/run.ts -- --workspace --with-tools --out .scratch/reports/review-docs/workspace.md
```

## Allowed runtime

Scripts may only assume `bun`, `rg`, `jq` are present (Q3). No harness-specific JS APIs, no `build:seq` by default (fast `rg` only); `docs:verify-examples` only when `--with-tools` and `docs/api.aggregate.json` exists. See `../_template/scripts/README.md` and `AGENTS.md:138-152` import rule, `AGENTS.md:601-625` sandbox (never write outside repo root and `/tmp`).
