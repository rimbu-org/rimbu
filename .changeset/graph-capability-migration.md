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

- Undirected graphs' `stream()`, `toArray()`, `forEach()` and
  `streamConnections()` emit each edge **twice**, because `connect` writes both
  directions. `connectionSize` counts once. This was always the behaviour; it is
  now asserted by the edge test harnesses and documented in
  `packages/graph/AGENTS.md` rather than being silently masked.
- `connect` on an already-connected valued pair overwrites the value. This is
  now pinned by a test.

### Internal

- The `VariantGraph`, `VariantValuedGraph`, `VariantGraphBase` and
  `VariantValuedGraphBase` internal tiers are being removed in favour of the
  shared `GraphCollection.Advanced` / `ValuedGraphCollection.Advanced` capability
  suites. They are not exported, so this is not a public change.

### Deviations from repo naming conventions

Kept deliberately; see `packages/graph/AGENTS.md` for the reasoning so they are
not "corrected" later: `addNodes`/`removeNodes` (the plural already conveys
per-element application), `modifyAt` (a connection's key is the *pair* of
nodes), and `getConnectionsFrom` (there is no `getConnectionsTo` — the incoming
side must be scanned on a directed graph, so it is exposed as
`getConnectionStreamTo`).
