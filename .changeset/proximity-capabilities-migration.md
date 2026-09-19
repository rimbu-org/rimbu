---
'@rimbu/proximity': major
---

Migrate `@rimbu/proximity` to the capability/HKT model and separate exact-key
from distance-based nearest-key lookup.

**Breaking changes**

- `ProximityMap` is now a full `MapCollection` capability family.
- `get` and `has` perform **exact-key** lookup; nearest lookup is exposed
  explicitly as `getNearest`, and `getNearestMatch` returns the matched
  `{ key, value, distance }`.
- Method renames: `at` (nearest) → `getNearest`; `hasKey` → `has`;
  `addEntry` → `add`; `addEntries` → `addAll`; `removeKeyAndGet` →
  `removeKeyAndReturn`; `updateAt` → `updateAtKey`; `updateAtAndGet` →
  `updateAtKeyAndReturn`; `modifyAt` → `modifyAtKey`; `transform` → `recompose`.
- Removed: `toJSON`, `ProximityMap.Types`, `ProximityMapCreators`, and the
  `Module`-based `createProximityMapContextModule` factory.
- `defaultContext` is now a property (it was a method on the factory).
- Contexts are plain classes built from `ContextBaseWithAddAll` /
  `KeyedCollectionContextBase`; the exported `ProximityMap` is
  `ProximityMapContext.createDefault().keyedContext`.
- The public configuration types are imported from
  `@rimbu/proximity/distance-function` and `@rimbu/proximity/key-matching`.
