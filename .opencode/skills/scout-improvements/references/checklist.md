# Scout-Improvements Checklist

Source: `AGENTS.md:16-31` §1.1, `AGENTS.md:287-478` §6, `spec.md:2.7` (opportunity backlog), ticket `13`, Q12 seam (`scout-improvements` never repeats line nits — those are `review-impl`).

This skill is **diagnose-only**, **pattern-level**, **advisory**. Severity is `info` (advisory) or `warn` (high-leverage arch debt), **never `error`**. Findings are an advisory backlog, not a gate. They feed future ADRs via `maintain-skills`. All entries are idempotent and package-scoped (`<pkg>` default, `--workspace` optional).

> **Line-nit exclusion (Q12):** `scout-improvements` must not repeat `review-impl` findings. Do not flag `any` (`suspicious.noExplicitAny`), `!` (`style.noNonNullAssertion`), `console` in `src/`, `noUnusedImports`, or `noRestrictedImports` (`./`/`../`). Those are `review-impl` per `AGENTS.md:565-572` / `biome.json:15-44`. This checklist is pattern-level architecture only.

## Scope

- **Default:** single package `<pkg>` (`packages/<name>` with `src/`)
- **`--workspace`:** all 23 published packages (`packages/*` per `AGENTS.md:45-68`, exclude `list2`), still `rg`-only, no `build:seq`
- **Evidence:** `rg -n "<pattern>" packages/<pkg>/src --no-heading` lines cited verbatim in **Rationale**; optional `jq` for `package.json`/`tsconfig` inspection
- **Output:** advisory backlog with columns `Opportunity | Rationale | Effort (S/M/L) | ADR sketch | AGENTS.md impact` (spec §2.7 row 11). Every row must have a one-line **ADR sketch**; if the suggestion contradicts `docs/adr/<nnnn>-*.md`, flag `Contradicts ADR-XXXX — …` per `docs/agents/domain.md:32-36` (if `docs/adr/` absent, note `No ADR contradiction — docs/adr/ not present` per `domain.md:11-12`)

## Checks — Architecture Patterns (§6)

| Opportunity (Rule) | Severity | Pattern | Check (rg) | Effort | ADR sketch | AGENTS.md impact | Example Rationale |
|---|---|---|---|---|---|---|---|
| `interface-namespace` | info | §6.1 Interface + companion Namespace co-location | `rg -n "export interface.*\{|export namespace" src --no-heading` — verify every public `export interface X` has a sibling `export namespace X` in the same package (or `src/<name>.ts` barrel) per `AGENTS.md:290-333` | S | `ADR: co-locate Interface+Namespace per §6.1; split only when barrel re-exports` | `AGENTS.md:287-333` §6.1 — doc pattern, no code change | `public/list.ts defines List interface but companion namespace is in internal/list-base.ts — consider re-exporting via public barrel` |
| `hkt-types-slot` | info (warn if missing both slots on a collection) | §6.4 HKT `Types` via `RMapBase`/`RSetBase` | `rg -n "interface Types extends.*RMapBase\.Types|RSetBase\.Types|RMapBase\.Types" src --no-heading`; then check for `readonly normal:` and `readonly nonEmpty:` inside | M | `ADR: add HKT Types slot to <Collection> for concrete return types` | `AGENTS.md:375-398` §6.4 — extends base | `hashed/src/hashmap.ts lacks Types.nonEmpty — HKT slot incomplete` |
| `reducer-composability` | info | §6.5 `Reducer<I,O>` composable folds | `rg -n "Reducer\." src --no-heading` vs `rg -n "\.reduce\( *Reducer\." src --no-heading` and `rg -n "\.reduce\( *\(acc"` src — if `reduce` is used with raw lambdas where `Reducer.sum`/`Reducer.mapInput`/`Reducer.combine` would compose, suggest `Reducer` | S | `ADR: prefer Reducer composables over raw reduce lambdas` | `AGENTS.md:400-420` §6.5 — teach Reducer | `src/internal/... uses .reduce((acc,v)=>acc+v) — could be Reducer.sum.mapInput` |
| `module-pattern` | info | §6.7 `Module` sealing for factory objects | `rg -n "create.*ContextModule\(\)\.build\(\)|Module\.create" src --no-heading` — if a package exposes a factory object (`export const HashMap`, `export const List`) without `create…ContextModule().build()`, suggest Module | S | `ADR: seal <Collection> factory via Module helper` | `AGENTS.md:467-476` §6.7 — impl detail | `packages/graph/src/internal/... builds factory via plain object — consider Module` |
| `nonempty-ergonomics` | info | §6.2 / §1.1 `NonEmpty` refinement ergonomics | `rg -n "NonEmpty|assumeNonEmpty|nonEmpty\(\)" src/public --no-heading` — check that methods which provably return non-empty (e.g. `prepend`/`append` on non-empty, `Builder.build` when non-empty) encode `NonEmpty` in return type, and that `NonEmpty` overloads are discoverable (no hidden `any`) | S | `ADR: refine <method> to return NonEmpty when provably non-empty` | `AGENTS.md:29-30` §1.1 overload order + `AGENTS.md:338-352` §6.2 | `List.Builder.build() could return NonEmpty when builder has entries — ergonomics gap` |
| `api-ergonomics-consistency` | info | §1.1 consistent naming, indices, options, const/NoInfer | `rg -n "filter|map\(|flatMap|take\(|drop\(" src/public --no-heading` for synonyms; `rg -n "OptLazy|otherwise.*OptLazy"` for fallback ergonomics; `rg -n "const.*extends|NoInfer"` for inference helpers; `rg -n "at\(.*-1|slice.*negative"` for `List` vs `Stream` index contract per `AGENTS.md:21-25` | S | `ADR: align <method> naming/indices/OptLazy/const-param per §1.1` | `AGENTS.md:16-31` §1.1 + `AGENTS.md:424-463` §6.6 `const`/`NoInfer` | `Stream at(-1) docs suggest last element — should return fallback per §1.1 exception` |
| `perf-stream-materialization` | info (warn if hot path) | Perf: unnecessary `Stream` materialization | `rg -n "\.toArray\(\)|Array\.from\(.*Stream|Stream\.from\(.*\)\.toArray|fromArray.*\.toArray" packages/<pkg>/src --no-heading` plus `rg -n "\.collect\(|Stream\.applyFilter" src/internal --no-heading` — if `Stream` is materialized to an intermediate array only to be re-streamed, suggest staying lazy until terminal `reduce`/`collect`/`count` | M | `ADR: keep Stream lazy until terminal Reducer; avoid intermediate toArray` | `AGENTS.md:565-572` §9 perf (no new §, but §6.5 Reducer) | `src/internal/... does .stream().toArray() then Stream.from(arr).map — could stay as Stream` |
| `const-noinfer-inference` | info | §6.6 `const` type params & `NoInfer<T>` | `rg -n "function.*<.*const|NoInfer<" src/public --no-heading` — if a public selector/pipe function takes `readonly` arrays without `const` or fallback params without `NoInfer`, suggest inference helpers | S | `ADR: add const type param to select/path helpers; NoInfer on fallback` | `AGENTS.md:424-463` §6.6 | `deep/src/select.ts selector lacks const — callers need as const` |

## Checks — Package-Specific Architecture (ensure list & graph each get ≥1 actionable suggestion)

| Opportunity (Rule) | Severity | Package | Check (rg / file existence) | Effort | ADR sketch | AGENTS.md impact | Example Rationale |
|---|---|---|---|---|---|---|---|
| `list-block-tree-arity` | warn | `packages/list` | `rg -n "BlockSize|BRANCHING|BranchingFactor|InnerBlock|InnerTree|OuterTree" packages/list/src --no-heading` and `rg -n "CacheMap|reversed-outer" packages/list/src --no-heading`; file existence `src/internal/immutable/outer-tree.ts` + `src/internal/mutable/*builder*.ts` | M | `ADR: evaluate block-tree arity 32 vs 64 and fan-out tuning for List` | `AGENTS.md:287-478` §6 (impl) + `AGENTS.md:57` `list` block-tree | `List block-tree uses 32-wide blocks — benchmark 64-wide for cache locality; see inner-tree.ts` |
| `graph-valued-split` | warn | `packages/graph` | Existence of both `src/internal/valued/` and `src/internal/non-valued/` plus `rg -n "VariantValuedGraphBase|VariantGraphBase|ValuedGraphElement|GraphElement" packages/graph/src --no-heading`; duplicate `variant-base.ts` vs `variant.ts` | L | `ADR: unify valued/non-valued Graph via generic V or composition over Variant*` | `AGENTS.md:55` graph + `AGENTS.md:79-113` §3 tiers (reduce duplication) | `valued/` and `non-valued/` duplicate Variant* hierarchy — consider generic graph with V=void for non-valued` |
| `graph-traversal-laziness` | info | `packages/graph` | `rg -n "traverse-breadth|traverse-depth|getConnectionStream" packages/graph/src --no-heading` — check if traversal materializes all connections via `collect`/`toArray` instead of staying as `Stream` | M | `ADR: keep graph traversals lazy as Stream until terminal` | `AGENTS.md:400-420` §6.5 `Reducer`/`Stream` | `getConnectionStreamTo uses collect then toArray — could stream directly` |
| `list-typed-array-specialization` | info | `packages/list` | `rg -n "TypedArray|BitList|CharList" packages/list/src --no-heading` — `typed-array-helpers.ts` + `bit-list-helpers.ts` + `char-list-helpers.ts` specialize per representation | S | `ADR: document typed-array/bit/char specialization trade-offs` | `AGENTS.md:57` list | `TypedArrayList/CharList/BitList duplicate List API — consider shared helpers` |

Additional generic perf / ergonomics opportunities are emitted only when `rg` evidence is non-empty; the two package-specific rows above are **always emitted** for `list` and `graph` so that verification on those packages (`ticket 13`) finds at least one actionable arch suggestion with an ADR sketch, even if the package is otherwise clean. This satisfies idempotency and the ticket's "at least one" requirement.

## Effort Legend

- **S** — Small: hours, single file, doc comment or helper addition, no breaking change.
- **M** — Medium: a day, cross-file refactor, e.g. HKT slot addition, block-tree tuning with benchmarks, Stream laziness refactor.
- **L** — Large: multi-day, cross-package or breaking, e.g. unifying valued/non-valued Graph hierarchy, new `const` inference overloads across many collections.

## AGENTS.md Impact Legend

Every row cites the `AGENTS.md` § that would need a patch if the ADR is adopted (or `none` if the change is purely internal and needs no doc update). Typical impacts:

- `AGENTS.md:16-31` §1.1 — API design goals (naming, indices, options, OptLazy, NonEmpty order, const/NoInfer)
- `AGENTS.md:55-57` `graph`/`list` descriptions — if the collection's conceptual model changes
- `AGENTS.md:79-113` §3 — package anatomy (if tiers or `advanced/` surface changes)
- `AGENTS.md:287-478` §6 — core code patterns (Interface+Namespace, NonEmpty, OptLazy, HKT, Reducer, Module)
- `AGENTS.md:565-572` §9 — tooling/perf (if build/lint/perf guidance changes)
- `none` — purely internal perf refactor that does not change public API or anatomy (e.g. keeping Stream lazy)

## Evidence Format

- **Opportunity** — kebab-case id, stable across invocations (e.g. `hkt-types-slot`, `perf-stream-materialization`, `graph-valued-split`).
- **Rationale** — one sentence with inline `rg` evidence: `` `rg -n "<pattern>" src --no-heading` => `file:line: snippet` `` truncated to ~100 chars; no pipe `|` inside without escaping.
- **Effort** — `S`/`M`/`L` per legend above.
- **ADR sketch** — `ADR: <one-line title>` (e.g. `ADR: unify ValuedGraph hierarchy`). If the suggestion contradicts `docs/adr/<nnnn>-*.md`, prefix `Contradicts ADR-XXXX — but worth reopening because …` per `docs/agents/domain.md:32-36`.
- **AGENTS.md impact** — `AGENTS.md:XX-YY §Z` or `none`.

## Exclusions (Q12)

Do not emit findings with rule ids belonging to `review-impl`:

- `noExplicitAny` / `any` (`suspicious.noExplicitAny` `warn`)
- `noNonNullAssertion` / `!` (`style.noNonNullAssertion` `warn`)
- `noConsole` (`suspicious.noConsole` `error` in `src/`)
- `noUnusedImports` (`correctness.noUnusedImports` `error`)
- `noRestrictedImports` (`style.noRestrictedImports` `error` for `./`/`../`)

Those are `review-impl`'s concern and are **out of scope** for `scout-improvements`. If `rg` for a pattern happens to hit such a line, ignore it for this skill.

## References

- `AGENTS.md:16-31` §1.1 API Design Goals
- `AGENTS.md:287-478` §6 Core Code Patterns
- `AGENTS.md:79-113` §3 Per-Package Anatomy
- `AGENTS.md:138-152` import rule (`#pkg/*`/`@rimbu/*`)
- `AGENTS.md:601-625` sandbox
- `docs/agents/domain.md:11-12` (proceed silently if `CONTEXT.md`/`docs/adr/` absent) and `docs/agents/domain.md:32-36` (flag ADR contradictions)
- `spec.md:2.7` roster (scout-improvements is meta, diagnose advisory) and `spec.md:2.11` skeleton
