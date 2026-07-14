# @rimbu/proximity — Package Agent Guide

This package provides Rimbu's **immutable `ProximityMap`**: a map whose `get()`
does a nearest-key lookup using a configurable `DistanceFunction` instead of exact
key equality. It is backed internally by a `HashMap` of `[key, value]` entries.

> For workspace-wide conventions (biome rules, `build:seq` before typecheck/test,
> the Interface + Namespace pattern, HKT `Types` slots, NonEmpty tracking,
> `OptLazy`, `RelatedTo`, and the changeset workflow) see the **root `AGENTS.md`**.
> This file only covers what is specific to `@rimbu/proximity`.

## Source layout

```
src/
├── proximity.ts   # exports["."]             — ProximityMap interface + creators
├── public/        # exports["./*"]           — public subpaths (dist/public/*)
│   ├── distance-function.ts  # @rimbu/proximity/distance-function
│   └── key-matching.ts      # @rimbu/proximity/key-matching
└── internal/        # NEVER exported; "#proximity/*" only
    ├── builder.ts
    ├── context-factory.ts
    ├── creators.ts
    ├── empty.ts
    ├── non-empty.ts
    └── wrapping.ts
```

### Restructure note

Previously `distance-function.ts` and `key-matching.ts` sat at `src/` root and were
leaked by the `"./*" → "./dist/*.js"` wildcard export (exposing every top-level
source file, including any stray internal). They are user-facing config types
consumed by `ProximityMap` contexts, so they were moved under `src/public/` and the
wildcard export was repointed to `"./*" → "./dist/public/*"`. `internal/` remains
unreachable. `tsconfig.common.json` was updated so `@rimbu/proximity/*` resolves to
`src/public/*`.

### Key rule: imports inside `src/`
- Use the package alias `#proximity/*` for anything in `src/internal/*`.
- Use `@rimbu/proximity/distance-function` and `@rimbu/proximity/key-matching`
  (package sub-paths) for the public config types, even from `proximity.ts`.
- Use `@rimbu/collection-types`, `@rimbu/hashed`, `@rimbu/stream`, `@rimbu/common`,
  `@rimbu/base` for dependencies.

## Architecture

- **`ProximityMap<K, V>`** (`proximity.ts`) — extends `RMapBase<K, V, ProximityMap.Types>`.
  The `get(key)` performs a linear scan via `findNearestKeyMatch`, returning the value
  of the closest key (finite distance); optimized `DistanceFunction`s can short-circuit.
- **`ProximityMap.Context<UK>`** holds the `DistanceFunction<UK>` and the backing
  `HashMap.Context<UK>`.
- **Implementations** (`internal/non-empty.ts`, `empty.ts`, `builder.ts`, `wrapping.ts`)
  delegate storage to a `HashMap` and apply the distance function on lookup.
- **`DistanceFunction<T>`** (`public/distance-function.ts`) — `(one: T, another: T) => number`
  with `defaultFunction` based on `===`.
- **`findNearestKeyMatch` / `NearestKeyMatch`** (`public/key-matching.ts`) —
  the linear nearest-key scan helper, also used directly by tests.

## Tooling

All commands run from this package directory. Per the root guide, **always
`bun run build:seq` (from the repo root) before `typecheck`/`test`** so dependent
`dist/` outputs are current.

| Command | Purpose |
|---|---|
| `bun run typecheck` | `tsc -p tsconfig.json --noEmit` (includes `src`, `test`, `test-d`) |
| `bun run test` | `bun test test/* --tsconfig-override tsconfig.common.json` |
| `bun run build` | emit this package to `dist/` |
| `bun run biome:check` / `biome:fix` | lint + format |
