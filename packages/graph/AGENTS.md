# @rimbu/graph — Package Agent Guide

This package provides Rimbu's **immutable Graph** data structures. Four families
cover the `Arrow`/`Edge` × `Valued`/`NonValued` combinations, each with hashed
and sorted variants. Graphs are backed internally by nested maps/sets of
`Link`/`ValuedLink` elements.

> For workspace-wide conventions (biome rules, `build:seq` before typecheck/test,
> the Interface + Namespace pattern, HKT `Types` slots, NonEmpty tracking,
> `OptLazy`, `RelatedTo`, and the changeset workflow) see the **root `AGENTS.md`**.
> This file only covers what is specific to `@rimbu/graph`.

## Source layout

```
src/
├── graph.ts      # exports["."]              — re-exports the whole surface
├── advanced/     # exports["./advanced/*"]    — the capability suite
│   └── graph-base.ts   # GraphCollection / ValuedGraphCollection
│                       #   Advanced.{FamilyBase,Family,TypesRecord,Api,NonEmptyApi,
│                       #              BuilderApi,ContextApi}
│                       #   + Capability.With*  and the typed storage aliases
├── public/       # exports["./*"]            — public subpaths (dist/public/*)
│   ├── arrow-graph.ts            # @rimbu/graph/arrow-graph
│   ├── arrow-valued-graph.ts     # @rimbu/graph/arrow-valued-graph
│   ├── edge-graph.ts             # @rimbu/graph/edge-graph
│   ├── edge-valued-graph.ts      # @rimbu/graph/edge-valued-graph
│   ├── link.ts                   # @rimbu/graph/link (+ GraphElement)
│   ├── valued-link.ts            # @rimbu/graph/valued-link (+ ValuedGraphElement)
│   ├── traverse-depth-first.ts   # @rimbu/graph/traverse-depth-first
│   ├── traverse-breadth-first.ts # @rimbu/graph/traverse-breadth-first
│   ├── non-valued/              # @rimbu/graph/non-valued/*
│   │   ├── arrow/{hashed,sorted}.ts
│   │   └── edge/{hashed,sorted}.ts
│   └── valued/                  # @rimbu/graph/valued/*
│       ├── arrow/{hashed,sorted}.ts
│       └── edge/{hashed,sorted}.ts
└── internal/       # NEVER exported; "#graph/*" only (folded from old "#private/*")
    ├── base.ts
    ├── common/base.ts
    ├── arrow/ (base.ts, creators.ts, valued/)
    ├── edge/  (base.ts, creators.ts, valued/)
    ├── non-valued/ (builder.ts, context-factory.ts, empty.ts, non-empty.ts)
    ├── valued/ (base.ts, builder.ts, context-factory.ts, empty.ts, non-empty.ts,
    │            variant-base.ts, variant.ts, valued-graph.ts)
    ├── variant/ (variant-graph.ts)
    ├── variant-base.ts
    ├── traverse-base.ts
    └── graph.ts                  # internal graph base (name is fine inside internal/)
```

### Restructure note (deviation from draft plan)

The draft `plans/graph.md` proposed moving `src/non-valued/` and `src/valued/`
(the concrete variant implementations) into `internal/`. **This was not followed**
for both folders, because:

1. `@rimbu/core/src/graph.ts` re-exports `@rimbu/graph/non-valued/arrow/{hashed,sorted}`
   and `@rimbu/graph/non-valued/edge/{hashed,sorted}` — so those subpaths are
   externally consumed and must stay public.
2. `valued/*` has no external consumer, but keeping variant constructors public is
   consistent with the `@rimbu/table` decision (users reach for `ValuedGraphHashed`
   etc. directly). So both `non-valued/` and `valued/` were moved under `src/public/`
   and the `"./*" → "./dist/*.js"` leak was repointed to `"./*" → "./dist/public/*"`.
   `./advanced/*` **is** now present, for the capability suite — see the layout above.

Other changes:
- The empty root `src/graph.ts` was replaced with a real re-export of the whole surface.
- The redundant `#private/*` import alias was **folded into `#graph/*`**; all
  `src/**` references to `#private/...` were rewritten to `#graph/...`.
- The 8 top-level public entry files moved to `src/public/`.
- The relative `../../internal/...` imports in the (now-public) `non-valued/`/`valued/`
  variant files were rewritten to the `#graph/...` alias so they no longer break when
  relocated.

### Key rule: imports inside `src/`
- Use the package alias `#graph/*` for anything in `src/internal/*`.
- Use `@rimbu/graph/...` package sub-paths for the public entries (incl. `non-valued/`,
  `valued/`, `link`, `valued-link`, `traverse-*`).
- Use `@rimbu/hashed`, `@rimbu/sorted`, `@rimbu/stream`, `@rimbu/common`,
  `@rimbu/base`, `@rimbu/collection-types` for dependencies.

## Architecture (brief)

- **`ArrowGraph` / `EdgeGraph` / `ArrowValuedGraph` / `EdgeValuedGraph`** — the four
  public family interfaces; each extends its `*Base` and declares `NonEmpty`/`Context`/
  `Builder`/`Types` members.
- **`Link<N>` / `ValuedLink<N, V>`** — the element/connection types (`link.ts`,
  `valued-link.ts`); `GraphElement`/`ValuedGraphElement` are unions with isolated nodes.
- **`VariantGraphBase`** (`internal/variant-base.ts`) — the type-variant, read-only base.
- **`*Base`** (`internal/*/base.ts`, `internal/non-valued/...`, `internal/valued/...`) —
  the concrete abstract bases holding the nested-map storage.
- **`createGraphContextModule` / `createValuedGraphContextModule`** (`internal/non-valued/`,
  `internal/valued/`) — the `Module` factories used by every variant constructor.
- **`traverseDepthFirst*` / `traverseBreadthFirst*`** (`public/traverse-*.ts`) —
  traversal helpers built on `internal/traverse-base.ts`.

## Naming — deliberate deviations (do not "fix")

Root `AGENTS.md` §1.1 wants the same concept named the same everywhere. Graph
deviates in three places, each on purpose. These are recorded here so the next
reader does not "correct" them.

| Graph name | Convention would say | Why it is kept |
|---|---|---|
| `addNodes` / `removeNodes` | `addNodeEach` / `removeNodeEach` | The plural already conveys per-element application, and `Node` is the correct unit noun. `addNodeEach` reads worse. |
| `modifyAt(node1, node2, options)` | `modify` (as `Table` does) | A connection's key is the **pair** of nodes, not one key, so there is no single key to name. It is also not `modifyAtKey` — that would suggest one key. |
| `getConnectionsFrom` | — | Kept. There is no `getConnectionsTo`: the incoming side has to be scanned on a directed graph, so it is exposed as `getConnectionStreamTo` (a stream of links) rather than as a connection collection. See below. |

Renames actually applied: `connectAll` → `connectEach` and `disconnectAll` →
`disconnectEach`. The `*All` ban is load-bearing — `connectAll(links)` genuinely
reads as "connect everything".

## Deliberate semantics

- **`toArray()` returns elements, not `size`.** A graph's elements are its
  isolated nodes **and** its links, so `of([1], [2, 3]).toArray()` is
  `[[1], [2, 3], [3]]` — note the trailing `[3]`, because `connect(2, 3)` also
  creates `3` as a node. `toArray().length` equals neither `size` nor
  `connectionSize`. `length` is not offered: it is a banned name, and its only
  possible meaning here would be that third number.
- **`size` is the node count**, identical to `nodeSize`.
- **`forEach` and `forEachIndexed` are currently the same traversal** — both take
  `(element, index, halt)`. The split is deliberate-but-pending: the rewiring
  step narrows `forEach` to the one-argument form the shared collection
  vocabulary uses and leaves the three-argument form to `forEachIndexed`. Until
  then do not add a one-argument behaviour to either name; see "Still
  outstanding".
- **Undirected iteration double-counts.** `EdgeGraph`'s `stream()` / `forEach()` /
  `streamConnections()` emit each edge **twice**, because `connect` writes both
  directions. `connectionSize` counts once. This is kept (a dedup needs a
  visited-pair set on a hot path) and is **asserted** by the `symmetric()` helper
  in the edge harnesses, not masked by it.
- **`isSink` / `isSource` are on all four families.** Narrowing per directedness
  would add asymmetry for no gain. On an undirected graph both report whether
  the node is isolated.
- **`connect` on an already-connected valued pair overwrites the value.** Asserted
  in `edge-valued-graph-test-standard.ts` (`getConnectionStreamTo` expects
  `['b', 'a', 4]`, not `2`). The migration plan §5 called this uncovered — it is
  not; the valued `arrMulti` fixture deliberately contains the reverse edge with
  a different value to pin it.
- **`WithFilter` / `WithMap` / `WithFlatMap` / `WithRecompose` are refused.** A
  node rename has to be applied to both sides of every link, which is not `map`'s
  contract, and their re-typing goes through `ReTyped`, which pivots on `_NEW_E`
  into a `_NEW_FAMILY` keyed on the **node** type. `WithFilter` is refused twice
  over: the same problem, plus on an undirected graph each edge is stored twice,
  so keeping `[2, 3]` while dropping `[3, 2]` yields a state no `connect` /
  `disconnect` can produce. **Consequence: `filter` must not exist anywhere**, and
  the classes use graph-local bases rather than `CollectionEmpty.Base` (whose
  `Tp` bound requires `Collection.Advanced.Family`, whose `_NORMAL` carries
  `WithFilter`).

## Tooling

All commands run from this package directory. Per the root guide, **always
`bun run build:seq` (from the repo root) before `typecheck`/`test`** so dependent
`dist/` outputs are current.

| Command | Purpose |
|---|---|
| `bun run typecheck` | `tsc -p tsconfig.json --noEmit` (includes `src`, `test`, `test-d`, `test-random`) |
| `bun run test` | `bun test test/* --tsconfig-override tsconfig.common.json` |
| `bun run test:random` | `bun test ./test-random --tsconfig-override tsconfig.common.json` (requires a build) |
| `bun run build` | emit this package to `dist/` |
| `bun run biome:check` / `biome:fix` | lint + format |

`test:random` must keep passing `--tsconfig-override tsconfig.common.json`;
without it the `@rimbu/graph/...` sub-path imports fail to resolve and the suite
exits before running a single test (root `AGENTS.md` §5). Prefer `./test-random`
over `test-random` — without the `./` the argument is a filter, not a path.

## Testing

| Directory | Purpose |
|---|---|
| `test/` | Runtime tests — 4 shared harnesses (`*-graph-test-standard.ts`) driven once per variant, plus `regression.test.ts` and the two traverse suites |
| `test-d/` | Type-level tests: `arrowgraph.test-d.ts` for the abstract family, `variants.test-d.ts` for all 8 concrete variants |
| `test-random/` | Randomized differential tests against an adjacency-list model |

The shared harnesses are typed against `ArrowGraph.Context`, so the edge drivers
cast to it (`EdgeGraphHashed as unknown as ArrowGraph.Context<number>`): the two
are structurally identical for everything the harness touches.

`test-random/` mutates a plain `Map<N, Set<N>>` model and a graph in lockstep.
It checks the O(1) size invariants after **every** operation, re-verifies the
whole graph every `CHECK_FULL_EVERY` (50) operations, and ends each case with an
explicit `checkFull()` — verifying everything after every operation is O(n²) and
is what made `multimap`'s suite dominate the repo-wide `test:random` runtime.

It has already paid for itself: it found two defects the set-comparison harnesses
could not reach, both now pinned in `test/regression.test.ts`.

- `connectionSize` drifted upwards after `removeNode` on a **directed** graph,
  because only the removed node's incoming arcs were subtracted.
- `Builder.forEach` emitted a spurious isolated-node element for every
  *connected* node, so it disagreed with `Builder.build().stream()`.

## Still outstanding

The public variant interfaces (`ArrowGraphHashed`, …) still extend the internal
`VariantGraphBase` / `GraphConnect` hierarchy, **not**
`GraphCollection.Advanced.Api`. The capability suite in `advanced/` is therefore
only partly wired in: the storage aliases and family slots are used, but its
`Api` / `NonEmptyApi` / `BuilderApi` / `ContextApi` aggregates are not yet the
public surface. Consequences and follow-ups:

- The capability `Api` declares `toArray()` and `forEachIndexed()`, and so does
  the legacy tier they will be merged into. The members are implemented and
  tested; what is missing is only that the *public* families still point at the
  legacy hierarchy. Do not add members to the capability `Api` expecting them to
  become public without rewiring.
- The `Variant*` tier (`internal/variant-base.ts`, `internal/valued/variant-base.ts`)
  still exists and is slated for deletion once the families are rewired.

Plan: `.scratch/graph-migration-plan.md` §2.3 (adopt the capability `Api`) and
§2.7 (delete the `Variant*` tier).
