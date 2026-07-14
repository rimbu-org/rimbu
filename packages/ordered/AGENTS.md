# @rimbu/ordered — Package Agent Guide

This package provides `OrderedMap<K, V>` and `OrderedSet<T>` — immutable insertion-ordered collections, plus their hashed/sorted variant pairs.

## Source layout

```
src/
├── ordered.ts      # exports["."]       — re-exports OrderedMap + OrderedSet (whole surface)
├── public/         # exports["./*"]     — public subpaths (dist/public/*)
│   ├── map.ts       # @rimbu/ordered/map     — OrderedMap only
│   ├── set.ts       # @rimbu/ordered/set     — OrderedSet only
│   ├── map/
│   │   ├── hashed.ts  # @rimbu/ordered/map/hashed  — OrderedHashMap
│   │   └── sorted.ts  # @rimbu/ordered/map/sorted  — OrderedSortedMap
│   └── set/
│       ├── hashed.ts  # @rimbu/ordered/set/hashed  — OrderedHashSet
│       └── sorted.ts  # @rimbu/ordered/set/sorted  — OrderedSortedSet
└── internal/        # NEVER exported; "#map/*", "#set/*" only
    ├── map/
    │   ├── base.ts            # OrderedMapBase
    │   ├── builder.ts         # OrderedMap.Builder
    │   ├── context-factory.ts # OrderedMap.Context factory
    │   ├── creators.ts        # OrderedMap factory methods
    │   ├── empty.ts           # OrderedMap.Empty
    │   └── non-empty.ts       # OrderedMap.NonEmpty
    └── set/
        ├── base.ts            # OrderedSetBase
        ├── builder.ts         # OrderedSet.Builder
        ├── context-factory.ts # OrderedSet.Context factory
        ├── creators.ts        # OrderedSet factory methods
        ├── empty.ts           # OrderedSet.Empty
        └── non-empty.ts       # OrderedSet.NonEmpty
```

The `public/` tier is exposed via the `"./*"` wildcard export (`exports["./*"] → "./dist/public/*"`).
`internal/` is never exported and is reachable only via the `#map/*` / `#set/*` import aliases.

## Package imports (`#` paths)

```jsonc
"#map/*": "./dist/internal/map/*.{js,d.ts}"
"#set/*": "./dist/internal/set/*.{js,d.ts}"
```

## Variant nesting

`OrderedMap`/`OrderedSet` come in hashed and sorted key variants, exposed as nested subpaths:
- `OrderedHashMap` / `OrderedSortedMap` via `@rimbu/ordered/map/{hashed,sorted}`
- `OrderedHashSet` / `OrderedSortedSet` via `@rimbu/ordered/set/{hashed,sorted}`

The base implementation classes live in `src/internal/{map,set}/`. Public entry files import the
factory via the `#map/*` / `#set/*` aliases (never relative `../internal/...`, which Biome bans).

## Adding a method to OrderedMap

1. Add the method signature (and NonEmpty override) to `src/public/map.ts`
2. Implement in `src/internal/map/*`
3. Propagate to `RMapBase` in `@rimbu/collection-types` if it belongs on the abstract base
4. Add tests in `test/orderedmap.test.ts`

## Pre-existing known issues

None currently.
