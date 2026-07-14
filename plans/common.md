# @rimbu/common — restructuring plan

## Current state (violations)
- `package.json` exports only `"./*"` → `"./dist/*.js"` (wildcard leak).
- No root entry file (`src/common.ts` does not exist); every top-level file is an implicit subpath.
- All 11 source files currently live at `src/` top level and are public — correct tier, wrong location.
- No `internal/` tier and no `#common/*` import alias.
- `tsconfig.common.json` maps `@rimbu/common/*` → `./src/*.ts` (must retarget to `./src/public/*.ts`).
- **Naming collision:** `range.ts` (numeric `Range`) and `index-range.ts` (`IndexRange`) are two distinct, similarly-named modules — an obvious inconsistency to flag.

## Target layout
```
src/
  common.ts        # root "."  → re-exports whole public surface
  public/          # "./*" → dist/public/*   (normal user API)
    async-opt-lazy.ts
    collect.ts
    comp.ts
    eq.ts
    err.ts
    index-range.ts
    module.ts
    opt-lazy.ts
    range.ts
    traverse-state.ts
    types.ts
  advanced/        # (none)
  internal/        # (none)
```

## File mapping (current → target)
| Current file | Tier | New path |
|---|---|---|
| src/async-opt-lazy.ts | public | src/public/async-opt-lazy.ts |
| src/collect.ts | public | src/public/collect.ts |
| src/comp.ts | public | src/public/comp.ts |
| src/eq.ts | public | src/public/eq.ts |
| src/err.ts | public | src/public/err.ts |
| src/index-range.ts | public | src/public/index-range.ts |
| src/module.ts | public | src/public/module.ts |
| src/opt-lazy.ts | public | src/public/opt-lazy.ts |
| src/range.ts | public | src/public/range.ts |
| src/traverse-state.ts | public | src/public/traverse-state.ts |
| src/types.ts | public | src/public/types.ts |
| (new) | root | src/common.ts |

## package.json exports / imports changes
Target `exports`:
```jsonc
"exports": {
  ".": {
    "types": "./dist/common.d.ts",
    "default": "./dist/common.js"
  },
  "./*": {
    "types": "./dist/public/*.d.ts",
    "default": "./dist/public/*.js"
  }
}
```
- Remove old `"./*"` → `"./dist/*.js"`.
- No `imports` block needed.

`tsconfig.common.json` paths change:
```jsonc
"@rimbu/common": ["./src/common.ts"],
"@rimbu/common/*": ["./src/public/*.ts"]
```

## Root fix
Create `src/common.ts` re-exporting the entire public surface:
```ts
export * from '@rimbu/common/async-opt-lazy';
export * from '@rimbu/common/collect';
export * from '@rimbu/common/comp';
export * from '@rimbu/common/eq';
export * from '@rimbu/common/err';
export * from '@rimbu/common/index-range';
export * from '@rimbu/common/module';
export * from '@rimbu/common/opt-lazy';
export * from '@rimbu/common/range';
export * from '@rimbu/common/traverse-state';
export * from '@rimbu/common/types';
```

## Naming / intentional deviations
- **Obvious inconsistency to document:** `range.ts` (`Range` — numeric/value range) vs `index-range.ts` (`IndexRange` — positional index range) are similarly named but serve different purposes. Per rule D1, do NOT rename; document the distinction in the package README / docs so users don't confuse them.

## Notes
- No relative imports exist in `src/` (verified), so no internal import rewrites are needed.
- Subpaths such as `@rimbu/common/eq`, `@rimbu/common/opt-lazy` are used widely; the `src/public/` move keeps those subpaths intact.
