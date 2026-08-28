# Write-Unit-Tests Checklist

Source: `AGENTS.md:213-224` §4 `test` script, `AGENTS.md:480-518` §7 method checklist, `AGENTS.md:79-113` §3 layout, `spec.md:2.7` Q11, ticket `11`.

## Scope

- **Default:** single package `<pkg>` (`packages/<name>` with `src/public/` and `package.json`)
- **`--workspace`:** all packages with `package.json` (exclude `list2`), audits each package's `src/public/` vs `test/` then optionally generates `test/*.generated.test.ts`
- **Hybrid:** diagnose by default (read-only, reuses `audit-tests` 06); fix only with `--fix` (gap-fill), `--force` to overwrite hand-written `test/*.test.ts` (Q11), `--dry-run` to simulate

## Checks

| Rule | Severity | Check | Evidence (rg + file:line) | Fix |
|---|---|---|---|---|
| `missing-unit-test` | warn | For each public method on the package's main interface (`src/public/**/*.ts` — methods like `filter`, `map`, `flatMap`, `take`, `drop`, `get`, `has`, `set`, `remove`, `update`, `forEach`, `reduce`, `stream`, `toArray`, `size`, `isEmpty`, `nonEmpty`, `equals`, `first`, `last`, `at`, `slice`, etc.), `rg -n "\b<method>\b" test --no-heading` across `test/*.test.ts` (recursive `test/`). If `0` matches, flag `warn`. Type-only methods are `info`, not `warn`. Standard suite `runMapTestsWith`/`runSetTestsWith` covers canonical methods. | `rg -n "\b<method>\b" test --no-heading => 0 matches` + `src/public/...:line:export interface <method>` and `test/<name>.test.ts:line: test("<method>")` where covered | Append `test/<pkg>.generated.test.ts: test("<method> — generated") per AGENTS.md:506` |
| `missing-test-file` | warn | If `test/` does not exist or has no `*.test.ts`, flag all public methods as `warn` (no coverage). | `ls test/*.test.ts => 0 files` | Create `test/` per AGENTS.md:79-113 then `--fix` |
| `missing-test-random` | info | If `test-random/` exists (or `package.json` `scripts` has `test:random`), verify `test-random/` has at least one `*.ts`; if missing or empty, flag `info` (not `warn`) per Q11. If no infra, skip. | `ls test-random/ --no-heading => 0` + `jq .scripts package.json \| rg test:random` | Add `test-random/*.ts` property tests if package already has `test-random` infra |
| `generated-test-passed` | info | After `--fix`, scoped `bun test test/<generated> --tsconfig-override tsconfig.common.json` passed (`0 fail`). | `bun test test/<generated> => X pass, 0 fail` | No action — audit-tests re-run shows reduced gaps |
| `generated-test-failed` | error | After `--fix`, scoped `bun test` failed (non-zero or `fail` in output). Leave file but mark error with reproduction note. | `bun test test/<generated> => fail: <snippet>` | Fix generated test per AGENTS.md:213-224 — reproduction: `bun test test/<generated> --tsconfig-override tsconfig.common.json` |

## Procedure — Diagnose (reuse 06)

- Same evidence as `audit-tests` (06): enumerate public methods via canonical lists + `rg` presence in `src/public`, check `rg` coverage in `test/`, handle standard suite, check `test-random` as `info`.
- Never mutates, never runs `bun test`. Idempotent. Emits `write-unit-tests — <pkg>` report.

## Procedure — Fix (--fix / --force / --dry-run)

| Step | Guardrail | Detail | Normative ref |
|---|---|---|---|
| `gap-fill-only` | Never overwrite hand-written `test/*.test.ts` without `--force` (Q11) | With `--fix`, write only to `test/<pkg>.generated.test.ts` (one file per package run, one suite per uncovered method). Without `--force`, never touch hand-written `test/*.test.ts`; with `--force`, may overwrite them if needed. Generated file may be overwritten on re-run (idempotent). | `spec.md:2.11` Q11 |
| `one-file-per-package` | Single file per package run, one test per method | File is `test/<pkg>.generated.test.ts` where `<pkg>` is dir basename (e.g. `hashed.generated.test.ts`). Each `test('<Coll>.<method> — generated')` is concise, isolated, uses `bun:test` (`describe`/`test`/`expect`) and package import (`import { HashMap } from '@rimbu/hashed/map'`), no `console`, single quotes, `as any` for concise signatures. | `AGENTS.md:213-224` §4, `AGENTS.md:480-518` §7 |
| `follow-test-patterns` | Preserve `bun test` style, no `console` | Use `import { describe, expect, test } from 'bun:test'`; detect collection symbol from `src/public/<sub>.ts` first `export interface` and import path `@rimbu/<pkg>/<sub>` or `@rimbu/<pkg>` for entry. Instance tests create `HashMap.of([1,'a'] as const)` / `HashSet.of(1,2,3)` / `List.of(1,2,3)` / `Stream.of(1,2,3)`; static `of`/`from`/`empty`/`builder`/`reducer`/`createContext`/`range` test the factory; properties (`size`/`isEmpty`) assert values. | `biome.json:73-84` `noConsole`, `AGENTS.md:138-152` |
| `bun-test-post-check` | Run scoped `bun test` and report pass/fail | After writing (not `--dry-run`), run `bun test test/<generated> --tsconfig-override tsconfig.common.json` from package dir. On success add `info` `generated-test-passed`; on failure leave file and add `error` `generated-test-failed` with reproduction note. With `--dry-run`, simulate `info` `generated-test-passed` (`dry-run: would pass`). | `AGENTS.md:213-224` §4, `AGENTS.md:546-573` §9 |
| `idempotent` | Safe to re-run | Second `--fix` regenerates same file (no duplicate suites); audit-tests re-run shows reduced gaps because `rg -n "\b<method>\b" test => 1+` now includes generated file. | `spec.md:2.6` Q6 |
| `audit-tests-gap-list` | Uses audit-tests output as gap list | Diagnose findings are the gap list; Fix consumes that list to generate one suite per `warn` method. No separate enumeration — identical to 06. | ticket 11 |

## Severity

- `warn` — public method has no `test/*.test.ts` case (`rg =>0`, reuses 06)
- `error` — generated test failed scoped `bun test` (`generated-test-failed`)
- `info` — `test-random/` missing while package has infra, or generated test passed (`generated-test-passed`), or dry-run

For this skill, `missing-unit-test` is `warn` (not `error`); only `generated-test-failed` is `error` (post-check guardrail).

## Evidence Format

- `Location`: `file:line` for the public method (`src/public/map.ts:10`) or `test/<generated>:1` for post-check, or `package: <name>` for `test-random` missing
- `Evidence`: `rg -n "\b<method>\b" test --no-heading => 0 matches` + `src/public/...:line` for missing; or `bun test test/<generated> --tsconfig-override tsconfig.common.json: X pass, 0 fail` for passed, or `fail: <snippet>` for failed, under 120 chars + backticks
- `Suggested fix`: `Add test/<pkg>.generated.test.ts: test("<method> — generated") per AGENTS.md:506` or `Fix generated test per AGENTS.md:213-224 — reproduction: bun test test/<generated> --tsconfig-override tsconfig.common.json`
- `Normative ref`: `AGENTS.md:213-224 §4` or `AGENTS.md:480-518 §7` or `AGENTS.md:79-113 §3` or `AGENTS.md:546-573 §9`

## Dogfood

- `packages/hashed` — `src/public/map.ts` (`HashMap`) and `src/public/set.ts` (`HashSet`) plus `src/hashed.ts` entry. Standard suite `runMapTestsWith`/`runSetTestsWith` covers canonical methods → diagnose reports 0 warn. After injecting a synthetic gap (e.g. removing method coverage or adding a fake method file), `write-unit-tests --fix` generates `test/hashed.generated.test.ts` with one suite per gap, `bun test test/hashed.generated.test.ts --tsconfig-override tsconfig.common.json` passes, and `audit-tests` re-run shows reduced gaps (`rg => 1+` via generated file).
- `packages/list` — similar dogfood with `List` collection.

## References

- `AGENTS.md:213-224` §4 `test` script, `AGENTS.md:480-518` §7, `AGENTS.md:79-113` §3 layout, `AGENTS.md:546-573` §9 `bun test`, `AGENTS.md:138-152` import rule, `AGENTS.md:601-625` sandbox
- `biome.json:27-35` `noRestrictedImports`, `biome.json:73-84` `noConsole` in `src/` vs `test/`
- `spec.md:2.7` Q11 `warn` vs `info`, `write-unit-tests` feed from `audit-tests` (06)
