---
name: review-api
description: Audits public API surface for AGENTS.md §1.1/§6 consistency — naming, indices, OptLazy, NonEmpty order, HKT Types, Module, tiers
disable-model-invocation: false
---

# Review-API — Public API Consistency

Diagnose-only skill that checks the public API of a Rimbu package against the design goals in `AGENTS.md:16-31` §1.1 and code patterns in `AGENTS.md:287-478` §6. Reports naming, index, `OptLazy`, `NonEmpty` overload order and tier leakage as `error` (Q9).

## Purpose

Single-concern API lint for `packages/<name>/src/public/` (and `src/<name>.ts` entry). Verifies seven contracts: (a) consistent naming `filter`/`map`/`flatMap`/`take`/`drop` across packages, (b) math-index ` -1` = last (`Stream`/`AsyncStream` `at(-1)` returns fallback), (c) `OptLazy` overload pairs, (d) `NonEmpty` overload order (`StreamSource.NonEmpty` first), (e) HKT `Types` slot, (f) `Module` pattern, (g) tier leakage `public`/`advanced`/`internal`. Scope is single package `<pkg>` by default, `--workspace` for all. This skill is **diagnose-only**.

## Normative refs

- `AGENTS.md:16-31` §1.1 API Design Goals (consistent naming, math indices with `Stream` exception, `OptLazy`, `NonEmpty`, overload order)
- `AGENTS.md:287-478` §6 Core Code Patterns (6.1 Interface+Namespace, 6.2 `NonEmpty`, 6.3 `OptLazy`, 6.4 HKT `Types`, 6.5 `Reducer`, 6.6 `const`/`NoInfer`, 6.7 `Module`)
- `AGENTS.md:104-113` §3 Three tiers `public`/`advanced`/`internal` (never expose `internal` via `exports`)
- `AGENTS.md:138-152` import rule (`#<pkg>/*` for `internal`, `@rimbu/*` for cross-package)
- `AGENTS.md:79-113` §3 layout (`src/public/` → `dist/public/*`)
- `docs/adr/<nnnn>-*.md` — if API intentionally diverges, cite ADR; if `docs/adr/` missing, proceed silently per `docs/agents/domain.md:11-12`

`AGENTS.md` wins > ADR > checklist (Q5).

## When to use

> When you add or change a public method, rename an API, touch `src/public/` or `src/<name>.ts`, or review a PR that changes the exported surface, invoke `review-api` in diagnose mode (`--out` optional).

Additional triggers: before publishing a new collection method (see `AGENTS.md:480-518` §7), when `maintain-skills` reports drift, when `API_SURFACE.md`/`support/docs-extractor` shows new entities.

## Procedure

### Diagnose (read-only, default)

1. Resolve target: single package `<pkg>` (e.g. `packages/stream`) is default. If `--workspace` is passed, expand to all packages with `src/public/` (exclude `list2`). Require `<pkg>` if no `--workspace`.
2. For each target, collect evidence **without mutating** via `rg` (and `API_SURFACE.md`/`support/docs-extractor` output where available):
   - (a) **Naming** — `rg -n "filter|map\(|flatMap|take\(|drop\(" src/public --no-heading` to list canonical names; flag synonyms like `select`/`where`/`collect`/`filterBy` if they appear as public methods (evidence is `rg` line, `file:line`)
   - (b) **Math indices** — check that `Stream`/`AsyncStream` `at(-1)` returns fallback (not last) and that other collections document `-1` = last per `AGENTS.md:21-25`; evidence is `rg -n "at\(|get\(|slice\(" src/public` and impl `rg -n "index.*<.*0|at\(.*-1" src/internal`
   - (c) **OptLazy** — for methods returning `| undefined`, verify existence of overload ` (..., otherwise: OptLazy<O>)` per `AGENTS.md:354-373`; evidence is `rg -n "\| undefined|OptLazy"` pair check
   - (d) **NonEmpty order** — for `NonEmpty` interfaces, verify `StreamSource.NonEmpty` (or `Types` `nonEmpty`) overload appears **first** per `AGENTS.md:29-30`; evidence is `rg -n "NonEmpty|StreamSource"` order check
   - (e) **HKT Types** — verify concrete collections declare `interface Types extends RMapBase.Types { readonly normal: ...; readonly nonEmpty: ... }` per `AGENTS.md:375-398`
   - (f) **Module** — verify factory uses `create...ContextModule().build()` per `AGENTS.md:467-476`
   - (g) **Tier leakage** — verify `src/public/` never imports from `src/internal/` via relative path, and `src/advanced/` only re-exports from `#<pkg>/*`; flag `internal` strings in `exports` (also covered by `review-anatomy`)
3. Emit report per **Output contract** to **stdout**; if `--out <path>` given, also write to that path (convention `.scratch/reports/review-api/<pkg>.md`). Never write outside repo/`/tmp`.
4. Be idempotent and safe to re-run. No build required (static `rg` only).

### Fix

This skill has no fix mode — it is diagnose-only. If findings are `error`, fix manually per `AGENTS.md:16-31`/`AGENTS.md:287-478` and re-run. For `warn` (`Types`/`Module` nuance), propose an ADR if intentionally omitted.

## Output contract

Conforms to `../_template/references/report-template.md` (spec §2.8).

```markdown
# review-api — <pkg>

## Summary

API <clean|has issues> for §1.1/§6. Counts: X error, Y warn, Z info.

## Findings

| Severity | Rule | Location | Evidence | Suggested fix | Normative ref |
|---|---|---|---|---|---|

## Next actions

- No action required — package is clean for review-api.  OR  Fix errors then re-run.
```

Severity per Q9:

- `error` — (a) naming inconsistency, (b) math-index contract break (`Stream.at(-1)` not fallback), (c) missing `OptLazy` overload pair, (d) `NonEmpty` overload order wrong, (g) tier leakage (`internal` exposed)
- `warn` — (e) HKT `Types` slot missing/partial, (f) `Module` pattern not sealed
- `info` — advisory (e.g. `Reducer` not used where it could be, `const`/`NoInfer` suggestion)

Location: `file:line` or `package: <name>`. Evidence is `rg` line or `API_SURFACE.md:XX` reference. `Normative ref` is `AGENTS.md:XX-YY §1.1/§6`.

Output to stdout by default; with `--out .scratch/reports/review-api/<pkg>.md` also write there (Q8).

## Examples

```bash
# Diagnose single package to stdout (default)
bun .opencode/skills/review-api/scripts/run.ts -- packages/stream

# Diagnose with file output
bun .opencode/skills/review-api/scripts/run.ts -- packages/hashed --out .scratch/reports/review-api/hashed.md

# Workspace sweep (all packages with public API)
bun .opencode/skills/review-api/scripts/run.ts -- --workspace
bun .opencode/skills/review-api/scripts/run.ts -- --workspace --out .scratch/reports/review-api/workspace.md
```

## Allowed runtime

Scripts may only assume `bun`, `rg`, `jq` are present (Q3). No harness-specific JS APIs. See `../_template/scripts/README.md` and `AGENTS.md:138-152` import rule. Uses `API_SURFACE.md` (if present) as supplemental evidence but does not require a build.
