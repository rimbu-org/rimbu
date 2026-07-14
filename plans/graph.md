# @rimbu/graph — restructuring plan

## Current state (violations)
- `src/graph.ts` (root) is **EMPTY (0 bytes)** — no `.` entry; root does not re-export the 4 graph families, contexts, `Link`, or `ValuedLink` (violates A).
- `src/arrow-graph.ts`, `src/arrow-valued-graph.ts`, `src/edge-graph.ts`, `src/edge-valued-graph.ts`, `src/link.ts`, `src/valued-link.ts`, `src/traverse-depth-first.ts`, `src/traverse-breadth-first.ts` are top-level public entries exposed via explicit subpaths **and** a wildcard `"./*"` → `"./dist/*.js"` (violates B1/C1; leaks everything at `dist/*`).
- `src/non-valued/` (`arrow/hashed.ts`, `arrow/sorted.ts`, `edge/hashed.ts`, `edge/sorted.ts`) and `src/valued/` (`arrow/hashed.ts`, `arrow/sorted.ts`, `edge/hashed.ts`, `edge/sorted.ts`) are **concrete variant implementations** sitting at top level — they must move to `internal/`.
- `src/internal/` correctly holds base.ts, common/, arrow/, edge/, non-valued/, valued/, variant/, variant-base.ts, traverse-base.ts, graph.ts — but `graph.ts` (internal) collides in name with the empty root `graph.ts`.
- **Alias leak**: `imports` contains both `#graph/*` and `#private/*` (redundant). `#private/*` must be folded into `#graph/*` (violates the "remove redundant #private/*" rule).

## Target layout
```
src/
  graph.ts                       # root "."  → re-exports all 4 families + contexts + Link + ValuedLink
  public/                        # "./*" → dist/public/*
    arrow-graph.ts               # @rimbu/graph/arrow-graph
    arrow-valued-graph.ts        # @rimbu/graph/arrow-valued-graph
    edge-graph.ts                # @rimbu/graph/edge-graph
    edge-valued-graph.ts         # @rimbu/graph/edge-valued-graph
    link.ts                      # @rimbu/graph/link
    valued-link.ts               # @rimbu/graph/valued-link
    traverse-depth-first.ts      # @rimbu/graph/traverse-depth-first
    traverse-breadth-first.ts    # @rimbu/graph/traverse-breadth-first
  internal/                      # never exported; "#graph/*" only (folded from #private/*)
    base.ts
    common/
    arrow/
    edge/
    non-valued/                  # (was src/non-valued/*)
    valued/                      # (was src/valued/*)
    variant/
    variant-base.ts
    traverse-base.ts
    graph.ts                     # internal graph base (name is fine inside internal/)
```

## File mapping (current → target)
| Current file | Tier | New path |
|---|---|---|
| src/graph.ts | root | src/graph.ts (rewrite: re-export whole surface) |
| src/arrow-graph.ts | public | src/public/arrow-graph.ts |
| src/arrow-valued-graph.ts | public | src/public/arrow-valued-graph.ts |
| src/edge-graph.ts | public | src/public/edge-graph.ts |
| src/edge-valued-graph.ts | public | src/public/edge-valued-graph.ts |
| src/link.ts | public | src/public/link.ts |
| src/valued-link.ts | public | src/public/valued-link.ts |
| src/traverse-depth-first.ts | public | src/public/traverse-depth-first.ts |
| src/traverse-breadth-first.ts | public | src/public/traverse-breadth-first.ts |
| src/non-valued/arrow/hashed.ts | internal | src/internal/non-valued/arrow/hashed.ts |
| src/non-valued/arrow/sorted.ts | internal | src/internal/non-valued/arrow/sorted.ts |
| src/non-valued/edge/hashed.ts | internal | src/internal/non-valued/edge/hashed.ts |
| src/non-valued/edge/sorted.ts | internal | src/internal/non-valued/edge/sorted.ts |
| src/valued/arrow/hashed.ts | internal | src/internal/valued/arrow/hashed.ts |
| src/valued/arrow/sorted.ts | internal | src/internal/valued/arrow/sorted.ts |
| src/valued/edge/hashed.ts | internal | src/internal/valued/edge/hashed.ts |
| src/valued/edge/sorted.ts | internal | src/internal/valued/edge/sorted.ts |
| src/internal/* | internal | src/internal/* (unchanged) |

## package.json exports / imports changes
Target `exports`:
```jsonc
{
  ".": { "types": "./dist/graph.d.ts", "default": "./dist/graph.js" },
  "./*": { "types": "./dist/public/*.d.ts", "default": "./dist/public/*.js" }
}
```
- REMOVE explicit `"./arrow-graph"`, `"./arrow-valued-graph"`, `"./edge-graph"`, `"./edge-valued-graph"` (superseded by `"./*"` → `dist/public/*`).
- REMOVE the leaking `"./*"` → `"./dist/*.js"` (must point at `./dist/public/*`).
- `imports` — REMOVE `#private/*`, fold into `#graph/*`:
```jsonc
{
  "#graph/*": { "types": "./dist/internal/*.d.ts", "default": "./dist/internal/*.js" }
}
```

## Root fix
CREATE a real `src/graph.ts` root re-exporting the whole surface:
- `ArrowGraph`, `ArrowValuedGraph`, `EdgeGraph`, `EdgeValuedGraph` (and their `.Context`/`.Builder`/creators) — re-export from `./public/*`.
- `Link`, `ValuedLink` — re-export from `./public/link`, `./public/valued-link`.
- Traversal helpers `traverseDepthFirst`, `traverseBreadthFirst` — re-export from `./public/*` (if they are part of the public surface).

## Naming / intentional deviations
- Graph deliberately uses 4 distinct families (`Arrow`/`Edge` × `Valued`/`NonValued`) with `Link`/`ValuedLink` types — this is the intended API shape, not a naming inconsistency.
- `get`/`mapValues` parity is inherited from the underlying map/set bases.

## Notes
- **Import fixes required:** every `src/public/*.ts` file currently references concrete variants possibly via package subpaths or relative paths — update internal refs to `#graph/*` and cross-public refs to `@rimbu/graph/<name>`. The moved `non-valued/`, `valued/` folders keep using `#graph/*`.
- The internal `src/internal/graph.ts` (base) coexists with the new root `src/graph.ts` — no conflict since root is not under `internal/`.
- `tsconfig.common.json` paths: add each `@rimbu/graph/<name>` → `./public/<name>.ts`, `"./*"` → `./public/*.ts`, and ensure `@rimbu/graph/internal/*` style (if used) maps to `./internal/*.ts`. Remove any `#private/*` alias mapping.
- `graph` depends on `@rimbu/hashed`, `@rimbu/sorted`, `@rimbu/stream` — keep external imports.
