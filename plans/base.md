# @rimbu/base — restructuring plan

## Current state (violations)
- `package.json` exports only `"./*"` → `"./dist/*.js"` (wildcard leak; any `dist/*.js` reachable, including anything non-public).
- No root entry file (`src/base.ts` does not exist); the package uses a bare wildcard so every top-level file is an implicit subpath.
- All 5 source files (`arr.ts`, `entry.ts`, `plain-object.ts`, `rimbu-error.ts`, `token.ts`) currently live at `src/` top level and are treated as public — correct tier, wrong location per the lockstep `src/public/` convention.
- No `internal/` tier and no `#base/*` import alias (none needed).
- `tsconfig.common.json` maps `@rimbu/base/*` → `./src/*.ts` (must retarget to `./src/public/*.ts`).

## Target layout
```
src/
  base.ts         # root "."  → re-exports whole public surface
  public/         # "./*" → dist/public/*   (normal user API)
    arr.ts
    entry.ts
    plain-object.ts
    rimbu-error.ts
    token.ts
  advanced/       # (none)
  internal/       # (none)
```

## File mapping (current → target)
| Current file | Tier | New path |
|---|---|---|
| src/arr.ts | public | src/public/arr.ts |
| src/entry.ts | public | src/public/entry.ts |
| src/plain-object.ts | public | src/public/plain-object.ts |
| src/rimbu-error.ts | public | src/public/rimbu-error.ts |
| src/token.ts | public | src/public/token.ts |
| (new) | root | src/base.ts |

## package.json exports / imports changes
Target `exports`:
```jsonc
"exports": {
  ".": {
    "types": "./dist/base.d.ts",
    "default": "./dist/base.js"
  },
  "./*": {
    "types": "./dist/public/*.d.ts",
    "default": "./dist/public/*.js"
  }
}
```
- Remove old `"./*"` → `"./dist/*.js"`.
- No `imports` block needed (no internal tier).

`tsconfig.common.json` paths change:
```jsonc
"@rimbu/base": ["./src/base.ts"],
"@rimbu/base/*": ["./src/public/*.ts"]
```

## Root fix
Create `src/base.ts` re-exporting the entire public surface via package paths:
```ts
export * from '@rimbu/base/arr';
export * from '@rimbu/base/entry';
export * from '@rimbu/base/plain-object';
export * from '@rimbu/base/rimbu-error';
export * from '@rimbu/base/token';
```

## Naming / intentional deviations
- No obvious naming inconsistencies among the 5 files.
- **Flag (do not change now):** `entry.ts` (tuple accessors) and `plain-object.ts` (generic object utils) are generic utilities that arguably belong in `@rimbu/common` rather than `@rimbu/base`. Keep in `base` for this restructuring; document as a possible future move.

## Notes
- No relative imports exist in `src/` (verified), so no import rewrites are required inside the moved files.
- Downstream imports already use `@rimbu/base/<name>` subpaths, so the `src/public/` move is transparent at call sites.
