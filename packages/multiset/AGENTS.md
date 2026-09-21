# @rimbu/multiset — Package Agent Guide

This package provides Rimbu's **immutable multiset**: a collection where a value may
occur any number of times (its *count*). It is backed internally by a count map
(`value → count`), so add/remove/set-count operations are O(log N) and the collection
stays fully immutable.

The generic public type is `MultiSetBase<T, F>` (`advanced/multiset-base.ts`), parameterised
by the **count-map family** `F` — any `MapCollection.Advanced.Family<T, number>`. The
default `MultiSet<T>` is `MultiSetBase<T, MapCollection.Advanced.Family<T, number>>`; the
named variants pin `F` to a concrete map:

- `HashMultiSet<T>` — `MultiSetBase<T, HashMap.Advanced.Family<T, number>>`.
- `SortedMultiSet<T>` — `MultiSetBase<T, SortedMap.Advanced.Family<T, number>>`.

Any map can therefore define a concretely typed MultiSet kind with a one-line alias, e.g.
`type MyMultiSet<T> = MultiSetBase<T, MyMap.Advanced.Family<T, number>>`. `countMap` and
`countMapContext` resolve to the concrete map type, and the kind is preserved through
element retyping (`map`/`flatMap`) via `Collection.Advanced.ReTypeFam` in the family's
`_NEW_FAMILY`.

The package uses the **capability-based API** from `@rimbu/collection-types`: a
`MultiSet` is a `ValuedCollection` (element-addressed, with `has`) extended with a
package-local `MultiSetCollection.Capability` suite for the count-aware operations.
There is no read-only type-variant base (`VariantMultiSet` was removed).

> For workspace-wide conventions (biome rules, `build:seq` before typecheck/test, the
> Interface + Namespace pattern, HKT families, NonEmpty tracking, `OptLazy`, `RelatedTo`,
> and the changeset workflow) see the **root `AGENTS.md`**. This file only covers what is
> specific to `@rimbu/multiset`.

## Source layout

```
src/
├── multiset.ts            # exports["."]      — re-exports advanced/multiset-base + public/multiset
├── advanced/             # exports["./advanced/*"] — implementer / extension API
│   └── multiset-base.ts   # MultiSetCollection.{Advanced,Capability}.* (Api, BuilderApi, ContextApi, FamilyBase, Family) + MultiSetBase<T, F>
├── public/               # exports["./*"]
│   ├── multiset.ts        # @rimbu/multiset/multiset — MultiSet + Advanced.Family (alias) + factory const
│   ├── hashed.ts          # @rimbu/multiset/hashed   — HashMultiSet (F = HashMap.Advanced.Family)
│   └── sorted.ts          # @rimbu/multiset/sorted   — SortedMultiSet (F = SortedMap.Advanced.Family)
└── internal/             # NEVER exported; "#multiset/*" only
    ├── base.ts            # MultiSetEmpty, MultiSetNonEmptyBase, MultiSetBuilder
    └── context-factory.ts # MultiSetContext (generic over UT + FAM)
```

### Key rule: imports inside `src/`
- Use the package alias `#multiset/*` for anything in `src/internal/*`.
- Use `@rimbu/multiset` (and sub-paths) for the public types.
- Never use relative imports — banned by Biome.

## Architecture

### Family / HKT

The single generic family `MultiSetCollection.Advanced.Family<T, F>`
(`advanced/multiset-base.ts`) extends `MultiSetCollection.Advanced.FamilyBase<T, F>` (the
count-map slot carrier in the same file), `ValuedCollection.Advanced.Family<T>` plus
`Collection.Capability.WithAdd`, `WithAddAll`, and `WithToBuilder`. It pins the HKT slots
(`_NORMAL`, `_NON_EMPTY`, `_BUILDER`, `_CONTEXT`, `_UPPER_E`, `_INVARIANT`, `_FAM`,
`_NEW_FAMILY`) and carries `_COUNT_MAP_FAMILY: F` with its derived
`_COUNT_MAP` / `_COUNT_MAP_NON_EMPTY` / `_COUNT_MAP_CONTEXT`. `MultiSet.Advanced.Family<T, F>`
is an alias of it; `HashMultiSet.Advanced.Family<T>` and `SortedMultiSet.Advanced.Family<T>`
are further aliases that pin `F`.

`MultiSetBase` and `Family` live together in `advanced/multiset-base.ts` so the base does
not depend on `public/multiset.ts` (a `MultiSetBase` ↔ `MultiSet.Advanced.Family` cycle
would otherwise stop TypeScript resolving the collection API members). `MultiSetBase` is
exported from `@rimbu/multiset` (via `export *`) and `@rimbu/multiset/advanced/multiset-base`,
not from the `/multiset` subpath.

`FamilyBase`'s `F` is deliberately constrained to the wide `AnyFamily`
(`Collection.Advanced.FamilyBase<any>`), because TypeScript cannot prove
`Collection.Advanced.ReTypeFam<F, readonly [E2, number]>` satisfies a keyed-family
constraint for a generic `F`. The faithful `CountMapFamily<T>` constraint is applied at the
public `MultiSetBase<T, F>` entry point; the derived slot helpers
(`CountMapFrom` / `CountMapNonEmptyFrom` / `CountMapContextFrom`) fall back to the generic
`MapCollection` when `F` is not a concrete map family.

`countMap` is exposed as the **concrete** map of `F`: `HashMap<T, number>` for
`HashMultiSet`, `SortedMap<T, number>` for `SortedMultiSet`, and the generic
`MapCollection<T, number>` (NonEmpty on non-empty instances) for the default `MultiSet`.

### Capability suite (`advanced/multiset-base.ts`)

`MultiSetCollection.Capability.*` holds the count-aware API as plain `Api` /
`BuilderApi` interfaces (the `BiMapCollection.Capability` shape), aggregated into
`MultiSetCollection.Advanced.Api` / `BuilderApi`:

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
`MultiSetCollection.Advanced.Api` on top of the generic `Collection.Capability.WithAdd`.
It uses the literal-amount trick: `0 extends N ? Tp['_SELF'] : Tp['_NON_EMPTY']`, so
`add(v, 0)` keeps the current kind while `add(v, n>0)` is non-empty.

`Api` reads `countMap` from the family slots: `[Tp['_IS_NON_EMPTY']] extends [true] ?
Tp['_COUNT_MAP_NON_EMPTY'] : Tp['_COUNT_MAP']`.

### Runtime classes (`internal/base.ts`)

- `MultiSetEmpty<T, Tp>` extends `CollectionEmpty.Base<T, Tp>` directly (the valued
  mixins are deliberately not used, since their boolean set algebra would conflict with
  the count-wise MultiSet algebra). It implements the count API directly.
- `MultiSetNonEmptyBase<T, Tp>` extends `CollectionNonEmpty.Base<T, Tp>`, stores a
  non-empty count map and a total `size`.
- `MultiSetBuilder<T, Tp>` extends `CollectionBuilderBase<T, Tp['_FAM'], Tp>`.

`MultiSetContext<UT, FAM>` (`internal/context-factory.ts`) extends
`ContextBaseWithAddAll<FAM>` and exposes `typeTag`, `countMapContext`
(`MapCollection.Context<FAM['_COUNT_MAP_FAMILY']>`, so concretely `HashMap.Context` /
`SortedMap.Context`), `isValidElem`, `reducer`, and memoised `empty`. Runtime storage is
widened and cast; only the public `Context` types carry `F`.

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

Changing `remove`/`removeAll` signatures, renaming `intersect`/`symDifference` to
`intersection`/`symmetricDifference`, and changing the `MultiSetBase<T, F>` parameter
shape or the family `_COUNT_MAP_FAMILY` slot are **breaking changes** and require a `major`
bump. Because all Rimbu packages are lockstep-fixed, a single changeset listing
`@rimbu/multiset` **and** `@rimbu/core` bumps both.
