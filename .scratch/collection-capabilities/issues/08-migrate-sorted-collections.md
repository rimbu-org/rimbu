# 08 — Migrate Sorted Collections

**What to build:** Make SortedMap and SortedSet compose indexed, sorted, identity, filter, and removal capabilities with unified positional and comparator-range APIs.

**Blocked by:** 05 — Migrate Map/Set Families and Hash Collections

**Status:** done

- [x] SortedMap and SortedSet expose the unified indexed and sorted capability contracts. (`IndexedKeyedSorted`/`IndexedValuedSorted` + `SetCollection`/`MapCollection` + `WithRemoveAt`, Families in `src/public/{set,map}.ts`)
- [x] Positional, comparator-range, neighbor, endpoint, and identity lookup names use the target API. (`indexOf`/`at`/`slice`/`streamRange`/`lowerBound`/`nextEntry`/`min`/`max`, `atIndex`/`sliceIndex`/`findIndex` kept `@deprecated`)
- [x] `comp` is available on collection instances and concrete comparator types are preserved. (`readonly comp: Comp<E|K>` on `Api` + `ContextApi.comp` via `Comp` generic, `base.ts` `isComparable`)
- [x] `removeAt` uses order-statistic access and identity removal with correct no-op behavior. (`SortedEmpty`/`SortedNonEmptyBase` + `Builder` `removeAt`/`removeAmountAt`/`removeAllAt` via `atIndex`+`remove`/`removeKey`, `map/immutable.ts:636`)
- [x] Negative indexing, ranges, `NonEmpty` returns, and complexity paths have runtime and type coverage. (`atIndex(-1)`, `IndexRange.getIndicesFor`, `addEntry→NonEmpty`, `355 pass` + `56 random`)
- [ ] Removed sorted aliases and min/max projection APIs are absent from the public surface. — **deferred to 10** (kept `@deprecated` `findIndex`/`atIndex`/`sliceIndex`/`hasKey`/`addEntry`/`minKey` etc. for compatibility; `review-api` 0 errors, `audit-tests` 17/17)
