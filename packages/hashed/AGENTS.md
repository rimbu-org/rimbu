# @rimbu/hashed — Package Agent Guide

This package provides `HashMap<K, V>` and `HashSet<T>` — immutable hash-based collections.

## Source layout

```
src/
├── hashed.ts        # exports["."]       — re-exports HashMap + HashSet + Hasher
├── map.ts           # exports["./map"]   — HashMap only
├── set.ts           # exports["./set"]   — HashSet only
└── internal/
    ├── hashed/
    │   ├── base.ts            # shared hashed node base (HAMT structure)
    │   └── hasher-module.ts   # Hasher factory module
    ├── map/
    │   ├── immutable.ts       # HashMap + HashMap.NonEmpty implementation class
    │   ├── builder.ts         # HashMap.Builder implementation
    │   ├── context-factory.ts # HashMap.Context factory
    │   └── creators.ts        # HashMap factory methods (of, from, empty, reducer)
    └── set/
        ├── immutable.ts       # HashSet + HashSet.NonEmpty implementation class
        ├── builder.ts         # HashSet.Builder implementation
        ├── context-factory.ts # HashSet.Context factory
        └── creators.ts        # HashSet factory methods
```

## Package imports (`#` paths)

```jsonc
"#hashed/*": "./dist/internal/hashed/*.{js,d.ts}"
"#map/*":    "./dist/internal/map/*.{js,d.ts}"
"#set/*":    "./dist/internal/set/*.{js,d.ts}"
```

## Key types and their locations

| Type | Public file | Implementation |
|---|---|---|
| `HashMap<K, V>` | `src/map.ts` | `src/internal/map/immutable.ts` |
| `HashMap.NonEmpty<K, V>` | `src/map.ts` | `src/internal/map/immutable.ts` |
| `HashMap.Builder<K, V>` | `src/map.ts` | `src/internal/map/builder.ts` |
| `HashMap.Context<UK, UV>` | `src/map.ts` | `src/internal/map/context-factory.ts` |
| `HashSet<T>` | `src/set.ts` | `src/internal/set/immutable.ts` |
| `HashSet.NonEmpty<T>` | `src/set.ts` | `src/internal/set/immutable.ts` |
| `Hasher<T>` | `src/hashed.ts` | `src/internal/hashed/hasher-module.ts` |

## HAMT structure

HashMap and HashSet are implemented as **Hash Array Mapped Tries** (HAMT) — a tree structure where:
- Each node covers a slice of the hash bits
- Structural sharing minimises allocation on updates
- Implemented in `src/internal/hashed/base.ts`

## Adding a method to HashMap

1. Add the method signature (and NonEmpty override) to `src/map.ts`
2. Implement in `src/internal/map/immutable.ts`
3. Propagate to `RMapBase` in `@rimbu/collection-types/src/map/base.ts` if it belongs on the abstract base
4. Add tests in `test/hashmap.test.ts`
5. Add type tests in `test-d/hashmap.test-d.ts`

## HKT binding

`HashMap` binds to the abstract `RMapBase` via:
```ts
export namespace HashMap {
  export interface Types extends KeyValue {
    readonly normal: HashMap<this['_K'], this['_V']>;
    readonly nonEmpty: HashMap.NonEmpty<this['_K'], this['_V']>;
  }
}
```
This is how `filter()` on `RMapBase` returns `HashMap<K,V>` (not `RMapBase<K,V>`).

## Pre-existing known issues

None currently.
