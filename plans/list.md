# @rimbu/list — restructuring plan

## Current state (violations)
- Root file `src/list.ts` exists (correct name) but does NOT re-export the public variant
  files `char.ts`, `bit.ts`, `typed-array.ts` — so `@rimbu/list` only exposes `List`.
  Target model A requires the root to re-export the WHOLE public surface.
- `package.json` uses explicit `"./char"`, `"./bit"`, `"./typed-array"` subpath entries
  instead of the `"./*" → "./dist/public/*"` wildcard (model B1).
- `package.json` has an explicit `"./internal/*"` export that LEAKS the entire
  `src/internal/` block-tree implementation to consumers (must be removed).
- `src/char.ts`, `src/bit.ts`, `src/typed-array.ts` sit at the package top level
  instead of under `src/public/` (model C1).
- `src/internal/` (block-tree impl) is correctly private but is reachable via the leaked
  `"./internal/*"` export — once removed it is only reachable through `#list/*`.

## Target layout
```
src/
  list.ts        # root "."  → re-exports List + CharList/BitList/TypedArrayList
  public/        # "./*" → dist/public/*   (normal user API)
    char.ts
    bit.ts
    typed-array.ts
  internal/      # never exported; "#list/*" only   (private impl)
    bit-list-helpers.ts
    char-list-helpers.ts
    char-list-impl.ts
    context-module.ts
    list-base.ts
    list-helpers.ts
    list-impl.ts
    immutable/  (cache-map, empty, inner-block, inner-tree, outer-base,
                outer-block, outer-tree, reversed-outer-block, tree-base, utils)
    mutable/    (builder-base, builder, inner-block-builder, inner-tree-builder,
                outer-block-builder, outer-tree-builder, tree-builder)
```

## File mapping (current → target)
| Current file | Tier | New Path |
|---|---|---|
| src/list.ts | root | src/list.ts (add re-exports of public variants) |
| src/char.ts | public | src/public/char.ts |
| src/bit.ts | public | src/public/bit.ts |
| src/typed-array.ts | public | src/public/typed-array.ts |
| src/internal/bit-list-helpers.ts | internal | src/internal/bit-list-helpers.ts |
| src/internal/char-list-helpers.ts | internal | src/internal/char-list-helpers.ts |
| src/internal/char-list-impl.ts | internal | src/internal/char-list-impl.ts |
| src/internal/context-module.ts | internal | src/internal/context-module.ts |
| src/internal/list-base.ts | internal | src/internal/list-base.ts |
| src/internal/list-helpers.ts | internal | src/internal/list-helpers.ts |
| src/internal/list-impl.ts | internal | src/internal/list-impl.ts |
| src/internal/immutable/* (10 files) | internal | src/internal/immutable/* |
| src/internal/mutable/* (7 files) | internal | src/internal/mutable/* |

## package.json exports / imports changes
Target `exports`:
```json
"exports": {
  ".":        { "types": "./dist/list.d.ts", "default": "./dist/list.js" },
  "./*":      { "types": "./dist/public/*.d.ts", "default": "./dist/public/*.js" }
}
```
Target `imports`:
```json
"imports": {
  "#list/*":  { "types": "./dist/internal/*.d.ts", "default": "./dist/internal/*.js" },
  "#test/*":  { "default": "./test/*.ts" }
}
```
- REMOVE explicit `"./char"`, `"./bit"`, `"./typed-array"` (replaced by wildcard).
- REMOVE `"./internal/*"` entirely (was leaking the implementation).
- KEEP `#list/*` and `#test/*` imports.

## Root fix
`src/list.ts` must re-export the whole public surface. Add (after the existing `List`
definitions):
```ts
export * from '@rimbu/list/char';
export * from '@rimbu/list/bit';
export * from '@rimbu/list/typed-array';
```
These resolve via the `"./*"` wildcard to `dist/public/*`. (No naming clashes expected:
`CharList`, `BitList`, `TypedArrayList` are distinct names.)

## Naming / intentional deviations
- `CharList`/`BitList`/`TypedArrayList` are legitimate distinct public variants; keeping
  them as `public/char.ts` etc. with subpaths `@rimbu/list/char` is intentional.
- `internal/` block-tree files are correctly named; no changes.

## Notes
- Subpath consumers (`@rimbu/list/char`) keep working via the wildcard.
- Root re-export is a behavior ADD (currently only `List` is exported from root). Confirm
  this does not create duplicate identifiers before merging.
- `tsconfig.common.json` must add a path so `@rimbu/list/<sub>` resolves to
  `./public/<sub>.ts` for in-package typechecking.
