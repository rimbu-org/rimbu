---
"@rimbu/ordered": major
---

# Migrate OrderedMap and OrderedSet to the capability model

**Breaking:** `OrderedMap` and `OrderedSet` now implement the standard
`MapCollection`/`SetCollection` capability families from `@rimbu/collection-types`,
matching `HashMap`/`HashSet`. This is a hard switch with no deprecated aliases.

### Public surface

- The abandoned `OrderedHashMap`/`OrderedSortedMap`/`OrderedHashSet`/`OrderedSortedSet`
  variant types are removed. Key storage is chosen through the context instead:
  `OrderedMap.createContext({ keyMapContext })`.
- `OrderedMap`/`OrderedSet` are now full terminal factories exposing
  `empty`/`of`/`from`/`builder`/`reducer` plus `createContext`, typed as
  `Advanced.DefaultFactory`.
- Standard capability method names: `get` (was `at(key)`), `has` (was `hasKey`),
  `add`/`addAll` (was `addEntry`/`addEntries`), `removeKeyAndReturn` (was
  `removeKeyAndGet`), `updateAtKeyAndReturn` (was `updateAtAndGet`), `map` (was
  `transform`), `intersection` (was `intersect`), `symmetricDifference` (was
  `symDifference`). `toJSON` is dropped.
- `OrderedMap.Context`/`OrderedSet.Context` expose `keyMapContext` and
  `indicatorBlockSizeBits` (default `5`). The internal indicator map context is
  no longer public.
- `OrderedMap`/`OrderedSet` are backed by the capability mixins and expose
  `NonEmpty`/`Builder`/`Advanced.Family` like the other migrated packages.

### Order semantics

Updating an existing key's value keeps its position (previously a changed value
moved the key to the end). Removing and re-adding a key appends it. `mapValues`
and `filter` keep their position/relative order.

The shared `@rimbu/collection-types/test-utils` suites are used, and
`@rimbu/list` is no longer a dependency.
