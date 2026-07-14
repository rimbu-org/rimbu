# @rimbu/core — restructuring plan

## Current state (violations)
- `package.json` exports `.` and `"./*"` → `"./dist/*.js"`. The `"./*"` wildcard exposes every top-level `src/*.ts` file as a subpath — acceptable for an umbrella of public re-exports, but the lockstep model prefers **explicit scoped subpaths mirroring subpackages** (no catch-all wildcard).
- `src/core.ts` re-exports subpackages via `@rimbu/core/<name>`. It does `export * from '@rimbu/core/collection-types'`, but **does NOT surface `@rimbu/collection-types`' HKT/`./common` helpers** (`KeyValue`, `WithElem`, `Elem`, `ModifyOptions`, `VariantMap`, `VariantSet`, etc.). After collection-types moves those to `./advanced`, core should surface them.
- `src/collection-types.ts` currently only does `export * from '@rimbu/collection-types'` (root). It must also re-export `@rimbu/collection-types/advanced` so the HKT helpers are visible through core.
- No `internal/` folder exists in core (umbrella only) — confirmed. So no internal tier to create.
- `tsconfig.common.json` maps `@rimbu/core` → `./src/core.ts` and `@rimbu/core/*` → `./src/*.ts`; the `*` mapping can remain for internal cross-file type resolution even after `exports` is made explicit.

## Target layout
```
src/
  core.ts              # root "."  → re-exports all subpackages + their advanced surfaces
  bimap.ts             # subpath @rimbu/core/bimap        (public re-export)
  bimultimap.ts        # subpath @rimbu/core/bimultimap
  collection-types.ts  # subpath @rimbu/core/collection-types  (+ advanced surfaced)
  common.ts            # subpath @rimbu/core/common
  deep.ts              # subpath @rimbu/core/deep
  graph.ts             # subpath @rimbu/core/graph
  hashed.ts            # subpath @rimbu/core/hashed
  list.ts              # subpath @rimbu/core/list
  multimap.ts          # subpath @rimbu/core/multimap
  multiset.ts          # subpath @rimbu/core/multiset
  sorted.ts            # subpath @rimbu/core/sorted
  stream.ts            # subpath @rimbu/core/stream
  public/              # (none — core subpaths are the public surface)
  advanced/            # (none at core level)
  internal/            # (none)
```

## File mapping (current → target)
| Current file | Tier | New path |
|---|---|---|
| src/core.ts | root | src/core.ts (edit to surface advanced) |
| src/bimap.ts | public (subpath) | src/bimap.ts (unchanged) |
| src/bimultimap.ts | public (subpath) | src/bimultimap.ts (unchanged) |
| src/collection-types.ts | public (subpath) | src/collection-types.ts (edit to add advanced re-export) |
| src/common.ts | public (subpath) | src/common.ts (unchanged) |
| src/deep.ts | public (subpath) | src/deep.ts (unchanged) |
| src/graph.ts | public (subpath) | src/graph.ts (unchanged) |
| src/hashed.ts | public (subpath) | src/hashed.ts (unchanged) |
| src/list.ts | public (subpath) | src/list.ts (unchanged) |
| src/multimap.ts | public (subpath) | src/multimap.ts (unchanged) |
| src/multiset.ts | public (subpath) | src/multiset.ts (unchanged) |
| src/sorted.ts | public (subpath) | src/sorted.ts (unchanged) |
| src/stream.ts | public (subpath) | src/stream.ts (unchanged) |

No files are moved; the change is in `exports` (explicit subpaths) and two re-export edits.

## package.json exports / imports changes
Target `exports` (explicit scoped subpaths mirroring subpackages; remove the `"./*"` wildcard):
```jsonc
"exports": {
  ".": { "types": "./dist/core.d.ts", "default": "./dist/core.js" },
  "./bimap": { "types": "./dist/bimap.d.ts", "default": "./dist/bimap.js" },
  "./bimultimap": { "types": "./dist/bimultimap.d.ts", "default": "./dist/bimultimap.js" },
  "./collection-types": { "types": "./dist/collection-types.d.ts", "default": "./dist/collection-types.js" },
  "./collection-types/advanced": { "types": "./dist/collection-types.d.ts", "default": "./dist/collection-types.js" },
  "./common": { "types": "./dist/common.d.ts", "default": "./dist/common.js" },
  "./deep": { "types": "./dist/deep.d.ts", "default": "./dist/deep.js" },
  "./graph": { "types": "./dist/graph.d.ts", "default": "./dist/graph.js" },
  "./hashed": { "types": "./dist/hashed.d.ts", "default": "./dist/hashed.js" },
  "./list": { "types": "./dist/list.d.ts", "default": "./dist/list.js" },
  "./multimap": { "types": "./dist/multimap.d.ts", "default": "./dist/multimap.js" },
  "./multiset": { "types": "./dist/multiset.d.ts", "default": "./dist/multiset.js" },
  "./sorted": { "types": "./dist/sorted.d.ts", "default": "./dist/sorted.js" },
  "./stream": { "types": "./dist/stream.d.ts", "default": "./dist/stream.js" }
}
```
- **Remove** the `"./*"` → `"./dist/*.js"` wildcard.
- No `imports` block required at core level (no internal tier).

`tsconfig.common.json` can keep:
```jsonc
"@rimbu/core": ["./src/core.ts"],
"@rimbu/core/*": ["./src/*.ts"]
```
This is still valid for internal resolution; the explicit `exports` entries control the published surface.

## Root fix
1. `src/collection-types.ts` — add the advanced surface so HKT helpers are reachable through core:
   ```ts
   export * from '@rimbu/collection-types';
   export * from '@rimbu/collection-types/advanced';
   ```
   (Requires `@rimbu/collection-types/advanced` to be a valid export — see collection-types plan. Resolves post-build via package `exports`; add a `tsconfig.common.json` path if pre-build typecheck is needed: `"@rimbu/collection-types/advanced/*": ["./../collection-types/src/advanced/*.ts", "./../collection-types/src/advanced/*"]`.)
2. `src/core.ts` — unchanged beyond existing `export * from '@rimbu/core/collection-types'`; the advanced helpers now flow through via the edited `collection-types.ts`.

## Naming / intentional deviations
- Core is an umbrella with no `public/`/`advanced/`/`internal/` split of its own; its "public surface" is the set of subpackage re-export files. The lockstep `src/public/` convention does not apply here because core has no implementation files.
- `./collection-types/advanced` reuses `collection-types.ts` (same file) as a convenience alias so callers can `import ... from '@rimbu/core/collection-types/advanced'`. Document as intentional.

## Notes
- No source files move; this is a low-risk package-json/manifest change plus two re-export edits.
- The explicit subpath list must stay in sync with the 12 subpackage re-export files; if a new subpackage is added to core, add its explicit export entry.
- After collection-types' breaking rename (`@rimbu/collection-types/common` → `advanced/common`), core consumers gain the HKT helpers at the core root automatically — a net improvement over current state.
