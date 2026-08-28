# Audit-Type-Tests Checklist

Source: `AGENTS.md:424-463` §6.6 (`const`/`NoInfer`), `AGENTS.md:335-352` §6.2 NonEmpty, `AGENTS.md:375-398` §6.4 HKT, `AGENTS.md:29-30` overload order, `AGENTS.md:79-113` §3 `test-d/`, ticket `07`, Q11 (`expectTypeOf` only, ban `as`).

## Scope

- **Default:** single package `<pkg>` (`packages/<name>` with `src/public/` and `package.json`)
- **`--workspace`:** all packages with `package.json` (exclude `list2`), audits each package's `src/public/` vs `test-d/`

## Checks

| Rule | Severity | Check | Evidence (rg + file:line) | Fix |
|---|---|---|---|---|
| `missing-type-test` | warn | For each public generic method (`src/public/**/*.ts` with `<...>` generics — e.g. `filter<T>`, `map<T>`, `get<K>`, `select<T, const SL>`, `first<T>`), `rg -n "\b<method>\b" test-d --no-heading` across `test-d/*.test-d.ts` (recursive). If `0` matches and `test-d/` exists, flag `warn`. If `test-d/` dir missing, also `warn` per method (no type tests). | `rg -n "\b<method>\b" test-d --no-heading => 0 matches` + `src/public/...:line:export function <method>` | Add `test-d/<name>.test-d.ts: expectTypeOf<...>` per `AGENTS.md:424-463` |
| `as-assertion` | warn | `rg -n "\bas\s" test-d --no-heading` — for each `test-d/*.test-d.ts` line with `as` type assertion (`as string`/`as any`/`as unknown`/`as Type`), flag `warn` (ban in generated tests per Q11). `as const` is `as` but for literals — flag as `info` to prefer `const` param per `AGENTS.md:424-438`, not `warn`. | `test-d/...:line: value as string` | Replace `as` with `expectTypeOf` or `satisfies`; for `as const` use `const` type param |
| `as-const` | info | `rg -n "as const" test-d --no-heading` — flag `info` (prefer `const` type param, not hard ban). | `test-d/...:line: as const` | Use `const` type param per `AGENTS.md:426-442` |
| `nonempty-type-test` | warn | For each `NonEmpty` variant (`rg -n "interface NonEmpty" src/public`), check `test-d/` has `nonEmpty()`/`assumeNonEmpty()` narrowing case (`rg -n "nonEmpty\(\)|assumeNonEmpty" test-d`). If `0`, flag `warn`. | `rg -n "nonEmpty" test-d => 0` | Add `expectTypeOf` case for `NonEmpty` per `AGENTS.md:335-352` |
| `hkt-type-test` | warn | For each `interface Types` (`rg -n "interface Types" src/public`), check `test-d/` has `Types` `normal`/`nonEmpty` case (`rg -n "Types.*normal|Types.*nonEmpty" test-d`). If `0`, flag `warn`. | `rg -n "Types" test-d => 0` | Add `expectTypeOf` case for `Types` per `AGENTS.md:375-398` |
| `const-param-test` | warn | For each `const` type param (`rg -n "<const" src/public` — e.g. `<const SL extends`), check `test-d/` has case without `as const` (uses `const` inference). If `0`, flag `warn`. | `rg -n "<const" src/public => 1` but `rg -n "expectTypeOf" test-d` has no `const` case | Add `expectTypeOf` case with inline literal per `AGENTS.md:424-438` |
| `noinfer-test` | warn | For each `NoInfer` (`rg -n "NoInfer" src/public`), check `test-d/` has `NoInfer` fallback case. If `0`, flag `warn`. | `rg -n "NoInfer" test-d => 0` | Add `expectTypeOf` case for `NoInfer` per `AGENTS.md:445-463` |
| `overload-order-type-test` | warn | For `NonEmpty` with two overloads (`StreamSource.NonEmpty` first), reuse `review-api` check: verify order via `rg -n "NonEmpty|StreamSource"` and flag `warn` if `nonEmpty` not first (also a type-level concern). | `src/public/...:line: StreamSource` before `StreamSource.NonEmpty` | Move `NonEmpty` overload first per `AGENTS.md:29-30` |
| `any-nonnull-in-testd` | info | `rg -n "any|!" test-d --no-heading` — `biome.json:15-44` `noExplicitAny`/`noNonNullAssertion` in `test-d/` are `info` only here (not `warn`), per Notes. | `test-d/...:line: any` | Prefer `unknown`/`expectTypeOf` |

## Severity

- `warn` — generic method has no `test-d/` `expectTypeOf` case, or `test-d/` uses `as` assertion, or `NonEmpty`/`Types`/`const`/`NoInfer`/`overload` not covered
- `info` — `as const` (prefer `const` param), or `any`/`!` in `test-d/` (informational per `biome.json:15-44`)
- **Never `error`** — gaps are `warn`/`info`; `write-type-tests` (12) will generate `*.generated.test-d.ts` with `expectTypeOf` only

## Evidence Format

- `Evidence` column: `` `rg -n "\b<method>\b" test-d --no-heading => 0 matches` `` + `src/public/...:line` for missing; or `` `test-d/...:line: value as string` `` for `as` ban
- `Location` column: `file:line` for the public method (`src/public/...:line`) or `test-d/` file for `as` (`test-d/...:line`)
- `Suggested fix` column: `Add test-d/<name>.test-d.ts: expectTypeOf<...>` or `Replace as with expectTypeOf`
- `Normative ref` column: `AGENTS.md:424-463 §6.6` or `AGENTS.md:335-352 §6.2` or `AGENTS.md:375-398 §6.4` or `AGENTS.md:29-30 §1.1`

## Exclusions

- Do not flag `src/<name>.ts` entry re-exports
- Do not flag `src/internal/` or `src/advanced/` (only `src/public/`)
- Do not flag `test-random` (not in scope per `07:12`)
- Do not flag `as` in `src/` (only in `test-d/`)
- `as const` is `info`, not `warn` (per Q11, `const` param is preferred but `as const` is not hard ban)

## References

- `AGENTS.md:424-463` §6.6 `const`/`NoInfer`, `AGENTS.md:335-352` §6.2 NonEmpty, `AGENTS.md:375-398` §6.4 HKT, `AGENTS.md:29-30` §1.1 overload order, `AGENTS.md:79-113` §3 `test-d/`
- `spec.md:2.7` Q11 `expectTypeOf` only, `write-type-tests` feed
