---
name: write-docs
description: Gap-fill missing JSDoc with runnable @example for public exports — hybrid diagnose (reuse review-docs 09) + fix with --fix/--force, never overwrites existing JSDoc without --force
disable-model-invocation: false
---

# Write-Docs — Public API Documentation Generation

Hybrid skill that gap-fills missing `/** ... @example ... */` for `packages/<name>/src/public/**/*.ts` (and `src/<name>.ts` entry). Counterpart to `review-docs` (09). Diagnose by default (read-only, reuse 09); mutate only with `--fix` (and `--force` to overwrite/augment existing JSDoc). Never generates README/TypeDoc frontmatter — left to `support/docs-extractor`.

## Purpose

Single-concern docs generation for `packages/<name>`. Verifies that every public export in `src/public/**/*.ts` (and the main `src/<name>.ts` entry) has a `/** ... @example ... */` block that is `docs:verify-examples`-runnable (`package.json:56-64`, `support/docs-extractor/src/verify-examples.ts`), reusing the `review-docs` (09) diagnose logic. In diagnose mode it is read-only and idempotent; in fix mode (`--fix`) it gap-fills only — adds one JSDoc block at a time for uncovered exports, preserving existing formatting (`biome.json:11-14` tabs, `46-50` single quotes). Existing JSDoc is never overwritten without `--force` (Q13). After mutation it post-checks `docs:verify-examples` scoped to touched files and reports pass/fail in the shared report, reverting or warning on failure. Scope is single package `<pkg>` by default, optional `--workspace`. Wave 2 per spec §2.7.

## Normative refs

- `AGENTS.md:546-573` §9 Tooling Reference (`docs:verify-examples`, `typedoc`, `build:seq`, `biome.json` tabs/single quotes)
- `AGENTS.md:79-113` §3 Per-Package Anatomy (three tiers `public`/`advanced`/`internal`, `src/public/` → `dist/public/*`)
- `AGENTS.md:138-152` import rule (package paths `#pkg/*`/`@rimbu/*`, never relative) — mandatory when inspecting `src/`
- `AGENTS.md:601-625` sandbox (`/tmp` + repo root, never write outside)
- `package.json:56-64` docs scripts (`docs:extract`, `docs:aggregate`, `docs:verify-examples`, `docs:examples`)
- `config/typedoc.json:1-16` TypeDoc config (`entryPointStrategy: packages`, `plugin: support/typedoc-rimbu-plugin`)
- `biome.json:11-14` `formatter.indentStyle: tab` and `biome.json:46-50` `javascript.formatter.quoteStyle: single` — preserve when generating JSDoc
- `support/docs-extractor/src/verify-examples.ts` — runnable example verifier (`// =>` inline/next-line/multi-line, `--filter=<pkg>/`)
- `support/docs-extractor/src/examples.ts` — type-check gate for `@example` (`--strict-examples`)
- `docs/agents/domain.md:11-12` single-context repo (`CONTEXT.md`/`docs/adr/` may not yet exist, proceed silently)
- `AGENTS.md:16-31` §1.1 API Design Goals — examples should reflect naming/math-index/`OptLazy`/`NonEmpty` where relevant, but gap-fill uses minimal runnable `console.log(1); // => 1`

`AGENTS.md` wins > ADR > checklist (spec §2.5, Q5). Do not generate README/TypeDoc frontmatter (`support/docs-extractor` owns it).

## When to use

> When you edit `packages/*/src/public/**` or add a public export and `review-docs` reports missing JSDoc/@example, consider invoking `write-docs` in diagnose mode (`--out` optional). Run fix mode only when the task explicitly asks for `--fix`/`--force`.

Additional triggers: after `review-docs` (09) shows `warn` `missing-jsdoc`/`missing-example`, before publishing a new public method, when `docs:verify-examples` fails for a package, to dogfood on `packages/hashed`/`stream`/`list`.

## Procedure

### Diagnose (read-only, default)

Reuse `review-docs` (09) logic — no mutation, no `build:seq` by default, harness-independent (`bun`+`rg`+`jq` only):

1. Resolve target: single package `<pkg>` (e.g. `packages/hashed`) is default. If `--workspace` is passed, expand to all 23 published packages with `src/public/` or `src/<name>.ts` (exclude `list2`). Require `<pkg>` if no `--workspace`. Be single-package-scoped and idempotent (Q6).
2. For each target package, collect evidence **without mutating**:
   - Enumerate public files: `src/public/**/*.ts` plus `src/<name>.ts` entry. For each file, enumerate top-level public exports via `rg -n "^\s*export\s+(type\s+)?(function|class|interface|type|const|let|var|namespace|enum)" src/public --no-heading` and file scan. Skip barrel re-exports (`export * from`, `export { X } from`).
   - For each export at `file:line`, inspect preceding 20 lines for `/**` and `@example`. Use `rg -n "@example" src/public --no-heading` for quick presence and file-read window for per-export decision. If no `/**` in window, emit `warn` `missing-jsdoc`; if `/**` present but no `@example`, emit `warn` `missing-example`. Evidence is the export line `file:line` and `rg` snippet. Severity `warn` per ticket 09 (missing JSDoc = `warn`, broken example = `error`).
   - Runnable example check (optional, not default): if `--with-tools` is passed and `docs/api.aggregate.json` exists, run `bun ./support/docs-extractor/src/verify-examples.ts --filter=<pkg>/` scoped to the package and parse `docs/api.examples.verify.report.json` or stdout for mismatches whose `key` contains `<pkg>/`. Each mismatch becomes `error` `broken-example` with evidence `console.log #N output mismatch`. If aggregate missing, emit `info` `verify-skipped`. Cite verbatim `rg`/`docs:verify-examples` snippet (Q10). Every finding cites `file:line` and `AGENTS.md`/`package.json`/`config/typedoc.json`.
3. Emit report per **Output contract** to **stdout**; if `--out <path>` given, also write identical markdown there (convention `.scratch/reports/write-docs/<pkg>.md`). Never write outside repo root and `/tmp` (`AGENTS.md:601-625`). Be idempotent and safe to re-run. No `build:seq` needed for diagnose.
4. Severity follows checklist: missing JSDoc/`@example` = `warn`; broken `docs:verify-examples` = `error` (Q9); `verify-skipped` = `info`.

### Fix (opt-in, --fix / --force)

Gap-fill only. Requires explicit `--fix` (or `--force` to overwrite/augment existing JSDoc). Without `--fix`, refuse to mutate and emit diagnose report instead.

1. Require `--fix`. Without it, do not mutate — emit diagnose report. With `--fix`, apply minimal patch: gap-fill only. Never overwrite hand-written JSDoc without `--force` (Q13). For `write-docs`, this means: without `--force`, only handle `missing-jsdoc` (exports with no `/**` at all); exports that already have `/**` but no `@example` (`missing-example`) are left untouched and reported as `warn`. With `--force`, also handle `missing-example` by augmenting the existing `/** ... */` block to add `@example` (one block at a time, preserving indent/tabs and single quotes). Never replace a fully documented block that already has `@example` — even with `--force`, leave it unless the example is broken (re-check after).
2. Generate one JSDoc block at a time, preserving existing formatting (`biome.json:11-14` tabs, `46-50` single quotes):
   - Detect the export line's leading indent (tabs, not spaces) and use the same indent for every `/**` line. Top-level exports use no indent; `export namespace` members use one tab (`\t`), etc. Preserve the file's existing line endings.
   - Use single quotes in any generated JS string literals (per `biome.json:46-50`). The canonical runnable example is `console.log(1); // => 1` inside a fenced ```ts block — type-checks with no imports, runs via `bun`, and matches `docs:verify-examples` inline form (`// =>` on same line). For known packages (`hashed` `HashMap`/`HashSet`) the example may import the package (`import { HashMap } from '@rimbu/hashed/map';` with single quotes) and log a deterministic value, but the fallback `console.log(1); // => 1` is always runnable without `dist`.
   - Do not generate README or TypeDoc frontmatter (`support/docs-extractor` owns `docs:extract`/`docs:aggregate`/`docs:markdown`).
   - Process exports in descending `line` order per file so insertions do not shift subsequent locations. Write the file once after all insertions (or per file). Support `--dry-run` to simulate without mutating — report what would be added and counts, but do not write.
3. Post-check: run `docs:verify-examples` scoped to touched files and report pass/fail in the findings:
   - If `docs/api.aggregate.json` exists and at least one file was touched (or `--dry-run` simulated), run `bun ./support/docs-extractor/src/verify-examples.ts --filter=<pkg>/` and parse `docs/api.examples.verify.report.json` for mismatches whose `key` contains `<pkg>/`. Each `broken-example` after fix becomes `error`; if no mismatches, emit `info` `verify-passed` with evidence `Verified N snippet(s): 0 issue(s)` from stdout. If aggregate missing or `dist` not built, emit `info` `verify-skipped` (`docs/api.aggregate.json missing — run bun run docs:extract`) and do not fail the report. If `--dry-run`, skip the actual `bun` spawn and emit `info` `verify-passed` with evidence `dry-run: generated examples are console.log(1); // => 1 which is docs:verify-examples-runnable by construction`.
   - On post-check failure (`error` `broken-example` for a just-generated example), either revert the just-written insertions (restore file from backup) or, if revert is not cheap, emit `warn` `fix-reverted` / `fix-warn` with evidence and suggested fix `Fix // => to actual output per docs:verify-examples` and keep the file but flag in report. Prefer revert when the snapshot is available; otherwise warn.
4. Re-emit the report with updated counts (fewer `warn` after fix, plus `verify-passed`/`verify-skipped`/`broken-example`). The report is still written to stdout and optionally `--out`. Be idempotent — second `--fix` finds no `missing-jsdoc` and does nothing, reporting clean.

## Output contract

Conforms to `../_template/references/report-template.md` (spec §2.8). Every skill — diagnose or fix — emits markdown with:

```markdown
# write-docs — <pkg>

## Summary

One paragraph + counts by severity: X error, Y warn, Z info. State whether package is clean for docs or requires fix, and for --fix whether verify passed.

## Findings

| Severity | Rule | Location | Evidence | Suggested fix | Normative ref |
|---|---|---|---|---|---|

## Next actions

- Bullet list of follow-ups (e.g. "run with --fix", "re-run review-docs (09) — expect fewer warn", "run bun run docs:verify-examples --filter=<pkg>/").
- If no findings: single bullet "No action required — package is clean for write-docs."
```

Severity semantics (spec §2.7, Q9, ticket 10):

- `error` — broken `docs:verify-examples` example (`broken-example`) after fix or in diagnose with `--with-tools`
- `warn` — missing `/**` (`missing-jsdoc`), `/**` without `@example` (`missing-example`), TypeDoc would warn (`typedoc-warning`)
- `info` — verify skipped (`verify-skipped`), verify passed after fix (`verify-passed`), dry-run simulation, or advisory

Location: `file:line` for the export (`src/public/...:line`, repo-relative) or `package: <name>` for package-level (`verify-skipped`/`verify-passed`). Evidence is verbatim `rg` line or `docs:verify-examples` snippet (under 120 chars, backticks). Normative ref is `AGENTS.md:546-573 §9` or `package.json:56-64` or `config/typedoc.json:1-16`.

Output location: stdout markdown is default. With `--out .scratch/reports/write-docs/<pkg>.md` write identical markdown there (create parent dirs if needed). This is the `--out` convention from Q8. Never write outside repo root and `/tmp` (`AGENTS.md:601-625`).

## Examples

```bash
# Diagnose single package to stdout (default, safe for agent auto-invoke, rg only, reuse 09)
bun .opencode/skills/write-docs/scripts/run.ts -- packages/hashed

# Diagnose with file output (sandbox guard, .scratch/reports per Q8)
bun .opencode/skills/write-docs/scripts/run.ts -- packages/hashed --out .scratch/reports/write-docs/hashed.md

# Fix mode (gap-fill only — adds missing /** @example */; never overwrites without --force)
bun .opencode/skills/write-docs/scripts/run.ts -- packages/hashed --fix
bun .opencode/skills/write-docs/scripts/run.ts -- packages/hashed --fix --dry-run  # simulate without mutating

# Fix with --force (also augments existing /** without @example; still one block at a time, tabs/single quotes, post-check verify)
bun .opencode/skills/write-docs/scripts/run.ts -- packages/hashed --fix --force
bun .opencode/skills/write-docs/scripts/run.ts -- packages/hashed --fix --force --out .scratch/reports/write-docs/hashed.md

# Workspace sweep (diagnose all packages with src/public/)
bun .opencode/skills/write-docs/scripts/run.ts -- --workspace --out .scratch/reports/write-docs/workspace.md

# Verify after fix — review-docs (09) should report fewer warn and docs:verify-examples should pass
bun .opencode/skills/review-docs/scripts/run.ts -- packages/hashed
bun ./support/docs-extractor/src/verify-examples.ts --filter=hashed/
```

## Allowed runtime

Scripts in `scripts/` may only assume `bun`, `rg`, `jq` are present (spec §2.3, Q3/Q14). Do not rely on harness-specific JS APIs. All imports in `packages/*/src/` inspected by this skill must follow `AGENTS.md:138-152` package-path rule (`#pkg/*`, `@rimbu/*`, never relative `./`/`../` per `biome.json:27-35`). See `../_template/scripts/README.md`, `AGENTS.md:601-625` sandbox (never write outside repo root and `/tmp`), and `AGENTS.md:546-573` §9 for `docs:verify-examples` runtime.
