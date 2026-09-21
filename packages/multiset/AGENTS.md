# @rimbu/multiset — Package Agent Guide

This package provides Rimbu's **immutable multiset**: a collection where a value may
occur any number of times (its *count*). It is backed internally by a count map
(`value → count`), so add/remove/set-count operations are O(log N) and the collection
stays fully immutable.

Two concrete variants exist:
- `HashMultiSet` — count map is a `HashMap` (hash-ordered iteration).
- `SortedMultiSet` — count map is a `SortedMap` (sorted iteration).

The package uses the **capability-based API** from `@rimbu/collection-types`: a
`MultiSet` is a `ValuedCollection` (element-addressed, with `has`) extended with a
package-local `MultiSetCollection.Capability` suite for the count-aware operations.
There is no type-variant base anymore.

> For workspace-wide conventions (biome rules, `build:seq` before typecheck/test, the
> Interface + Namespace pattern, HKT families, NonEmpty tracking, `OptLazy`, `RelatedTo`,
> and the changeset workflow) see the **root `AGENTS.md`**. This file only covers what is
> specific to `@rimbu/multiset`.

## Source layout

```
src/
├── multiset.ts            # exports["."]      — re-exports advanced/multiset-base + public/multiset
├── advanced/             # exports["./advanced/*"] — implementer / extension API
│   └── multiset-base.ts   # MultiSetCollection.Capability.*, MultiSetBase, MultiSetBuilderBase
├── public/               # exports["./*"]
│   ├── multiset.ts        # @rimbu/multiset/multiset — generic MultiSet + Advanced + factory const
│   ├── hashed.ts          # @rimbu/multiset/hashed   — HashMultiSet
│   └── sorted.ts          # @rimbu/multiset/sorted   — SortedMultiSet
└── internal/             # NEVER exported; "#multiset/*" only
    ├── base.ts            # MultiSetEmpty, MultiSetNonEmptyBase, MultiSetBuilder
    └── context-factory.ts # MultiSetContextBase + MultiSetContext / HashMultiSetContext / SortedMultiSetContext
```

### Key rule: imports inside `src/`
- Use the package alias `#multiset/*` for anything in `src/internal/*`.
- Use `@rimbu/multiset` (and sub-paths) for the public types.
- Never use relative imports — banned by Biome.

## Architecture

### Family / HKT

Each concrete variant declares its own `Advanced.Family<T>` extending
`MultiSet.Advanced.Family<T>`, which in turn extends
`ValuedCollection.Advanced.Family<T>` plus `Collection.Capability.WithAdd`,
`WithAddAll`, and `WithToBuilder`. The family pins the HKT slots
(`_NORMAL`, `_NON_EMPTY`, `_BUILDER`, `_CONTEXT`, `_UPPER_E`, `_INVARIANT`, `_FAM`,
`_NEW_FAMILY`).

The count map is exposed as the **generic** `MapCollection<T, number>` (and
`MapCollection.NonEmpty<T, number>` on non-empty instances): the concrete `HashMap` /
`SortedMap` backing is an implementation detail, mirroring how `BiMap` exposes its
delegate maps.

### Capability suite (`advanced/multiset-base.ts`)

`MultiSetCollection.Capability.*` holds the count-aware API as plain `Api` /
`BuilderApi` interfaces (the `BiMapCollection.Capability` shape), aggregated into
`MultiSetBase` / `MultiSetBuilderBase`:

| Capability | Members |
|---|---|
| `WithCount` | `count`, `sizeDistinct` (`count` on the builder too) |
| `WithCountStreams` | `streamDistinct`, `streamWithCounts` |
| `WithCountMap` | `countMap` |
| `WithSetCount` | `setCount`, `modifyCount` |
| `WithAddAllWithCounts` | `addAllWithCounts` |
| `WithFilterWithCounts` | `filterWithCounts` |
| `WithRemove` | `remove(value, amount?)` (default `1`) |
| `WithRemoveAll` | `removeAll(values)` (all occurrences of each) |
| `WithUnion` / `WithIntersection` / `WithDifference` / `WithSymmetricDifference` | count-wise algebra over `MultiSet` operands |

The amount-carrying `add(value, amount)` overload is declared directly on
`MultiSetBase` on top of the generic `Collection.Capability.WithAdd`. It uses the
literal-amount trick: `0 extends N ? Tp['_SELF'] : Tp['_NON_EMPTY']`, so
`add(v, 0)` keeps the current kind while `add(v, n>0)` is non-empty.

### Runtime classes (`internal/base.ts`)

- `MultiSetEmpty<T, Tp>` extends `CollectionEmpty.Base<T, Tp>` directly (the valued
  mixins are deliberately not used, since their boolean set algebra would conflict with
  the count-wise MultiSet algebra). It implements the count API directly.
- `MultiSetNonEmptyBase<T, Tp>` extends `CollectionNonEmpty.Base<T, Tp>`, stores a
  non-empty count map and a total `size`.
- `MultiSetBuilder<T, Tp>` extends `CollectionBuilderBase<T, Tp['_FAM'], Tp>`.

Contexts (`internal/context-factory.ts`) extend `ContextBaseWithAddAll<FAM>` and
expose `typeTag`, `countMapContext` (a `MapCollection.Context`, defaulting to
`HashMap` / `SortedMap`), `isValidElem`, `reducer`, and memoised `empty`.

## Core API semantics (deliberate — do not "fix")

### Iteration shapes
- `stream()` yields **each occurrence** of each value (`{1,2,2}` → `[1,2,2]`).
- `streamDistinct()` yields each **distinct** value once.
- `streamWithCounts()` yields `[value, count]` tuples for each distinct value.
- `toArray()` returns the occurrence-expanded array.
- `forEach(f)` yields each occurrence (base `Collection` signature);
  `forEachIndexed(f)` provides `index`/`halt`.

### Count-wise algebra
Operands are `MultiSet<U>` (`U extends T`), so cross-variant operations work
(hashed ∪ sorted). Defined element-wise on counts:
- `union` → `max(thisCount, otherCount)`
- `intersection` → `min(thisCount, otherCount)`
- `difference` → `max(0, thisCount − otherCount)`
- `symmetricDifference` → `|thisCount − otherCount|`

### Removal
- `remove(value, amount?)` removes `amount` occurrences (default `1`).
- `removeAll(values)` removes **all** occurrences of every value in `values`.
There is no `'ALL'` option and no options object; `amount` is positional.

### NonEmpty tracking
`add` → non-empty; `union` returns non-empty whenever either operand is non-empty;
`intersection` / `difference` / `symmetricDifference` may empty and return the normal
type; `setCount(value, n>0)` is non-empty, `setCount(value, 0)` is normal.

## Testing

| Directory | Purpose |
|---|---|
| `test/` | Runtime tests — `runMultiSetTestsWith(name, context)` shared by both variants |
| `test-d/` | Type-level tests (`expectTypeOf`) |
| `test-random/` | Randomized tests against a `Map`-based model |

## Tooling

All commands run from this package directory. Per the root guide, **always
`bun run build:seq` (from the repo root) before `typecheck`/`test`**.

| Command | Purpose |
|---|---|
| `bun run typecheck` | `tsc -p tsconfig.json --noEmit` |
| `bun run test` | `bun test test/* --tsconfig-override tsconfig.common.json` |
| `bun run test:random` | `bun test test-random` (requires a build) |
| `bun run build` | emit this package to `dist/` |
| `bun run biome:check` / `biome:fix` | lint + format `src` |

## Changesets

Removing `VariantMultiSet`, changing `remove`/`removeAll` signatures, and renaming
`intersect`/`symDifference` to `intersection`/`symmetricDifference` are **breaking
changes** and require a `major` bump. Because all Rimbu packages are lockstep-fixed, a
single changeset listing `@rimbu/multiset` **and** `@rimbu/core` bumps both.
