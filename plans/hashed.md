# @rimbu/hashed — restructuring plan

## Current state (violations)
- `src/hashed.ts` (root, 43 lines) exports **only** `Hasher`; it does NOT re-export `HashMap`, `HashSet`, or their contexts. Root `.` therefore does not expose the whole public surface (violates A).
- `src/map.ts` and `src/set.ts` are top-level public entries exposed via explicit `"./map"` / `"./set"` exports instead of a scoped `"./*"` wildcard (violates B1/C1).
- Layout is flat: public entries sit next to `src/internal/`. No `src/public/` tier.
- No internal leak currently (exports only expose root + map + set), but the layout must be adopted to the locked target.

## Target layout
```
src/
  hashed.ts       # root "."  → re-exports Hasher + HashMap + HashSet + contexts (whole surface)
  public/         # "./*" → dist/public/*
    map.ts        # @rimbu/hashed/map
    set.ts        # @rimbu/hashed/set
  internal/       # never exported; "#hashed/*", "#map/*", "#set/*" only
    hashed/       # (base.ts, hasher-module.ts)
    map/          # (builder.ts, context-factory.ts, creators.ts, immutable.ts)
    set/          # (builder.ts, context-factory.ts, creators.ts, immutable.ts)
```

## File mapping (current → target)
| Current file | Tier | New path |
|---|---|---|
| src/hashed.ts | root | src/hashed.ts (rewrite: re-export whole surface) |
| src/map.ts | public | src/public/map.ts |
| src/set.ts | public | src/public/set.ts |
| src/internal/hashed/base.ts | internal | src/internal/hashed/base.ts (unchanged) |
| src/internal/hashed/hasher-module.ts | internal | src/internal/hashed/hasher-module.ts (unchanged) |
| src/internal/map/* | internal | src/internal/map/* (unchanged) |
| src/internal/set/* | internal | src/internal/set/* (unchanged) |

## package.json exports / imports changes
Target `exports`:
```jsonc
{
  ".": { "types": "./dist/hashed.d.ts", "default": "./dist/hashed.js" },
  "./*": { "types": "./dist/public/*.d.ts", "default": "./dist/public/*.js" }
}
```
- REMOVE explicit `"./map"` and `"./set"` (superseded by `"./*"` → `dist/public/*`).
- `imports` stays as-is:
```jsonc
{
  "#hashed/*": { "types": "./dist/internal/hashed/*.d.ts", "default": "./dist/internal/hashed/*.js" },
  "#map/*":    { "types": "./dist/internal/map/*.d.ts",    "default": "./dist/internal/map/*.js" },
  "#set/*":    { "types": "./dist/internal/set/*.d.ts",    "default": "./dist/internal/set/*.js" }
}
```
(These already point only at `dist/internal/**`; no `./internal/*` export exists.)

## Root fix
Rewrite `src/hashed.ts` so the `.` entry re-exports the WHOLE public surface:
- `Hasher` (currently the sole export)
- `HashMap` + `HashMap.Context`/`Builder`/creators (re-export `./public/map`)
- `HashSet` + `HashSet.Context`/`Builder`/creators (re-export `./public/set`)
Keep `Hasher` import path updated to `#hashed/hasher-module` (or re-export from internal).

## Naming / intentional deviations
- No naming deviations flagged for hashed; `get`/`mapValues` parity is already correct per RMapBase.
- Only structural adoption required (flatten public subpaths under `public/`).

## Notes
- Change relative/package imports inside `public/map.ts` and `public/set.ts` from `./internal/...` style to `#map/*` / `#set/*` / `#hashed/*` aliases.
- `tsconfig.common.json` paths must gain `@rimbu/hashed/map` → `./public/map.ts`, `@rimbu/hashed/set` → `./public/set.ts`, and the `"./*"` → `./public/*.ts` alias.
