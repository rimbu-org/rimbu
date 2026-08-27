---
name: review-anatomy
description: Checks package shape against AGENTS.md §3/§4/§5 and biome import rules — exports, imports, files, tsconfigs, layout
disable-model-invocation: false
---

# Review-Anatomy — Package Shape

Diagnose-only skill that audits a package's anatomy versus the canonical shapes in `AGENTS.md:76-284` (§3 anatomy, §4 `package.json`, §5 `tsconfig`) and the `biome.json:27-35` ban on relative imports. Reports shape violations as `error`.

## Purpose

Single-concern anatomy lint: verify that `packages/<name>/` follows the exact per-package layout (`src/<name>.ts`, `src/public/`, `src/advanced/`, `src/internal/`), the canonical `package.json` `exports`/`imports`/`files`/`sideEffects`/`workspace:*` shape, and the three `tsconfig` shapes. Scope is single package `<pkg>` by default, `--workspace` for all 23 published packages. This skill is **diagnose-only** (read-only) — it never mutates.

## Normative refs

- `AGENTS.md:76-284` §3 Per-Package Anatomy (three tiers `public`/`advanced`/`internal`, import rule), §4 Canonical `package.json` Shape, §5 Canonical `tsconfig` Shape
- `AGENTS.md:138-152` import rule (package paths `#<pkg>/*`/`@rimbu/*`, never `./`/`../`)
- `AGENTS.md:546-573` §9 Tooling Reference (Bun, `biome check`, `build:seq`/`typecheck:seq`)
- `biome.json:27-35` `noRestrictedImports` ban on `["./*", "../*"]` (error), `files.ignoreUnknown`, `formatter.indentStyle`
- `AGENTS.md:601-625` sandbox (`/tmp` + repo root)
- `docs/adr/<nnnn>-*.md` — if anatomy is intentionally diverged, cite ADR; if `docs/adr/` missing, proceed silently per `docs/agents/domain.md:11-12`

No other sources are normative. `AGENTS.md` wins > ADR > checklist (Q5).

## When to use

> When you edit `packages/*`, add a new package, touch `package.json`/`tsconfig.*`/`src/` layout, or review a PR that changes exports, invoke `review-anatomy` in diagnose mode (`--out` optional).

Additional triggers: before `bun run build:seq`, after `bun run biome:check` failures, when `maintain-skills` reports shape drift.

## Procedure

### Diagnose (read-only, default)

1. Resolve target: single package `<pkg>` (e.g. `packages/stream`) is default. If `--workspace` is passed, expand to all packages under `packages/*` that contain a `package.json` (exclude `list2` if not in `fixed`). If no arg and no `--workspace`, require `<pkg>` and error if missing.
2. For each target package, collect evidence **without mutating**:
   - Read `package.json` and validate `name`, `exports` (`"."`, `"./*"`, `"./advanced/*"` → `dist/...`), `imports` (`#<name>/*`), `files`, `sideEffects`, `type`, `dependencies` `workspace:*`, `publishConfig`, `scripts` per `AGENTS.md:155-235` checklist
   - Read `tsconfig.json`, `tsconfig.esm.json`, `tsconfig.common.json` and validate `extends`, `include`, `compilerOptions` (`rootDir`, `outDir`, `paths` for `@rimbu/<name>` and `#<name>/*`) per `AGENTS.md:238-284`
   - Check layout: `src/<name>.ts` exists, `src/public/` → `dist/public/*`, `src/advanced/` → `dist/advanced/*` when `exports` declares them, `src/internal/` never appears in `exports` (tier table `AGENTS.md:104-113`)
   - Run relative-import scan: `rg -n "from\s+['\"]\./|from\s+['\"]\.\./" packages/<pkg>/src --no-heading` — flag any match as `error` per `biome.json:27-35` and `AGENTS.md:138-152` (evidence is the `rg` line)
   - Optionally run `biome:check` and `typecheck` scoped to the package and cite verbatim output as evidence per Q10 (when `--with-tools` is passed or when `rg` already flagged)
3. Emit the report per **Output contract** to **stdout**; if `--out <path>` given, also write identical markdown to that path (convention `.scratch/reports/review-anatomy/<pkg>.md`). Never write outside repo root and `/tmp`.
4. Be idempotent and safe to re-run.

### Fix

This skill has no fix mode — it is diagnose-only. Do not mutate. If shape violations are found, fix manually per `AGENTS.md:76-284` and re-run this skill to verify.

## Output contract

Conforms to `../_template/references/report-template.md` (spec §2.8).

```markdown
# review-anatomy — <pkg>

## Summary

Package <clean|has issues> for anatomy. Counts: X error, Y warn, Z info.

## Findings

| Severity | Rule | Location | Evidence | Suggested fix | Normative ref |
|---|---|---|---|---|---|

## Next actions

- No action required — package is clean for review-anatomy.  OR  Fix errors then re-run.
```

Severity for this skill:

- `error` — shape violations: missing/incorrect `exports`/`imports`/`files`/`sideEffects`/`workspace:*`, `tsconfig` shape mismatch, layout tier leakage (`internal` exported, missing `src/<name>.ts`), relative imports (`./`/`../`) in `src/`
- `warn` — style drift: `package.json` description/keywords/author/license drift, `tsconfig` `include` extra entries, `scripts` missing optional `test:random`
- `info` — advisory: package has no `advanced/` but `exports` declares it (empty tier), or `list2`-style unpublished package not in `fixed`

Location: `file:line` for `package.json:XX`/`tsconfig:YY`/`src/...:ZZ` or `package: <name>` for package-level. Evidence is verbatim `rg`/`biome`/`tsc` snippet or the offending JSON path. `Normative ref` is `AGENTS.md:XX-YY §Z` or `docs/adr/NNNN`.

Output to stdout by default; with `--out .scratch/reports/review-anatomy/<pkg>.md` also write there (Q8).

## Examples

```bash
# Diagnose single package to stdout (default, safe for agent auto-invoke)
bun .opencode/skills/review-anatomy/scripts/run.ts -- packages/stream

# Diagnose with file output
bun .opencode/skills/review-anatomy/scripts/run.ts -- packages/hashed --out .scratch/reports/review-anatomy/hashed.md

# Workspace sweep (all 23 packages)
bun .opencode/skills/review-anatomy/scripts/run.ts -- --workspace
bun .opencode/skills/review-anatomy/scripts/run.ts -- --workspace --out .scratch/reports/review-anatomy/workspace.md

# With tools evidence (also runs biome:check + typecheck scoped)
bun .opencode/skills/review-anatomy/scripts/run.ts -- packages/stream --with-tools
```

## Allowed runtime

Scripts may only assume `bun`, `rg`, `jq` are present (Q3). No harness-specific JS APIs. See `../_template/scripts/README.md` and `AGENTS.md:138-152` package-path import rule. This skill's evidence for relative imports is `rg` (ripgrep) per `AGENTS.md:601-625`.
