# @rimbu/multimap — restructuring plan

## Current state (violations)
- `src/multimap.ts` (root) is the public `MultiMap` entry.
- `src/variant.ts` is the **`VariantMultiMap`** read-only covariant tier (implementer/extension API) and is exposed at top level; it belongs in `advanced/`, not top-level public (violates C1 advanced tier).
- `src/hash-key/` (`hash-value.ts`, `sorted-value.ts`) and `src/sorted-key/` (`hash-value.ts`, `sorted-value.ts`) are **key-type implementations** — private impl that must move to `internal/`.
- `src/internal/` holds base.ts, context-factory.ts, creators.ts, types.ts — correct.
- **Internal leak**: `exports` contains `"./*"` → `"./dist/*.js"` which would expose `variant.ts` AND the `hash-key`/`sorted-key` impl (must be removed/repointed).

## Target layout
```
src/
  multimap.ts     # root "."  → MultiMap + contexts (whole surface)
  public/         # "./*" → dist/public/*  (no separate public files today; root covers it)
  advanced/       # "./advanced/*" → dist/advanced/*
    variant.ts    # @rimbu/multimap/advanced/variant  (VariantMultiMap implementer API)
  internal/       # never exported; "#multimap/*" only
    base.ts
    context-factory.ts
    creators.ts
    types.ts
    hash-key/     # (hash-value.ts, sorted-value.ts)
    sorted-key/   # (hash-value.ts, sorted-value.ts)
```

## File mapping (current → target)
| Current file | Tier | New path |
|---|---|---|
| src/multimap.ts | root | src/multimap.ts (unchanged — re-exports whole surface) |
| src/variant.ts | advanced | src/advanced/variant.ts |
| src/hash-key/hash-value.ts | internal | src/internal/hash-key/hash-value.ts |
| src/hash-key/sorted-value.ts | internal | src/internal/hash-key/sorted-value.ts |
| src/sorted-key/hash-value.ts | internal | src/internal/sorted-key/hash-value.ts |
| src/sorted-key/sorted-value.ts | internal | src/internal/sorted-key/sorted-value.ts |
| src/internal/* | internal | src/internal/* (unchanged) |

## package.json exports / imports changes
Target `exports`:
```jsonc
{
  ".": { "types": "./dist/multimap.d.ts", "default": "./dist/multimap.js" },
  "./*": { "types": "./dist/public/*.d.ts", "default": "./dist/public/*.js" },
  "./advanced/*": { "types": "./dist/advanced/*.d.ts", "default": "./dist/advanced/*.js" }
}
```
- REMOVE the leaking `"./*"` → `"./dist/*.js"` (must point at `./dist/public/*` for any future public subpaths; current public/ is empty).
- ADD `"./advanced/*"` → `dist/advanced/*`.
- `imports` stays:
```jsonc
{
  "#multimap/*": { "types": "./dist/internal/*.d.ts", "default": "./dist/internal/*.js" }
}
```

## Root fix
`src/multimap.ts` already re-exports the `MultiMap` base surface + contexts. Confirm it does not also try to re-export `variant.ts` (that is now advanced-only).

## Naming / intentional deviations
- **Intentional deviation (document, do NOT change):** `MultiMap` uses `setValues` / `addValues` (key → collection semantics) rather than `set`/`add` parity with `Map`. This is semantically justified (a key maps to a *collection* of values). Do not force rename.
- `VariantMultiMap` is explicitly advanced (covariant read-only), hence `advanced/` not `public/`.

## Notes
- **Import fixes required:** files under `hash-key/` and `sorted-key/` import from `#multimap/*` (internal) — keep. `variant.ts` may import internal types via `#multimap/*`; after moving `variant.ts` to `advanced/`, ensure its internal imports still use `#multimap/*` (the alias covers `dist/internal/**`, independent of file location) — no change needed provided it doesn't use relative `./`/`../` paths.
- `tsconfig.common.json` paths: add `"./*"` → `./public/*.ts`, `"./advanced/*"` → `./advanced/*.ts`, and `@rimbu/multimap/advanced/variant` → `./advanced/variant.ts`.
- `multimap` depends on `@rimbu/collection-types`, `@rimbu/hashed`, `@rimbu/sorted`, `@rimbu/stream` — keep external imports.
