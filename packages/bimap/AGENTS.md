# @rimbu/bimap — Package Agent Guide

This package provides `BiMap<K, V>` — an immutable bi-directional map with a one-to-one
key↔value invariant, built on the `@rimbu/collection-types` capability mixins.

## Source layout

```
src/
├── bimap.ts                 # exports["."]      — re-exports public + advanced
├── public/
│   └── bimap.ts             # exports["./*"]    — BiMap + NonEmpty/Builder/Context/Advanced + const
├── advanced/
│   └── bimap-base.ts        # exports["./advanced/*"] — BiMapBase, BiMapBuilderBase, BiMapCollection.Capability.*
└── internal/                # NEVER exported; "#bimap/*" only
    ├── context.ts           # BiMapCollectionContext / BiMapKeyedContext
    ├── immutable.ts         # BiMapEmpty + abstract BiMapNonEmptyBase + BiMapImpl
    └── builder.ts           # BiMapBuilder
```

`public/` is exposed via `"./*"`, `advanced/` via `"./advanced/*"`. `internal/` is reachable
only through the `#bimap/*` import alias.

## Package imports (`#` paths)

```jsonc
"#bimap/*": "./dist/internal/*.{js,d.ts}"
```

## Architecture

`BiMap` is a `MapCollection` (element `readonly [K, V]`, keyed by `K`) with a second index
keyed by `V`, backed by two inverse `MapCollection`s.

- `BiMap.Advanced.Family<K, V>` extends `MapCollection.Advanced.Family<K, V>` and sets
  `_UPPER_E: readonly [K, V]`.
- `BiMapBase` / `BiMapBuilderBase` (`advanced/bimap-base.ts`) aggregate the map capabilities
  with the value-direction `BiMapCollection.Capability.*` interfaces.
- Immutable classes compose the mixins:
  `MapCollectionEmpty.WithMixin(KeyedCollectionEmpty.WithMixin(CollectionEmpty.Constructor))`
  and the `NonEmpty` equivalent. The mixins derive `set`/`addAll`/`filter`/`map`/`recompose`
  etc. via `toBuilder()`; only `add`, `modifyAtKey`, `mapValues`, `get`, `toBuilder`, the
  collection seed members, and the value-direction members are implemented directly.
- Delegate contexts are `MapCollection.Context`s, defaulting to `HashMap`; a custom
  `createContext({ keyValueContext, valueKeyContext })` can mix hash/sorted directions.

## API conventions

- Key direction uses the Keyed/Map names: `get`, `has`, `add`, `addAll`, `removeKey(s)`,
  `updateAtKey`, `modifyAtKey`.
- Value direction uses `getKey`, `hasValue`, `removeValue(s)`, `removeValueAndReturn`,
  `updateAtValue`, `modifyAtValue`, `removeEntry(ies)`.
- Side results use `Op.DynamicResult` (`{ collection, hasResult, result, hasChanged }`) via
  `*AndReturn`.
- `invert()` returns `BiMap<V, K>` using `FamToTypes`, no variance annotations.
- Collisions (from `add`/`set`/`mapValues`/`map`/`flatMap`/`recompose`) resolve
  **last-iterated-wins** by rebuilding through the builder, preserving the 1-to-1 invariant.

## Known deviations

- `mapValues` is refinement-only (`V2 extends V`) and lossy for a bijection.
- `BiMap.Advanced.KeyedContextApi` restates the inherited `merge*` members loosely: because
  `_UPPER_E` is narrowed to `readonly [K, V]`, the `WithMerge` return types (which recurse
  through `_UPPER_V`) cannot be structurally satisfied. BiMap does not claim the merge API.

## Adding a method to BiMap

1. Add a `BiMapCollection.Capability.WithX` `Api`/`BuilderApi` (and include it in
   `BiMapBase`/`BiMapBuilderBase`) in `src/advanced/bimap-base.ts`.
2. Add the signature (and NonEmpty override) to `src/public/bimap.ts`.
3. Implement in `src/internal/immutable.ts` (and `builder.ts` if relevant).
4. Propagate to `collection-types` only if it belongs on the shared map base.
5. Add tests in `test/` and type tests in `test-d/`.

## Verification

```
bunx tsc -p packages/bimap/tsconfig.esm.json
bunx tsc -p packages/bimap/tsconfig.json --noEmit
bun test test/* --tsconfig-override tsconfig.common.json
bun test test-random --tsconfig-override tsconfig.common.json
```
