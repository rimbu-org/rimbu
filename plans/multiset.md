# @rimbu/multiset — restructuring plan

## Current state (violations)
- `src/multiset.ts` (root) is the public `MultiSet` entry.
- `src/hashed.ts`, `src/sorted.ts` are top-level public **variant** entries exposed via explicit `"./hashed"`, `"./sorted"` **and** a wildcard `"./*"` → `"./dist/*.js"` (violates B1/C1, leaks everything at `dist/*`).
- `src/variant.ts` is the **`VariantMultiSet`** read-only covariant tier (implementer/extension API) and sits at top level; it belongs in `advanced/` (violates C1 advanced tier).
- `src/internal/` holds base.ts, context-factory.ts, creators.ts, types.ts — correct.

## Target layout
```
src/
  multiset.ts     # root "."  → MultiSet + contexts (whole surface)
  public/         # "./*" → dist/public/*
    hashed.ts     # @rimbu/multiset/hashed
    sorted.ts     # @rimbu/multiset/sorted
  advanced/       # "./advanced/*" → dist/advanced/*
    variant.ts    # @rimbu/multiset/advanced/variant  (VariantMultiSet implementer API)
  internal/       # never exported; "#multiset/*" only
    base.ts
    context-factory.ts
    creators.ts
    types.ts
```

## File mapping (current → target)
| Current file | Tier | New path |
|---|---|---|
| src/multiset.ts | root | src/multiset.ts (unchanged — re-exports whole surface) |
| src/hashed.ts | public | src/public/hashed.ts |
| src/sorted.ts | public | src/public/sorted.ts |
| src/variant.ts | advanced | src/advanced/variant.ts |
| src/internal/* | internal | src/internal/* (unchanged) |

## package.json exports / imports changes
Target `exports`:
```jsonc
{
  ".": { "types": "./dist/multiset.d.ts", "default": "./dist/multiset.js" },
  "./*": { "types": "./dist/public/*.d.ts", "default": "./dist/public/*.js" },
  "./advanced/*": { "types": "./dist/advanced/*.d.ts", "default": "./dist/advanced/*.js" }
}
```
- REMOVE explicit `"./hashed"`, `"./sorted"` (superseded by `"./*"` → `dist/public/*`).
- REMOVE the leaking `"./*"` → `"./dist/*.js"` (must point at `./dist/public/*`).
- ADD `"./advanced/*"` → `dist/advanced/*`.
- `imports` stays:
```jsonc
{
  "#multiset/*": { "types": "./dist/internal/*.d.ts", "default": "./dist/internal/*.js" }
}
```

## Root fix
`src/multiset.ts` already re-exports `MultiSet` base surface + contexts. Confirm it does not also re-export `variant.ts` (now advanced-only).

## Naming / intentional deviations
- **Intentional deviations (document, do NOT change):**
  - `MultiSet` uses `count` for the occurrence count vs `size` for total elements and `sizeDistinct` for distinct keys — semantically justified (a counted set/bag).
  - `streamWithCounts` exposes key+count pairs — semantically justified.
  - `VariantMultiSet` is explicitly advanced (covariant read-only), hence `advanced/` not `public/`.

## Notes
- **Import fixes required:** `public/hashed.ts`, `public/sorted.ts`, and `advanced/variant.ts` may use relative `./`/`../` paths to internal files or to each other — change to `#multiset/*` (internal) and package paths. After moving, `variant.ts`'s internal imports must use `#multiset/*` (alias covers `dist/internal/**`, location-independent).
- `tsconfig.common.json` paths: add `@rimbu/multiset/hashed` → `./public/hashed.ts`, `@rimbu/multiset/sorted` → `./public/sorted.ts`, `"./*"` → `./public/*.ts`, `"./advanced/*"` → `./advanced/*.ts`, and `@rimbu/multiset/advanced/variant` → `./advanced/variant.ts`.
- `multiset` depends on `@rimbu/hashed`, `@rimbu/sorted`, `@rimbu/stream` — keep external imports.
