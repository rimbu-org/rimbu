# @rimbu/table — restructuring plan

## Current state (violations)
- `src/table.ts` (root) is the public `Table` entry.
- `src/hash-row/` (`hash-column.ts`, `sorted-column.ts`) and `src/sorted-row/` (`hash-column.ts`, `sorted-column.ts`) are **variant constructors** (implementer/extension API) sitting at top level; they belong in `advanced/` (violates C1 advanced tier).
- `src/internal/` holds base.ts, context-factory.ts, creators.ts, types.ts, variant.ts — correct.
- **Internal leak**: `exports` contains `"./*"` → `"./dist/*.js"` which exposes the `hash-row`/`sorted-row` folders *and* any stray internal file at `dist/*` (must be removed; the variant folders move to `advanced/`).

## Target layout
```
src/
  table.ts        # root "."  → Table + contexts (whole surface)
  public/         # "./*" → dist/public/*  (no separate public files today; root covers it)
  advanced/       # "./advanced/*" → dist/advanced/*
    hash-row/     # (hash-column.ts, sorted-column.ts)  @rimbu/table/advanced/hash-row/*
    sorted-row/   # (hash-column.ts, sorted-column.ts)  @rimbu/table/advanced/sorted-row/*
  internal/       # never exported; "#table/*" only
    base.ts
    context-factory.ts
    creators.ts
    types.ts
    variant.ts
```

## File mapping (current → target)
| Current file | Tier | New path |
|---|---|---|
| src/table.ts | root | src/table.ts (unchanged — re-exports whole surface) |
| src/hash-row/hash-column.ts | advanced | src/advanced/hash-row/hash-column.ts |
| src/hash-row/sorted-column.ts | advanced | src/advanced/hash-row/sorted-column.ts |
| src/sorted-row/hash-column.ts | advanced | src/advanced/sorted-row/hash-column.ts |
| src/sorted-row/sorted-column.ts | advanced | src/advanced/sorted-row/sorted-column.ts |
| src/internal/* | internal | src/internal/* (unchanged) |

## package.json exports / imports changes
Target `exports`:
```jsonc
{
  ".": { "types": "./dist/table.d.ts", "default": "./dist/table.js" },
  "./*": { "types": "./dist/public/*.d.ts", "default": "./dist/public/*.js" },
  "./advanced/*": { "types": "./dist/advanced/*.d.ts", "default": "./dist/advanced/*.js" }
}
```
- REMOVE the leaking `"./*"` → `"./dist/*.js"` (repoint at `./dist/public/*`; current public/ is empty).
- ADD `"./advanced/*"` → `dist/advanced/*`.
- `imports` stays:
```jsonc
{
  "#table/*": { "types": "./dist/internal/*.d.ts", "default": "./dist/internal/*.js" }
}
```

## Root fix
`src/table.ts` already re-exports the `Table` base surface + contexts. Confirm it does not also try to re-export the `hash-row`/`sorted-row` variant constructors (those are now advanced-only).

## Naming / intentional deviations
- Variant row constructors (`HashRowTable`, `SortedRowTable` and their column variants) are explicitly advanced (implementer-facing factory selection) — hence `advanced/` not `public/`.
- No other naming deviations flagged.

## Notes
- **Import fixes required:** files under `advanced/hash-row/` and `advanced/sorted-row/` may import internal types via relative `./`/`../` or package subpaths — change internal refs to `#table/*` (alias covers `dist/internal/**`, location-independent). Ensure cross-folder imports (`hash-row` ↔ `sorted-row`) use package paths under `@rimbu/table/advanced/...`.
- `tsconfig.common.json` paths: add `"./*"` → `./public/*.ts`, `"./advanced/*"` → `./advanced/*.ts`, and `@rimbu/table/advanced/hash-row/*` → `./advanced/hash-row/*.ts`, `@rimbu/table/advanced/sorted-row/*` → `./advanced/sorted-row/*.ts`.
- `table` depends on `@rimbu/hashed`, `@rimbu/sorted`, `@rimbu/stream` — keep external imports.
