---
'@rimbu/graph': major
---

`@rimbu/graph` — capability migration: `size`, renamed bulk methods, and a
corrected public surface. Runtime behaviour of the collections is unchanged
apart from the noted additions and removals; the class internals moved onto the
shared capability suite.

### Added

- `size` on every family, equal to `nodeSize`. It is the node count, and is
  deliberately **not** `toArray().length` — a graph's elements are its isolated
  nodes *and* its links, so that number equals neither `size` nor
  `connectionSize`.

### Removed

- `length`. It is a banned name in this repo, and its only possible meaning here
  would be that third number (`size + connectionSize`), which is not a size
  anyone wants. Use `size`, `nodeSize`, or `connectionSize` explicitly.

### Renamed

- `connectAll` → `connectEach`
- `disconnectAll` → `disconnectEach`

These follow the `*Each` convention for bulk operations. `*All` reads as "the
whole collection" rather than "each element of this source", which is not what
these do. The singulars `connect` and `disconnect` are unchanged.

### Changed

- `getConnectionsFrom` now returns the per-variant connection collection rather
  than a widened supertype, so `Graph`/`EdgeGraph` and
  `ValuedGraph`/`ValuedEdgeGraph` each give back their own shape.

### Fixed / documented

- Undirected graphs' `stream()`, `forEach()` and `streamConnections()` emit
  each edge **twice**, because `connect` writes both directions.
  `connectionSize` counts once. This was always the behaviour; it is now
  asserted by the edge test harnesses and documented in
  `packages/graph/AGENTS.md` rather than being silently masked.
- `connect` on an already-connected valued pair overwrites the value. This is
  now pinned by a test.
- `connectionSize` is now exact on a **directed** graph after `removeNode`. It
  previously dropped only the removed node's *incoming* arcs and silently
  ignored its *outgoing* ones, so it drifted upwards with every removal. This
  showed up as, for example,
  `ArrowGraphHashed.of([0, 1], [1, 2], [2, 0], [2, 2], [3, 0]).removeNode(2)`
  reporting `connectionSize === 2` where the truth is `1`.
- `Builder.forEach` no longer reports a spurious isolated-node element for
  every *connected* node. It previously emitted `[node]` unconditionally and
  then the node's links, so it yielded more elements than
  `Builder.build().stream()` for the same builder — 21 against 11 on a ten-node
  chain. The immutable `forEach` was already correct; only the builder was
  wrong. Both are pinned by `test/regression.test.ts`.

### Internal

- New `advanced/` tier (`@rimbu/graph/advanced/graph-base`) carrying the
  `GraphCollection.Advanced.{FamilyBase,Family,Api,NonEmptyApi,BuilderApi,ContextApi}`
  records, the `Capability.With*` suite, and family-carrying storage aliases
  (`LinkMapType`, `LinkConnectionsType`, `LinkMapValuesType`,
  `LinkValuesType`). The concrete families use these aliases for their storage,
  so the outer link map and the inner connection collection resolve to the
  variant's own backing instead of a generic `MapCollection`.
- **Still outstanding:** the `VariantGraph`, `VariantValuedGraph`,
  `VariantGraphBase` and `VariantValuedGraphBase` internal tiers have *not* been
  deleted yet, and the public variant interfaces still extend them rather than
  `GraphCollection.Advanced.Api`. One consequence is visible to users: the
  capability `Api` declares `toArray()` and `forEachIndexed()`, but because it is
  not yet the public surface, **graphs have no `toArray()`** — use
  `stream().toArray()`. Wiring the public families onto the capability aggregates
  is tracked as the follow-up in `.scratch/graph-migration-plan.md` §2.3/§2.7.

### Deviations from repo naming conventions

Kept deliberately; see `packages/graph/AGENTS.md` for the reasoning so they are
not "corrected" later: `addNodes`/`removeNodes` (the plural already conveys
per-element application), `modifyAt` (a connection's key is the *pair* of
nodes), and `getConnectionsFrom` (there is no `getConnectionsTo` — the incoming
side must be scanned on a directed graph, so it is exposed as
`getConnectionStreamTo`).
