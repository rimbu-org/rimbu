---
severity: low
impact: package
complexity: trivial
pass: api
package: graph
confidence: high
effort_estimate: 0.1d
title: "EdgeGraphBase.isDirected doc comment wrongly says 'arrow (directed)'"
---

## Summary
The `isDirected` property on `EdgeGraphBase` (undirected/edge graphs) is documented with copy-pasted text from the arrow (directed) variant. The doc claims "Returns false since this is an arrow (directed) graph instance", which is contradictory: an edge graph is undirected, and the value `false` is correct but the explanation is wrong and misleading.

## Evidence
`packages/graph/src/internal/edge/base.ts:11-13`
```ts
/**
 * Returns false since this is an arrow (directed) graph instance.
 */
readonly isDirected: false;
```
The same wrong wording likely appears in `EdgeGraphBase.Context` (`edge/base.ts:44`) and the public `edge-graph.ts`/`edge-valued-graph.ts` re-exports. The arrow variant (`arrow/base.ts`) correctly documents `true`.

## Impact
User-facing JSDoc is incorrect; readers may believe undirected graphs are directed. Pure documentation defect, no runtime effect.

## Recommendation
Reword to something like "Returns false since this is an edge (undirected) graph instance." Apply the same correction to the `Context.isDirected` doc and any duplicated public docs.
