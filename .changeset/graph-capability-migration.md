---
'@rimbu/graph': major
---

`@rimbu/graph` — capability migration: `size`, renamed bulk methods, and a
corrected public surface. Runtime behaviour of the collections is unchanged
apart from the noted additions and removals; the class internals moved onto the
shared capability suite.

### Added

- `toArray()` on every family. A graph's elements are its isolated nodes **and**
  its links, so this returns 1-tuples and link tuples — it is *not* `size`.
  Previously graphs had no `toArray()` at all; use `stream().toArray()`.
- `forEachIndexed(f, options?)` on the collections and the builders — the same
  traversal `forEach` already provided (receiving `element`, `index`, `halt`),
  under the name the shared collection vocabulary reserves for the indexed form.
- `clear()` on both builders, returning them to the empty state and leaving them
  usable. It respects the traversal lock like every other builder mutator.
- `asNormal()` on the (possibly empty) form. On the empty form it returns `this`,
  since an empty graph is already the normal form.
- `size` on every family, equal to `nodeSize`. It is the node count, and is
  deliberately **not** `toArray().length` — a graph's elements are its isolated
  nodes *and* its links, so that number equals neither `size` nor
  `connectionSize`.

### Removed

- `length`. It is a banned name in this repo, and its only possible meaning here
  would be that third number (`size + connectionSize`), which is not a size
  anyone wants. Use `size`, `nodeSize`, or `connectionSize` explicitly.

### Changed (breaking)

- **`forEach` now takes only the graph element.** It previously received
  `(element, index, halt)` and accepted a `{ state }` option. The indexed
  traversal is now spelled `forEachIndexed` and keeps both — `f(element, index,
  halt)` plus the `{ state }` option. This matches every other Rimbu collection
  and the shared vocabulary, where `forEach` is the one-argument form and
  `forEachIndexed` is the indexed one.

  ```ts
  // before
  g.forEach((element, index, halt) => { if (index >= 1) halt(); });
  // after
  g.forEachIndexed((element, index, halt) => { if (index >= 1) halt(); });
  g.forEach((element) => { /* … */ });
  ```

  Affects the collections and both builders. Callers that only ever passed a
  one-argument (or zero-argument) callback need no change. Note that the two
  forms still take the *same* `state` option, so the migration is a pure rename
  for callers that were already using the indexed behaviour.

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
- **Deleted: the `VariantGraph`, `VariantValuedGraph`, `VariantGraphBase` and
  `VariantValuedGraphBase` internal tiers**, plus the `GraphConnect` /
  `GraphConnectNonEmpty` helper interfaces. Their members — and all of their
  documentation — moved onto `GraphBase` / `ValuedGraphBase`. Nothing was
  exported, so this is not a public change.

  Two consequences are visible in the *types*, though not in behaviour:

  - `GraphBase` and `ValuedGraphBase` are now two separate hierarchies rather
    than one (`VariantValuedGraphBase extends VariantGraphBase` used to unify
    them). Anything generic over "some graph" — the `traverse*` helpers and
    `LinkType` — must accept `GraphBase<N, any> | ValuedGraphBase<N, any>`.
  - The non-empty forms state `isDirected` (`true` for arrow, `false` for edge)
    directly rather than inheriting it, because the `Omit` list that folds the
    non-empty members into the normal form widens it back to `boolean`.

- **Still outstanding:** the public variant interfaces extend `GraphBase` /
  `ValuedGraphBase`, **not** `GraphCollection.Advanced.Api`. The capability
  aggregates are implemented and tested but are not yet the public surface.
  Tracked in `.scratch/graph-migration-plan.md` §2.3.

### Deviations from repo naming conventions

Kept deliberately; see `packages/graph/AGENTS.md` for the reasoning so they are
not "corrected" later: `addNodes`/`removeNodes` (the plural already conveys
per-element application), `modifyAt` (a connection's key is the *pair* of
nodes), and `getConnectionsFrom` (there is no `getConnectionsTo` — the incoming
side must be scanned on a directed graph, so it is exposed as
`getConnectionStreamTo`).
