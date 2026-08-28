# Review-Docs Checklist

Source: `AGENTS.md:546-573` §9, `package.json:56-64`, `config/typedoc.json:1-16`, ticket `09`, Wave 2. `AGENTS.md` wins > ADR > checklist (Q5). `README` not in scope.

## Scope

- **Default:** single package `<pkg>` (`packages/<name>` with `src/public/**/*.ts` and/or `src/<name>.ts` entry)
- **`--workspace`:** all packages with `src/public/` (or `src/<name>.ts` when `public/` tier not present, exclude `list2` unpublished)
- **Read-only:** never mutate (Q2). Feeds `write-docs` (10).

## Checks

### (a) JSDoc with @example — `AGENTS.md:546-573` §9, `package.json:56-64`

Every `public/` export must have `/** ... @example ... */` that is `docs:verify-examples`-runnable. TypeDoc plugin (`support/typedoc-rimbu-plugin`, `config/typedoc.json:12`) renders without warnings for the same JSDoc.

| Rule | Severity | Check | Evidence (`rg`) | Fix | Normative ref |
|---|---|---|---|---|---|
| `missing-jsdoc` | warn | For each top-level `export` in `src/public/**/*.ts` and `src/<name>.ts` (pattern `^\s*export\s+(type\s+)?(function\|class\|interface\|type\|const\|let\|var\|namespace\|enum)`), preceding 20 lines contain `/**` block. If none, flag. | `rg -n "^\s*export\s+" packages/<pkg>/src/public --no-heading` + file window `/**` absent | Add `/** ... */` per `AGENTS.md:546-573` | `AGENTS.md:546-573` §9 |
| `missing-example` | warn | Same export window contains `@example` with fenced ```ts code + `// =>` output comment. If `/**` present but no `@example`, flag. (also covers non-runnable placeholder) | `rg -n "@example" packages/<pkg>/src/public --no-heading` vs per-export window `0` | Add `@example` ```ts ... ``` with `console.log(x); // => value` per `package.json:56-64` docs:verify-examples | `package.json:56-64`, `AGENTS.md:546-573` |
| `typedoc-warning` | warn | TypeDoc (`config/typedoc.json:1-16`) would warn: missing `@param`/`@typeparam`/`@returns` for exported function/interface method, or missing JSDoc entirely. Heuristic: same as `missing-jsdoc` + check that `@example` block is not empty. | Same `rg` as above + `rg -n "@param\|@typeparam\|@returns" src/public --no-heading` missing where method has args | Add missing tags; ensure `/**` is valid TypeDoc | `config/typedoc.json:1-16`, `AGENTS.md:546-573` |

### (b) Runnable Example — `package.json:61` `docs:verify-examples`

| Rule | Severity | Check | Evidence | Fix | Normative ref |
|---|---|---|---|---|---|
| `broken-example` | error | If `--with-tools` and `docs/api.aggregate.json` exists, run `bun ./support/docs-extractor/src/verify-examples.ts --filter=<pkg>/` scoped to package. Parse `docs/api.examples.verify.report.json` or stdout for `mismatches` where `key` contains `<pkg>/`. Each mismatch (output vs actual, missing `// =>`, inferred-type) is `error`. | `docs/api.examples.verify.report.json: details[]` where `key` ~ `<pkg>/` + stdout `console.log #N output mismatch` | Fix `@example` to match actual output via `docs:verify-examples`; use `// =>` inline/next-line/multi-line per `support/docs-extractor/src/verify-examples.ts` | `package.json:56-64` |
| `verify-skipped` | info | If `--with-tools` but no `docs/api.aggregate.json` or `verify-examples` fails to run (e.g. no `dist/`), emit `info` that runnable check was skipped. | `ls docs/api.aggregate.json` missing or `spawn bun verify-examples --filter` exit non-zero without report | Run `bun run docs:extract && bun run docs:verify-examples` per `package.json:56-64` | `package.json:56-64` |

### (c) Exclusions

| Item | Scope |
|---|---|
| `README` | Explicitly not in scope per ticket 09 |
| `test/` `test-d/` `test-random/` | Not checked (only `src/public/` + entry) |
| `src/internal/` `src/advanced/` | Not in scope (only public surface); `advanced/` is extension API not user-facing docs |
| `list2` | Unpublished, excluded from `--workspace` |

## Severity

- `warn` — missing JSDoc, missing `@example`, TypeDoc would warn (package still builds but docs gap)
- `error` — `@example` exists but `docs:verify-examples` reports mismatch/missing `// =>` (broken runnable)
- `info` — verify skipped (no aggregate), or `typedoc.json` entryPoints gap

Per ticket 09: missing JSDoc = `warn`, broken example = `error`.

## Evidence Format

- `Location`: `file:line` for the export (`src/public/...:line`, repo-relative) or `package: <name>` for `verify-skipped`/workspace summary
- `Evidence`: `` `rg -n "@example" src/public => 0` `` or `export line` or `docs/api.examples.verify.report.json: key: detail (expected vs actual)` under 120 chars + backticks
- `Suggested fix`: `Add /** @example ```ts ... // => ... ``` */` or `Fix // => to actual: <value> per docs:verify-examples`
- `Normative ref`: `AGENTS.md:546-573 §9` or `package.json:56-64` or `config/typedoc.json:1-16`

## References

- `AGENTS.md:546-573` §9 Tooling Reference, `AGENTS.md:601-625` sandbox, `AGENTS.md:79-113` §3 layout
- `package.json:56-64` `docs:*` scripts, `config/typedoc.json:1-16`, `support/typedoc-rimbu-plugin/dist/index.js`
- `support/docs-extractor/src/verify-examples.ts` (run-and-capture + inferred-type checker)
- `spec.md:2.7` Wave 2, `docs/agents/domain.md:11-12` single-context (ADRs may not exist)
