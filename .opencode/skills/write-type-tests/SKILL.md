---
name: write-type-tests
description: Generates concise expectTypeOf type tests from audit-type-tests gaps — hybrid diagnose (reuse 07) + fix append test-d/*.generated.test-d.ts, expectTypeOf only no as
disable-model-invocation: false
---

# Write-Type-Tests — Concise Type-Level Test Generation

Hybrid skill that gap-fills `test-d/*.test-d.ts` coverage by generating `test-d/*.generated.test-d.ts` from `audit-type-tests` (07) gaps. Diagnose by default (read-only, reuses 07); mutate only with `--fix` (and `--force` to overwrite hand-written files per Q11). One generated file per package run, one `expectTypeOf` per uncovered generic/overload. Post-check is scoped `tsc -p tsconfig.json --noEmit`.

## Purpose

Single-concern type-level test generation for `packages/<name>`. In diagnose mode it reuses the `audit-type-tests` (07) logic to enumerate public generic methods in `src/public/**/*.ts` (and `src/<name>.ts` entry) whose `test-d/*.test-d.ts` coverage is missing (`rg -n "\b<method>\b" test-d => 0`), plus `NonEmpty` narrowing (`nonEmpty()`/`assumeNonEmpty()` per `AGENTS.md:335-352`), HKT `Types` `normal`/`nonEmpty` preservation (`AGENTS.md:375-398`), `const` type params (`AGENTS.md:429-444`), `NoInfer<T>` fallback (`AGENTS.md:445-463`), and `NonEmpty` overload order (`AGENTS.md:29-30`). In fix mode (`--fix`) it gap-fills only by appending `test-d/<pkg>.generated.test-d.ts` — never edits hand-written `test-d/*.test-d.ts` without `--force` (Q11). Generated tests use `expectTypeOf` only and ban `as` assertions per Q11, are concise and isolated per gap, and are idempotent and single-package-scoped (one file per package run). After mutation it post-checks via scoped `tsc -p tsconfig.json --noEmit` and reports pass/fail in the shared report, leaving the file but marking `error` on failure with evidence. Wave 2 per spec §2.7.

## Normative refs

- `AGENTS.md:335-352` §6.2 NonEmpty Refinements (`nonEmpty()`/`assumeNonEmpty()`, `NonEmpty` variant)
- `AGENTS.md:375-398` §6.4 HKT `Types` (`normal`/`nonEmpty` via `Types` slot, `RMapBase`/`RSetBase`)
- `AGENTS.md:424-463` §6.6 Advanced Inference Helpers (`const` type params `AGENTS.md:429-444`, `NoInfer<T>` `AGENTS.md:445-463`)
- `AGENTS.md:29-30` §1.1 Overload order for `NonEmpty` variants (`NonEmpty` first, `StreamSource.NonEmpty` before `StreamSource`)
- `AGENTS.md:79-113` §3 Per-Package Anatomy (`test-d/` for `expectTypeOf`, `src/public/` → `dist/public/*`)
- `AGENTS.md:138-152` import rule (package paths `#pkg/*`/`@rimbu/*`, never relative) — mandatory when inspecting `src/`
- `AGENTS.md:601-625` sandbox (`/tmp` + repo root, never write outside)
- `AGENTS.md:546-573` §9 Tooling Reference (`tsc -p tsconfig.json --noEmit`, `build:seq`)
- `biome.json:27-35` `noRestrictedImports` (`"./*"`, `"../*"` banned in `src/`) — generated `test-d/` must also not use relative imports
- `docs/agents/domain.md:11-12` single-context repo (`CONTEXT.md`/`docs/adr/` may not yet exist, proceed silently)

`AGENTS.md` wins > ADR > checklist (spec §2.5, Q5). Do not enforce a rule absent from `AGENTS.md`/ADR — propose an ADR via `maintain-skills` instead.

## When to use

> When you add a generic public method, change `NonEmpty`/`Types`/`const`/`NoInfer`/`OptLazy`/`NonEmpty` overload order, or `audit-type-tests` (07) reports `warn` missing type tests, consider invoking `write-type-tests` in diagnose mode (`--out` optional). Run fix mode only when the task explicitly asks for `--fix`/`--force`.

Additional triggers: after `review-api` (§6.6), before publishing a new generic method per `AGENTS.md:480-518` §7, when `maintain-skills` reports type-test gaps, to dogfood on `packages/stream`/`sorted`/`hashed`.

## Procedure

### Diagnose (read-only, default)

Reuse `audit-type-tests` (07) logic — no mutation, harness-independent (`bun`+`rg`+`jq` only):

1. Resolve target: single package `<pkg>` (e.g. `packages/stream`) is default. If `--workspace` is passed, expand to all 23 published packages with `package.json` (exclude `list2`). Require `<pkg>` if no `--workspace`. Be single-package-scoped and idempotent (Q6).
2. For each target package, collect evidence **without mutating** via `rg` + file listing (same evidence as 07):
    - Enumerate public generic methods: `rg -n "^\s*(?:readonly\s+)?\w+\s*<[^>]*>\s*\(.*<.*>.*\)" src/public --no-heading` (methods with `<...>` generics) and `rg -n "interface NonEmpty|interface Types|const.*<.*>|NoInfer" src/public --no-heading` to list `NonEmpty`/`Types`/`const`/`NoInfer` sites.
    - For each generic method, check `test-d/` coverage: `rg -n "\b<method>\b" test-d --no-heading` and `rg -n "expectTypeOf" test-d --no-heading`. If `0` matches for the method but `test-d/` exists, emit `warn` `missing-type-test` with `rg` command + `0 matches` and `test-d/` `file:line` where coverage exists or would be. If `test-d/` dir missing, emit `warn` per method (no type tests).
    - **Ban `as`:** `rg -n "\bas\s" test-d --no-heading` — for each `test-d/*.test-d.ts` line with `as` (e.g. `as const` is allowed? No, `as` for assertions is banned; `as const` is not an assertion but still uses `as` — flag only `as` with type assertion like `as string`/`as any`/`as unknown`), emit `warn` at that `file:line` (ban in generated tests per Q11). `as const` for literals is flagged as `info` to prefer `const` param.
    - **Overload order:** reuse `review-api` check: for `NonEmpty` interfaces, verify `StreamSource.NonEmpty` (or `Types` `nonEmpty`) overload is first per `AGENTS.md:29-30` (via `rg -n "NonEmpty|StreamSource"` order check).
    - **HKT/NonEmpty/const/NoInfer:** verify `test-d/` has cases for `NonEmpty` narrowing (`nonEmpty()`/`assumeNonEmpty()`), `Types` `normal`/`nonEmpty`, `const` type params (`<const` in `src/public`), and `NoInfer` fallback — each missing is `warn`.
    - Cite `test-d/` `file:line` where coverage exists or `0 matches` where missing; cite `rg` verbatim.
3. Emit report per **Output contract** to **stdout**; if `--out <path>` given, also write identical markdown there (convention `.scratch/reports/write-type-tests/<pkg>.md`). Never write outside repo root and `/tmp` (`AGENTS.md:601-625`). Be idempotent and safe to re-run. Diagnose never writes `test-d/*.generated.test-d.ts` and never runs `tsc`; it is the gap list that Fix consumes.

### Fix (opt-in, --fix / --force)

Gap-fill only. Requires explicit `--fix` (or `--force` to overwrite hand-written files per Q11). Without `--fix`, refuse to mutate and emit diagnose report instead.

1. Require `--fix`. Without it, do not mutate — emit diagnose report. With `--fix`, apply minimal patch: gap-fill only, append `test-d/<pkg>.generated.test-d.ts`. Never edit hand-written `test-d/*.test-d.ts` without `--force` (Q11); Fix writes only to `*.generated.test-d.ts`. With `--force`, an existing `*.generated.test-d.ts` is regenerated even if content differs, and hand-written files may be overwritten if explicitly needed (still single file per package run). Support `--dry-run` to simulate without mutating — report what would be added and counts, but do not write. Be single-package-scoped and idempotent — second `--fix` with same gaps produces same file (no duplicate append).
2. For each target package with `warn` gaps (`missing-type-test`, `nonempty-type-test`, `hkt-type-test`, `const-param-test`, `noinfer-test`, `overload-order-type-test` per 07), generate one file `test-d/<pkg>.generated.test-d.ts` (where `<pkg>` is the package dir basename, e.g. `stream.generated.test-d.ts`) containing one `expectTypeOf` case per uncovered generic/overload, plus `NonEmpty` narrowing, `OptLazy` fallback inference, HKT `Types` preservation, `const`/`NoInfer`, and overload order cases where relevant. Use `expectTypeOf` only — ban `as` assertions per Q11 (use `satisfies` or `expectTypeOf` with `toEqualTypeOf`/`toExtend`/`toBeFunction` etc., never `as string`/`as any`/`as unknown`):
    - Detect package imports: first `export interface`/`export const` in `src/public/<sub>.ts` or `src/<name>.ts` determines the public symbol (e.g. `SortedMap` from `@rimbu/sorted/map`, `Stream` from `@rimbu/stream`, `FastIterator` from `@rimbu/stream/stream-types`) via mapping `src/<name>.ts` → `@rimbu/<name>` and `src/public/<sub>.ts` → `@rimbu/<name>/<sub>`. Use `import { expectTypeOf } from 'bun:test'` plus the package imports with single quotes. Do not use `as` or `any` or `!` in generated tests.
    - Keep tests concise — one `expectTypeOf` per uncovered generic/overload per ticket 12 (e.g. `expectTypeOf<Stream<number>['map']>().toBeFunction()`, `expectTypeOf(Stream.empty<number>().min()).toEqualTypeOf<...>()`, `expectTypeOf(genNonEmpty).toExtend<GenEmpty>()`, `expectTypeOf<SortedMap.Types['normal']>().toEqualTypeOf<SortedMap<number,string>>()`). Cover `NonEmpty` narrowing (`nonEmpty()`/`assumeNonEmpty()`), `OptLazy` fallback (`method()` vs `method('fallback')` vs `method(() => 'fallback')`), HKT `Types` (`normal`/`nonEmpty`), `const` params (inline literal `['a', 'b.c']` without `as const`), `NoInfer` fallback (`NoInfer<T>`), and overload order (`NonEmpty` first) where gaps exist.
    - Write the file once per package; if the file already exists, overwrite it with the regenerated content (idempotent). Do not append to an existing generated file in a way that duplicates cases — replace the file content. With `--dry-run`, skip the write and report `dry-run: would generate test-d/<pkg>.generated.test-d.ts with N case(s)`.
3. Post-check: run `tsc -p tsconfig.json --noEmit` scoped to the package and report pass/fail in the findings:
    - After writing (not `--dry-run`), run `tsc -p tsconfig.json --noEmit` from the package directory via `spawnSync` (`bunx tsc` or `tsc` present per Q3). Capture stdout/stderr and exit status.
    - On success (`0`), add `info` `generated-type-test-passed` with evidence `tsc -p tsconfig.json --noEmit: ok` and location `test-d/<generated>:1`. Re-running `audit-type-tests` (07) after fix should show reduced `warn` gaps (the generated file now contains each method name and `expectTypeOf`, so `rg -n "\b<method>\b" test-d => 1+` and `rg -n "NonEmpty|Types|NoInfer" test-d => 1+`).
    - On failure (non-zero or error in output), leave the file on disk, add `error` `generated-type-test-failed` with location `test-d/<generated>:1`, evidence `tsc -p tsconfig.json --noEmit: <first 120 chars of stderr/stdout>` and suggested fix `Fix generated test per AGENTS.md:424-463 — reproduction: tsc -p tsconfig.json --noEmit in packages/<name>` with reproduction note. Do not delete or revert the file.
    - With `--dry-run`, skip the `tsc` spawn and emit `info` `generated-type-test-passed` with evidence `dry-run: generated test expectTypeOf only, no as — would pass tsc -p tsconfig.json --noEmit (reproduction: tsc -p tsconfig.json --noEmit)`.
    - If no gaps were found, emit no `generated-type-test-*` finding and report clean.
4. Re-emit the report with updated counts (fewer `warn` after fix, plus `generated-type-test-passed`/`failed`). The report is still written to stdout and optionally `--out`. Be idempotent — second `--fix` finds no new gaps (now covered via generated file) and does nothing, reporting clean for `missing-type-test` etc.

## Output contract

Conforms to `../_template/references/report-template.md` (spec §2.8). Every skill — diagnose or fix — emits markdown with:

```markdown
# write-type-tests — <pkg>

## Summary

One paragraph + counts by severity: X error, Y warn, Z info. State whether package is clean for type tests or requires fix, and for --fix whether scoped tsc passed.

## Findings

| Severity | Rule | Location | Evidence | Suggested fix | Normative ref |
|---|---|---|---|---|---|

## Next actions

- Bullet list of follow-ups (e.g. "run with --fix", "re-run audit-type-tests (07) — expect fewer warn", "run tsc -p tsconfig.json --noEmit").
- If no findings: single bullet "No action required — package is clean for write-type-tests."
```

Severity semantics (spec §2.7, Q11, ticket 12):

- `error` — generated type test failed its scoped `tsc -p tsconfig.json --noEmit` (`generated-type-test-failed`); Fix must leave file but mark error with reproduction note.
- `warn` — public generic method has no `test-d/*.test-d.ts` `expectTypeOf` case (`missing-type-test` via `rg => 0`; reuses 07 list), or `NonEmpty`/`Types`/`const`/`NoInfer`/`overload` not covered (`nonempty-type-test`, `hkt-type-test`, `const-param-test`, `noinfer-test`, `overload-order-type-test`), or `test-d/` uses `as` assertion (`as-assertion`).
- `info` — `as const` advisory (`as-const`), `any`/`!` in `test-d/` (`any-nonnull-in-testd`), or generated test passed (`generated-type-test-passed`), or dry-run simulation.

Location: `file:line` for the public method (`src/public/...:line`, repo-relative) or `test-d/<generated>:1` for generated file post-check, or `package: <name>` for package-level. Evidence is verbatim `rg` line or `tsc` output snippet (under 120 chars, backticks). Normative ref is `AGENTS.md:335-352 §6.2` or `AGENTS.md:375-398 §6.4` or `AGENTS.md:424-463 §6.6` or `AGENTS.md:29-30 §1.1`.

Output location: stdout markdown is default. With `--out .scratch/reports/write-type-tests/<pkg>.md` write identical markdown there (create parent dirs if needed). This is the `--out` convention from Q8. Never write outside repo root and `/tmp` (`AGENTS.md:601-625`).

## Examples

```bash
# Diagnose single package to stdout (default, safe for agent auto-invoke, reuses 07)
bun .opencode/skills/write-type-tests/scripts/run.ts -- packages/stream

# Diagnose with file output (sandbox guard, .scratch/reports per Q8)
bun .opencode/skills/write-type-tests/scripts/run.ts -- packages/stream --out .scratch/reports/write-type-tests/stream.md

# Fix mode (gap-fill only — appends test-d/*.generated.test-d.ts; never edits hand-written without --force, expectTypeOf only, no as)
bun .opencode/skills/write-type-tests/scripts/run.ts -- packages/stream --fix
bun .opencode/skills/write-type-tests/scripts/run.ts -- packages/stream --fix --dry-run  # simulate without mutating

# Fix with --force (also overwrites hand-written test-d/*.test-d.ts if needed; still one file per package, post-check tsc scoped)
bun .opencode/skills/write-type-tests/scripts/run.ts -- packages/stream --fix --force
bun .opencode/skills/write-type-tests/scripts/run.ts -- packages/stream --fix --force --out .scratch/reports/write-type-tests/stream.md

# Workspace sweep (diagnose all packages)
bun .opencode/skills/write-type-tests/scripts/run.ts -- --workspace --out .scratch/reports/write-type-tests/workspace.md

# Verify after fix — audit-type-tests (07) should report fewer warn and scoped tsc should pass
bun .opencode/skills/audit-type-tests/scripts/run.ts -- packages/stream
tsc -p packages/stream/tsconfig.json --noEmit
```

## Allowed runtime

Scripts in `scripts/` may only assume `bun`, `rg`, `jq` are present (spec §2.3, Q3/Q14). Do not rely on harness-specific JS APIs. All imports in `packages/*/src/` inspected by this skill must follow `AGENTS.md:138-152` package-path rule (`#pkg/*`/`@rimbu/*`, never relative `./`/`../` per `biome.json:27-35`). Generated tests must use `expectTypeOf` from `bun:test` and never use `as` assertions (`AGENTS.md:424-463` §6.6, Q11). See `../_template/scripts/README.md`, `AGENTS.md:601-625` sandbox (never write outside repo root and `/tmp`), and `AGENTS.md:335-352` §6.2 / `AGENTS.md:375-398` §6.4 / `AGENTS.md:424-463` §6.6 / `AGENTS.md:29-30` §1.1 for type-test contract.
