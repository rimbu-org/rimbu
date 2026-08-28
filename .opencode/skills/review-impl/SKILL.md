---
name: review-impl
description: Judgmental impl review — correctness, mutation safety, Biome §9, NonEmpty/Reducer/Token per AGENTS.md §6
disable-model-invocation: false
---

# Review-Impl — Implementation Quality

Diagnose-only skill for judgmental implementation review: `biome.json:15-44`/`AGENTS.md:565-572` lint rules, mutation leaks, `NonEmpty` narrowing, `Reducer` misuse, `Token`/`RimbuError` (`packages/base`). Fast static `rg` only, no `build:seq` (Q10).

## Purpose

Single-concern impl lint for `packages/<name>/src/`. Checks `AGENTS.md:287-478` §6 patterns and `biome.json:15-44`/`AGENTS.md:565-572`: `noUnusedImports` (`error`), `noExplicitAny` (`warn`), `noNonNullAssertion` (`warn`), `noConsole` (`error` in `src/`), `noRestrictedImports` (`error` `./`/`../` already covered by `review-anatomy` but also checked here), plus mutation leaks (returning `this` vs new instance), `NonEmpty` narrowing bugs, `Reducer` misuse, `Token`/`RimbuError` misuse. Scope is single package `<pkg>` by default, `--workspace` for all. This skill is **diagnose-only** (never mutates) and stays fast for mid-task use.

## Normative refs

- `AGENTS.md:287-478` §6 Core Code Patterns (6.1 Interface+Namespace, 6.2 `NonEmpty`, 6.3 `OptLazy`, 6.4 HKT `Types`, 6.5 `Reducer`, 6.6 `const`/`NoInfer`, 6.7 `Module`)
- `AGENTS.md:565-572` Lint rules enforced by Biome + `biome.json:15-44` ( `correctness.noUnusedImports` `error`, `style.noNonNullAssertion` `warn`, `suspicious.noExplicitAny` `warn`, `suspicious.noConsole` `error` in `src/`, `style.noRestrictedImports` `error` `["./*", "../*"]`)
- `AGENTS.md:79-113` §3 layout (`src/` vs `test/` override `biome.json:73-84` `noConsole` off in `**/test/**`)
- `AGENTS.md:546-573` §9 Tooling Reference (`biome check`)
- `AGENTS.md:601-625` sandbox (`/tmp` + repo root)
- `docs/adr/<nnnn>-*.md` — if `any`/`!` is intentional (e.g. `as` for test scaffolding), cite ADR; if `docs/adr/` missing, proceed silently per `docs/agents/domain.md:11-12`

`AGENTS.md` wins > ADR > checklist (Q5). Line nits live here, not in `scout-improvements` (Q12).

## When to use

> When you edit `packages/*/src/` or review implementation correctness, invoke `review-impl` in diagnose mode (`--out` optional).

Additional triggers: after `review-anatomy`, before `bun test`, when `maintain-skills` reports `any`/`!`/`console`, when `Reducer`/`Token` is used.

## Procedure

### Diagnose (read-only, default)

1. Resolve target: single package `<pkg>` (e.g. `packages/list`) is default. If `--workspace` is passed, expand to all packages with `src/` (exclude `list2`). Require `<pkg>` if no `--workspace`.
2. For each target package, collect evidence **without mutating** and **without `build:seq`** (Q10, fast) via `rg`:
   - `noUnusedImports` `error` — `rg -n "import.*\{[^}]*\}" src --no-heading` + `rg -n "from.*#|from.*@rimbu"` and check via `biome check` if available, but primary evidence is `rg` for unused (heuristic: `import { X } from` where `X` not found via `rg -n "\bX\b" src --no-heading` elsewhere)
   - `noExplicitAny` `warn` — `rg -n ":\s*any\b|\bas\s+any\b|<any>|any\[\]" src --no-heading` (exclude `test/` per `biome.json:73-84`)
   - `noNonNullAssertion` `warn` — `rg -n "!\." src --no-heading` and `rg -n "!\s*;" src --no-heading` and `rg -n "\w+!\b" src --no-heading` (exclude `!=`/`!==`)
   - `noConsole` `error` — `rg -n "console\.(log|warn|error|info|debug)" src --no-heading` (must not appear in `src/`, allowed in `test/` per `biome.json:73-84`)
   - `noRestrictedImports` `error` — `rg -n "from\s+['\"]\./|from\s+['\"]\.\./" src --no-heading` (already in `review-anatomy`, but also checked here as `error`)
   - **Mutation leaks** — `rg -n "return this;|return this\b" src --no-heading` in methods that should return new instance (e.g. `set`, `update`, `map`, `filter` on immutable collections); flag `warn` with evidence `return this` in `src/internal/...` where new instance expected
   - **`NonEmpty` narrowing bugs** — `rg -n "nonEmpty\(\)|assumeNonEmpty|NonEmpty" src --no-heading` and check for `!` or missing `nonEmpty()` guard before `assumeNonEmpty`
   - **`Reducer` misuse** — `rg -n "Reducer\." src --no-heading` and check for `Reducer` without `mapInput`/`combine` or direct `reduce` misuse
   - **`Token`/`RimbuError` misuse** (`packages/base`) — `rg -n "Token|RimbuError" src --no-heading` and check for `Token` without `Symbol` or `RimbuError` without `throw`
3. Emit report per **Output contract** to **stdout**; if `--out <path>` given, also write to that path (convention `.scratch/reports/review-impl/<pkg>.md`). Never write outside repo/`/tmp`. Be idempotent and fast (no `build:seq`).
4. Severity follows `biome.json:15-44` config (see checklist). Every Biome finding cites `rule` + `file:line`.

### Fix

This skill has no fix mode — it is diagnose-only. Do not mutate. If `any`/`!`/`console`/`noUnusedImports` findings are `warn`/`error`, fix manually per `AGENTS.md:565-572` and re-run this skill to verify. For `Token`/`RimbuError` misuse, fix per `packages/base` docs.

## Output contract

Conforms to `../_template/references/report-template.md` (spec §2.8).

```markdown
# review-impl — <pkg>

## Summary

Impl <clean|has issues> for §6/§9. Counts: X error, Y warn, Z info.

## Findings

| Severity | Rule | Location | Evidence | Suggested fix | Normative ref |
|---|---|---|---|---|---|

## Next actions

- Fix errors (noUnusedImports/noConsole/noRestrictedImports) then re-run.
```

Severity per `biome.json:15-44`/`AGENTS.md:565-572`:

- `error` — `noUnusedImports` (`rg` import not used), `noConsole` in `src/`, `noRestrictedImports` (`./`/`../`)
- `warn` — `noExplicitAny` (`: any`, `as any`), `noNonNullAssertion` (`!`), mutation leak (`return this` where new instance expected), `NonEmpty` narrowing missing guard, `Reducer`/`Token` misuse
- `info` — advisory (e.g. `any` in `test-d` is `warn` elsewhere, but here in `src` it's `warn` not `info`; `Reducer` could use `mapInput`)

Location: `file:line` (`src/...:line`) or `package: <name>`. Evidence is `rg` line or `biome check` snippet. `Normative ref` is `AGENTS.md:287-478 §6` or `biome.json:15-44` or `AGENTS.md:565-572`.

Output to stdout by default; with `--out .scratch/reports/review-impl/<pkg>.md` also write there (Q8).

## Examples

```bash
# Diagnose single package to stdout (default, safe for agent auto-invoke, fast no build)
bun .opencode/skills/review-impl/scripts/run.ts -- packages/list

# Diagnose with file output
bun .opencode/skills/review-impl/scripts/run.ts -- packages/stream --out .scratch/reports/review-impl/stream.md

# Workspace sweep (all packages, fast)
bun .opencode/skills/review-impl/scripts/run.ts -- --workspace
bun .opencode/skills/review-impl/scripts/run.ts -- --workspace --out .scratch/reports/review-impl/workspace.md
```

## Allowed runtime

Scripts may only assume `bun`, `rg`, `jq` are present (Q3). No harness-specific JS APIs, no `build:seq` per Q10 (fast). See `../_template/scripts/README.md` and `AGENTS.md:138-152` import rule. Cite `biome.json` rule + `file:line` for every finding.
