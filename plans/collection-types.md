# @rimbu/collection-types — restructuring plan

## Current state (violations)
- `package.json` exports `.`, `./common`, and `"./*"` → `"./dist/*.js"`. The `"./*"` wildcard **leaks internal** files (e.g. `dist/map/base.js`, `dist/internal/**`) because `src/map/`, `src/set/`, and `src/internal/` are all at `src/` top level.
- Entry files use **banned relative `./internal/...` imports** that must become the `#collection-types/*` alias:
  - `src/collection-types.ts:13-16` → `./internal/map/types/generic|variant`, `./internal/set/types/generic|variant`
  - `src/common.ts:1,3` → `./internal/common/types`, `./internal/common/utils`
- `common.ts` (the file, holding `KeyValue`/`WithElem`/`Elem`/`ModifyOptions` HKT helpers) and the `common/` folder (with `empty-base.ts`) both live at `src/` top level, colliding conceptually with the `./common` subpath.
- `map/base.ts`, `map/base-module.ts`, `set/base.ts`, `set/base-module.ts` are implementer bases living at `src/` top level (reachable via the `"./*"` leak as `@rimbu/collection-types/map/base`).
- `internal/` holds the HKT machinery (`common/types.ts`, `common/utils.ts`, `map/types/generic.ts`, `map/types/variant.ts`, `set/types/generic.ts`, `set/types/variant.ts`) which is currently re-exported publicly through root and `./common` — it must stay internal and be surfaced only through `advanced/` re-exports.

## Target layout
```
src/
  collection-types.ts        # root "."  → re-exports whole surface (advanced + internal HKT via alias)
  advanced/                  # "./advanced/*" → dist/advanced/*   (implementer/extension API)
    common.ts                # (from src/common.ts) KeyValue/WithElem/Elem/ModifyOptions
    common/empty-base.ts     # (from src/common/empty-base.ts)
    map/base.ts              # (from src/map/base.ts)
    map/base-module.ts       # (from src/map/base-module.ts)
    set/base.ts              # (from src/set/base.ts)
    set/base-module.ts       # (from src/set/base-module.ts)
  internal/                  # NEVER exported; "#collection-types/*" only
    common/types.ts
    common/utils.ts
    map/types/generic.ts
    map/types/variant.ts
    set/types/generic.ts
    set/types/variant.ts
```

## File mapping (current → target)
| Current file | Tier | New path |
|---|---|---|
| src/collection-types.ts | root | src/collection-types.ts (edit imports) |
| src/common.ts | advanced | src/advanced/common.ts |
| src/common/empty-base.ts | advanced | src/advanced/common/empty-base.ts |
| src/map/base.ts | advanced | src/advanced/map/base.ts |
| src/map/base-module.ts | advanced | src/advanced/map/base-module.ts |
| src/set/base.ts | advanced | src/advanced/set/base.ts |
| src/set/base-module.ts | advanced | src/advanced/set/base-module.ts |
| src/internal/common/types.ts | internal | src/internal/common/types.ts (unchanged) |
| src/internal/common/utils.ts | internal | src/internal/common/utils.ts (unchanged) |
| src/internal/map/types/generic.ts | internal | src/internal/map/types/generic.ts (unchanged) |
| src/internal/map/types/variant.ts | internal | src/internal/map/types/variant.ts (unchanged) |
| src/internal/set/types/generic.ts | internal | src/internal/set/types/generic.ts (unchanged) |
| src/internal/set/types/variant.ts | internal | src/internal/set/types/variant.ts (unchanged) |

## package.json exports / imports changes
Target `exports`:
```jsonc
"exports": {
  ".": {
    "types": "./dist/collection-types.d.ts",
    "default": "./dist/collection-types.js"
  },
  "./advanced/*": {
    "types": "./dist/advanced/*.d.ts",
    "default": "./dist/advanced/*.js"
  }
}
```
- **Remove** `"./common"` and the `"./*"` wildcard leak.
- Keep `imports`:
```jsonc
"imports": {
  "#collection-types/*": {
    "types": "./dist/internal/*.d.ts",
    "default": "./dist/internal/*.js"
  }
}
```

`tsconfig.common.json` paths:
```jsonc
"@rimbu/collection-types": ["./src/collection-types.ts"],
"@rimbu/collection-types/advanced": ["./src/advanced.ts"],   // optional aggregator
"@rimbu/collection-types/advanced/*": ["./src/advanced/*.ts", "./src/advanced/*"],
"#collection-types/*": ["./src/internal/*.ts", "./src/internal/*"]
```

## Root fix
`src/collection-types.ts` currently re-exports HKT types via relative `./internal/...`. Change to:
```ts
export type * from '#collection-types/map/types/generic';
export type * from '#collection-types/map/types/variant';
export type * from '#collection-types/set/types/generic';
export type * from '#collection-types/set/types/variant';
```
`src/advanced/common.ts` (formerly `common.ts`) changes its relative imports to the alias:
```ts
export type * from '#collection-types/common/types';
export * from '#collection-types/common/utils';
```
This keeps the HKT machinery physically `internal/` (never exported by its own name) while still surfacing it through root `.` and `./advanced/*`.

## Naming / intentional deviations
- **`common.ts` file vs `common/` folder:** kept as-is (now `advanced/common.ts` and `advanced/common/empty-base.ts`). The `./common` subpath is renamed to `./advanced/common` per the advanced-tier rule; documented below as a breaking import change.
- No other obvious inconsistencies.

## Notes
- **BREAKING downstream change (major risk):** many packages import `@rimbu/collection-types/common` and `@rimbu/collection-types/common/empty-base`, and `@rimbu/collection-types/map/base`, `@rimbu/collection-types/set/base` (plus `*/base-module` and `VariantMapBase`/`VariantSetBase`). After this change these become `@rimbu/collection-types/advanced/common`, `@rimbu/collection-types/advanced/common/empty-base`, `@rimbu/collection-types/advanced/map/base`, `@rimbu/collection-types/advanced/set/base`, etc. A repo-wide import rewrite is required (hashed, sorted, ordered, multimap, multimap, bimultimap, graph, table, core, and test files).
- There is also an existing **unexported** usage `@rimbu/collection-types/test-utils/...` in tests (e.g. `runSetTestsWith`, `runMapRandomTestsWith`). `test-utils` is not in current `exports` and is out of scope for this tiering; flag separately for a follow-up (it needs its own explicit export or to live under `internal`/test-only path).
- `@rimbu/collection-types` (root) must continue to surface `RMap`, `RSet`, `VariantMap`, `VariantSet` etc. (re-exported via the `#collection-types/*` alias), so the root `.` surface is preserved.
