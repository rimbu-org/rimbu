# @rimbu/bimultimap — restructuring plan

## Current state (violations)
- `src/bimultimap.ts` (root) is the public `BiMultiMap` entry; it does not re-export the variant sub-entries `hashed.ts`/`sorted.ts` (root should expose whole surface, but variants are intentionally subpath-only — acceptable; root still covers the base BiMultiMap type).
- `src/hashed.ts`, `src/sorted.ts` are top-level public **variant** entries exposed via explicit `"./hashed"`, `"./sorted"` **and** a wildcard `"./*"` → `"./dist/*.js"` (violates B1/C1, leaks everything at `dist/*` including the variant interface files).
- `src/hashed/interface.ts` and `src/sorted/interface.ts` hold the `BiMultiMapHashed` / `BiMultiMapSorted` namespaces. They are imported by the variant entries via package subpath `@rimbu/bimultimap/hashed/interface` and are implementation detail of the variant — they must move to `internal/`.
- `src/internal/` holds base.ts, builder.ts, context-factory.ts, generic.ts, immutable.ts — correct.

## Target layout
```
src/
  bimultimap.ts          # root "."  → BiMultiMap base + contexts (whole surface)
  public/                # "./*" → dist/public/*
    hashed.ts            # @rimbu/bimultimap/hashed
    sorted.ts            # @rimbu/bimultimap/sorted
  internal/              # never exported; "#bimultimap/*" only
    base.ts
    builder.ts
    context-factory.ts
    generic.ts
    immutable.ts
    hashed-interface.ts  # (was src/hashed/interface.ts)
    sorted-interface.ts  # (was src/sorted/interface.ts)
```

## File mapping (current → target)
| Current file | Tier | New path |
|---|---|---|
| src/bimultimap.ts | root | src/bimultimap.ts (unchanged — re-exports base surface) |
| src/hashed.ts | public | src/public/hashed.ts |
| src/sorted.ts | public | src/public/sorted.ts |
| src/hashed/interface.ts | internal | src/internal/hashed-interface.ts |
| src/sorted/interface.ts | internal | src/internal/sorted-interface.ts |
| src/internal/* | internal | src/internal/* (unchanged) |

## package.json exports / imports changes
Target `exports`:
```jsonc
{
  ".": { "types": "./dist/bimultimap.d.ts", "default": "./dist/bimultimap.js" },
  "./*": { "types": "./dist/public/*.d.ts", "default": "./dist/public/*.js" }
}
```
- REMOVE explicit `"./hashed"`, `"./sorted"` (superseded by `"./*"` → `dist/public/*`).
- REMOVE the leaking `"./*"` → `"./dist/*.js"` (must point at `./dist/public/*`).
- `imports` stays:
```jsonc
{
  "#bimultimap/*": { "types": "./dist/internal/*.d.ts", "default": "./dist/internal/*.js" }
}
```

## Root fix
`src/bimultimap.ts` already re-exports `BiMultiMap` base type + contexts. Confirm it covers the whole base surface (no variant files needed at root; variants remain subpath-only per design).

## Naming / intentional deviations
- Variant interface namespaces (`BiMultiMapHashed`, `BiMultiMapSorted`) are folded into `internal/` (named `hashed-interface.ts` / `sorted-interface.ts`) and referenced via `#bimultimap/*`.
- No other naming deviations flagged.

## Notes
- **Import fix required:** `public/hashed.ts` currently imports `@rimbu/bimultimap/hashed/interface` and `public/sorted.ts` imports `@rimbu/bimultimap/sorted/interface`. After moving the interface files to `src/internal/`, change these to `#bimultimap/hashed-interface` / `#bimultimap/sorted-interface`.
- `tsconfig.common.json` paths: add `@rimbu/bimultimap/hashed` → `./public/hashed.ts`, `@rimbu/bimultimap/sorted` → `./public/sorted.ts`, and `"./*"` → `./public/*.ts`.
- Variants depend on `@rimbu/multimap/hash-key/hash-value` etc. — keep external imports intact.
