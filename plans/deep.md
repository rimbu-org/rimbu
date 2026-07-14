# @rimbu/deep — restructuring plan

## Current state (violations)
- Root file `src/deep.ts` exists (correct name) but does NOT re-export `match`, `patch`,
  `path`, `select`, `tuple` from the root (only `protected`, `with-type`, and its own helpers
  `protect`/`getAt`). Target model A requires the root to re-export the WHOLE public surface.
- `package.json` `exports` uses `"./*": { "types": "./dist/*.d.ts", "default": "./dist/*.js" }`
  (model B1 requires `"./*" → "./dist/public/*"`).
- Public modules (`match.ts`, `patch.ts`, `path.ts`, `protected.ts`, `select.ts`,
  `tuple.ts`, `with-type.ts`) sit at the package root instead of `src/public/` (model C1).
- `package.json` `imports` defines a redundant `#private/*` alias that duplicates `#deep/*`
  (both point at `dist/internal/*`). `src/deep.ts` and `src/patch.ts` import
  `stringSplit` from `#private/string-split`; this must be folded into `#deep/*`.

## Target layout
```
src/
  deep.ts        # root "."  → re-exports whole surface
  public/        # "./*" → dist/public/*   (normal user API)
    match.ts
    patch.ts
    path.ts
    protected.ts
    select.ts
    tuple.ts
    with-type.ts
  internal/      # never exported; "#deep/*" only   (private impl)
    match-internal.ts
    path-internal.ts
    string-split.ts
```

## File mapping (current → target)
| Current file | Tier | New Path |
|---|---|---|
| src/deep.ts | root | src/deep.ts (add public re-exports; fix #private → #deep) |
| src/match.ts | public | src/public/match.ts |
| src/patch.ts | public | src/public/patch.ts |
| src/path.ts | public | src/public/path.ts |
| src/protected.ts | public | src/public/protected.ts |
| src/select.ts | public | src/public/select.ts |
| src/tuple.ts | public | src/public/tuple.ts |
| src/with-type.ts | public | src/public/with-type.ts |
| src/internal/match-internal.ts | internal | src/internal/match-internal.ts |
| src/internal/path-internal.ts | internal | src/internal/path-internal.ts |
| src/internal/string-split.ts | internal | src/internal/string-split.ts |

## package.json exports / imports changes
Target `exports`:
```json
"exports": {
  ".":   { "types": "./dist/deep.d.ts", "import": "./dist/deep.js" },
  "./*": { "types": "./dist/public/*.d.ts", "default": "./dist/public/*.js" }
}
```
Target `imports`:
```json
"imports": {
  "#deep/*": { "types": "./dist/internal/*.d.ts", "default": "./dist/internal/*.js" }
}
```
- REPLACE `"./*" → "./dist/*"` with `"./*" → "./dist/public/*"`.
- REMOVE the redundant `"./internal/*"`-style exposure (none currently) and ensure no
  `dist/internal/**` is exported (already the case — internal is only via `#deep/*`).
- REMOVE the `#private/*` import alias entirely; fold into `#deep/*`.

## Root fix
`src/deep.ts` must re-export the whole public surface. It already does
`export type * from '@rimbu/deep/protected'` and `withType`. Add the remaining public
subpaths so the root exposes Match / Patch / Path / Select / Tuple too:
```ts
export * from '@rimbu/deep/match';
export * from '@rimbu/deep/patch';
export * from '@rimbu/deep/path';
export * from '@rimbu/deep/select';
export * from '@rimbu/deep/tuple';
```
Also change `#private/string-split` → `#deep/string-split` in `src/deep.ts` and
`src/patch.ts`.

## Naming / intentional deviations
- `#private/*` was a redundant alias for `#deep/*` — folded in (no behavior change).
- `internal/` files (`match-internal.ts`, `path-internal.ts`, `string-split.ts`) are
  correctly private; no changes beyond the alias fix.

## Notes
- `deep.ts` and `patch.ts` currently use `@rimbu/deep/path`, `@rimbu/deep/protected` and
  `#private/string-split` — all continue to resolve after the move (public via wildcard,
  internal via `#deep/*`).
- `tsconfig.common.json` must add a path so `@rimbu/deep/<sub>` resolves to
  `./public/<sub>.ts` for in-package typechecking.
