# @rimbu/actor — restructuring plan

## Current state (violations)
- Root file `src/actor.ts` exists (correct name) and defines `Actor` + error types, but does
  NOT re-export `Action` or `Slice`. Target model A: root re-exports `Actor` + `Action` +
  `Slice` (React hooks stay subpath-only).
- `package.json` has a `"./*": { "types": "./dist/*.d.ts", "default": "./dist/*.js" }`
  wildcard that exposes `action.ts` and `slice.ts` as subpaths "accidentally" (model B1
  requires `"./*" → "./dist/public/*"`).
- `action.ts`, `slice.ts`, `use-immer.ts`, `use-patch.ts` sit at the package root instead of
  `src/public/` (model C1). The two React hooks must remain subpath-only (not re-exported
  from root), but still belong in `public/`.
- `src/internal/` is correctly private and only reachable via `#actor/*`.

## Target layout
```
src/
  actor.ts       # root "."  → re-exports Actor + Action + Slice (NOT React hooks)
  public/        # "./*" → dist/public/*   (normal user API)
    action.ts
    slice.ts
    use-immer.ts     # public subpath, NOT re-exported from root
    use-patch.ts     # public subpath, NOT re-exported from root
  internal/      # never exported; "#actor/*" only   (private impl)
    action-base.ts
    lookup.ts
    slice-config.ts
    utils.ts
```

## File mapping (current → target)
| Current file | Tier | New Path |
|---|---|---|
| src/actor.ts | root | src/actor.ts (add Action + Slice re-exports) |
| src/action.ts | public | src/public/action.ts |
| src/slice.ts | public | src/public/slice.ts |
| src/use-immer.ts | public | src/public/use-immer.ts |
| src/use-patch.ts | public | src/public/use-patch.ts |
| src/internal/action-base.ts | internal | src/internal/action-base.ts |
| src/internal/lookup.ts | internal | src/internal/lookup.ts |
| src/internal/slice-config.ts | internal | src/internal/slice-config.ts |
| src/internal/utils.ts | internal | src/internal/utils.ts |

## package.json exports / imports changes
Target `exports`:
```json
"exports": {
  ".":   { "types": "./dist/actor.d.ts", "default": "./dist/actor.js" },
  "./*": { "types": "./dist/public/*.d.ts", "default": "./dist/public/*.js" }
}
```
Target `imports`:
```json
"imports": {
  "#actor/*": { "types": "./dist/internal/*.d.ts", "default": "./dist/internal/*.js" }
}
```
- REPLACE `"./*" → "./dist/*"` with `"./*" → "./dist/public/*"`.
- REMOVE the now-redundant explicit `"./use-immer"` and `"./use-patch"` entries (covered by
  the wildcard). If you prefer to keep them explicit, keep them but they are optional.
- KEEP `#actor/*` import.

## Root fix
`src/actor.ts` must re-export `Action` and `Slice` (but NOT the React hooks):
```ts
export * from '@rimbu/actor/action';
export * from '@rimbu/actor/slice';
```
`use-immer` / `use-patch` remain importable as `@rimbu/actor/use-immer` and
`@rimbu/actor/use-patch` (via the wildcard) but are deliberately absent from the root
re-export (React hooks subpath-only, per model A).

## Naming / intentional deviations
- React hooks kept subpath-only (intentional, per locked model A).
- `internal/action-base.ts` is a private base type (not the public `action.ts`); correct.

## Notes
- `actor.ts` imports `#actor/action-base` (the private base) — unaffected by the move.
- `devDependencies`/`optionalDependencies` (deep, spy, stream, immer, happy-dom) unchanged.
- `tsconfig.common.json` must add a path so `@rimbu/actor/<sub>` resolves to
  `./public/<sub>.ts` for in-package typechecking.
