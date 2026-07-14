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
   No `./advanced/*` and no internal variant folder were introduced.

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

## Tooling

All commands run from this package directory. Per the root guide, **always
`bun run build:seq` (from the repo root) before `typecheck`/`test`** so dependent
`dist/` outputs are current.

| Command | Purpose |
|---|---|
| `bun run typecheck` | `tsc -p tsconfig.json --noEmit` (includes `src`, `test`, `test-d`) |
| `bun run test` | `bun test test/* --tsconfig-override tsconfig.common.json` |
| `bun run build` | emit this package to `dist/` |
| `bun run biome:check` / `biome:fix` | lint + format |
