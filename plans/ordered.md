# @rimbu/ordered — restructuring plan

## Current state (violations)
- **No `"."` export at all** — there is no root entry; root does not re-export `OrderedMap`/`OrderedSet` (violates A).
- Public entries (`map.ts`, `set.ts`, `map/hashed.ts`, `map/sorted.ts`, `set/hashed.ts`, `set/sorted.ts`) are exposed via explicit `"./map"`, `"./set"` **and** a wildcard `"./*"` → `"./dist/*.js"` (violates B1/C1 and leaks everything at `dist/*`).
- `src/map.ts`, `src/set.ts` are flat top-level alongside `src/internal/map/`, `src/internal/set/` (which already correctly hold `base.ts`, `creators.ts`, `builder.ts`, `context-factory.ts`, `empty.ts`, `non-empty.ts`).
- The impl is **already** under `src/internal/map` and `src/internal/set` (unlike the audit's assumption) — good; no public/impl co-mingling in `src/map/`. The `src/map/` and `src/set/` folders contain ONLY variant entries (`hashed.ts`, `sorted.ts`), which are public.

## Target layout
```
src/
  ordered.ts      # root "."  → re-exports OrderedMap + OrderedSet + contexts (whole surface)
  public/         # "./*" → dist/public/*
    map.ts        # @rimbu/ordered/map
    set.ts        # @rimbu/ordered/set
    map/hashed.ts # @rimbu/ordered/map/hashed
    map/sorted.ts # @rimbu/ordered/map/sorted
    set/hashed.ts # @rimbu/ordered/set/hashed
    set/sorted.ts # @rimbu/ordered/set/sorted
  internal/       # never exported; "#map/*", "#set/*" only
    map/          # (base.ts, builder.ts, context-factory.ts, creators.ts, empty.ts, non-empty.ts)
    set/          # (base.ts, builder.ts, context-factory.ts, creators.ts, empty.ts, non-empty.ts)
```

## File mapping (current → target)
| Current file | Tier | New path |
|---|---|---|
| (none) | root | src/ordered.ts (CREATE: root re-export) |
| src/map.ts | public | src/public/map.ts |
| src/set.ts | public | src/public/set.ts |
| src/map/hashed.ts | public | src/public/map/hashed.ts |
| src/map/sorted.ts | public | src/public/map/sorted.ts |
| src/set/hashed.ts | public | src/public/set/hashed.ts |
| src/set/sorted.ts | public | src/public/set/sorted.ts |
| src/internal/map/* | internal | src/internal/map/* (unchanged) |
| src/internal/set/* | internal | src/internal/set/* (unchanged) |

## package.json exports / imports changes
Target `exports`:
```jsonc
{
  ".": { "types": "./dist/ordered.d.ts", "default": "./dist/ordered.js" },
  "./*": { "types": "./dist/public/*.d.ts", "default": "./dist/public/*.js" }
}
```
- ADD `"."` root entry (currently missing).
- REMOVE explicit `"./map"`, `"./set"` (superseded by `"./*"` → `dist/public/*`).
- REMOVE the leaking `"./*"` → `"./dist/*.js"` (must point at `./dist/public/*`).
- `imports` stays (already points at internal):
```jsonc
{
  "#map/*": { "types": "./dist/internal/map/*.d.ts", "default": "./dist/internal/map/*.js" },
  "#set/*": { "types": "./dist/internal/set/*.d.ts", "default": "./dist/internal/set/*.js" }
}
```

## Root fix
CREATE `src/ordered.ts` re-exporting the whole surface:
- `OrderedMap` + `OrderedMap.Context`/`Builder`/creators (re-export `./public/map`)
- `OrderedSet` + `OrderedSet.Context`/`Builder`/creators (re-export `./public/set`)

## Naming / intentional deviations
- No naming deviations flagged; ordered follows map/set conventions.
- Audit note: impl was already under `src/internal/{map,set}`, so no movement of impl files is required — only creation of the root and moving the 6 public entry files under `public/`.

## Notes
- Update imports inside the 6 public files to use `#map/*` / `#set/*` aliases (they currently import from `#map/base`, `#map/creators`, `#map/context-factory`, etc., which still resolve to `src/internal/map/*` — those aliases are unchanged, so only the relative `./`/`../` imports, if any, need fixing).
- `tsconfig.common.json` paths: add `@rimbu/ordered/map` → `./public/map.ts`, `@rimbu/ordered/set` → `./public/set.ts`, and `"./*"` → `./public/*.ts` plus nested `@rimbu/ordered/map/*` → `./public/map/*.ts`, `@rimbu/ordered/set/*` → `./public/set/*.ts`.
