# @rimbu/ordered — Package Agent Guide

This package provides `OrderedMap<K, V>` and `OrderedSet<T>` — immutable
insertion-ordered collections built on the `@rimbu/collection-types` capability
mixins. For workspace-wide conventions (biome rules, `build:seq` before
typecheck/test, the Interface + Namespace pattern, capability families,
`NonEmpty` tracking, `OptLazy`, `RelatedTo`, changesets) see the root
`AGENTS.md`.

## Source layout

```
src/
├── ordered.ts        # exports["."]   — re-exports @rimbu/ordered/map + /set
├── public/           # exports["./*"] — public subpaths (dist/public/*)
│   ├── map.ts         # @rimbu/ordered/map — OrderedMap + Advanced namespace + const
│   └── set.ts         # @rimbu/ordered/set — OrderedSet + Advanced namespace + const
└── internal/         # NEVER exported; "#ordered/*" only
    ├── common/
    │   └── ordered-indicator.ts  # rational order-maintenance Indicator
    ├── map/
    │   ├── context.ts     # OrderedMapContext + OrderedMapKeyedContext
    │   ├── non-empty.ts   # OrderedMapNonEmpty
    │   ├── empty.ts       # OrderedMapEmpty
    │   └── builder.ts     # OrderedMapBuilder
    └── set/
        ├── context.ts     # OrderedSetContext
        ├── non-empty.ts   # OrderedSetNonEmpty
        ├── empty.ts       # OrderedSetEmpty
        └── builder.ts     # OrderedSetBuilder
```

Public types are reachable via `@rimbu/ordered/map`, `@rimbu/ordered/set`, and
the root `@rimbu/ordered`. Internals use the `#ordered/*` import alias
(`#ordered/map/context`, `#ordered/set/context`, …); there are no `#map/*` /
`#set/*` aliases, because those would collide with `@rimbu/hashed`'s own
package-local aliases when its `dist` is loaded.

## Architecture

Both collections are `MapCollection`/`SetCollection` capability families
backed by **two maps**:

- a key map (`keyMapContext`, default `HashMap`) holding the key/element and an
  `Indicator`;
- a sorted indicator map (`SortedMap<Indicator, …>`) that defines the insertion
  order and is the source of iteration.

The indicator map's block size is configured with `indicatorBlockSizeBits`
(default `5`); its context is internal. Passing a sorted `keyMapContext` changes
key storage/equality only — iteration always follows insertion order.

- `OrderedMap.Advanced.Family<K, V>` extends `MapCollection.Advanced.Family<K, V>`
  and pins `_NORMAL`/`_NON_EMPTY`/`_BUILDER`/`_CONTEXT`/`_KEYED_CONTEXT`.
- `OrderedSet.Advanced.Family<E>` extends `SetCollection.Advanced.Family<E>`.
- The exported consts are `OrderedMapContext.createDefault().keyedContext` and
  `OrderedSetContext.createDefault()`.
- Immutable classes compose the mixins
  `MapCollectionEmpty/NonEmpty.WithMixin(KeyedCollection…WithMixin(Collection….Constructor))`
  (set: `SetCollectionNonEmpty.WithMixin(ValuedCollectionNonEmpty.WithMixin(…))`);
  only the required abstracts are implemented directly (`add`, `modifyAtKey`,
  `mapValues`, `get`, `context`, the collection seed members, `remove` for sets).

## Order semantics

- New keys/elements are appended.
- Updating an existing key's value (including `set`/`add`/`modifyAtKey`/
  `updateAtKey`) keeps its position.
- Removing and re-adding an entry appends it at the end.
- `mapValues` keeps position; `filter` keeps relative order.

## Tooling

```
bunx tsc -p tsconfig.esm.json            # build src
bunx tsc -p tsconfig.json --noEmit       # typecheck src + test + test-d
bun test test/* --tsconfig-override tsconfig.common.json
bunx biome check src
```
