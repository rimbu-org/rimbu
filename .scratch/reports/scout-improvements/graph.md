# scout-improvements — packages/graph

## Summary

Scouted packages/graph for pattern-level improvements (Interface+Namespace, HKT, Reducer, Module, NonEmpty, API ergonomics, Stream perf) via rg. Found 6 advisory backlog item(s). Counts: 0 error, 1 warn, 5 info. All findings are advisory (warn = high-leverage arch debt, info = opportunity) and never error per Q12. No ADR contradiction — docs/adr/ not present, proceed silently per docs/agents/domain.md:11-12. CONTEXT.md not present, proceed silently per docs/agents/domain.md:11-12.
 1 warn(s) represent high-leverage architecture debt that may warrant an ADR.

## Findings

| Opportunity | Rationale | Effort | ADR sketch | AGENTS.md impact |
|---|---|---|---|---|
| graph-valued-split | packages/graph/src/internal/valued/variant-base.ts: Graph splits valued/ and non-valued/ with duplicated Variant* bases — consider generic V=void unification \| | L | ADR: unify valued/non-valued Graph via generic V or composition over Variant* hierarchy | AGENTS.md:55 graph, AGENTS.md:79-113 §3, AGENTS.md:287-333 §6.1 |
| api-ergonomics-consistency | packages/graph: Fallback param could use NoInfer<T> to prevent widening per §6.6 \| rg NoInfer => 0 | S | ADR: wrap fallback/default params with NoInfer<T> | AGENTS.md:444-463 §6.6 NoInfer |
| graph-traversal-laziness | packages/graph/src/internal/non-valued/non-empty.ts: Graph traversal/collect materializes — keep as Stream until terminal reduce \| /workspace/rimbu-worktree/pa | M | ADR: keep graph traversals lazy as Stream until terminal | AGENTS.md:400-420 §6.5 Stream/Reducer |
| interface-namespace | packages/graph: Interface count (131) != Namespace count (28) — ensure each public interface has companion namespace per §6.1 \| /workspace/rimbu-worktree/packa | S | ADR: co-locate Interface+Namespace per §6.1; split only when barrel re-exports | AGENTS.md:287-333 §6.1 |
| perf-stream-materialization | packages/graph: Stream materialization via toArray() in internal — consider staying lazy until terminal Reducer/collect \| /workspace/rimbu-worktree/packages/gr | M | ADR: keep Stream lazy until terminal Reducer; avoid intermediate toArray | AGENTS.md:400-420 §6.5, AGENTS.md:565-572 §9 |
| reducer-composability | packages/graph: Reducer used without mapInput/combine — potential for more composable folds \| /workspace/rimbu-worktree/packages/graph/src/internal/non-valued/ | S | ADR: explore Reducer.mapInput/combine for input mapping | AGENTS.md:400-420 §6.5 |

> Severity for this skill: all findings are `info` (advisory) or `warn` (high-leverage arch debt), never `error` (Q12). No line-level Biome nits are reported here — those belong to review-impl (Q12).

## Next actions

- 1 warn(s) are high-leverage arch debt — consider opening an ADR per finding (see ADR sketch column) and proposing an AGENTS.md patch via maintain-skills.
- 5 info — advisory opportunities; evaluate ADR sketch and effort (S/M/L) before scheduling.
- For each backlog item, open an ADR (or propose AGENTS.md patch via maintain-skills) rather than enforcing directly per spec §2.5 (AGENTS.md wins > ADR > checklist).
- Re-run `bun .opencode/skills/scout-improvements/scripts/run.ts -- packages/graph` to verify after ADR or patch.
- Do not use this backlog as a gate — it is advisory and feeds future ADRs (purely diagnostic, idempotent).
- Note: docs/adr/ not present — note gap for maintain-skills to propose ADR per docs/agents/domain.md:11-12.