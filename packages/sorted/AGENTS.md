# @rimbu/sorted — Package Agent Guide

This package provides `SortedMap<K, V>` and `SortedSet<T>` — immutable sorted B-tree collections.

## Source layout

```
src/
├── sorted.ts    # exports["."]       — re-exports SortedMap + SortedSet
├── map.ts       # exports["./map"]   — SortedMap only
├── set.ts       # exports["./set"]   — SortedSet only
└── internal/
    ├── sorted/
    │   ├── base.ts         # shared sorted node base (B-tree node operations)
    │   └── sorted-index.ts # index tracking helpers
    ├── map/
    │   ├── immutable.ts       # SortedMap + SortedMap.NonEmpty implementation
    │   ├── builder.ts         # SortedMap.Builder implementation
    │   ├── context-factory.ts # SortedMap.Context factory
    │   └── creators.ts        # SortedMap factory methods
    └── set/
        ├── immutable.ts       # SortedSet + SortedSet.NonEmpty implementation
        ├── builder.ts         # SortedSet.Builder implementation
        ├── context-factory.ts # SortedSet.Context factory
        └── creators.ts        # SortedSet factory methods
```

## Package imports (`#` paths)

```jsonc
"#sorted/*": "./dist/internal/sorted/*.{js,d.ts}"
"#map/*":    "./dist/internal/map/*.{js,d.ts}"
"#set/*":    "./dist/internal/set/*.{js,d.ts}"
```

## B-tree structure

SortedMap and SortedSet are implemented as **B-trees** with configurable block size:
- Leaf nodes hold sorted key arrays
- Inner nodes hold child node arrays + separator key arrays
- All operations maintain sorted order using the provided `Comp<K>` comparator
- Core B-tree logic lives in `src/internal/sorted/base.ts`

## Key differences from HashMap

- Requires a `Comp<K>` comparator (from `@rimbu/common`) — keys must be orderable
- Supports range queries: `streamRange(range)`, `getAtIndex(i)`, `streamSliceIndex(range)`
- Inner and leaf nodes are stored separately (`SortedSetInner`, `SortedSetLeaf`) — the test files `sortedset-inner.test.ts` and `sortedset-leaf.test.ts` test these individually

## tsconfig.common.json note

The `tsconfig.common.json` includes a path for `@rimbu/sorted/internal/*` to allow test files to access internal types:

```jsonc
"@rimbu/sorted/internal/*": ["./internal/*.ts", "./internal/*"]
```

This is intentional and test-only. Do not remove it.

## Pre-existing known issues

- One type error in `test/sortedmap-specific.test.ts`: `number[][]` not assignable to `(readonly [number, number])[]`
