# scout-improvements — packages/list

## Summary

Scouted packages/list for pattern-level improvements (Interface+Namespace, HKT, Reducer, Module, NonEmpty, API ergonomics, Stream perf) via rg. Found 5 advisory backlog item(s). Counts: 0 error, 1 warn, 4 info. All findings are advisory (warn = high-leverage arch debt, info = opportunity) and never error per Q12. No ADR contradiction — docs/adr/ not present, proceed silently per docs/agents/domain.md:11-12. CONTEXT.md not present, proceed silently per docs/agents/domain.md:11-12.
 1 warn(s) represent high-leverage architecture debt that may warrant an ADR.

## Findings

| Opportunity | Rationale | Effort | ADR sketch | AGENTS.md impact |
|---|---|---|---|---|
| list-block-tree-arity | packages/list/src/internal/immutable/outer-tree.ts: List block-tree uses Inner/Outer Block+Tree with CacheMap — benchmark arity 32 vs 64 for locality and GC \|  | M | ADR: evaluate List block-tree arity 32 vs 64 and fan-out tuning for cache locality | AGENTS.md:57 list (block-tree), AGENTS.md:287-478 §6 |
| api-ergonomics-consistency | packages/list: Fallback param could use NoInfer<T> to prevent widening per §6.6 \| rg NoInfer => 0 | S | ADR: wrap fallback/default params with NoInfer<T> | AGENTS.md:444-463 §6.6 NoInfer |
| interface-namespace | packages/list: Interface count (54) != Namespace count (11) — ensure each public interface has companion namespace per §6.1 \| /workspace/rimbu-worktree/package | S | ADR: co-locate Interface+Namespace per §6.1; split only when barrel re-exports | AGENTS.md:287-333 §6.1 |
| list-typed-array-specialization | packages/list/src/internal/typed-array-helpers.ts: TypedArray/Bit/Char helpers specialize List API — consider shared helper extraction \| /workspace/rimbu-workt | S | ADR: document typed-array/bit/char specialization trade-offs | AGENTS.md:57 list |
| perf-stream-materialization | packages/list: Stream materialization via toArray() in internal — consider staying lazy until terminal Reducer/collect \| /workspace/rimbu-worktree/packages/lis | M | ADR: keep Stream lazy until terminal Reducer; avoid intermediate toArray | AGENTS.md:400-420 §6.5, AGENTS.md:565-572 §9 |

> Severity for this skill: all findings are `info` (advisory) or `warn` (high-leverage arch debt), never `error` (Q12). No line-level Biome nits are reported here — those belong to review-impl (Q12).

## Next actions

- 1 warn(s) are high-leverage arch debt — consider opening an ADR per finding (see ADR sketch column) and proposing an AGENTS.md patch via maintain-skills.
- 4 info — advisory opportunities; evaluate ADR sketch and effort (S/M/L) before scheduling.
- For each backlog item, open an ADR (or propose AGENTS.md patch via maintain-skills) rather than enforcing directly per spec §2.5 (AGENTS.md wins > ADR > checklist).
- Re-run `bun .opencode/skills/scout-improvements/scripts/run.ts -- packages/list` to verify after ADR or patch.
- Do not use this backlog as a gate — it is advisory and feeds future ADRs (purely diagnostic, idempotent).
- Note: docs/adr/ not present — note gap for maintain-skills to propose ADR per docs/agents/domain.md:11-12.