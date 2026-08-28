---
name: audit-tests
description: Inventories unit-test gaps for bun test — cross-references public API vs test/*.test.ts, flags test-random gaps as info
disable-model-invocation: false
---

# Audit-Tests — Unit Coverage Gaps

Diagnose-only skill that audits `test/*.test.ts` coverage for `bun test test/* --tsconfig-override tsconfig.common.json` (`AGENTS.md:213-224` §4) and `AGENTS.md:480-518` §7 method checklist. Reports missing `test-random/` as `info` (Q11).

## Purpose

Single-concern unit-test gap audit for `packages/<name>/`. For each public method on the package's main interface(s) (`src/public/**/*.ts`), checks that at least one `test/*.test.ts` case exists (via `rg` + file listing). Flags missing `test-random/` property tests as `info`, never `warn`/`error` (Q11). Scope is single package `<pkg>` by default, `--workspace` for all. This skill is **diagnose-only** (read-only) and feeds `write-unit-tests` (11).

## Normative refs

- `AGENTS.md:213-224` §4 `scripts` (`test: "bun test test/* --tsconfig-override tsconfig.common.json"`)
- `AGENTS.md:480-518` §7 How to Add a New Collection Method (interface → NonEmpty → abstract base → internal → Builder → tests → type tests → propagate → core)
- `AGENTS.md:79-113` §3 layout (`test/` for `bun test`, `test-random/` optional property tests)
- `AGENTS.md:546-573` §9 Tooling Reference (`bun test`)
- `AGENTS.md:601-625` sandbox (`/tmp` + repo root)
- `docs/adr/<nnnn>-*.md` — if test gaps are intentional (e.g. experimental `actor`), cite ADR; if `docs/adr/` missing, proceed silently per `docs/agents/domain.md:11-12`

`AGENTS.md` wins > ADR > checklist (Q5).

## When to use

> When you add a public method per `AGENTS.md:480-518` §7 or review a package's test coverage, invoke `audit-tests` in diagnose mode (`--out` optional).

Additional triggers: after `review-api`/`review-anatomy`, before `write-unit-tests`, when `maintain-skills` reports test gaps.

## Procedure

### Diagnose (read-only, default)

1. Resolve target: single package `<pkg>` (e.g. `packages/hashed`) is default. If `--workspace` is passed, expand to all packages with `package.json` (exclude `list2`). Require `<pkg>` if no `--workspace`.
2. For each target package, collect evidence **without mutating** via `rg` + file listing:
   - Enumerate public methods: `rg -n "^\s*(readonly\s+)?\w+\(|^\s*\w+\s*\(|^\s*get\s+\w+|^\s*set\s+\w+" src/public --no-heading` and also `rg -n "export (function|const|class|interface)" src --no-heading` to list main interfaces and their methods. For each method name (e.g. `filter`, `map`, `get`, `has`, `set`, `remove`, `stream`, `toArray`), `rg -n "\b<method>\b" test --no-heading` across `test/*.test.ts` (and `test/` recursively). If `0` matches, emit `warn` (missing unit test) with `rg` command + `0 matches` and `test/` file:line where coverage *would* be.
   - Check `test/` existence: if no `test/` or no `*.test.ts`, emit `warn` per method.
   - Check `test-random/`: if `test-random/` exists, verify at least one `*.ts` file; if missing and package already has `test-random/` infra (has `test-random/` dir or `scripts` has `test:random`), emit `info` (not `warn`) per Q11: `rg -n "test-random" package.json --no-heading` + `ls test-random`. If `test-random/` not present and no infra, skip.
   - Cite `test/` `file:line` where coverage exists (e.g. `test/hashmap.test.ts:42: test("filter ...")`) as evidence for covered methods.
3. Emit report per **Output contract** to **stdout**; if `--out <path>` given, also write to that path (convention `.scratch/reports/audit-tests/<pkg>.md`). Never write outside repo/`/tmp`. Be idempotent.
4. Severity: missing unit test = `warn` (or `info` if method is type-only), missing `test-random` = `info` (Q11), never `error` for this audit (gaps are `warn`/`info`).

### Fix

This skill has no fix mode — it is diagnose-only. Do not mutate. If `warn` gaps are found, implement tests per `AGENTS.md:480-518` §7 and re-run this skill to verify. For `info` `test-random` gaps, add `test-random/` property tests if the package already has `test-random` infra.

## Output contract

Conforms to `../_template/references/report-template.md` (spec §2.8).

```markdown
# audit-tests — <pkg>

## Summary

Audited N public methods. Counts: 0 error, W warn, I info. Covered X/Y methods.

## Findings

| Severity | Rule | Location | Evidence | Suggested fix | Normative ref |
|---|---|---|---|---|---|

## Next actions

- Fix warn gaps by adding test/*.test.ts cases, re-run audit-tests.
```

Severity for this skill (Q11):

- `warn` — public method has no `test/*.test.ts` case (e.g. `rg -n "\b<method>\b" test => 0`)
- `info` — `test-random/` missing while package has `test-random` infra (`test-random/` dir or `scripts` has `test:random`), or method is type-only / `NonEmpty` variant not directly tested
- **Never `error`** — gaps are `warn`/`info`; `write-unit-tests` will generate `*.generated.test.ts`

Location: `file:line` for the public method (`src/public/...:line`) or `package: <name>` for package-level (`test-random` missing). Evidence is `rg` command + match count and `test/` `file:line` where coverage exists or `0 matches` where missing.

Output to stdout by default; with `--out .scratch/reports/audit-tests/<pkg>.md` also write there (Q8).

## Examples

```bash
# Diagnose single package to stdout (default, safe for agent auto-invoke)
bun .opencode/skills/audit-tests/scripts/run.ts -- packages/hashed

# Diagnose with file output
bun .opencode/skills/audit-tests/scripts/run.ts -- packages/list --out .scratch/reports/audit-tests/list.md

# Workspace sweep (all packages)
bun .opencode/skills/audit-tests/scripts/run.ts -- --workspace
bun .opencode/skills/audit-tests/scripts/run.ts -- --workspace --out .scratch/reports/audit-tests/workspace.md
```

## Allowed runtime

Scripts may only assume `bun`, `rg`, `jq` are present (Q3). No harness-specific JS APIs. See `../_template/scripts/README.md` and `AGENTS.md:138-152` import rule. Evidence is `rg` + file listing, never a build. Output feeds `write-unit-tests` (11) via `*.generated.test.ts` (Q11).
