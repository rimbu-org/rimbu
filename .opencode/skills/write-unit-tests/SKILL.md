---
name: write-unit-tests
description: Generates focused bun:test cases from audit-tests gaps — appends test/*.generated.test.ts per package, one suite per uncovered method
disable-model-invocation: false
---

# Write-Unit-Tests — Focused Unit Test Generation

Hybrid skill that gap-fills `test/*.test.ts` coverage by generating `test/*.generated.test.ts` from `audit-tests` (06) gaps. Diagnose by default (read-only, reuses 06); mutate only with `--fix` (and `--force` to overwrite hand-written files per Q11). One generated file per package run, one test suite per uncovered method. Post-check is scoped `bun test`.

## Purpose

Single-concern test generation for `packages/<name>`. In diagnose mode it reuses the `audit-tests` (06) logic to enumerate public methods in `src/public/**/*.ts` (and `src/<name>.ts` entry) whose `test/*.test.ts` coverage is missing (`rg -n "\b<method>\b" test => 0`). In fix mode (`--fix`) it gap-fills only by appending `test/<pkg>.generated.test.ts` — never edits hand-written `test/*.test.ts` without `--force` (Q11). Generated tests follow the existing `test/` `bun:test` style (`import { describe, expect, test } from 'bun:test'`; package imports like `import { HashMap } from '@rimbu/hashed/map'`; no `console` per `biome.json` `noConsole`), are concise and isolated per public method, and are idempotent and single-package-scoped (one file per package run). After mutation it post-checks via scoped `bun test test/<generated> --tsconfig-override tsconfig.common.json` and reports pass/fail in the shared report, leaving the file but marking `error` on failure with reproduction note. Wave 2 per spec §2.7.

## Normative refs

- `AGENTS.md:213-224` §4 `scripts` (`test: "bun test test/* --tsconfig-override tsconfig.common.json"`)
- `AGENTS.md:480-518` §7 How to Add a New Collection Method (interface → NonEmpty → abstract base → internal → Builder → tests → type tests → propagate → core)
- `AGENTS.md:79-113` §3 Per-Package Anatomy (`test/` for `bun test`, `test-random/` optional property tests)
- `AGENTS.md:546-573` §9 Tooling Reference (`bun test`, `biome check`)
- `AGENTS.md:138-152` import rule (package paths `#pkg/*`/`@rimbu/*`, never relative) — mandatory when inspecting `src/`
- `AGENTS.md:601-625` sandbox (`/tmp` + repo root, never write outside)
- `biome.json:27-35` `noRestrictedImports` (`"./*"`, `"../*"` banned in `src/`) and `biome.json:73-84` `noConsole` override (error in `src/`, allowed in `test/`)
- `docs/adr/<nnnn>-*.md` — if test gaps are intentional (e.g. experimental `actor`), cite ADR; if `docs/adr/` missing, proceed silently per `docs/agents/domain.md:11-12`

`AGENTS.md` wins > ADR > checklist (spec §2.5, Q5). Do not enforce a rule absent from `AGENTS.md`/ADR — propose an ADR via `maintain-skills` instead.

## When to use

> When you add a public method per `AGENTS.md:480-518` §7 or `audit-tests` (06) reports `warn` missing unit tests, consider invoking `write-unit-tests` in diagnose mode (`--out` optional). Run fix mode only when the task explicitly asks for `--fix`/`--force`.

Additional triggers: after `review-api`/`review-anatomy`, on a package with new `src/public/` exports, when `maintain-skills` reports test gaps, to dogfood on `packages/hashed`/`list`/`stream`.

## Procedure

### Diagnose (read-only, default)

Reuse `audit-tests` (06) logic — no mutation, harness-independent (`bun`+`rg`+`jq` only):

1. Resolve target: single package `<pkg>` (e.g. `packages/hashed`) is default. If `--workspace` is passed, expand to all 23 published packages with `package.json` (exclude `list2`). Require `<pkg>` if no `--workspace`. Be single-package-scoped and idempotent (Q6).
2. For each target package, collect evidence **without mutating** via `rg` + file listing (same evidence as 06):
   - Enumerate public methods: canonical collection methods (`filter`, `map`, `flatMap`, `forEach`, `reduce`, `find`, `get`, `has`, `set`, `remove`, `update`, `modifyAt`, `updateAt`, `hasKey`, `hasValue`, `getAt`, `first`, `last`, `at`, `take`, `drop`, `slice`, `stream`, `toArray`, `equals`, `size`, `isEmpty`, `nonEmpty`, `assumeNonEmpty`, `toBuilder`, `from`, `of`, `empty` for map-like; `filter`, `map`, `flatMap`, `prepend`, `append`, `concat`, `insert`, `removeAt` for `list`; `filter`, `map`, `flatMap`, `dropWhile`, `takeWhile`, `collect`, `range` for `stream`) checked via `rg -n "\b<method>\b" src/public --no-heading` to confirm presence, then `rg -n "\b<method>\b" test --no-heading` across `test/*.test.ts` to check coverage. If `0` matches, emit `warn` `missing-unit-test` with `rg` command + `0 matches` and `src/public/...:line`. If package uses standard suite (`runMapTestsWith`/`runSetTestsWith`/`runListTests`/`runCollectionTests` detected in `test/`), those canonical methods are considered covered via shared utils and not flagged.
   - Check `test/` existence: if no `test/` or no `*.test.ts`, per-method `warn` already covers; if no methods were evaluated and `test/` missing, emit `warn` `missing-test-file`.
   - Check `test-random/`: if `test-random/` exists or `package.json` `scripts` has `test:random`/`test-random`, verify at least one `*.ts` in `test-random/`; if missing, emit `info` `missing-test-random` (never `warn`/`error` per Q11). If `test-random/` infra absent, skip.
   - Cite `test/` `file:line` where coverage exists or `0 matches` where missing; cite `rg` verbatim.
3. Emit report per **Output contract** to **stdout**; if `--out <path>` given, also write identical markdown there (convention `.scratch/reports/write-unit-tests/<pkg>.md`). Never write outside repo root and `/tmp` (`AGENTS.md:601-625`). Be idempotent and safe to re-run. Diagnose never writes `test/*.generated.test.ts` and never runs `bun test`; it is the gap list that Fix consumes.

### Fix (opt-in, --fix / --force)

Gap-fill only. Requires explicit `--fix` (or `--force` to overwrite hand-written files per Q11). Without `--fix`, refuse to mutate and emit diagnose report instead.

1. Require `--fix`. Without it, do not mutate — emit diagnose report. With `--fix`, apply minimal patch: gap-fill only, append `test/<pkg>.generated.test.ts`. Never edit hand-written `test/*.test.ts` without `--force` (Q11); Fix writes only to `*.generated.test.ts`. With `--force`, an existing `*.generated.test.ts` is regenerated even if content differs, and hand-written files may be overwritten if explicitly needed (still single file per package run). Support `--dry-run` to simulate without mutating — report what would be added and counts, but do not write. Be single-package-scoped and idempotent — second `--fix` with same gaps produces same file (no duplicate append).
2. For each target package with `warn` `missing-unit-test` gaps, generate one file `test/<pkg>.generated.test.ts` (where `<pkg>` is the package dir basename, e.g. `hashed.generated.test.ts`) containing one `describe`/`test` suite per uncovered method, preserving `bun test` style and no `console`:
   - Detect package import: first `export interface`/`export const` in `src/public/<sub>.ts` or `src/<name>.ts` determines the public symbol (e.g. `HashMap` from `@rimbu/hashed/map`, `List` from `@rimbu/list`, `Stream` from `@rimbu/stream`) via mapping `src/<name>.ts` → `@rimbu/<name>` and `src/public/<sub>.ts` → `@rimbu/<name>/<sub>`. Use `import { describe, expect, test } from 'bun:test'` plus the package import with single quotes per `biome.json:46-50`. Do not use `console` in generated tests.
   - Keep tests concise and isolated per public method: each `test('<Collection>.<method> — generated', () => { ... })` creates a minimal instance (`HashMap.of([1,'a'] as const)`, `HashSet.of(1,2,3)`, `List.of(1,2,3)`, `Stream.of(1,2,3)`) and asserts either type existence (`expect(typeof (m as any).filter).toBe('function')`) or a deterministic result (`expect((m as any).filter(() => true).size).toBeDefined()`), using `as any` to keep the test concise when the exact signature is verbose. Static factories (`of`, `from`, `empty`, `builder`, `reducer`, `createContext`, `range`) are tested on the collection itself, not an instance; properties (`size`, `isEmpty`) assert the value.
   - Write the file once per package; if the file already exists, overwrite it with the regenerated content (idempotent). Do not append to an existing generated file in a way that duplicates suites — replace the file content. With `--dry-run`, skip the write and report `dry-run: would generate test/<pkg>.generated.test.ts with N test(s)`.
3. Post-check: run `bun test` scoped to the generated file and report pass/fail in the findings:
   - After writing (not `--dry-run`), run `bun test test/<generated> --tsconfig-override tsconfig.common.json` from the package directory via `spawnSync` (`bun` present per Q3). Capture stdout/stderr and exit status.
   - On success (`0`, `X pass, 0 fail`), add `info` `generated-test-passed` with evidence `bun test test/<generated> --tsconfig-override tsconfig.common.json: X pass, 0 fail` and location `test/<generated>:1`. Re-running `audit-tests` (06) after fix should show reduced `warn` gaps (the generated file now contains each method name, so `rg -n "\b<method>\b" test => 1+`).
   - On failure (non-zero or `fail` in output), leave the file on disk, add `error` `generated-test-failed` with location `test/<generated>:1`, evidence `bun test ...: <first 120 chars of stderr/stdout>` and suggested fix `Fix generated test per AGENTS.md:213-224 — reproduction: bun test test/<generated> --tsconfig-override tsconfig.common.json in packages/<name>` with reproduction note. Do not delete or revert the file.
   - With `--dry-run`, skip the `bun test` spawn and emit `info` `generated-test-passed` with evidence `dry-run: generated test bun:test style with no console — would pass bun test (reproduction: bun test test/<generated> --tsconfig-override tsconfig.common.json)`.
   - If no gaps were found, emit no `generated-test-*` finding and report clean.
4. Re-emit the report with updated counts (fewer `warn` after fix, plus `generated-test-passed`/`failed` and possibly `verify-skipped` for `test-random` info). The report is still written to stdout and optionally `--out`. Be idempotent — second `--fix` finds no new gaps (now covered via generated file) and does nothing, reporting clean for `missing-unit-test`.

## Output contract

Conforms to `../_template/references/report-template.md` (spec §2.8). Every skill — diagnose or fix — emits markdown with:

```markdown
# write-unit-tests — <pkg>

## Summary

One paragraph + counts by severity: X error, Y warn, Z info. State whether package is clean for unit tests or requires fix, and for --fix whether scoped bun test passed.

## Findings

| Severity | Rule | Location | Evidence | Suggested fix | Normative ref |
|---|---|---|---|---|---|

## Next actions

- Bullet list of follow-ups (e.g. "run with --fix", "re-run audit-tests (06) — expect fewer warn", "run bun test test/<generated> --tsconfig-override tsconfig.common.json").
- If no findings: single bullet "No action required — package is clean for write-unit-tests."
```

Severity semantics (spec §2.7, Q11, ticket 11):

- `error` — generated test failed its scoped `bun test` (`generated-test-failed`); Fix must leave file but mark error with reproduction note.
- `warn` — public method has no `test/*.test.ts` case (`missing-unit-test` via `rg => 0`; reuses 06 list).
- `info` — `test-random/` missing while package has `test-random` infra (`missing-test-random`), or generated test passed (`generated-test-passed`), or dry-run simulation.

Location: `file:line` for the public method (`src/public/...:line`, repo-relative) or `test/<generated>:1` for generated file post-check, or `package: <name>` for package-level (`missing-test-random`). Evidence is verbatim `rg` line or `bun test` output snippet (under 120 chars, backticks). Normative ref is `AGENTS.md:213-224 §4` or `AGENTS.md:480-518 §7` or `AGENTS.md:79-113 §3` or `AGENTS.md:546-573 §9`.

Output location: stdout markdown is default. With `--out .scratch/reports/write-unit-tests/<pkg>.md` write identical markdown there (create parent dirs if needed). This is the `--out` convention from Q8. Never write outside repo root and `/tmp` (`AGENTS.md:601-625`).

## Examples

```bash
# Diagnose single package to stdout (default, safe for agent auto-invoke, reuses 06)
bun .opencode/skills/write-unit-tests/scripts/run.ts -- packages/hashed

# Diagnose with file output (sandbox guard, .scratch/reports per Q8)
bun .opencode/skills/write-unit-tests/scripts/run.ts -- packages/hashed --out .scratch/reports/write-unit-tests/hashed.md

# Fix mode (gap-fill only — appends test/*.generated.test.ts; never edits hand-written without --force)
bun .opencode/skills/write-unit-tests/scripts/run.ts -- packages/hashed --fix
bun .opencode/skills/write-unit-tests/scripts/run.ts -- packages/hashed --fix --dry-run  # simulate without mutating

# Fix with --force (also overwrites hand-written test/*.test.ts if needed; still one file per package, post-check bun test scoped)
bun .opencode/skills/write-unit-tests/scripts/run.ts -- packages/hashed --fix --force
bun .opencode/skills/write-unit-tests/scripts/run.ts -- packages/hashed --fix --force --out .scratch/reports/write-unit-tests/hashed.md

# Workspace sweep (diagnose all packages)
bun .opencode/skills/write-unit-tests/scripts/run.ts -- --workspace --out .scratch/reports/write-unit-tests/workspace.md

# Verify after fix — audit-tests (06) should report fewer warn and scoped bun test should pass
bun .opencode/skills/audit-tests/scripts/run.ts -- packages/hashed
bun test packages/hashed/test/hashed.generated.test.ts --tsconfig-override packages/hashed/tsconfig.common.json
```

## Allowed runtime

Scripts in `scripts/` may only assume `bun`, `rg`, `jq` are present (spec §2.3, Q3/Q14). Do not rely on harness-specific JS APIs. All imports in `packages/*/src/` inspected by this skill must follow `AGENTS.md:138-152` package-path rule (`#pkg/*`, `@rimbu/*`, never relative `./`/`../` per `biome.json:27-35`). Generated tests must use `bun:test` (`describe`/`test`/`expect`) and never use `console` (`biome.json:73-84` `noConsole`). See `../_template/scripts/README.md`, `AGENTS.md:601-625` sandbox (never write outside repo root and `/tmp`), and `AGENTS.md:213-224` §4 / `AGENTS.md:480-518` §7 for test coverage contract.
