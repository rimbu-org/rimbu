---
name: scout-improvements
description: Advisory pattern-level scout for §6 Interface+Namespace/HKT/Reducer/Module/NonEmpty, §1.1 API ergonomics, and perf anti-patterns like Stream materialization — package-scoped, warn/info only
disable-model-invocation: false
---

# Scout-Improvements — Architecture & Design Opportunities

Advisory-only, diagnose-only pattern-level scout. Surfaces architecture and design opportunities at the package scope (`packages/<name>`), not line-level nits. Checks the code patterns in `AGENTS.md:287-478` §6 (Interface+Namespace, HKT `Types`, `Reducer`, `Module`, `NonEmpty` ergonomics), the API design goals in `AGENTS.md:16-31` §1.1 (consistent naming, math indices, `OptLazy`, overload order), and performance anti-patterns such as unnecessary materialization of `Stream`. **Never repeats line nits** — `any`/`!`/`console`/`noRestrictedImports` belong to `review-impl` per Q12.

## Purpose

Single-concern advisory scout for `packages/<name>`. In **diagnose mode only** (never mutates), it inspects `src/` via static `rg` for pattern-level improvement opportunities: §6 Interface+Namespace (§6.1), HKT `Types` slot (§6.4), `Reducer` composability (§6.5), `Module` sealing (§6.7), `NonEmpty` ergonomics (§6.2 / §1.1 overload order), API ergonomics (§1.1 naming/indices/`OptLazy`/`const`/`NoInfer`), and perf anti-patterns (e.g. unnecessary `Stream` materialization via intermediate `toArray()`/`Array.from`). Scope is a single package `<pkg>` by default; `--workspace` optionally sweeps all 23 published packages (`packages/*` per `AGENTS.md:45-68`). Findings are **advisory** (`info`, or `warn` for high-leverage architecture debt), never `error`; they feed future ADRs via `maintain-skills`. The skill is **diagnose-only**, **idempotent**, and safe to re-run. It does **not** enforce line-level Biome rules — those belong to `review-impl` (Q12).

## Normative refs

- `AGENTS.md:16-31` §1.1 API Design Goals (consistent naming `filter`/`map`/`flatMap`/`take`/`drop`, math indices `-1`=last with `Stream.at(-1)` fallback, `OptLazy` overload pair, `NonEmpty` overload order, `const`/`NoInfer`)
- `AGENTS.md:287-478` §6 Core Code Patterns (6.1 Interface+Namespace, 6.2 `NonEmpty`, 6.3 `OptLazy`, 6.4 HKT `Types`, 6.5 `Reducer`, 6.6 `const`/`NoInfer`, 6.7 `Module`)
- `AGENTS.md:104-113` §3 Three tiers `public`/`advanced`/`internal` (extension points belong in `advanced/`, not `internal`)
- `AGENTS.md:138-152` import rule (package paths `#pkg/*`/`@rimbu/*`, never relative) — mandatory when inspecting `src/` via `rg`
- `AGENTS.md:601-625` sandbox (repo root + `/tmp` only, never write outside)
- `CONTEXT.md` at repo root and `docs/adr/<nnnn>-*.md` — if they exist, suggestions that contradict an ADR are flagged explicitly per `docs/agents/domain.md:32-36`; if they do not exist, proceed silently per `docs/agents/domain.md:11-12` and note the gap for `maintain-skills`

`AGENTS.md` wins > ADR > checklist (spec §2.5, Q5). If a pattern you want to enforce is absent from `AGENTS.md` or an ADR, do not enforce it — emit an `info` proposal with an ADR sketch for `maintain-skills` instead.

## When to use

> When you edit `packages/*`, review a package's public surface, or want pattern-level improvement ideas for a package, invoke `scout-improvements` in diagnose mode (`--out` optional).

Additional triggers: after `review-api`/`review-anatomy`, before opening an ADR, when touching `Stream`/`Reducer`/`List` graph internals, or when `maintain-skills` reports arch debt.

## Procedure

### Diagnose (read-only, default)

1. Resolve target: single package `<pkg>` (e.g. `packages/list`) is the default. If `--workspace` is passed, expand to all 23 published packages (`packages/*` per `AGENTS.md:45-68`, exclude unpublished `list2`). Require `<pkg>` if no `--workspace`; error with usage if neither is given.
2. Before exploring, read `CONTEXT.md` (if it exists) and any `docs/adr/*.md` that touch the target area per `docs/agents/domain.md:5-11`. If they do not exist, proceed silently per `docs/agents/domain.md:11-12`.
3. For each target package, collect evidence **without mutating** and **without `build:seq`** (pattern-level `rg` only):
   - Use only allowed runtime: `bun`, `rg` (ripgrep), `jq` (`scripts/README.md`). Cite `rg -n "<pattern>" src --no-heading` lines verbatim as evidence.
   - Check architecture patterns (§6): Interface+Namespace co-location (`rg -n "export interface|export namespace"`), HKT `Types` slot (`rg -n "interface Types extends.*R.*Types"`), `Reducer` composability (`rg -n "Reducer\.|\.reduce\("` + `rg -n "Reducer\."` vs plain `reduce`), `Module` sealing (`rg -n "create.*ContextModule.*build"`), `NonEmpty` ergonomics (presence and return-type refinement, `rg -n "NonEmpty"`).
   - Check API ergonomics (§1.1): naming consistency (`filter`/`map`/`flatMap`/`take`/`drop`), index handling (negative `-1` docs for `List` vs `Stream.at(-1)` fallback), `OptLazy`/`NonEmpty` overload ergonomics, `const`/`NoInfer` hints (`rg -n "const.*extends|NoInfer"`).
   - Check perf anti-patterns: unnecessary `Stream` materialization (`rg -n "\.toArray\(\)|Array\.from\(.*stream|Stream\.from\(.*\)\.toArray"`), intermediate `toArray()` that could stay lazy, `collect` vs `Reducer`, extra copies in `list` block-tree or `graph` valued/non-valued duplication.
   - For `packages/list`, at least evaluate block-tree arity / branching factor; for `packages/graph`, evaluate valued vs non-valued split / `Variant*` duplication; for `packages/stream`, evaluate unnecessary materialization — each must surface at least one actionable advisory even if the package is otherwise clean.
   - **Never flag Biome line nits** (`any`, `!`, `console`, `noRestrictedImports` `./`/`../`) — those are `review-impl` per Q12. If `rg` finds such a line, ignore it for this skill.
4. Flag ADR contradictions explicitly per `docs/agents/domain.md:32-36`: if a suggestion contradicts `docs/adr/<nnnn>-*.md`, add a row or note `> Contradicts ADR-XXXX — but worth reopening because …`. If `docs/adr/` is absent, note `No ADR contradiction — docs/adr/ not present, proceed silently per docs/agents/domain.md:11-12`.
5. Emit the advisory backlog per **Output contract** to **stdout**; if `--out <path>` is given, also write the identical markdown to that path (convention `.scratch/reports/scout-improvements/<pkg>.md` per Q8). Never write outside the repo root and `/tmp` (`AGENTS.md:601-625`). Be **idempotent** — same input produces the same markdown (deterministic sort by Opportunity).
6. Severity for this skill only: `info` for advisory opportunities, `warn` for high-leverage architecture debt (e.g. major split or arity change). **Never `error`** — this skill is purely diagnostic and feeds future ADRs via `maintain-skills`.

### Fix

This skill has no fix mode — it is diagnose-only. Do not mutate. If the backlog contains a high-leverage `warn`, open an ADR (or propose an `AGENTS.md` patch via `maintain-skills`) and re-run `scout-improvements -- <pkg>` to verify the backlog is addressed. There is no `--fix`/`--force`.

## Output contract

Conforms to `../_template/references/report-template.md` (spec §2.8). The shared template is the skeleton; this skill's **Findings** table replaces the generic `Severity | Rule | …` with the advisory backlog from spec §2.11.

Required structure:

```markdown
# scout-improvements — <pkg>

## Summary

One paragraph describing overall architecture health for this concern.
Counts by severity: **X error, Y warn, Z info** (always 0 error for this skill — counts reflect warn/info only).
State whether the package is clean or has backlog items and whether any ADR contradiction was found per docs/agents/domain.md:32-36.

## Findings

| Opportunity | Rationale | Effort | ADR sketch | AGENTS.md impact |
|---|---|---|---|---|
| list-block-tree-arity | Block-tree arity 32 vs 64 | M | ADR: evaluate block size for cache locality | AGENTS.md:287-478 §6 (impl) |
| graph-valued-split | Valued vs non-valued duplication via Variant* | L | ADR: unify via generic V or composition | AGENTS.md:79-113 §3, AGENTS.md:287-478 §6.1 |
| perf-stream-materialization | toArray() materializes lazy Stream before reuse | S | ADR: keep Stream lazy until terminal reduce/collect | AGENTS.md:400-420 §6.5 |

If no backlog, use `| — | — | — | No findings | — |` or keep the header with `No findings` in Evidence.

## Next actions

- Bullet list of concrete follow-ups (e.g. "Open ADR for X", "Propose AGENTS.md patch via maintain-skills", "Re-run after ADR").
- If no findings: single bullet `No action required — package is clean for scout-improvements.`
```

Field definitions (spec §2.8 adapted):

- **Opportunity** — kebab-case opportunity id (e.g. `interface-namespace`, `hkt-types-slot`, `reducer-composability`, `perf-stream-materialization`, `list-block-tree-arity`, `graph-valued-split`). Must be advisory, not a line nit (Q12).
- **Rationale** — one sentence tying the opportunity to the package, with `rg` line or `file:line` evidence inline.
- **Effort** — `S` (hours), `M` (day), `L` (multi-day/cross-package) — see `references/checklist.md`.
- **ADR sketch** — one-line draft ADR title/slug (e.g. `ADR: unify ValuedGraph via generic`). If the suggestion contradicts an existing ADR, flag `Contradicts ADR-XXXX — …` per `docs/agents/domain.md:32-36`.
- **AGENTS.md impact** — `AGENTS.md:XX-YY §Z` that would need a patch if the ADR is adopted (or `none` if no docs change).

Location convention: when a finding is tied to a file, include `file:line` inside **Opportunity** or **Rationale** (e.g. `packages/list/src/internal/immutable/outer-tree.ts:42`). For package-level advisories use `package: <path>`.

Severity semantics for this skill (Q8/Q12):

- `info` — advisory improvement (most opportunities).
- `warn` — high-leverage architecture debt (e.g. block-tree arity change, valued vs non-valued split).
- **Never `error`** — this skill is purely diagnostic.

Output location: stdout markdown is the default. When `--out .scratch/reports/scout-improvements/<pkg>.md` is given, write the identical markdown there (create parent dirs if needed). Never write outside the repo root and `/tmp` (`AGENTS.md:601-625`).

## Examples

```bash
# Diagnose single package to stdout (default, safe for agent auto-invoke)
bun .opencode/skills/scout-improvements/scripts/run.ts -- packages/list

# Diagnose with file output (convention .scratch/reports/<skill>/<pkg>.md)
bun .opencode/skills/scout-improvements/scripts/run.ts -- packages/list --out .scratch/reports/scout-improvements/list.md
bun .opencode/skills/scout-improvements/scripts/run.ts -- packages/graph --out .scratch/reports/scout-improvements/graph.md

# Workspace sweep (all published packages, still warn/info only, never mutates)
bun .opencode/skills/scout-improvements/scripts/run.ts -- --workspace
bun .opencode/skills/scout-improvements/scripts/run.ts -- --workspace --out .scratch/reports/scout-improvements/workspace.md
```

This skill has no fix mode. There is no `--fix` or `--force`.

## Allowed runtime

Scripts in `scripts/` may only assume `bun`, `rg`, `jq` are present (spec §2.3, Q3/Q14). Do not rely on harness-specific JS APIs. See `../_template/scripts/README.md` and `AGENTS.md:138-152` package-path import rule. Evidence is `rg` + `jq` pipelines and `node:fs` reads, never a build. Use `rg -n "<pattern>" packages/<pkg>/src --no-heading` per checklist.
