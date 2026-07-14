# @rimbu/typical — restructuring plan

## Current state (violations)
- Root file `src/typical.ts` exists (correct name) and re-exports the whole surface
  (`export type { U, Str, StrNum, Num }` from `#typical/*` type namespaces). Conforms to
  model A.
- `package.json` already conforms: only `"."` export, no subpath wildcards, no internal
  leak. `imports` has only `#typical/*` (correct).
- There are no public subpath files beyond the root — the package is a type-level library
  whose entire public API is the namespace re-exports from `src/internal/`.
- `src/internal/` (`num.ts`, `str.ts`, `strnum.ts`, `utils.ts`) is correctly private and
  only reachable via `#typical/*`.

This package is already largely conformant. The restructuring is minor: confirm the layout
and ensure consistency with the 3-folder shape (no `public/` folder is needed since the only
public entry is the root; `internal/` stays as-is).

## Target layout
```
src/
  typical.ts     # root "."  → re-exports whole surface (type namespaces)
  internal/      # never exported; "#typical/*" only   (private impl)
    num.ts
    str.ts
    strnum.ts
    utils.ts
```
(No `public/` or `advanced/` directories are created — the root is the sole public entry and
there are no public subpaths. This is intentional for a type-only package.)

## File mapping (current → target)
| Current file | Tier | New Path |
|---|---|---|
| src/typical.ts | root | src/typical.ts (unchanged) |
| src/internal/num.ts | internal | src/internal/num.ts |
| src/internal/str.ts | internal | src/internal/str.ts |
| src/internal/strnum.ts | internal | src/internal/strnum.ts |
| src/internal/utils.ts | internal | src/internal/utils.ts |

## package.json exports / imports changes
None required. Current:
```json
"exports": {
  ".": { "types": "./dist/typical.d.ts", "import": "./dist/typical.js" }
}
"imports": {
  "#typical/*": { "types": "./dist/internal/*.d.ts", "default": "./dist/internal/*.js" }
}
```
- No `"./*"` wildcard to remove (none present).
- No `"./internal/*"` export (none present).
- `#typical/*` import stays.

## Root fix
None. `src/typical.ts` already re-exports the whole surface:
```ts
import type * as Num from '#typical/num';
import type * as Str from '#typical/str';
import type * as StrNum from '#typical/strnum';
import type * as U from '#typical/utils';
export type { U, Str, StrNum, Num };
```

## Naming / intentional deviations
- No `public/` folder by design — the package exposes only a root type namespace surface.
  Documented as intentional (type-only library).

## Notes
- `typical` is a dependency of nothing in this batch except being depended upon elsewhere;
  no cross-package breakage expected.
- If future public subpaths are added, create `src/public/` + `"./*" → "./dist/public/*"`
  at that time.
