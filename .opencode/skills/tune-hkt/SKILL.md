---
name: tune-hkt
description: HKT correctness and type-level cost — checks family/mixin shape, probes how slots actually resolve, measures cold types/instantiations/memory, and applies mechanical fixes with --fix
disable-model-invocation: false
---

# Tune-HKT — HKT Correctness & Type-Level Cost

Hybrid skill that owns one concern: **is the higher-kinded-type machinery in a package both correct and cheap to check?** Diagnose by default (read-only); mechanical fixes only with explicit `--fix`.

## Purpose

The HKT family/capability machinery in `@rimbu/collection-types` is the single largest driver of type-check time and memory across the monorepo. Small shape mistakes are invisible in review but cost multiples at check time — one capability declaring its own `_TP` made `@rimbu/sorted` **3.65x slower and 2.7x more memory-hungry**, with no compile error to point at it.

This skill checks the shape (`## Checks` below), **probes how the family slots actually resolve** (the decisive diagnostic — a slot that resolves to an intersection rather than a single named type means TypeScript's nominal fast path is defeated), and **measures** cold types / instantiations / memory against a budget. With `--fix` it applies the two mechanical repairs and reverts if the post-check fails.

Scope is a single package `<pkg>`; `--workspace` sweeps all packages. Complements rather than duplicates `review-api`, which owns rules `family-adhoc-intersection` (h) and `mixin-shared-tp` (i) — this skill re-runs those and merges their findings so one invocation gives the whole HKT picture.

## Normative refs

- `AGENTS.md` §6.4 Higher-Kinded Types — the `Types`/family slot pattern
- `AGENTS.md` §6.4 "Always name a family — never use an ad-hoc capability intersection"
- `AGENTS.md` §6.4 "Capability mixins must share one `_TP` declaration" — the six kind-tagged shared records
- `AGENTS.md:287-478` §6 Core Code Patterns
- `AGENTS.md:546-573` §9 Tooling Reference (`build:seq` before `typecheck`, Biome)
- `AGENTS.md:138-152` import rule (`#pkg/*` / `@rimbu/*`, never relative)
- `docs/adr/` — if a package intentionally diverges, cite the ADR; if `docs/adr/` is absent, proceed silently per `docs/agents/domain.md:11-12`

`AGENTS.md` wins > ADR > this checklist.

## When to use

> When you add or change an `Advanced.Family`, a capability `Mixin`, a `Tp extends ...` constraint, or any `src/advanced/` type machinery — or when a package's type-check suddenly gets slower or hungrier — consider invoking `tune-hkt` in diagnose mode. Run `--fix` only when the task explicitly asks for it.

Additional triggers: before merging a new collection package; when `bun run typecheck` for one package exceeds its cost budget; when `review-api` reports `mixin-shared-tp` or `family-adhoc-intersection`; when investigating an OOM or a multi-second single-package check.

## Checks

| Rule | Severity | What it catches |
|---|---|---|
| `mixin-shared-tp` | error | A capability `Mixin` not on a kind-tagged shared record, or declaring its own `_TP` (delegated to `review-api` (i)) |
| `family-adhoc-intersection` | error | A family assembled as an intersection of `Capability.*` instead of a named interface (delegated to `review-api` (h)) |
| `family-in-constraint` | warn | `Tp extends Types/TypesNonEmpty<X.Advanced.Family<...>>` in `src/advanced/` where `FamilyBase` is what the parent requires. The aggregate pins `_NORMAL`/`_BUILDER`/`_CONTEXT`, so they cannot collapse |
| `distributive-conditional` | warn | A naked type parameter tested against a literal in a conditional whose default is `boolean` — distributes over `true \| false`, computing and unioning both branches on every use. Suggested fix is the tuple wrapper `[T] extends [true]`, but **not** auto-applied — see *Deliberately not auto-fixed* |
| `slot-intersection` | error | **(`--probe`)** A family slot resolves to an intersection rather than a single named type. This is the one that actually costs — see below |
| `cost-budget` | warn | **(`--measure`)** Cold memory or types-per-source-line above budget |

### Why `slot-intersection` is the decisive check

A concrete context class nominally `implements` its own `Advanced.ContextApi`. If `Tp['_CONTEXT']` resolves to that single interface, TypeScript short-circuits the comparison. If it resolves to

```
ContextApi<FamilyBase<...> & Keyed...FamilyBase<...> & Map...Family<...> & Sorted...Family<...>> & Context<K>
```

then every member is walked structurally — even though the last constituent already subsumes the others. TypeScript does not reduce redundant intersections. Static checks can miss the cause; the probe shows the effect directly.

## Procedure

### Diagnose (read-only, default)

1. Resolve target: single package `<pkg>` (default) or every package under `packages/` with `--workspace`.
2. Run the static checks (`rg` only, no build): `family-in-constraint`, `distributive-conditional`.
3. Re-run `review-api` for the same target and merge its `mixin-shared-tp` / `family-adhoc-intersection` rows, so one report covers the whole concern. If `review-api` is unavailable, emit an `info` row saying so rather than silently dropping the checks.
4. With `--probe`: generate a temporary probe under the target package that forces the checker to print how `_NORMAL` / `_BUILDER` / `_CONTEXT` resolve, run `tsc --noEmit --noErrorTruncation` against a scratch tsconfig, and flag any slot whose resolved type contains `&`. **Always delete the probe and scratch tsconfig**, including on failure. If the probe does not compile, emit `info: probe-inconclusive` rather than a false finding.
5. With `--measure`: delete `tsconfig.tsbuildinfo` first (the repo enables `incremental`, so a warm run reports ~0 types and is meaningless), then run `tsc -p tsconfig.json --noEmit --extendedDiagnostics` and compare against budget.
6. Emit the report per **Output contract** to stdout; with `--out <path>` also write it there. Never write outside the repo root and `/tmp`.
7. Idempotent and safe to re-run; no repo mutation in diagnose mode.

### Fix (opt-in, `--fix`)

Applies only the two **mechanically safe** repairs. Everything else is reported for a human.

1. Require explicit `--fix`; without it, refuse to mutate and emit the diagnose report.
2. `family-in-constraint` → replace the aggregate `X.Advanced.Family<...>` with the corresponding `FamilyBase` in undefaulted `Tp extends ...` constraints.
3. **Post-check**: run `tsc -p tsconfig.json --noEmit` for the package — the *full* config (src + test + test-d), not `tsconfig.esm.json`. If the error count differs from the pre-fix baseline, **revert every edit** and report `fix-reverted` as an `error`. A type-level "optimisation" that changes what compiles is a bug, not a fix.
4. Re-emit the report with updated counts and the post-check result.

### Deliberately not auto-fixed

- **`distributive-conditional`.** The tuple wrapper *looks* semantics-preserving — for a resolved `boolean`, the distributed union and the non-distributed branch are the same type. But a **deferred** conditional (unresolved generic `IsNonEmpty`) relates far more permissively during assignability than a tuple-wrapped one, the same transparency/opacity trade-off that governs `ReTyped`. Applied mechanically to `FirstLast` / `MinMax` / `ElementStream`, it held `collection-types` src at 0 errors while taking `@rimbu/list` from **0 to 39**. Report it; let a human apply it and verify every downstream package.
- **Converting a `Mixin` to a shared record.** The correct record depends on kind (empty/non-empty, plain/keyed/sorted) and often needs a matching constraint change.
- **Restructuring a family**, or changing a public constraint that downstream packages bind to.

**A passing post-check is necessary, not sufficient.** It is scoped to one package; any change to a public type needs a workspace-wide error-count comparison before it is trusted. That is not automated here precisely because it is slow and needs judgement.

### Measurement discipline

Two traps, both of which produced wrong conclusions during the work that motivated this skill:

- **Wall-clock time is unreliable** here (±20% run to run). Trust `Types` / `Instantiations` / `Memory used`, which are deterministic. For timing, interleave A/B or take best-of-N.
- **`incremental: true` is on repo-wide** (`config/tsconfig.base.json`). Any cold measurement must delete `<pkg>/tsconfig.tsbuildinfo` first, or it reports a warm run (~340 types, ~79MB) and looks like a spectacular improvement.

## Output contract

Conforms to `../_template/references/report-template.md`.

```markdown
# tune-hkt — <pkg>

## Summary

HKT machinery <clean|has issues>. Counts: X error, Y warn, Z info.
<Cost line when --measure: types/instantiations/memory.>

## Findings

| Severity | Rule | Location | Evidence | Suggested fix | Normative ref |
|---|---|---|---|---|---|

## Next actions

- No action required — package is clean for tune-hkt.  OR  Fix errors then re-run.
```

Severity: `error` — `mixin-shared-tp`, `family-adhoc-intersection`, `slot-intersection`, `fix-reverted`. `warn` — `family-in-constraint`, `distributive-conditional`, `cost-budget`. `info` — `probe-inconclusive`, `review-api-unavailable`, and the measured cost line when within budget.

Location is `file:line` or `package: <name>`. Normative ref is `AGENTS.md §6.4` or a `docs/adr/NNNN`.

## Examples

```bash
# Static diagnose, fast, no build (default)
bun .opencode/skills/tune-hkt/scripts/run.ts -- packages/sorted

# Include the slot probe — the decisive check (runs tsc, slower)
bun .opencode/skills/tune-hkt/scripts/run.ts -- packages/sorted --probe

# Include cold cost measurement against budget
bun .opencode/skills/tune-hkt/scripts/run.ts -- packages/sorted --measure

# Everything, written to a report file
bun .opencode/skills/tune-hkt/scripts/run.ts -- packages/sorted --probe --measure --out .scratch/reports/tune-hkt/sorted.md

# Apply the mechanical fix (family-in-constraint); auto-reverts if the post-check regresses
bun .opencode/skills/tune-hkt/scripts/run.ts -- packages/collection-types --fix

# Workspace sweep (static checks only unless --probe/--measure given)
bun .opencode/skills/tune-hkt/scripts/run.ts -- --workspace
```

## Manual probe (when the automatic one is inconclusive)

Drop this in the package, run `tsc -p <scratch tsconfig> --noEmit --noErrorTruncation`, read the printed types, then delete it. Assigning to `null` is what forces the checker to print the resolved type.

```ts
import type { Collection } from '@rimbu/collection-types/collection';
import type { MyColl } from '@rimbu/mypkg';

type E = number;
type RealTp = Collection.Advanced.TypesNonEmpty<MyColl.Advanced.Family<E>, E>;

// To inspect the *composed* record, intersect the capability mixins the
// package's WithMixin chain uses and read _TP off that instead:
//   type C = CollectionNonEmpty.Mixin & IndexedCollectionNonEmpty.Mixin;
//   type ComposedTp = (C & { _E: E; _TP: RealTp })['_TP'];

declare const nrm: RealTp['_NORMAL'];
declare const bld: RealTp['_BUILDER'];
declare const ctx: RealTp['_CONTEXT'];

export const a: null = nrm;
export const b: null = bld;
export const c: null = ctx;
```

Healthy output names a single type per slot (`MyColl<number>`, `Builder<number>`, `Context<number>`). Any `&` in a slot is the finding.

## Allowed runtime

`bun`, `rg`, `jq` only. No harness-specific JS APIs. Writes only inside the repo root and `/tmp` (`AGENTS.md:601-625`); all temporary probe files are removed before exit.
