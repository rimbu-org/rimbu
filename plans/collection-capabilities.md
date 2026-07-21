# Orthogonal collection capabilities — implementation plan

## Status

- **Scope:** breaking public API redesign for the core collection families.
- **Release:** major; no compatibility aliases in the final public surface.
- **First implementation gate:** a type-only composition spike.
- **Primary package:** `@rimbu/collection-types`.
- **Initial concrete adopters:** List variants, HashMap/HashSet, SortedMap/SortedSet,
  all OrderedMap/OrderedSet variants, and ProximityMap.

This plan supersedes the relevant API-shape assumptions in the older per-package
restructuring plans. Those plans remain the source of truth for package layout and
export tiers, except that this plan supersedes the collection-types target layout
and exports by adding `src/public/*` and its curated `"./*"` wildcard.

## Goals

1. Model collection behavior as small orthogonal capabilities instead of broad
   List/Map/Set inheritance trees.
2. Give List, Sorted, and Ordered collections one consistent indexed API.
3. Give value-addressed and key-addressed collections consistent identity APIs.
4. Preserve concrete collection and NonEmpty return types without forcing every
   capability through the full map/set HKT machinery.
5. Keep parent interfaces narrow so implementations never need meaningless,
   unsupported, or collision-heavy methods.
6. Make semantic and asymptotic guarantees explicit and enforce them with shared
   runtime and type-level contract suites.

## Non-goals

- Do not redesign every specialized package in the first pass. MultiMap, MultiSet,
  Table, BiMap, BiMultiMap, and Graph need separate semantic audits.
- Do not retain compatibility aliases in the final public surface. Temporary
  in-branch aliases may exist only to keep phased migration commits compilable.
- Do not add replacements for `*AndGet` methods yet. Context-hosted helpers remain
  a follow-up option.
- Do not add shared reversible or rotatable collection traits yet.
- Do not add generic rebuilding helpers that would implement efficient collection
  operations by scanning streams.
- Do not replace or periodically relabel Ordered rational indicators. Unbounded
  exact rational labels are an explicit accepted tradeoff.

## Target capability graph

```text
Collection<E>
├── IndexedCollection<E>
│   ├── IndexedValuedCollection<T> + ValuedCollection<T>
│   ├── IndexedKeyedCollection<K, V> + KeyedCollection<K, V>
│   ├── RemovableAtCollection<E>
│   ├── SwappableAtCollection<E>
│   ├── OrderEditableCollection<E>
│   └── ReorderableCollection<I, E>
├── ValuedCollection<T>
├── KeyedCollection<K, V>             // E = readonly [K, V]
├── FilterableCollection<E>
└── SortedCollection<S, E>            // independent from IndexedCollection

SetCollection.Variant<T>
└── SetCollection<T>

MapCollection.Variant<K, V>
└── MapCollection<K, V>
```

`SortedCollection` and `IndexedCollection` both extend `Collection`, but neither
extends the other. Rimbu's SortedMap and SortedSet implement both. This allows a
third-party comparator-backed collection without efficient order-statistic access
to implement `SortedCollection` without falsely claiming `IndexedCollection`.

Edit traits inherit `IndexedCollection` because their indices are meaningless
without the indexed observation contract. Concrete collections compose only the
edit traits that are natural for their semantics.

Family namespace shape:

```text
SetCollection<T>
SetCollection.NonEmpty<T>
SetCollection.Variant<T>
SetCollection.Variant.NonEmpty<T>
SetCollection.Context<UT>
SetCollection.Builder<T>

MapCollection<K, V>
MapCollection.NonEmpty<K, V>
MapCollection.Variant<K, V>
MapCollection.Variant.NonEmpty<K, V>
MapCollection.Context<UK>
MapCollection.Builder<K, V>
```

Concrete families continue to expose their own Context, Builder, NonEmpty, and
Types members; these generic names are constraints and view types.

## Public contracts

The exact generic syntax is validated by the type spike. The following signatures
define the required public behavior, not necessarily the final source formatting.

### `Collection<E>`

`Collection` is finite by contract and extends the existing fast-iteration shape.

```ts
interface Collection<E> extends FastIterable<E> {
  readonly size: number;
  readonly isEmpty: boolean;

  nonEmpty(): this is Collection.NonEmpty<E>;
  assumeNonEmpty(): Collection.NonEmpty<E>;

  stream(): Stream<E>;
  forEach(
    f: (element: E, index: number, halt: () => void) => void,
    options?: { state?: TraverseState },
  ): void;
  toArray(): E[];
}
```

`Collection.NonEmpty<E>` refines at least:

- `isEmpty` to `false`.
- `stream()` to `Stream.NonEmpty<E>`.
- `toArray()` to `ArrayNonEmpty<E>`.
- `assumeNonEmpty()` to `this`.
- `asNormal()` to the normal collection type in advanced/concrete bindings.

`Collection` does not require `context`, builders, `toString`, or `toJSON`.
It also does not require `map` or `transform`: Lists transform elements freely,
sets may collapse/context-constrain results, and maps distinguish entry and value
transformation. Those methods remain family-specific.

### `IndexedCollection<E>`

```ts
interface IndexedCollection<E> extends Collection<E> {
  stream(options?: { reversed?: boolean }): Stream<E>;
  streamSlice(
    range: IndexRange,
    options?: { reversed?: boolean },
  ): Stream<E>;

  at(index: number): E | undefined;
  at<O>(index: number, otherwise: OptLazy<O>): E | O;

  first(): E | undefined;
  first<O>(otherwise: OptLazy<O>): E | O;
  last(): E | undefined;
  last<O>(otherwise: OptLazy<O>): E | O;

  take(amount: number): IndexedCollection<E>;
  drop(amount: number): IndexedCollection<E>;
  slice(range: IndexRange): IndexedCollection<E>;
}
```

`IndexedCollection.NonEmpty<E>` refines:

- `first()` and `last()` to return `E` without a fallback.
- `stream()` to return `Stream.NonEmpty<E>`.
- `take<N extends number>` so a statically known nonzero amount returns the
  concrete NonEmpty type and a possibly-zero amount returns the normal type.
- `drop(0)` to return the concrete NonEmpty type; general `drop(number)` returns
  the normal type.

`slice` always preserves canonical collection order. Reverse output is available
only through `stream` and `streamSlice`.

### Identity capabilities

```ts
interface ValuedCollection<T> extends Collection<T> {
  has<U = T>(value: RelatedTo<T, U>): boolean;
}

interface KeyedCollection<K, V>
  extends Collection<readonly [K, V]> {
  get<UK = K>(key: RelatedTo<K, UK>): V | undefined;
  get<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): V | O;
  has<UK = K>(key: RelatedTo<K, UK>): boolean;
  streamKeys(): Stream<K>;
  streamValues(): Stream<V>;
}
```

`ValuedCollection` guarantees efficient identity membership but does not guarantee
uniqueness. Set uniqueness and algebra belong to `SetCollection`.

The indexed intersections add identity-to-index lookup:

```ts
interface IndexedValuedCollection<T>
  extends IndexedCollection<T>, ValuedCollection<T> {
  indexOf<U = T>(value: RelatedTo<T, U>): number | undefined;
  indexOf<U, O>(value: RelatedTo<T, U>, otherwise: OptLazy<O>): number | O;
}

interface IndexedKeyedCollection<K, V>
  extends IndexedCollection<readonly [K, V]>, KeyedCollection<K, V> {
  indexOf<UK = K>(key: RelatedTo<K, UK>): number | undefined;
  indexOf<UK, O>(key: RelatedTo<K, UK>, otherwise: OptLazy<O>): number | O;
  streamKeys(options?: { reversed?: boolean }): Stream<K>;
  streamValues(options?: { reversed?: boolean }): Stream<V>;
}
```

Maps bind the indexed element to `readonly [K, V]`; `at`, `first`, and `last`
therefore return entries.

### `FilterableCollection<E>`

The public capability uses a boolean predicate and returns the public capability
type. Its advanced base and every concrete binding preserve `Self`.

```ts
interface FilterableCollection<E> extends Collection<E> {
  filter(
    pred: (element: E, index: number, halt: () => void) => boolean,
    options?: { negate?: boolean },
  ): FilterableCollection<E>;
}
```

List and set family contracts add their existing type-guard overloads through
family-specific HKT records. The generic capability does not attempt to infer new
map key/value types from a narrowed entry tuple.

### `SortedCollection<S, E>`

`S` is the comparator/search type and `E` is the iterated result element.

```ts
interface SortedCollection<S, E> extends Collection<E> {
  readonly comp: Comp<S>;

  lowerBound(search: S): number;
  upperBound(search: S): number;

  next(
    search: S,
    options?: { inclusive?: boolean; otherwise?: never },
  ): E | undefined;
  next<O>(
    search: S,
    options: { inclusive?: boolean; otherwise: OptLazy<O> },
  ): E | O;
  previous(
    search: S,
    options?: { inclusive?: boolean; otherwise?: never },
  ): E | undefined;
  previous<O>(
    search: S,
    options: { inclusive?: boolean; otherwise: OptLazy<O> },
  ): E | O;

  streamRange(
    range: Range<S>,
    options?: { reversed?: boolean },
  ): Stream<E>;
  sliceRange(range: Range<S>): SortedCollection<S, E>;
}
```

Bindings:

- `SortedSet<T>` uses `S = T`, `E = T`.
- `SortedMap<K, V>` uses `S = K`, `E = readonly [K, V]`.

`SortedCollection` itself has no endpoint methods because it is independent from
`IndexedCollection`. Rimbu's SortedMap and SortedSet implement both and use indexed
`first` and `last` as comparator endpoints; `min`, `max`, `minKey`, `maxKey`,
`minValue`, and `maxValue` are removed from those concrete families.

### Optional indexed edit capabilities

Shape-preserving methods return concrete `Self` through advanced base interfaces.

```ts
interface RemovableAtCollection<E> extends IndexedCollection<E> {
  removeAt(index: number): RemovableAtCollection<E>;
}

interface SwappableAtCollection<E> extends IndexedCollection<E> {
  swapAt(index1: number, index2: number): SwappableAtCollection<E>;
}

interface OrderEditableCollection<E> extends IndexedCollection<E> {
  prepend(
    element: E,
  ): OrderEditableCollection<E> & IndexedCollection.NonEmpty<E>;
  append(
    element: E,
  ): OrderEditableCollection<E> & IndexedCollection.NonEmpty<E>;
  placeAt(
    index: number,
    element: E,
  ): OrderEditableCollection<E> & IndexedCollection.NonEmpty<E>;
}

interface ReorderableCollection<I, E> extends IndexedCollection<E> {
  moveTo(index: number, identity: I): ReorderableCollection<I, E>;
}
```

Advanced bindings refine `prepend`, `append`, and `placeAt` to `NonEmptySelf`.
`removeAt` removes exactly one element. Bulk positional removal and bulk arbitrary
placement are not required methods.

## Advanced implementer contracts

### Type strategy

Use explicit `Self` and `NonEmptySelf` parameters for shape-preserving traits:

```ts
interface IndexedCollectionBase<
  E,
  Self extends IndexedCollection<E>,
  NonEmptySelf extends Self & IndexedCollection.NonEmpty<E>,
> extends IndexedCollection<E> {
  take(amount: number): Self;
  drop(amount: number): Self;
  slice(range: IndexRange): Self;
  // NonEmpty refinements use NonEmptySelf where provable.
}
```

Apply the same pattern to Filterable, Sorted, RemovableAt, SwappableAt,
OrderEditable, and Reorderable bases. Reserve HKT records for type-changing family
operations such as set/List type-guard filtering, List mapping, and map
`mapValues`.

Every base constrains `Self` to its public capability and `NonEmptySelf` to the
corresponding Self/NonEmpty intersection. The spike must reject unconstrained Self
parameters rather than repairing incompatible overrides with casts.

The type spike must prove that concrete NonEmpty interfaces compose these bases
without:

- `Omit<Concrete, keyof Base.NonEmpty<...>>` reconstruction.
- `any` return escapes.
- Incorrect overload selection.
- Loss of concrete context/comparator types.

NonEmpty-returning overloads remain first whenever a normal and NonEmpty overload
can both match.

### Proposed source layout

Prefer a small number of cohesive files over one file per tiny capability:

```text
packages/collection-types/src/
  collection-types.ts
  public/
    capabilities.ts
    map.ts
    set.ts
  advanced/
    capabilities/base.ts
    map/base.ts
    map/base-module.ts
    set/base.ts
    set/base-module.ts
    normalization.ts
  internal/
    common/types.ts
    map/types/generic.ts
    map/types/variant.ts
    set/types/generic.ts
    set/types/variant.ts
```

The type spike may adjust exact file boundaries to avoid circular imports, but
must preserve the root/public/advanced/internal tier model.

Add `"./*"` package exports and matching tsconfig paths for `src/public/*`, and
re-export the whole consumer surface from `src/collection-types.ts`. Keep
implementer bases available only through `"./advanced/*"`.

### Normalization helpers

Add advanced-only helpers used by every implementation:

- Lookup index normalization.
- Insertion-point normalization.
- Final-position normalization.
- Amount validation.
- `IndexRange` validation and normalization.

Do not add generic helpers that implement indexed behavior by stream scanning.

## Numeric semantics

### Element lookup indices

- Only finite safe integers are valid.
- Non-negative values count from the start.
- Negative values count from the end: `-1` is last.
- Out-of-bounds or invalid lookup returns the `OptLazy` fallback.

### Existing-target edits

- `removeAt`, `setAt`, `updateAt`, and `swapAt` require valid resolved indices.
- Invalid or out-of-bounds indices return the receiver unchanged.
- `swapAt` also returns unchanged when both indices resolve to the same position.

### List insertion points

- `insertAt(index, values)` names the gap before the element at `index`.
- `insertAt(-1, values)` inserts before the current last element.
- Finite out-of-range integer insertion points clamp to the nearest end.
- Non-safe-integer and non-finite insertion points return unchanged.

### Ordered final positions

- `placeAt(index, element)` and `moveTo(index, identity)` name the final item index.
- `-1` means the final last position.
- Existing identity removal is accounted for before assigning the final index.
- Finite out-of-range integer destinations clamp to the nearest end.
- `moveTo` returns unchanged when the identity is absent.
- Non-safe-integer and non-finite destinations return unchanged.

### Amounts and ranges

- `take`/`drop` accept only safe integer amounts; invalid amounts throw
  `RangeError`.
- Positive amounts operate from the start; negative amounts operate from the end.
- Oversized valid amounts clamp naturally.
- `IndexRange` throws `RangeError` for a non-safe-integer `start`, `end`, or
  `amount`, including the numeric member of an endpoint tuple.
- A valid non-positive range amount selects an empty range.

## Complexity contracts

Complexity is part of capability meaning, not merely implementation documentation.
Bounds count equality/comparator/hash operations; the cost of one user comparator,
hash, or bigint indicator comparison is parameterized separately.

| Capability | Required complexity |
|---|---|
| `IndexedCollection.at` and endpoints | O(log n) or better |
| `IndexedCollection.streamSlice` | O(log n + m) or better |
| `ValuedCollection.has` | O(log n) or better, amortized hashing allowed |
| `KeyedCollection.get/has` | O(log n) or better, amortized hashing allowed |
| Indexed identity `indexOf` | O(log n) or better |
| Sorted bounds/neighbors | O(log n) or better |
| Sorted range stream | O(log n + m) or better |

Collection-returning `take`, `drop`, `slice`, and `sliceRange` should exploit
structural sharing where the concrete representation permits it, but have no
cross-family asymptotic guarantee. Ordered collections may need to rebuild their
identity index for the selected entries.

These guarantees intentionally prevent an ordinary List from claiming
`ValuedCollection` through a linear scan and prevent a plain iterable from
claiming `IndexedCollection` through repeated traversal.

Ordered indexed operations perform O(log n) tree comparisons. Because rational
indicators are intentionally unbounded, their bigint bit-complexity can grow with
edit history and is not claimed to be O(1).

## Family contracts and renames

### Shared cardinality

- Rename public List and List builder `length` to `size`.
- Do not retain `length` aliases.

### List family

All List variants implement Collection, Indexed, Filterable, RemovableAt, and
SwappableAt capabilities.

| Current | Target |
|---|---|
| `length` | `size` |
| `at(index)` | unchanged |
| `with(index, value)` | `setAt(index, value)` |
| `updateAt(index, fn)` | unchanged |
| `insert(index, values)` | `insertAt(index, values)` |
| `remove(index, { amount })` | `removeAt(index)`; use List-specific splice for bulk removal |
| `streamRange(IndexRange)` | `streamSlice(IndexRange)` |
| `slice(IndexRange, { reversed })` | `slice(IndexRange)`; reverse only the stream |
| `*AndGet` methods | removed; helper design deferred |

Add `swapAt`. Keep List-only sequence operations such as splice, concat, rotate,
repeat, padding, and reversed collection creation outside shared capabilities.

### Map family

| Current | Target |
|---|---|
| `at(key)` | `get(key)` |
| `hasKey(key)` | `has(key)` |
| `addEntry(entry)` | removed; use the existing `set(key, value)` operation |
| `addEntries(entries)` | `setAll(entries)` |
| `removeKey(key)` | `remove(key)` |
| `removeKeys(keys)` | `removeAll(keys)` |
| `updateAt(key, fn)` | `update(key, fn)` |
| `modifyAt(key, options)` | `modify(key, options)` |
| `removeKeyAndGet` / `updateAtAndGet` | removed; helper design deferred |

`MapCollection.Variant<K, V>` contains covariant/read-safe map behavior.
`MapCollection<K, V>` adds invariant editing, context, and builder behavior.

Generic type migration:

| Current | Target |
|---|---|
| `RMap<K, V>` | `MapCollection<K, V>` |
| `RMap.NonEmpty<K, V>` | `MapCollection.NonEmpty<K, V>` |
| `VariantMap<K, V>` | `MapCollection.Variant<K, V>` |
| `VariantMap.NonEmpty<K, V>` | `MapCollection.Variant.NonEmpty<K, V>` |

### Set family

`SetCollection.Variant<T>` contains covariant/read-safe set behavior.
`SetCollection<T>` adds invariant insertion, context, and builder behavior.

Generic type migration:

| Current | Target |
|---|---|
| `RSet<T>` | `SetCollection<T>` |
| `RSet.NonEmpty<T>` | `SetCollection.NonEmpty<T>` |
| `VariantSet<T>` | `SetCollection.Variant<T>` |
| `VariantSet.NonEmpty<T>` | `SetCollection.Variant.NonEmpty<T>` |

Align set algebra with modern JavaScript:

| Current | Target |
|---|---|
| `intersect` | `intersection` |
| `symDifference` | `symmetricDifference` |
| `union` | unchanged |
| `difference` | unchanged |

### Sorted family

SortedMap and SortedSet compose Sorted and Indexed capabilities.

| Current | Target |
|---|---|
| `atIndex(index)` | `at(index)` |
| `sliceIndex(IndexRange)` | `slice(IndexRange)` |
| `streamSliceIndex(IndexRange)` | `streamSlice(IndexRange)` |
| comparator `slice(Range)` | `sliceRange(Range)` |
| `streamRange(Range)` | unchanged |
| set `next` / `previous` | unchanged |
| map `nextEntry` / `previousEntry` | `next` / `previous` |
| `findIndex(identity)` | `indexOf(identity)` |
| `min` / `max` and key/value variants | inherited `first` / `last` entry or value |

Add `removeAt`. Do not add positional set/update, swap, reverse-collection, or order
editing methods because they conflict with comparator order.

### Ordered family

Every OrderedMap/OrderedSet variant implements Indexed, RemovableAt, SwappableAt,
OrderEditable, Reorderable, and the appropriate indexed identity capability.

#### Single-element semantics

- Ordinary map `set` and set `add` preserve an existing identity's position.
- `update`, `modify`, and `mapValues` preserve existing positions unless removing
  an identity.
- `prepend` and `append` insert absent identities or move existing identities to
  the requested end.
- OrderedMap `prepend`/`append` accept one `readonly [K, V]` entry and replace the
  value when the key already exists.
- `placeAt(index, element)` inserts or moves; OrderedMap also replaces the value.
- `moveTo(index, identity)` moves an existing identity without replacing payload.
- `swapAt(index1, index2)` swaps order positions without changing identity/payload.
- Invalid edit no-ops and already-satisfied edits return the same object reference.

#### Bulk semantics

OrderedMap `setAll` and OrderedSet `addAll` gain a trailing option:

```ts
interface OrderedBulkOptions {
  readonly position?: 'preserve' | 'append' | 'prepend';
}
```

- `preserve` is the default: existing identities retain position; new identities
  append in source order.
- `append` moves supplied identities to the end as one block.
- `prepend` moves supplied identities to the start as one block without reversing.
- First source occurrence fixes relative position.
- Last source occurrence supplies the final OrderedMap value.
- An empty source returns the receiver unchanged.

`placeAllAt` is a helper candidate, not a required method.

#### Storage implications

- Continue using identity-to-indicator and indicator-to-element maps.
- Expose positional reads by delegating to the indicator SortedMap's indexed API.
- Ensure every edit updates both maps atomically.
- Keep exact rational `Indicator` values and allow unbounded numerator/denominator
  growth; do not add relabeling in this project.
- Update stale public documentation that says Ordered collections store order in a
  List.

### ProximityMap

ProximityMap must satisfy ordinary keyed identity rules:

- `get(key)` performs exact lookup.
- Add `getNearest(key)` for distance-based lookup.
- `has`, `remove`, `update`, and `modify` remain exact-key operations.
- Builder lookup is exact, matching immutable `get`.

This removes the current inconsistency where nearest lookup can return a value
while exact `has` is false.

### Builders

Builders use separate mutable contracts and do not implement immutable collection
capabilities. Mirror vocabulary and numeric semantics without forcing immutable
return types onto mutable methods:

- List builders use `size`, `at`, `setAt`, `updateAt`, `insertAt`, `removeAt`, and
  `swapAt`.
- Map builders use `get`, `has`, `set`, `setAll`, `remove`, `removeAll`, `update`,
  and `modify`.
- Set builders use `has`, `add`, `addAll`, `remove`, and `removeAll`.
- Ordered builders additionally mirror `prepend`, `append`, `placeAt`, `moveTo`,
  `swapAt`, and bulk position options.

Existing builder-specific result conventions may remain when useful, such as a
boolean change flag or returning a removed value. They are specified by builder
contracts, not by immutable capability interfaces.

## Reference identity guarantees

Guarantee receiver identity for immutable edit no-ops:

- Missing or invalid removals/updates.
- Same-position or invalid swaps.
- Missing or already-positioned moves.
- Setting/updating to an unchanged value under the family's existing value
  sameness rule.
- Empty bulk sources and bulk operations that make no semantic change.

Identity reuse for `take`, `drop`, `slice`, and `filter` remains an optimization,
not a public contract.

## Implementation phases

### Phase 0 — baseline and inventory

1. Run `git status` and record unrelated worktree changes; do not modify them.
2. Run `bun run build:seq` to establish a clean emitted baseline.
3. Run `bun run typecheck`, `bun run biome:check`, and `bun run test`.
4. Capture all current public method occurrences with code search so the final
   removal check can prove there are no stale aliases.
5. Inventory the currently commented Ordered variant files and record what must be
   restored or replaced during Phase 6 before claiming all-variant support.

**Gate:** baseline failures are understood before API work starts.

### Phase 1 — type-only capability spike

Create provisional capability and base types in `@rimbu/collection-types` without
migrating runtime implementations.

Representative compile-only bindings:

- `List<T>` and `List.NonEmpty<T>`.
- `SortedMap<K, V>` and `SortedMap.NonEmpty<K, V>`.
- `OrderedSet<T>` and `OrderedSet.NonEmpty<T>`.

Type assertions must cover:

- Concrete `take`, `drop`, `slice`, filter, remove, swap, and order-edit returns.
- `take(1)` and `drop(0)` NonEmpty refinements.
- Arbitrary `at` remains fallible on NonEmpty.
- Map indexed element is `readonly [K, V]`.
- Sorted map `next` returns an entry.
- NonEmpty overloads appear before normal overloads.
- No `any`, broad casts, Omit reconstruction, or public implementation details.

**Gate:** the capability graph compiles cleanly for all three representative
families before runtime migration begins.

### Phase 2 — collection-types foundation

1. Add public capability interfaces and companion namespaces.
2. Add advanced `*Base` interfaces using Self/NonEmptySelf.
3. Add advanced numeric normalization helpers.
4. Add `SetCollection`, `MapCollection`, and nested `.Variant` types. Retain the
   old top-level R/Variant names as temporary migration aliases only until Phase 4;
   they must never ship in the final release.
5. Add new family bases/modules alongside the legacy bases. Do not change legacy
   base-module vocabulary until direct implementations migrate atomically in
   Phase 4.
6. Export public types from the package root and implementer types only from
   advanced subpaths.
7. Add capability type tests and normalization runtime tests.
8. Add a `test/` directory and package `test` script to collection-types so its
   runtime normalization tests participate in package and root test commands.

**Gate:** collection-types builds, typechecks, and passes its tests independently;
new and temporary migration types coexist without changing current consumers.

### Phase 3 — List family

Affected areas:

- `packages/list/src/list.ts`.
- `packages/list/src/public/{char,bit,typed-array}.ts`.
- `packages/list/src/internal/list-base.ts`.
- List immutable and mutable implementations.
- List runtime, randomized, and type tests.

Work:

1. Bind all List variants to Collection/Indexed/Filterable/RemovableAt/SwappableAt.
2. Rename `length`, `with`, `insert`, `remove`, and `streamRange` APIs.
3. Remove reversed collection output from positional `slice` options.
4. Add `swapAt` to immutable Lists and builders.
5. Apply centralized numeric validation and no-op identity rules.
6. Remove List `*AndGet` public methods.
7. Update docs/examples and all repo consumers.

**Gate:** every List variant passes the shared capability suites and existing
structural/random tests.

### Phase 4 — map/set family and Hash implementations

This phase is atomic across generic bases and direct consumers because method and
type names change together.

1. Replace legacy generic map/set bases and base modules with
   MapCollection/SetCollection, then migrate HashMap and HashSet.
2. Apply map and set method renames.
3. Apply set algebra renames.
4. Preserve existing RelatedTo, OptLazy, context, builder, and NonEmpty behavior.
5. Update context modules, reducers, builders, docs, runtime tests, and type tests.
6. Mechanically migrate every direct MapCollection/SetCollection implementation
   so the new generic bases compile: Sorted, Ordered, and Proximity method names
   change here even though their capability-specific work remains in later phases.
7. Make ProximityMap `get` exact and add `getNearest`; align its builder before it
   claims the new KeyedCollection contract.
8. Mechanically update specialized packages that reference old Variant/R types so
   the monorepo compiles, without broadening their semantic capability adoption.
9. Remove the temporary RMap/RSet/VariantMap/VariantSet aliases only after all
   source, test, and emitted declaration consumers use the new names.

Specialized compile-only migration targets include BiMap, BiMultiMap, MultiMap,
MultiSet, Table, Graph, and their tests because they currently reference the old
generic family types.

**Gate:** Hash and generic family contract suites pass; repo-wide build succeeds
with no old generic map/set method or type references. Proximity exact/nearest
tests pass before the phase closes.

### Phase 5 — Sorted family

1. Compose IndexedKeyed/IndexedValued, Sorted, Filterable, and RemovableAt bases.
2. Rename positional and comparator range methods.
3. Replace min/max APIs with first/last.
4. Rename neighbor and index lookup methods.
5. Add direct `comp` access on collection instances.
6. Implement `removeAt` using order-statistic access plus identity removal.
7. Remove existing `any` returns in take/drop/transform paths encountered by the
   new base composition.
8. Add missing positional type tests.

**Gate:** runtime and type contract suites prove negative indexing, range behavior,
NonEmpty returns, concrete comparator preservation, and required complexity paths.

### Phase 6 — Ordered family

1. Activate and align base, hashed, and sorted Ordered variants.
2. Bind Indexed identity, removal, swapping, order-editing, and reordering traits.
3. Expose `at`, endpoints, take/drop/slice, streamSlice, reverse projections, and
   `indexOf` through the indicator SortedMap.
4. Change ordinary update/set behavior to preserve indicators.
5. Implement prepend, append, placeAt, moveTo, removeAt, and swapAt with dual-map
   synchronization.
6. Implement bulk position options and duplicate-source rules.
7. Mirror names/semantics in separate mutable builder contracts.
8. Correct storage documentation and examples.
9. Add deterministic tests for every empty/non-empty and boundary case.
10. Add randomized Array-plus-Map model tests covering mixed operation sequences.

Random model invariants after every operation:

- Public iteration equals model order.
- `size` matches both internal maps and the model.
- Identity lookup returns the model payload.
- `at(i)` and `indexOf(identity)` are mutual inverses for every element.
- Every identity has one indicator and every indicator has one identity.
- Immutable results do not mutate prior versions.

**Gate:** all Ordered variants pass shared capability suites, model tests, and
existing generic map/set suites.

### Phase 7 — repository migration and cleanup

1. Update `@rimbu/core` exports and docs.
2. Update all examples, tests, comments, and package guides.
3. Search the entire repository for removed names and old type exports.
4. Remove provisional coexistence types from the spike.
5. Add a capability matrix to collection documentation.
6. Add a major changeset describing migration mappings and Proximity behavior.

Final forbidden public names/search targets include:

- List `length`, `with`, positional `insert`, positional `remove`, `streamRange`.
- Map `at`, `hasKey`, `addEntry`, `addEntries`, `removeKey`, `removeKeys`,
  `updateAt`, `modifyAt`, and method-form `*AndGet`.
- Sorted `atIndex`, `sliceIndex`, `streamSliceIndex`, `nextEntry`,
  `previousEntry`, `findIndex`, min/max projection methods.
- Set `intersect`, `symDifference`.
- Generic `RMap`, `RSet`, `VariantMap`, and `VariantSet` exports.

Internal implementation names may remain only when they cannot leak into public
declarations and retaining them is deliberate; prefer completing the rename to
avoid maintenance confusion.

**Gate:** no compatibility alias remains in emitted declarations.

## Testing strategy

### Shared runtime contracts

Place reusable suites with the existing collection-types test utilities. Add one
suite per capability:

- Collection finite/cardinality/traversal contract.
- Indexed lookup/endpoints/ranges/reversal contract.
- Valued and Keyed identity contract.
- Indexed identity inverse contract.
- Filterable same-family contract.
- Sorted bound/neighbor/range contract.
- RemovableAt, SwappableAt, OrderEditable, and Reorderable edit contracts.

Suites receive factories and equality hooks instead of importing concrete
implementations, avoiding package cycles.

### Shared type contracts

For each concrete binding, assert:

- Normal versus NonEmpty return types.
- Concrete family preservation.
- Map entry typing.
- RelatedTo and OptLazy inference.
- Overload order for NonEmpty sources.
- Absence of deprecated members with negative type assertions where practical.

### Numeric boundary matrix

Cover every indexed method with:

- Empty, singleton, and multi-element collections.
- `0`, last positive index, `size`, and values beyond both ends.
- `-1`, `-size`, and values below `-size`.
- Fractional numbers, `NaN`, infinities, and unsafe integers.
- Zero, positive, negative, and oversized take/drop amounts.
- Inclusive/exclusive and negative IndexRange endpoints.
- Tuple IndexRange endpoints whose numeric member is fractional, unsafe, or
  non-finite.

### Verification commands

Always build before typecheck or tests:

```sh
bun run build:seq
bun run typecheck
bun run biome:check
bun run test
```

Run relevant package tests during each phase, but each phase gate ends with the
repo-wide sequence above to catch emitted declaration and downstream failures.

## Documentation and migration guide

Document the capability matrix explicitly:

| Family | Collection | Indexed | Valued/Keyed | Sorted | Filterable | RemoveAt | SwapAt | Order edit |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| List variants | yes | yes | no | no | yes | yes | yes | no |
| HashSet | yes | no | valued | no | yes | no | no | no |
| HashMap | yes | no | keyed | no | yes | no | no | no |
| SortedSet | yes | yes | valued | yes | yes | yes | no | no |
| SortedMap | yes | yes | keyed | yes | yes | yes | no | no |
| OrderedSet variants | yes | yes | valued | no | yes | yes | yes | yes |
| OrderedMap variants | yes | yes | keyed | no | yes | yes | yes | yes |
| ProximityMap | yes | no | keyed | no | yes | no | no | no |

The migration guide must include before/after snippets for List, Map, Sorted, Set
algebra, Ordered reordering, and Proximity exact/nearest lookup.

## Risk register

| Risk | Mitigation |
|---|---|
| Multiple base interfaces create incompatible overloads | Type-only spike before runtime migration |
| NonEmpty precision regresses | Shared type contracts and overload-order assertions |
| HKT complexity leaks into simple traits | Self/NonEmptySelf for shape-preserving methods |
| Map/set rename breaks many downstream packages | Atomic base/direct-consumer phase plus repo-wide search |
| Ordered dual maps diverge | Model tests and invariant checks after every random operation |
| Ordered updates accidentally move entries | Dedicated identity/reference tests for every update path |
| Arbitrary placement grows bigint labels | Accepted; document unbounded exact rational tradeoff |
| Numeric edge behavior differs by family | One advanced normalization implementation and shared matrix |
| Generic helpers violate complexity guarantees | No scan-based behavioral helpers |
| Stale emitted declarations hide failures | Always run `build:seq` before typecheck/tests |

## Completion criteria

The redesign is complete only when:

1. The final public surface contains the target capability and family names.
2. All core families implement exactly the natural capability matrix above.
3. No deprecated alias appears in emitted declarations.
4. No new `any`, Omit-based NonEmpty reconstruction, or broad return cast is used
   to satisfy capability composition.
5. All capability runtime and type suites pass for every adopter.
6. Ordered randomized model tests pass for every variant.
7. Proximity exact and nearest lookup semantics are distinct and documented.
8. `bun run build:seq`, `bun run typecheck`, `bun run biome:check`, and
   `bun run test` all pass from the repository root.
9. A major changeset and migration guide are ready for the lockstep release.

## Deferred decisions

Track these after the migration rather than expanding this project:

- Whether `*AndGet` helpers belong on concrete Context singletons.
- Whether optimized concrete `placeAllAt` methods are justified.
- Whether List and Ordered families need shared reversible/rotatable traits.
- Whether Ordered rational labels need relabeling after real workload profiling.
- Which narrow capabilities specialized packages should adopt after semantic audit.
