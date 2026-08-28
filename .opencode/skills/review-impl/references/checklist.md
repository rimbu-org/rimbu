# Review-Impl Checklist

Source: `AGENTS.md:287-478` §6, `biome.json:15-44`, `AGENTS.md:565-572`, ticket `08`, Q10 (fast, no `build:seq`).

## Scope

- **Default:** single package `<pkg>` (`packages/<name>` with `src/`)
- **`--workspace`:** all packages with `src/` (exclude `list2`), fast static `rg` only

## Checks — Biome Rules (`biome.json:15-44`/`AGENTS.md:565-572`)

| Rule | Severity | Check | Evidence (rg) | Fix |
|---|---|---|---|---|
| `noUnusedImports` | error | `import { X } from` where `X` not found via `rg -n "\bX\b" src --no-heading` elsewhere in `src/` (heuristic for `correctness.noUnusedImports: error` `biome.json:18-21`) | `src/...:line: import { X }` + `rg -n "\bX\b" src => 0` | Remove unused import or use `X` |
| `noExplicitAny` | warn | `rg -n ":\s*any\b|\bas\s+any\b|<any>|any\[\]" src --no-heading` in `src/` (exclude `test/` per `biome.json:73-84` `noConsole` off in `**/test/**`, but `noExplicitAny` is `warn` in `src/`; `any` in `test-d/` is `info` elsewhere) | `src/...:line: : any` | Use `unknown`/`generic`/`expectTypeOf` |
| `noNonNullAssertion` | warn | `rg -n "\w+!\." src --no-heading` and `rg -n "\w+!\b" src --no-heading` (exclude `!=`/`!==`) for `!` non-null assertion (`style.noNonNullAssertion: warn` `biome.json:26`) | `src/...:line: value!` | Use `OptLazy`/`nonEmpty()` guard or `!` with comment |
| `noConsole` | error | `rg -n "console\.(log\|warn\|error\|info\|debug)" src --no-heading` in `src/` (must not appear; allowed in `test/` per `biome.json:73-84` `suspicious.noConsole: error` with override) | `src/...:line: console.log` | Remove `console` or move to `test/` |
| `noRestrictedImports` | error | `rg -n "from\s+['\"]\./|from\s+['\"]\.\./" src --no-heading` for `./`/`../` (`style.noRestrictedImports: error` `biome.json:27-35` `["./*", "../*"]`) | `src/...:line: from './x'` | Use `#<pkg>/*` or `@rimbu/*` per `AGENTS.md:138-152` |

## Checks — Judgemental (§6)

| Rule | Severity | Check | Evidence | Fix |
|---|---|---|---|---|
| `mutation-leak` | warn | `rg -n "return this;|return this\b" src --no-heading` in methods that should return new instance (`set`, `update`, `map`, `filter`, `append`, `prepend` on immutable collections). Flag if `src/internal/...` method returns `this` where `AGENTS.md:9` says mutations return new instances. Heuristic: if file is `src/internal/immutable/**/*.ts` and contains `return this`, flag. | `src/internal/...:line: return this;` | Return new instance via `this.context` or `builder` |
| `nonempty-narrowing` | warn | `rg -n "assumeNonEmpty|nonEmpty\(\)" src --no-heading` and check for missing `nonEmpty()` guard before `assumeNonEmpty()` or `!` after `nonEmpty()`. Flag `assumeNonEmpty()` without `if (x.nonEmpty())` or `nonEmpty` check. | `src/...:line: assumeNonEmpty()` without preceding `nonEmpty()` | Add `if (x.nonEmpty())` guard or use `OptLazy` |
| `reducer-misuse` | warn | `rg -n "Reducer\." src --no-heading` and check for `Reducer` without `mapInput`/`combine` or direct `reduce` on `Stream` without `Reducer` type. Heuristic: if `src/` contains `\.reduce\(` but not `Reducer.` in same file, flag as potential `Reducer` opportunity. | `src/...:line: .reduce(` without `Reducer` | Use `Reducer` composable per `AGENTS.md:400-420` §6.5 |
| `token-misuse` | warn | `rg -n "Token" src --no-heading` in `packages/base` (`src/token.ts` etc.) — check for `Token` without `Symbol` or `new Token` without `Object.freeze`. Heuristic: `Token` usage outside `packages/base` should be via `Token` import, not direct `Symbol`. | `src/...:line: Token` | Use `Token` per `packages/base` docs |
| `rimbuerror-misuse` | warn | `rg -n "RimbuError" src --no-heading` — check for `throw new RimbuError` vs `throw RimbuError`. Heuristic: `RimbuError` should be thrown, not returned. | `src/...:line: RimbuError` | `throw new RimbuError...` per `packages/base` |

All findings cite `AGENTS.md` §6 or `biome.json:15-44` + `file:line`. `review-anatomy` (03) handles heavy `biome:check`/`typecheck` evidence; this skill stays fast via `rg` only (Q10, orchestrator may chain 03+08).

## Severity

- `error` — `noUnusedImports`, `noConsole` in `src/`, `noRestrictedImports` (`./`/`../`)
- `warn` — `noExplicitAny` (`: any`), `noNonNullAssertion` (`!`), `mutation-leak`, `nonempty-narrowing`, `reducer-misuse`, `token-misuse`, `rimbuerror-misuse`
- `info` — advisory (e.g. `any` in `test` is `warn` elsewhere, but here in `src` it's `warn`; `Reducer` could use `mapInput` is `info`)

## Evidence Format

- `Evidence` column: `` `rg -n "<pattern>" src --no-heading` `` line (e.g. `src/internal/...:12: value!`) + `biome.json` rule name
- `Location` column: `file:line` (`src/...:line`) or `package: <name>`
- `Suggested fix` column: `Remove any` / `Use OptLazy` / `Return new instance`
- `Normative ref` column: `biome.json:15-44` or `AGENTS.md:287-478 §6` or `AGENTS.md:565-572`

## Exclusions

- Do not flag `test/` for `noConsole` (allowed per `biome.json:73-84`)
- Do not flag `test-d/` for `noExplicitAny`/`noNonNullAssertion` (those are `info` in `audit-type-tests`, not here)
- Do not flag `src/internal/` `return this` in `Builder` (mutable builder may return `this` legitimately)
- Do not flag `any` in `src/advanced/` re-export barrels (type-only)

## References

- `AGENTS.md:287-478` §6, `biome.json:15-44`, `AGENTS.md:565-572`, `AGENTS.md:79-113` §3 (test override)
- `spec.md:2.7` Q10 fast, `maintain-skills` + `review-anatomy` chain
