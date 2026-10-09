---
'@rimbu/collection-types': major
'@rimbu/core': major
---

Remove the legacy `RMap` / `RSet` / `VariantMap` / `VariantSet` surface from
`@rimbu/collection-types`, and point `@rimbu/core` at the capability families
that replaced it.

### Removed

- The `RMap`, `RSet`, `VariantMap` and `VariantSet` type aliases, along with the
  `RMapBase` / `RSetBase` / `VariantMapBase` / `VariantSetBase` interfaces and
  the `RMapContextBaseModule` / `RSetContextBaseModule` factories. Together with
  the internal slot types behind them that is ~2,300 lines removed.

  The capability families (`Collection`, `ValuedCollection`,
  `KeyedCollection`, `IndexedCollection`, `SortedCollection`, `MapCollection`,
  `SetCollection`) describe the same operations without the separate
  read-only/invariant split, and without a second "types" record that had to be
  kept in sync with the first.

- `@rimbu/core` no longer re-exports the legacy bases. `@rimbu/core/collection-types/advanced`
  now exposes only the implementer-facing base classes (`collection-base`,
  `map-base`, `set-base`, `common`, `common/empty-base`).

### Changed

- `@rimbu/collection-types` (the package root) now re-exports the capability
  surface — `collection`, `map`, `set` and `types` — instead of the four legacy
  aliases. `@rimbu/core/collection-types` additionally re-exports the
  `keyed`, `sorted`, `valued` and `indexed` capability namespaces so that the
  abstract surface stays reachable from `@rimbu/core` as before.

### Migration

```ts
// before
import type { RMap } from '@rimbu/collection-types';
function log<K, V>(map: RMap<K, V>): void { /* … */ }

// after
import type { MapCollection } from '@rimbu/collection-types/map';
function log<K, V>(map: MapCollection<K, V>): void { /* … */ }
```

To constrain a value to a *subset* of capabilities, declare a **named**
interface extending the aggregate `Advanced.Family` rather than intersecting
individual `Capability.*` families — see the root `AGENTS.md` §6.4 for why the
hand-written intersection silently drops `_BUILDER` / `_CONTEXT` / `_NORMAL`
members.

```ts
import type { SetCollection } from '@rimbu/collection-types/set';

interface Capabilities extends SetCollection.Advanced.Family<number> {}
declare const S: SetCollection.Context<Capabilities>;
```

### Fixed

Four type-test files under `test-d/` were suppressed with `// @ts-nocheck` and
had silently rotted; they are live again and three of their assertions were
wrong:

- `HashMap` and `SortedMap` are **invariant** in their value type, not
  covariant. The assertions claimed that widening `V` produced a subtype;
  `add(key, value: V)` takes `V` and `mapValues` produces one, so it does not.
- `SetCollection.union` types its result from `Tp['_SELF']`. For an empty
  receiver unioned with a non-empty operand the result is the abstract
  `NonEmpty<E>`, not the concrete `Set.NonEmpty<E>`: the operand is a
  `StreamSource`, and a non-empty *set* is not structurally a
  `StreamSource.NonEmpty`. For a non-empty receiver the result is the receiver's
  own type intersected with `NonEmpty`. `toEqualTypeOf` could not express
  either, so these now assert the assignability that actually holds.

`test-utils/set/set-random.ts` also no longer types its context as a
hand-written intersection of eight `Capability.*` families; it is now a named
interface extending `SetCollection.Advanced.Family`.
