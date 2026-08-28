---
name: scout-dead-code
description: Finds unused public exports, orphan internal files, stale advanced re-exports, and files vs exports drift — package-scoped, warn-only
disable-model-invocation: false
---

# Scout-Dead-Code — Unused & Orphan Finder

Diagnose-only skill that scouts for dead code via static `rg` + `tsconfig` alias graph. Reports `warn` (never `error` per Q12) with `rg` command + match count as evidence.

## Purpose

Single-concern dead-code scout for `packages/<name>/`: (1) unused `public/` exports with no importer in `src/` + `test/`, (2) `internal/` files with zero importers, (3) `advanced/` re-exports that no longer re-export anything private, (4) `files` vs `exports` drift (`src/public/` or `src/advanced/` exists but not exported, or vice versa). Scope is single package `<pkg>` by default, `--workspace` builds a cross-package import graph via `rg` + `tsconfig` path aliases (`#pkg/*`, `@rimbu/*`). This skill is **diagnose-only** (never mutates).

## Normative refs

- `AGENTS.md:79-113` §3 Per-Package Anatomy (three tiers `public` (`"./*"`), `advanced` (`"./advanced/*"`), `internal` (`#<pkg>/*` never exported))
- `AGENTS.md:104-113` tier table (`internal` never in `exports`)
- `AGENTS.md:138-152` import rule (`#<pkg>/*` for `internal`, `@rimbu/*` for cross-package)
- `AGENTS.md:238-284` §5 `tsconfig` `paths` for alias resolution
- `AGENTS.md:601-625` sandbox (`/tmp` + repo root)
- `docs/adr/<nnnn>-*.md` — if dead code is intentionally kept (e.g. `advanced` API not yet used), cite ADR; if `docs/adr/` missing, proceed silently per `docs/agents/domain.md:11-12`

`AGENTS.md` wins > ADR > checklist (Q5). This skill never emits `error` — all findings are `warn` (potential dead) until confirmed by `rg` evidence, `info` for advisory (Q12).

## When to use

> When you remove an export, delete an `internal/` file, clean up `advanced/` re-exports, or review a package for drift, invoke `scout-dead-code` in diagnose mode (`--out` optional).

Additional triggers: after `review-anatomy`, before `bun run build:seq`, when `maintain-skills` reports missing `advanced` tier.

## Procedure

### Diagnose (read-only, default)

1. Resolve target: single package `<pkg>` (e.g. `packages/stream`) is default. If `--workspace` is passed, expand to all packages with `package.json` (exclude `list2`), build a cross-package import graph. Require `<pkg>` if no `--workspace`.
2. For each target package, collect evidence **without mutating** via `rg` (and `tsconfig` `paths` for alias resolution):
   - **Unused public exports:** enumerate `src/public/**/*.ts` exports (`export`/`export type`/`export *`) and for each, `rg -n "from.*@rimbu/<pkg>.*<export>|import.*<export>" packages --no-heading` across `src/` + `test/` (+ `test-d/` + `test-random/` if present). If zero matches, emit `warn` with `rg` command + match count `0` as evidence. Never `error`.
   - **Orphan internal files:** list `src/internal/**/*.ts` files and for each, `rg -n "from.*#<pkg>.*<basename>|from.*<basename>" packages/<pkg>/src --no-heading` across the package's `src/`. If zero importers (excluding self), emit `warn` with `rg` command + `0` matches.
   - **Stale advanced re-exports:** list `src/advanced/**/*.ts` files that `export * from '#<pkg>/...'` or `export { ... } from '#<pkg>/...'`. For each target `#<pkg>/...`, check that the target file still exists under `src/internal/` and is still private (not already exposed via `public`). If target missing or now public, emit `warn` as stale re-export.
   - **Files vs exports drift:** compare `src/public/` and `src/advanced/` existence vs `package.json` `exports` (`"./*"`, `"./advanced/*"`). If `src/public/` exists but no `exports["./*"]`, or vice versa, emit `warn` (also covered by `review-anatomy`, but here as `warn` with `rg` evidence).
3. Emit report per **Output contract** to **stdout**; if `--out <path>` given, also write to that path (convention `.scratch/reports/scout-dead-code/<pkg>.md`). Never write outside repo/`/tmp`. Be idempotent and safe to re-run. All findings are `warn` (or `info` for advisory), never `error` (Q12).

### Fix

This skill has no fix mode — it is diagnose-only. Do not mutate. If `warn` is confirmed dead (grep `0` matches), remove the export/file/re-export manually and re-run this skill to verify.

## Output contract

Conforms to `../_template/references/report-template.md` (spec §2.8).

```markdown
# scout-dead-code — <pkg>

## Summary

Scouted N exports/files. Counts: 0 error, W warn, I info. All warn are potential dead until confirmed.

## Findings

| Severity | Rule | Location | Evidence | Suggested fix | Normative ref |
|---|---|---|---|---|---|

## Next actions

- Confirm each warn with rg 0 matches; remove dead code manually and re-run.
```

Severity for this skill (Q12):

- `warn` — potential dead: unused `public` export (no importer), orphan `internal/` file (zero importers), stale `advanced/` re-export (target missing), `files` vs `exports` drift
- `info` — advisory: `advanced/` re-export that is now also public (not stale, but redundant), or `internal/` file with only one importer (low usage)
- **Never `error`** — even confirmed dead remains `warn` until human confirms via `rg` evidence (Q12)

Location: `file:line` for the export/file, or `package: <name>` for package-level. Evidence is `rg` command + match count `0` (e.g. `rg -n "from.*@rimbu/stream.*Filter" packages --no-heading => 0 matches`) plus the `rg` line if any importer exists.

Output to stdout by default; with `--out .scratch/reports/scout-dead-code/<pkg>.md` also write there (Q8).

## Examples

```bash
# Diagnose single package to stdout (default, safe for agent auto-invoke)
bun .opencode/skills/scout-dead-code/scripts/run.ts -- packages/stream

# Diagnose with file output
bun .opencode/skills/scout-dead-code/scripts/run.ts -- packages/hashed --out .scratch/reports/scout-dead-code/hashed.md

# Workspace sweep (cross-package import graph)
bun .opencode/skills/scout-dead-code/scripts/run.ts -- --workspace
bun .opencode/skills/scout-dead-code/scripts/run.ts -- --workspace --out .scratch/reports/scout-dead-code/workspace.md
```

## Allowed runtime

Scripts may only assume `bun`, `rg`, `jq` are present (Q3). No harness-specific JS APIs. See `../_template/scripts/README.md` and `AGENTS.md:138-152` import rule. Evidence is `rg` + `tsconfig` `paths` alias graph, never a build.
