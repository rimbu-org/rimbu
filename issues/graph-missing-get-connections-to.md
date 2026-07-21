---
severity: medium
impact: package
complexity: small
pass: api
package: graph
confidence: medium
effort_estimate: 0.5d
title: "ArrowGraph has no public reverse-connection lookup (getConnectionsTo)"
---

## Summary
The public graph API exposes `getConnectionsFrom(node)` for outgoing connections, but there is no symmetric public `getConnectionsTo(node)` to find incoming connections. For directed (arrow) graphs this is a real gap: callers cannot discover which nodes point *to* a given node without scanning every connection. The implementation already has the capability (`getConnectionStreamTo`, `graph.ts` internal non-empty `:125`) but it is not surfaced in `GraphBase`/`ArrowGraphBase`/`ArrowValuedGraphBase` interfaces, and it returns `any`.

## Evidence
- `packages/graph/src/internal/base.ts` — `GraphBase` declares `getConnectionsFrom` (`:46`) but no `getConnectionsTo`.
- `packages/graph/src/internal/non-valued/non-empty.ts:125-138` — `getConnectionStreamTo` exists but is typed `any` and is not part of the public interface.
- For undirected (edge) graphs the reverse lookup is reachable via `getConnectionsFrom` because both directions are stored (`non-valued/non-empty.ts:219-229`), so the gap is specific to arrow graphs.

## Impact
Users of `ArrowGraph`/`ArrowValuedGraph` cannot query reverse adjacency without a full `streamConnections`/`forEach` scan, which is O(N) and ergonomically poor.

## Recommendation
Add a public `getConnectionsTo<UN>(node): WithGraphValues<Tp,N,unknown>['linkConnections']` (and a streaming variant) to `GraphBase`/`ArrowGraphBase`/`ArrowValuedGraphBase` mirroring `getConnectionsFrom`, with proper typing instead of `any`. For edge graphs it can reuse the existing symmetric storage.
