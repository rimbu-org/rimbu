# @rimbu/sorted — restructuring plan

## Current state (violations)
- `src/sorted.ts` (root) is **EMPTY (0 bytes)** — no `.` entry content; root does not re-export `SortedMap`/`SortedSet`/contexts (violates A).
- `src/map.ts`, `src/set.ts` are top-level public entries exposed via explicit `"./map"` / `"./set"` instead of a scoped `"./*"` wildcard (violates B1/C1).
- `src/internal/` holds `map/`, `set/`, `sorted/` (base.ts, sorted-index.ts) — correct internal placement.
- **Internal leak**: `exports` contains `"./internal/*"` → `"./dist/internal/*"` which exposes private implementation (must be removed).

## Target layout
```
src/
  sorted.ts       # root "."  → re-exports SortedMap + SortedSet + contexts (whole surface)
  public/         # "./*" → dist/public/*
    map.ts        # @rimbu/sorted/map
    set.ts        # @rimbu/sorted/set
  internal/       # never exported; "#sorted/*", "#map/*", "#set/*" only
    map/          # (builder.ts, context-factory.ts, creators.ts, immutable.ts)
    set/          # (builder.ts, context-factory.ts, creators.ts, immutable.ts)
    sorted/       # (base.ts, sorted-index.ts)
```

## File mapping (current → target)
| Current file | Tier | New path |
|---|---|---|
| src/sorted.ts | root | src/sorted.ts (rewrite: re-export whole surface) |
| src/map.ts | public | src/public/map.ts |
| src/set.ts | public | src/public/set.ts |
| src/internal/map/* | internal | src/internal/map/* (unchanged) |
| src/internal/set/* | internal | src/internal/set/* (unchanged) |
| src/internal/sorted/* | internal | src/internal/sorted/* (unchanged) |

## package.json exports / imports changes
Target `exports`:
```jsonc
{
  ".": { "types": "./dist/sorted.d.ts", "default": "./dist/sorted.js" },
  "./*": { "types": "./dist/public/*.d.ts", "default": "./dist/public/*.js" }
}
```
- REMOVE explicit `"./map"`, `"./set"` (superseded by `"./*"` → `dist/public/*`).
- REMOVE `"./internal/*"` export (leaks internal).
- `imports` stays:
```jsonc
{
  "#sorted/*": { "types": "./dist/internal/sorted/*.d.ts", "default": "./dist/internal/sorted/*.js" },
  "#map/*":    { "types": "./dist/internal/map/*.d.ts",    "default": "./dist/internal/map/*.js" },
  "#set/*":    { "types": "./dist/internal/set/*.d.ts",    "default": "./dist/internal/set/*.js" }
}
```

## Root fix
Create a real `src/sorted.ts` root that re-exports the whole surface:
- `SortedMap` + `SortedMap.Context`/`Builder`/creators (re-export `./public/map`)
- `SortedSet` + `SortedSet.Context`/`Builder`/creators (re-export `./public/set`)

## Naming / intentional deviations
- No naming deviations flagged; sorted already follows RMapBase / RSetBase conventions.
- Only structural adoption + internal-leak removal required.

## Notes
- Update imports inside `public/map.ts`, `public/set.ts` to use `#map/*` / `#set/*` / `#sorted/*` aliases.
- `tsconfig.common.json` paths: add `@rimbu/sorted/map` → `./public/map.ts`, `@rimbu/sorted/set` → `./public/set.ts`, `"./*"` → `./public/*.ts`.
- `SortedMap`/`SortedSet` depend on `@rimbu/common`, `@rimbu/stream`, etc. — keep those external imports intact.
