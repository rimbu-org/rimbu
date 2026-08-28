# Write-Docs Checklist

Source: `AGENTS.md:546-573` §9, `package.json:56-64`, `config/typedoc.json:1-16`, `support/docs-extractor/src/verify-examples.ts`, ticket `10`, Wave 2. `AGENTS.md` wins > ADR > checklist (Q5). `README` not in scope — left to `support/docs-extractor`.

## Scope

- **Default:** single package `<pkg>` (`packages/<name>` with `src/public/**/*.ts` and/or `src/<name>.ts` entry)
- **`--workspace`:** all packages with `src/public/` (or `src/<name>.ts` when `public/` tier not present, exclude `list2` unpublished)
- **Hybrid:** diagnose by default (read-only, reuse `review-docs` 09); fix only with `--fix` (gap-fill), `--force` to overwrite/augment existing JSDoc (Q13)
- **Gap-fill only:** never overwrite hand-written `/**` without `--force`; generate one JSDoc block at a time, preserving `biome.json:11-14` tabs and `46-50` single quotes; runnable `// =>` examples only

## Procedure — Diagnose (reuse 09)

| Rule | Severity | Check | Evidence (`rg`) | Fix hint | Normative ref |
|---|---|---|---|---|---|
| `missing-jsdoc` | warn | For each top-level `export` in `src/public/**/*.ts` and `src/<name>.ts` (pattern `^\s*export\s+(type\s+)?(function\|class\|interface\|type\|const\|let\|var\|namespace\|enum)`), preceding 20 lines contain `/**` block. If none, flag. Skip barrel `export * from` / `export { X } from`. | `rg -n "^\s*export\s+" packages/<pkg>/src/public --no-heading` + file window `/**` absent | Add `/** ... @example ```ts ... // => ... ``` */` per `AGENTS.md:546-573` | `AGENTS.md:546-573` §9 |
| `missing-example` | warn | Same export window contains `@example` with fenced ```ts code + `// =>` output comment. If `/**` present but no `@example`, flag. (Gap-fill only without `--force` — diagnose still reports, fix skips) | `rg -n "@example" packages/<pkg>/src/public --no-heading` vs per-export window `0` | Add `@example` ```ts ... ``` with `console.log(1); // => 1` per `package.json:56-64` `docs:verify-examples` | `package.json:56-64`, `AGENTS.md:546-573` |
| `typedoc-warning` | warn | TypeDoc (`config/typedoc.json:1-16`) would warn: missing `@param`/`@typeparam`/`@returns` where `AGENTS.md:546-573` expects tags, or empty `@example`. Heuristic: same as `missing-jsdoc` + check `@example` block not empty. | Same `rg` as above | Add missing tags; ensure `/**` is valid TypeDoc | `config/typedoc.json:1-16` |
| `broken-example` | error | If `--with-tools` and `docs/api.aggregate.json` exists, run `bun ./support/docs-extractor/src/verify-examples.ts --filter=<pkg>/` scoped to package. Parse `docs/api.examples.verify.report.json` for `mismatches` where `key` contains `<pkg>/`. Each mismatch (output vs actual, missing `// =>`, inferred-type) is `error`. | `docs/api.examples.verify.report.json: details[]` where `key` ~ `<pkg>/` + stdout `console.log #N output mismatch` | Fix `@example` to match actual output via `docs:verify-examples`; use `// =>` inline/next-line/multi-line per `verify-examples.ts` | `package.json:56-64` |
| `verify-skipped` | info | If `--with-tools` but no `docs/api.aggregate.json` or verify fails (e.g. no `dist/`), emit `info` that runnable check was skipped. | `ls docs/api.aggregate.json` missing | Run `bun run docs:extract && bun run docs:verify-examples` per `package.json:56-64` | `package.json:56-64` |

## Procedure — Fix (--fix / --force)

| Step | Guardrail | Detail | Normative ref |
|---|---|---|---|
| `gap-fill-only` | Never overwrite existing `/**` without `--force` (Q13) | Without `--force`, only `missing-jsdoc` exports get a new block. `missing-example` (has `/**` but no `@example`) is reported but not mutated. With `--force`, augment existing `/** ... */` to add `@example` before `*/`. Never replace a block that already has `@example`. | `spec.md:2.10` Q13 |
| `one-block-at-a-time` | Generate one JSDoc block at a time, preserving formatting | Detect export line indent (tabs per `biome.json:11-14`) and use same indent for every `/**` line. Use single quotes for any string literal in example (`biome.json:46-50`). Do not batch-generateREADME/TypeDoc frontmatter. | `biome.json:11-14`, `46-50` |
| `runnable-example` | Examples must be `docs:verify-examples`-runnable | Canonical: `console.log(1); // => 1` inside ```ts fence with inline `// =>`. Type-checks with no imports, runs via `bun` without `dist`. For known `hashed` `HashMap`/`HashSet`, may use `import { HashMap } from '@rimbu/hashed/map';` + `console.log(HashMap.of([1, 'a']).size); // => 1` (single quotes). | `package.json:56-64`, `support/docs-extractor/src/verify-examples.ts` |
| `no-readme` | Do not generate README/TypeDoc frontmatter | `write-docs` covers JSDoc+examples only; `support/docs-extractor` owns `docs:extract`/`aggregate`/`markdown`. | `spec.md:2.10` |
| `post-check` | Run `docs:verify-examples` scoped to touched files and report pass/fail; revert or warn on failure | After mutation (not `--dry-run`), run `bun ./support/docs-extractor/src/verify-examples.ts --filter=<pkg>/` and parse report. If `broken-example` for just-generated snippet, revert file from snapshot or emit `warn` `fix-reverted`. With `--dry-run`, emit `info` `verify-passed` (`dry-run: console.log(1); // => 1 is runnable by construction`). If aggregate missing, emit `info` `verify-skipped`. | `package.json:56-64` |
| `idempotent` | Safe to re-run | Second `--fix` finds no `missing-jsdoc` and reports clean (0 warn). `--dry-run` never mutates. | `spec.md:2.6` Q6 |

## Severity

- `warn` — `missing-jsdoc`, `missing-example`, `typedoc-warning` (package builds but docs gap)
- `error` — `broken-example` (`docs:verify-examples` mismatch/missing `// =>`)
- `info` — `verify-skipped`, `verify-passed` (post-check), `dry-run`, advisory

Per ticket 10: gap-fill adds missing `/** ... @example ... */`; after `--fix`, `review-docs` (09) reports fewer `warn` and `docs:verify-examples` passes.

## Evidence Format

- `Location`: `file:line` for the export (`src/public/...:line`, repo-relative) or `package: <name>` for package-level (`verify-skipped`/`verify-passed`)
- `Evidence`: `` `export line` `` or `rg -n "@example" src/public => 0` or `docs/api.examples.verify.report.json: key: detail (expected vs actual)` under 120 chars + backticks
- `Suggested fix`: `Add /** @example ```ts console.log(1); // => 1 ``` */` or `Run with --fix` / `Run with --fix --force to add @example to existing /** */` or `Fix // => to actual: <value> per docs:verify-examples`
- `Normative ref`: `AGENTS.md:546-573 §9` or `package.json:56-64` or `config/typedoc.json:1-16` or `biome.json:11-14` / `46-50`

## Dogfood

- `packages/hashed` — public `src/public/map.ts` (`HashMap`) and `src/public/set.ts` (`HashSet`) plus `src/hashed.ts` entry. After `write-docs --fix` (or `--dry-run` simulation), `review-docs` warn count for hashed drops and `docs:verify-examples --filter=hashed/` reports 0 issues for generated `console.log(1); // => 1` snippets (or `verify-skipped` if no aggregate).

## References

- `AGENTS.md:546-573` §9 Tooling Reference, `AGENTS.md:601-625` sandbox, `AGENTS.md:79-113` §3 layout, `AGENTS.md:16-31` §1.1 (naming), `biome.json:11-14` tabs, `46-50` single quotes
- `package.json:56-64` `docs:*` scripts, `config/typedoc.json:1-16`, `support/typedoc-rimbu-plugin`
- `support/docs-extractor/src/verify-examples.ts` + `examples.ts` (Stage 4 gate)
- `spec.md:2.7` Wave 2, `spec.md:2.10` Added `write-docs` (Q13), `docs/agents/domain.md:11-12` single-context
