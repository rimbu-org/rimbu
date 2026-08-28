---
name: audit-type-tests
description: Inventories test-d / expectTypeOf gaps — checks NonEmpty, HKT Types, overload order, const/NoInfer per AGENTS.md §6.6
disable-model-invocation: false
---

# Audit-Type-Tests — Type-Level Gaps

Diagnose-only skill that audits `test-d/` (`expectTypeOf` only, bans `as`) and verifies `AGENTS.md:424-463` §6.6 (`const` type params, `NoInfer`), `AGENTS.md:335-352` NonEmpty, `AGENTS.md:375-398` HKT `Types`, `AGENTS.md:29-30` overload order. Reports `warn` for `as` and gaps, `info` for advisory.

## Purpose

Single-concern type-level gap audit for `packages/<name>/`. For each public generic method (`src/public/**/*.ts`), checks that `test-d/` (`*.test-d.ts` or `test-d/` equivalent) has an `expectTypeOf` case asserting precise return types, `NonEmpty` narrowing, and fallback inference; flags any `as`-based assertions as `warn` (ban per Q11, `write-type-tests` must use `expectTypeOf` only). Scope is single package `<pkg>` by default, `--workspace` for all. This skill is **diagnose-only** and feeds `write-type-tests` (12).

## Normative refs

- `AGENTS.md:424-463` §6.6 Advanced Inference Helpers (`const` type params, `NoInfer<T>`)
- `AGENTS.md:335-352` §6.2 NonEmpty Refinements (`nonEmpty()`/`assumeNonEmpty()`)
- `AGENTS.md:375-398` §6.4 HKT `Types` (`normal`/`nonEmpty`)
- `AGENTS.md:29-30` §1.1 Overload order for `NonEmpty` variants (`NonEmpty` first)
- `AGENTS.md:79-113` §3 layout (`test-d/` for `expectTypeOf`)
- `AGENTS.md:15-44` `biome.json` `noExplicitAny`/`noNonNullAssertion` — informational only here (see Notes)
- `AGENTS.md:601-625` sandbox (`/tmp` + repo root)
- `docs/adr/<nnnn>-*.md` — if type tests intentionally use `as`, cite ADR; if `docs/adr/` missing, proceed silently per `docs/agents/domain.md:11-12`

`AGENTS.md` wins > ADR > checklist (Q5). `test-random` not in scope for this skill.

## When to use

> When you add a generic public method, change `NonEmpty`/`Types`/`const`/`NoInfer`, or review type tests, invoke `audit-type-tests` in diagnose mode (`--out` optional).

Additional triggers: after `review-api` (§6.6), when `maintain-skills` reports type-test gaps, before `write-type-tests`.

## Procedure

### Diagnose (read-only, default)

1. Resolve target: single package `<pkg>` (e.g. `packages/hashed`) is default. If `--workspace` is passed, expand to all packages with `package.json` (exclude `list2`). Require `<pkg>` if no `--workspace`.
2. For each target package, collect evidence **without mutating** via `rg` + file listing:
   - Enumerate public generic methods: `rg -n "^\s*(?:readonly\s+)?\w+\s*(?:<[^>]*>)?\s*\(.*<.*>.*\)" src/public --no-heading` (methods with `<...>` generics) and `rg -n "interface NonEmpty|interface Types|const.*<.*>|NoInfer" src/public --no-heading` to list `NonEmpty`/`Types`/`const`/`NoInfer` sites.
   - For each generic method, check `test-d/` coverage: `rg -n "\b<method>\b" test-d --no-heading` and `rg -n "expectTypeOf" test-d --no-heading`. If `0` matches for the method but `test-d/` exists, emit `warn` (missing type test) with `rg` command + `0 matches` and `test-d/` `file:line` where coverage exists or would be. If `test-d/` dir missing, emit `warn` per method (no type tests).
   - **Ban `as`:** `rg -n "\bas\s" test-d --no-heading` — for each `test-d/*.test-d.ts` line with `as` (e.g. `as const` is allowed? No, `as` for assertions is banned; `as const` is not an assertion but still uses `as` — flag only `as` with type assertion like `as string`/`as any`/`as unknown`), emit `warn` at that `file:line` (ban in generated tests per Q11). `as const` for literals is allowed but flagged as `info` to prefer `const` param.
   - **Overload order:** reuse `review-api` check: for `NonEmpty` interfaces, verify `StreamSource.NonEmpty` (or `Types` `nonEmpty`) overload is first per `AGENTS.md:29-30` (via `rg -n "NonEmpty|StreamSource"` order check).
   - **HKT/NonEmpty/const/NoInfer:** verify `test-d/` has cases for `NonEmpty` narrowing (`nonEmpty()`/`assumeNonEmpty()`), `Types` `normal`/`nonEmpty`, `const` type params (`<const` in `src/public`), and `NoInfer` fallback — each missing is `warn`.
3. Emit report per **Output contract** to **stdout**; if `--out <path>` given, also write to that path (convention `.scratch/reports/audit-type-tests/<pkg>.md`). Never write outside repo/`/tmp`. Be idempotent.
4. Severity: missing type test or `as` usage = `warn` (or `info` for `as const`), never `error` for this audit; `noExplicitAny`/`noNonNullAssertion` from `biome.json:15-44` are `info` only here (see Notes).

### Fix

This skill has no fix mode — it is diagnose-only. Do not mutate. If `warn` gaps are found, add `test-d/*.test-d.ts` cases with `expectTypeOf` (never `as`) per `AGENTS.md:424-463` and re-run this skill to verify. For `as` bans, replace `as` with `expectTypeOf` or `satisfies`.

## Output contract

Conforms to `../_template/references/report-template.md` (spec §2.8).

```markdown
# audit-type-tests — <pkg>

## Summary

Audited N generic methods. Counts: 0 error, W warn, I info. Covered X/Y.

## Findings

| Severity | Rule | Location | Evidence | Suggested fix | Normative ref |
|---|---|---|---|---|---|

## Next actions

- Fix warn gaps by adding expectTypeOf cases, re-run audit-type-tests.
```

Severity for this skill (Q11):

- `warn` — generic method has no `test-d/` `expectTypeOf` case, or `test-d/` uses `as` assertion (e.g. `value as string`), or `NonEmpty`/`Types`/`const`/`NoInfer` not covered
- `info` — `as const` usage (prefer `const` param per `AGENTS.md:424-438`), or `noExplicitAny`/`noNonNullAssertion` in `test-d/` (informational per `biome.json:15-44`)

Location: `file:line` for the public method (`src/public/...:line`) or `test-d/` file for `as` (`test-d/...:line`). Evidence is `rg` command + match count and `test-d/` `file:line` where `expectTypeOf` exists or `0 matches` where missing.

Output to stdout by default; with `--out .scratch/reports/audit-type-tests/<pkg>.md` also write there (Q8).

## Examples

```bash
# Diagnose single package to stdout (default, safe for agent auto-invoke)
bun .opencode/skills/audit-type-tests/scripts/run.ts -- packages/hashed

# Diagnose with file output
bun .opencode/skills/audit-type-tests/scripts/run.ts -- packages/stream --out .scratch/reports/audit-type-tests/stream.md

# Workspace sweep (all packages)
bun .opencode/skills/audit-type-tests/scripts/run.ts -- --workspace
bun .opencode/skills/audit-type-tests/scripts/run.ts -- --workspace --out .scratch/reports/audit-type-tests/workspace.md
```

## Allowed runtime

Scripts may only assume `bun`, `rg`, `jq` are present (Q3). No harness-specific JS APIs. See `../_template/scripts/README.md` and `AGENTS.md:138-152` import rule. Evidence is `rg` + file listing, never a build. Output feeds `write-type-tests` (12) via `*.generated.test-d.ts` (Q11, `expectTypeOf` only, no `as`).
