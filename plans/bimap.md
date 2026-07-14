# @rimbu/bimap — restructuring plan

## Current state (violations)
- Package is largely **clean**: `src/bimap.ts` (root) is the public `BiMap` entry; all impl is under `src/internal/` (builder.ts, context-factory.ts, factory.ts, immutable.ts).
- No `"./*"` wildcard and no `"./internal/*"` leak — internal is reachable only via `#bimap/*`.
- Layout is flat: the single public entry `bimap.ts` sits at `src/` root next to `src/internal/`. Adopt the three-tier layout by keeping root as-is and confirming `src/internal/` stays internal.

## Target layout
```
src/
  bimap.ts        # root "."  → BiMap + contexts (whole surface; already correct)
  public/         # "./*" → dist/public/*  (no separate public files needed; root covers it)
  internal/       # never exported; "#bimap/*" only
    builder.ts
    context-factory.ts
    factory.ts
    immutable.ts
```
> Note: bimap has only one public entry (the root). `public/` may remain empty; the root re-exports the whole surface. `"./*"` → `dist/public/*` is included for consistency but currently resolves nothing.

## File mapping (current → target)
| Current file | Tier | New path |
|---|---|---|
| src/bimap.ts | root | src/bimap.ts (unchanged — already re-exports whole surface) |
| src/internal/* | internal | src/internal/* (unchanged) |

## package.json exports / imports changes
Target `exports` (already correct; keep):
```jsonc
{
  ".": { "types": "./dist/bimap.d.ts", "default": "./dist/bimap.js" }
}
```
- Optionally add `"./*": { "types": "./dist/public/*.d.ts", "default": "./dist/public/*.js" }` for layout consistency (no public subpaths today).
- `imports` stays:
```jsonc
{
  "#bimap/*": { "types": "./dist/internal/*.d.ts", "default": "./dist/internal/*.js" }
}
```

## Root fix
None required — `src/bimap.ts` already re-exports the whole public surface (`BiMap`, `BiMap.Context`, `BiMap.Builder`, creators).

## Naming / intentional deviations
- **Intentional deviation (document, do NOT change):** `BiMap` uses `getValue` / `getKey` instead of a single `get`, and has **no** `mapValues`. This is justified by the 1-to-1 bidirectional invariant (get-by-key and get-by-value are distinct operations). Do not force a `get`/`mapValues` parity with `HashMap`.
- No obvious naming inconsistencies to fix.

## Notes
- Minimal change required: adopt the three-tier folder skeleton and confirm no internal export exists. Core refactor risk is low.
- `tsconfig.common.json` may add `"./*"` → `./public/*.ts` if the wildcard export is added.
