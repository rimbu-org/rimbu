# @rimbu/proximity — restructuring plan

## Current state (violations)
- `src/proximity.ts` (root) is the public `ProximityMap` entry.
- `src/distance-function.ts` and `src/key-matching.ts` are **user-facing config types** sitting at top level; they are public API and belong in `public/` (violates B1/C1 scoped public folder).
- `src/internal/` holds builder.ts, context-factory.ts, creators.ts, empty.ts, non-empty.ts, wrapping.ts — correct.
- **Internal leak**: `exports` contains `"./*"` → `"./dist/*.js"` which would expose `distance-function.ts`/`key-matching.ts` via wildcard *and* any stray internal file at `dist/*` (must be repointed to `dist/public/*`).

## Target layout
```
src/
  proximity.ts          # root "."  → ProximityMap + contexts (whole surface)
  public/               # "./*" → dist/public/*
    distance-function.ts # @rimbu/proximity/distance-function
    key-matching.ts      # @rimbu/proximity/key-matching
  internal/             # never exported; "#proximity/*" only
    builder.ts
    context-factory.ts
    creators.ts
    empty.ts
    non-empty.ts
    wrapping.ts
```

## File mapping (current → target)
| Current file | Tier | New path |
|---|---|---|
| src/proximity.ts | root | src/proximity.ts (unchanged — re-exports whole surface) |
| src/distance-function.ts | public | src/public/distance-function.ts |
| src/key-matching.ts | public | src/public/key-matching.ts |
| src/internal/* | internal | src/internal/* (unchanged) |

## package.json exports / imports changes
Target `exports`:
```jsonc
{
  ".": { "types": "./dist/proximity.d.ts", "default": "./dist/proximity.js" },
  "./*": { "types": "./dist/public/*.d.ts", "default": "./dist/public/*.js" }
}
```
- REMOVE the leaking `"./*"` → `"./dist/*.js"` (must point at `./dist/public/*`).
- `imports` stays:
```jsonc
{
  "#proximity/*": { "types": "./dist/internal/*.d.ts", "default": "./dist/internal/*.js" }
}
```

## Root fix
`src/proximity.ts` already re-exports the `ProximityMap` base surface + contexts. Confirm it re-exports (or that the public subpaths surface) `DistanceFunction` and `KeyMatching` from `./public/*`.

## Naming / intentional deviations
- No naming deviations flagged; `get`/`mapValues` parity is inherited from the underlying map base.
- `distance-function.ts` / `key-matching.ts` are config types consumed by `ProximityMap` contexts — public by design.

## Notes
- **Import fixes required:** `public/distance-function.ts` and `public/key-matching.ts` may import internal files via relative `./`/`../` or package subpaths — change internal refs to `#proximity/*`. `proximity.ts` root must update its references to these two files to `./public/distance-function` and `./public/key-matching` (or re-export them).
- `tsconfig.common.json` paths: add `@rimbu/proximity/distance-function` → `./public/distance-function.ts`, `@rimbu/proximity/key-matching` → `./public/key-matching.ts`, and `"./*"` → `./public/*.ts`.
- `proximity` depends on `@rimbu/hashed`/`@rimbu/sorted` (underlying map) and `@rimbu/stream` — keep external imports.
