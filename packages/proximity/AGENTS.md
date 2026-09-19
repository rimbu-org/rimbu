# @rimbu/proximity — Package Agent Guide

This package provides Rimbu's **immutable `ProximityMap`**: a keyed map whose
`get`/`has` are **exact-key** lookups and which additionally supports
**distance-based nearest-key**: `getNearest` / `getNearestMatch`. It is backed
internally by a `HashMap` of `[key, value]` entries.

> For workspace-wide conventions (biome rules, `build:seq` before typecheck/test,
> the Interface + Namespace pattern, capability families, NonEmpty tracking,
> `OptLazy`, `RelatedTo`, and the changeset workflow) see the **root `AGENTS.md`**.
> This file only covers what is specific to `@rimbu/proximity`.

## Source layout

```
src/
├── proximity.ts   # exports["."]  — re-exports @rimbu/proximity/map
├── public/        # exports["./*"]  — public subpaths (dist/public/*)
│   ├── map.ts                # @rimbu/proximity/map — ProximityMap + Advanced namespace + const
│   ├── distance-function.ts  # @rimbu/proximity/distance-function
│   └── key-matching.ts       # @rimbu/proximity/key-matching
└── internal/        # NEVER exported; "#proximity/*" only
    ├── context.ts     # ProximityMapContext + ProximityMapKeyedContext
    ├── empty.ts       # ProximityMapEmpty
    ├── non-empty.ts   # ProximityMapNonEmpty
    ├── builder.ts     # ProximityMapBuilder
    └── wrapping.ts    # wrapHashMap helper
```

### Key rule: imports inside `src/`
- Use the package alias `#proximity/*` for anything in `src/internal/*`.
- Use `@rimbu/proximity/map`, `@rimbu/proximity/distance-function` and
  `@rimbu/proximity/key-matching` (package sub-paths) for public types, even
  from `proximity.ts`.
- Use `@rimbu/collection-types`, `@rimbu/hashed`, `@rimbu/stream`, `@rimbu/common`,
  `@rimbu/base` for dependencies.

## Architecture

`ProximityMap` is a full `MapCollection` capability family with two extra
distance-based reads. It follows the `@rimbu/hashed`/`@rimbu/sorted` pattern:

- **`ProximityMap<K, V>`** (`public/map.ts`) extends
  `ProximityMap.Advanced.Api<K, V, Collection.Advanced.Types<Family<K, V>, readonly [K, V]>>`.
  It is the full map surface (`get`/`has`/`add`/`addAll`/`set`/`removeKey(s)`/
  `removeKeyAndReturn`/`updateAtKey`/`modifyAtKey`/`mapValues`/`map`/`flatMap`/
  `recompose`/...) plus `getNearest` and `getNearestMatch`.
- **`ProximityMap.Advanced.Api` / `BuilderApi`** add the two nearest methods
  directly (no package-local capability — they return a value/fallback, not a
  new collection type). **`Advanced.Family<K, V>`** pins the concrete
  `_NORMAL`/`_NON_EMPTY`/`_BUILDER`/`_CONTEXT`/`_KEYED_CONTEXT` slots.
- **`ProximityMap.Context<UK>`** exposes `distanceFunction` and `hashMapContext`
  alongside the standard context surface. `ProximityMap` (the exported const) is
  `ProximityMapContext.createDefault().keyedContext`.
- **Implementations** (`internal/non-empty.ts`, `empty.ts`, `builder.ts`,
  `wrapping.ts`) compose the `MapCollection`/`KeyedCollection` capability mixins
  and delegate all exact-key storage to a backing `HashMap`; the distance
  function is applied only by `getNearest`/`getNearestMatch`.
- **`DistanceFunction<T>`** (`public/distance-function.ts`) — `(one: T, another: T) => number`
  with `defaultFunction` based on `===`.
- **`findNearestKeyMatch` / `NearestKeyMatch`** (`public/key-matching.ts`) —
  the linear nearest-key scan helper used by both the immutable collection and
  the builder.

## Semantics

- `get`, `has`, `set`, `add`, `removeKey`, `updateAtKey`, `modifyAtKey`, ... are
  **exact-key** operations.
- `getNearest(key[, otherwise])` performs an O(n) linear scan using the context's
  `DistanceFunction`, short-circuiting on a distance of `0`; it returns the
  closest value (or the fallback).
- `getNearestMatch(key[, otherwise])` returns the matching
  `NearestKeyMatch<K, V>` (`{ key, value, distance }`).
- The builder mirrors the immutable lookups: exact `get`/`has` plus
  distance-based `getNearest`/`getNearestMatch` over its current contents.

## Tooling

All commands run from this package directory. Per the root guide, **always
`bun run build:seq` (from the repo root) before `typecheck`/`test`** so dependent
`dist/` outputs are current.

| Command | Purpose |
|---|---|
| `bun run typecheck` | `tsc -p tsconfig.json --noEmit` (includes `src`, `test`, `test-d`) |
| `bun run test` | `bun test test/* --tsconfig-override tsconfig.common.json` |
| `bun run test:random` | `bun test test-random` (uses the shared random harness) |
| `bun run build` | emit this package to `dist/` |
| `bun run biome:check` / `biome:fix` | lint + format |
