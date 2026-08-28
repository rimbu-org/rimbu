# Write-Type-Tests Checklist

Source: `AGENTS.md:335-352` §6.2 NonEmpty, `AGENTS.md:375-398` §6.4 HKT Types, `AGENTS.md:424-463` §6.6 `const`/`NoInfer`/`OptLazy`, `AGENTS.md:29-30` §1.1 overload order, `AGENTS.md:79-113` §3 `test-d/`, `spec.md:2.7` Q11, ticket `12`.

## Scope

- **Default:** single package `<pkg>` (`packages/<name>` with `src/public/` and `package.json`)
- **`--workspace`:** all packages with `package.json` (exclude `list2`), audits each package's `src/public/` vs `test-d/` then optionally generates `test-d/*.generated.test-d.ts`
- **Hybrid:** diagnose by default (read-only, reuses `audit-type-tests` 07); fix only with `--fix` (gap-fill), `--force` to overwrite hand-written `test-d/*.test-d.ts` (Q11), `--dry-run` to simulate

## Checks

| Rule | Severity | Check | Evidence (rg + file:line) | Fix |
|---|---|---|---|---|
| `missing-type-test` | warn | For each public generic method (`src/public/**/*.ts` with `<...>` generics — e.g. `filter<T>`, `map<T>`, `get<K>`, `select<T, const SL>`, `first<T>`, `min<O>`, `fastNext<O>`), `rg -n "\b<method>\b" test-d --no-heading` across `test-d/*.test-d.ts` (recursive). If `0` matches and `test-d/` exists, flag `warn`. If `test-d/` dir missing, also `warn` per method (no type tests). | `rg -n "\b<method>\b" test-d --no-heading => 0 matches` + `src/public/...:line:export function <method>` | Add `test-d/<pkg>.generated.test-d.ts: expectTypeOf<...>().toEqualTypeOf<...>()` per `AGENTS.md:424-463` (one per uncovered generic/overload) |
| `as-assertion` | warn | `rg -n "\bas\s" test-d --no-heading` — for each `test-d/*.test-d.ts` line with `as` type assertion (`as string`/`as any`/`as unknown`/`as Type`), flag `warn` (ban in generated tests per Q11). `as const` is `as` but for literals — flag as `info` to prefer `const` param per `AGENTS.md:424-438`, not `warn`. | `test-d/...:line: value as string` | Replace `as` with `expectTypeOf` or `satisfies`; for `as const` use `const` type param |
| `as-const` | info | `rg -n "as const" test-d --no-heading` — flag `info` (prefer `const` type param, not hard ban). | `test-d/...:line: as const` | Use `const` type param per `AGENTS.md:426-442` |
| `nonempty-type-test` | warn | For each `NonEmpty` variant (`rg -n "interface NonEmpty" src/public`), check `test-d/` has `nonEmpty()`/`assumeNonEmpty()` narrowing case (`rg -n "nonEmpty\(\)|assumeNonEmpty" test-d`). If `0`, flag `warn`. | `rg -n "nonEmpty" test-d => 0` | Add `expectTypeOf` case for `NonEmpty` per `AGENTS.md:335-352` — e.g. `expectTypeOf(genEmpty.nonEmpty()).toEqualTypeOf<boolean>()`, `expectTypeOf(genNonEmpty).toExtend<GenNormal>()` |
| `hkt-type-test` | warn | For each `interface Types` (`rg -n "interface Types" src/public`), check `test-d/` has `Types` `normal`/`nonEmpty` case (`rg -n "Types" test-d`). If `0`, flag `warn`. | `rg -n "Types" test-d => 0` | Add `expectTypeOf` case for `Types` per `AGENTS.md:375-398` — e.g. `expectTypeOf<SortedMap.Types['normal']>().toEqualTypeOf<SortedMap<number,string>>()` |
| `const-param-test` | warn | For each `const` type param (`rg -n "<const" src/public` — e.g. `<const SL extends`), check `test-d/` has case without `as const` (uses `const` inference). If `0` expectTypeOf, flag `warn`. | `rg -n "<const" src/public => 1` but `rg -n "expectTypeOf" test-d` has no `const` case | Add `expectTypeOf` case with inline literal per `AGENTS.md:424-438` — e.g. `expectTypeOf(Stream.of(1).reduce([Reducer.sum] as const))` should be `expectTypeOf(Stream.of(1).reduce([Reducer.sum]))` with `const` param |
| `noinfer-test` | warn | For each `NoInfer` (`rg -n "NoInfer" src/public`), check `test-d/` has `NoInfer` fallback case. If `0`, flag `warn`. | `rg -n "NoInfer" test-d => 0` | Add `expectTypeOf` case for `NoInfer` per `AGENTS.md:445-463` — e.g. `expectTypeOf(list.first(1, fallback)).toEqualTypeOf<number>()` with `NoInfer` check |
| `overload-order-type-test` | warn | For `NonEmpty` with two overloads (`StreamSource.NonEmpty` first), reuse `review-api` check: verify order via `rg -n "NonEmpty|StreamSource"` and flag `warn` if `nonEmpty` not first (also a type-level concern). | `src/public/...:line: StreamSource` before `StreamSource.NonEmpty` | Move `NonEmpty` overload first per `AGENTS.md:29-30` + add `expectTypeOf` for both overloads |
| `any-nonnull-in-testd` | info | `rg -n "any|!" test-d --no-heading` — `biome.json:15-44` `noExplicitAny`/`noNonNullAssertion` in `test-d/` are `info` only here (not `warn`), per Notes. | `test-d/...:line: any` | Prefer `unknown`/`expectTypeOf` |
| `generated-type-test-passed` | info | After `--fix`, scoped `tsc -p tsconfig.json --noEmit` passed (`0`). | `tsc -p tsconfig.json --noEmit: ok` | No action — audit-type-tests re-run shows reduced gaps |
| `generated-type-test-failed` | error | After `--fix`, scoped `tsc -p tsconfig.json --noEmit` failed (non-zero or error in output). Leave file but mark error with reproduction note. | `tsc -p tsconfig.json --noEmit: <snippet>` | Fix generated test per `AGENTS.md:424-463` — reproduction: `tsc -p tsconfig.json --noEmit in packages/<name>` |

## Procedure — Diagnose (reuse 07)

- Same evidence as `audit-type-tests` (07): enumerate public generic methods via `rg` presence in `src/public`, check `rg` coverage in `test-d/`, handle `as` ban, check `NonEmpty`/`Types`/`const`/`NoInfer`/`overload` via `rg`.
- Never mutates, never runs `tsc`. Idempotent. Emits `write-type-tests — <pkg>` report.

## Procedure — Fix (--fix / --force / --dry-run)

| Step | Guardrail | Detail | Normative ref |
|---|---|---|---|
| `gap-fill-only` | Never overwrite hand-written `test-d/*.test-d.ts` without `--force` (Q11) | With `--fix`, write only to `test-d/<pkg>.generated.test-d.ts` (one file per package run, one `expectTypeOf` per uncovered generic/overload). Without `--force`, never touch hand-written `test-d/*.test-d.ts`; with `--force`, may overwrite them if needed. Generated file may be overwritten on re-run (idempotent). | `spec.md:2.11` Q11 |
| `expectTypeOf-only` | Ban `as` assertions per Q11 | Generated file uses `import { expectTypeOf } from 'bun:test'` and `expectTypeOf<...>().toEqualTypeOf<...>()`/`toExtend`/`toBeFunction` etc. Never `as string`/`as any`/`as unknown`/`as const` (prefer `const` param). | `AGENTS.md:424-463` §6.6, Q11 |
| `one-file-per-package` | Single file per package run, one `expectTypeOf` per method | File is `test-d/<pkg>.generated.test-d.ts` where `<pkg>` is dir basename (e.g. `stream.generated.test-d.ts`). Each `expectTypeOf` is concise, isolated, uses package import (`import { Stream } from '@rimbu/stream'`), no `as`/`any`/`!`, single quotes. Covers `NonEmpty` narrowing, `OptLazy` fallback, HKT `Types`, `const`/`NoInfer`, overload order where gaps exist. | `AGENTS.md:335-352` §6.2, `AGENTS.md:375-398` §6.4, `AGENTS.md:424-463` §6.6, `AGENTS.md:29-30` §1.1 |
| `tsc-post-check` | Run scoped `tsc -p tsconfig.json --noEmit` and report pass/fail | After writing (not `--dry-run`), run `tsc -p tsconfig.json --noEmit` from package dir. On success add `info` `generated-type-test-passed`; on failure leave file and add `error` `generated-type-test-failed` with reproduction note. With `--dry-run`, simulate `info` `generated-type-test-passed` (`dry-run: would pass`). | `AGENTS.md:546-573` §9 |
| `idempotent` | Safe to re-run | Second `--fix` regenerates same file (no duplicate cases); audit-type-tests re-run shows reduced gaps because `rg -n "\b<method>\b" test-d => 1+` now includes generated file. | `spec.md:2.6` Q6 |
| `audit-gap-list` | Uses audit-type-tests output as gap list | Diagnose findings are the gap list; Fix consumes that list to generate one `expectTypeOf` per `warn` method. No separate enumeration — identical to 07. | ticket 12 |

## Severity

- `warn` — public generic method has no `test-d/*.test-d.ts` `expectTypeOf` case (`rg =>0`, reuses 07), or `NonEmpty`/`Types`/`const`/`NoInfer`/`overload` not covered, or `as` assertion in `test-d/`
- `error` — generated type test failed scoped `tsc -p tsconfig.json --noEmit` (`generated-type-test-failed`)
- `info` — `as const`/`any`/`!` advisory, or generated test passed (`generated-type-test-passed`), or dry-run

For this skill, `missing-type-test` is `warn` (not `error`); only `generated-type-test-failed` is `error` (post-check guardrail).

## Evidence Format

- `Location`: `file:line` for the public method (`src/public/map.ts:88`) or `test-d/<generated>:1` for post-check, or `package: <name>` for `Types`/`NonEmpty` missing
- `Evidence`: `rg -n "\b<method>\b" test-d --no-heading => 0 matches` + `src/public/...:line` for missing; or `tsc -p tsconfig.json --noEmit: ok` for passed, or `error: <snippet>` for failed, under 120 chars + backticks
- `Suggested fix`: `Add test-d/<pkg>.generated.test-d.ts: expectTypeOf<...>().toEqualTypeOf<...>() per AGENTS.md:424-463` or `Fix generated test per AGENTS.md:424-463 — reproduction: tsc -p tsconfig.json --noEmit`
- `Normative ref`: `AGENTS.md:335-352` §6.2 or `AGENTS.md:375-398` §6.4 or `AGENTS.md:424-463` §6.6 or `AGENTS.md:29-30` §1.1

## Dogfood

- `packages/stream` — `src/public/stream-types.ts` (`FastIterator` fastNext) and `src/stream.ts` entry (`Stream` generics). Diagnose reports `missing-type-test` for `fastNext` (if `test-d/` not covering) and `as-assertion` warns. After `--fix`, `test-d/stream.generated.test-d.ts` with `expectTypeOf` + `fastNext` + `NonEmpty` + `OptLazy` cases is added, `tsc -p tsconfig.json --noEmit` passes, and `audit-type-tests` re-run shows reduced `warn` (`rg -n "\bfastNext\b" test-d => 1+` via generated file).
- `packages/sorted` — `src/public/map.ts`/`set.ts` (`SortedMap`/`SortedSet` with `min<O>`, `max<O>`, `findIndex<O>`, `next<O>`, `previous<O>`, `atIndex<O>`, `take`, `Types`). Diagnose reports 18 `missing-type-test` + `hkt-type-test`. After `--fix`, `test-d/sorted.generated.test-d.ts` with `expectTypeOf` per method + HKT `Types` normal/nonEmpty + NonEmpty narrowing + OptLazy fallback is added, `tsc` passes, audit re-run shows reduced `warn`.

## References

- `AGENTS.md:335-352` §6.2 NonEmpty, `AGENTS.md:375-398` §6.4 HKT, `AGENTS.md:424-463` §6.6 `const`/`NoInfer`, `AGENTS.md:29-30` §1.1 overload order, `AGENTS.md:79-113` §3 `test-d/`
- `biome.json:27-35` `noRestrictedImports`, `AGENTS.md:138-152` import rule
- `spec.md:2.7` Q11 `expectTypeOf` only, `write-type-tests` feed from `audit-type-tests` (07)
