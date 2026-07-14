# @rimbu/task — restructuring plan

## Current state (violations)
- Root file `src/task.ts` exists (correct name) but only exports `Task` + error classes;
  it does NOT re-export `ops`, `modifiers`, `utils`, or `ops-impl`. Target model A requires
  the root to re-export the WHOLE public surface.
- `package.json` uses explicit `"./ops"`, `"./ops-impl"`, `"./modifiers"`, `"./utils"`
  subpath entries instead of the `"./*"` / `"./advanced/*"` wildcards (model B1).
- `ops-impl.ts` (implementer-facing primitive ops) is currently an explicit top-level
  subpath; it belongs in the `advanced/` tier, not `public/`.
- There is a name clash risk: `src/utils.ts` (public) and `src/internal/utils.ts`
  (private) share the basename `utils`. The internal one must be renamed to avoid the clash.
- `src/internal/` is correctly private and only reachable via `#task/*`.

## Target layout
```
src/
  task.ts        # root "."  → re-exports whole surface (public + advanced)
  public/        # "./*" → dist/public/*   (normal user API)
    ops.ts
    modifiers.ts
    utils.ts
  advanced/      # "./advanced/*" → dist/advanced/*   (implementer/extension API)
    ops-impl.ts
  internal/      # never exported; "#task/*" only   (private impl)
    task-context-impl.ts
    task-module.ts
    task-utils.ts        # renamed from internal/utils.ts
```

## File mapping (current → target)
| Current file | Tier | New Path |
|---|---|---|
| src/task.ts | root | src/task.ts (add re-exports of public + advanced) |
| src/ops.ts | public | src/public/ops.ts |
| src/modifiers.ts | public | src/public/modifiers.ts |
| src/utils.ts | public | src/public/utils.ts |
| src/ops-impl.ts | advanced | src/advanced/ops-impl.ts |
| src/internal/task-context-impl.ts | internal | src/internal/task-context-impl.ts |
| src/internal/task-module.ts | internal | src/internal/task-module.ts |
| src/internal/utils.ts | internal | src/internal/task-utils.ts (rename) |

## package.json exports / imports changes
Target `exports`:
```json
"exports": {
  ".":           { "types": "./dist/task.d.ts", "default": "./dist/task.js" },
  "./*":         { "types": "./dist/public/*.d.ts", "default": "./dist/public/*.js" },
  "./advanced/*":{ "types": "./dist/advanced/*.d.ts", "default": "./dist/advanced/*.js" }
}
```
Target `imports`:
```json
"imports": {
  "#task/*": { "types": "./dist/internal/*.d.ts", "default": "./dist/internal/*.js" }
}
```
- REMOVE explicit `"./ops"`, `"./ops-impl"`, `"./modifiers"`, `"./utils"`.
- ADD `"./*" → "./dist/public/*"` and `"./advanced/*" → "./dist/advanced/*"`.
- KEEP `#task/*` import.

## Root fix
`src/task.ts` must re-export the whole surface. Add:
```ts
export * from '@rimbu/task/ops';
export * from '@rimbu/task/modifiers';
export * from '@rimbu/task/utils';
export * from '@rimbu/task/advanced/ops-impl';
```
Subpaths resolve via the new wildcards (`dist/public/*`, `dist/advanced/*`).

## Naming / intentional deviations
- `ops-impl.ts`: the `-impl` suffix contradicts the package convention where `impl` files
  are private. Here `ops-impl` is a PUBLIC (advanced) API of primitive ops. Renaming the
  public subpath `@rimbu/task/ops-impl` → `@rimbu/task/advanced/ops` would be a BREAKING
  change, so we keep the basename `ops-impl.ts` but move it into `src/advanced/`. Flag this
  as an intentional deviation (document, do not rename the public subpath).
- Internal `utils.ts` renamed to `task-utils.ts` to avoid the basename clash with public
  `utils.ts`. Update all `#task/utils` references to `#task/task-utils`.

## Notes
- `task.ts` imports `#task/utils` (the internal one) → must become `#task/task-utils`
  after the rename.
- `@rimbu/channel` dependency unchanged.
- `tsconfig.common.json` must add paths so `@rimbu/task/<sub>` and
  `@rimbu/task/advanced/<sub>` resolve to `./public/<sub>.ts` / `./advanced/<sub>.ts`.
