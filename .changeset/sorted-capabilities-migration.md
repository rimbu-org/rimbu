---
"@rimbu/sorted": major
"@rimbu/collection-types": major
"@rimbu/hashed": major
"@rimbu/ordered": major
"@rimbu/list": major
---

# Migrate Sorted and collection families to capability model

**Breaking:** `SortedMap` and `SortedSet` now implement the new capability families (`MapCollection`/`SetCollection` + `IndexedKeyedSortedCollection`/`IndexedValuedSortedCollection`) matching `HashMap`/`HashSet`. This completes `08` and prepares `10` legacy removal.

### SortedMap
- `get(key, otherwise?)` / `has(key)` for key lookup (use `get` instead of `at(key)`, `has` instead of `hasKey`)
- `at(index, otherwise?)` / `atIndex(index)` for positional access (use `at`/`atIndex` instead of `atIndex`/`getAtIndex`); negative indices supported via `atIndex`
- `removeAt(index, amount?)` / `removeAtAndReturn` – order-statistic removal by sorted position
- `slice(range: IndexRange | Range<K>)` replaces `sliceIndex` (`sliceIndex` remains `@deprecated` until `10`, use `slice({start, end, amount})`)
- `streamSliceIndex`, `lowerBound`/`upperBound`/`nextEntry`/`previousEntry` retained; `comp: Comp<K>` on instance and `Context` (`blockSizeBits`, `maxEntries`/`minEntries`)
- `SortedMapContext` / `SortedMapKeyedContext` now class-based (`ContextBaseWithAddAll`/`KeyedCollectionContextBase`) like `HashMap` – `SortedMap.createContext({comp, blockSizeBits}).keyedContext` is the `KeyedContext` with `merge`/`mergeAll`/`reducer`
- Tests now use `@rimbu/collection-types/test-utils/map/map-collection-standard` and `set-collection-standard` like `hashed` (`hashmap.test.ts:3`, `hashset.test.ts:3`)

### SortedSet
- Same `at`/`slice`/`removeAt` semantics via `IndexedValuedSorted`
- `SortedSetContext` class-based (`ContextBaseWithAddAll`) like `HashSet`

### Migration
```ts
// before (RMap)
map.at(key) -> map.get(key)
map.hasKey(key) -> map.has(key)
map.removeKey(key) -> map.removeKey(key) // unchanged
map.atIndex(i) -> map.at(i) // or map.atIndex(i)
map.sliceIndex({start: -3}) -> map.slice({start: -3}) // or keep sliceIndex until 10
map.getAtIndex(i) -> map.at(i)

// SortedMap/SortedSet still expose sliceIndex as @deprecated until 10; prefer slice
```

All `sorted/test` (343) and `test-random` (56) pass with `--tsconfig-override tsconfig.common.json`; `typecheck` and `build` pass for `sorted` and `collection-types`.
