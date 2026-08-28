# Audit-Tests Checklist

Source: `AGENTS.md:213-224` §4 `test` script, `AGENTS.md:480-518` §7 method checklist, `AGENTS.md:79-113` §3 layout, `spec.md:2.7` Q11, ticket `06`.

## Scope

- **Default:** single package `<pkg>` (`packages/<name>` with `src/public/` and `package.json`)
- **`--workspace`:** all packages with `package.json` (exclude `list2`), audits each package's `src/public/` vs `test/`

## Checks

| Rule | Severity | Check | Evidence (rg + file:line) | Fix |
|---|---|---|---|---|
| `missing-unit-test` | warn | For each public method on the package's main interface (`src/public/**/*.ts` — methods like `filter`, `map`, `flatMap`, `take`, `drop`, `get`, `has`, `set`, `remove`, `update`, `forEach`, `reduce`, `stream`, `toArray`, `size`, `isEmpty`, `nonEmpty`, `equals`, `first`, `last`, `at`, `slice`, etc.), `rg -n "\b<method>\b" test --no-heading` across `test/*.test.ts` (recursive `test/`). If `0` matches, flag `warn`. Type-only methods (`interface`/`type` without runtime) are `info`, not `warn`. | `rg -n "\b<method>\b" test --no-heading => 0 matches` + `src/public/...:line:export function <method>` and `test/<name>.test.ts:line: test("<method>")` where covered | Add `test/<name>.test.ts` case per `AGENTS.md:506` and re-run `rg` |
| `missing-test-file` | warn | If `test/` does not exist or has no `*.test.ts`, flag all public methods as `warn` (no coverage). | `ls test/*.test.ts => 0 files` | Create `test/` per `AGENTS.md:79-113` |
| `missing-test-random` | info | If `test-random/` exists (or `package.json` `scripts` has `test:random`), verify `test-random/` has at least one `*.ts`; if missing or empty, flag `info` (not `warn`) per Q11. If `test-random/` not present and no infra (`scripts` has no `test:random` and `test-random/` dir missing), skip. | `ls test-random/ --no-heading => 0` + `jq .scripts package.json \| rg test:random` | Add `test-random/*.ts` property tests if package already has `test-random` infra |
| `covered-method` | info (not a finding) | If `rg -n "\b<method>\b" test => >0`, cite `test/` `file:line` where coverage exists as evidence for covered method (do not flag). Used for summary counts. | `rg -n "\b<method>\b" test => 1+ matches: test/<name>.test.ts:42` | — |

## Severity

- `warn` — public method has no `test/*.test.ts` case (e.g. `rg =>0`)
- `info` — `test-random/` missing while package has `test-random` infra, or method is type-only/`NonEmpty` variant not directly tested
- **Never `error`** — gaps are `warn`/`info`; `write-unit-tests` (11) will generate `*.generated.test.ts` with `Q11` guardrails (`--force` to overwrite, scoped `bun test`)

## Evidence Format

- `Evidence` column: `` `rg -n "\b<method>\b" test --no-heading => 0 matches` `` + `src/public/...:line:export ...` for missing; or `` `test/<name>.test.ts:42: test("<method>")` `` for covered
- `Location` column: `file:line` for the public method (`src/public/map.ts:12`) or `package: <name>` for package-level (`test-random` missing)
- `Suggested fix` column: `Add test/<name>.test.ts: test("<method> ...") per AGENTS.md:506`
- `Normative ref` column: `AGENTS.md:213-224 §4` or `AGENTS.md:480-518 §7` or `AGENTS.md:79-113 §3`

## Exclusions

- Do not flag `src/<name>.ts` entry re-exports (they are barrels)
- Do not flag `src/advanced/` methods (covered by `review-api`)
- Do not flag private `src/internal/` methods
- Do not flag methods that are `type`-only (e.g. `interface Types`) — emit `info` if desired, not `warn`
- Do not flag `test-random` as `warn` — always `info` per Q11

## References

- `AGENTS.md:213-224` §4 `test` script, `AGENTS.md:480-518` §7, `AGENTS.md:79-113` §3 layout, `AGENTS.md:546-573` §9 `bun test`
- `spec.md:2.7` Q11 `warn` vs `info`, `write-unit-tests` feed
