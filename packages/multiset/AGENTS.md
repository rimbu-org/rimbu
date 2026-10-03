# @rimbu/multiset — Package Agent Guide

Rimbu's **immutable multiset**: a collection where a value may occur any number of times (its
*count*). It is backed internally by a count map (`value → count`), so add/remove/set-count
operations are O(log N) and the collection stays fully immutable.

The package is built on the **capability system** of `@rimbu/collection-types`: a
`MultiSet<T>` is a `ValuedCollection` (element-addressed, with `has`) extended with a
package-local `MultiSetCollection.Capability` suite for the count-aware operations.

> For workspace-wide conventions (biome rules, `build:seq` before typecheck/test, the
> Interface + Namespace pattern, capability families, `NonEmpty` tracking, `OptLazy`, and the
> changeset workflow) see the **root `AGENTS.md`**. This file covers only what is specific to
> `@rimbu/multiset`. The decision log is in `.scratch/multiset-migration-plan.md`.

## Source layout

```
src/
├── multiset.ts               # exports["."]           — re-exports advanced + public
├── advanced/                 # exports["./advanced/*"]
│   └── multiset-base.ts      # MultiSetCollection.Capability.*, Advanced.{Api,BuilderApi,ContextApi,FamilyBase}
├── public/                   # exports["./*"]
│   ├── multiset.ts           # @rimbu/multiset/multiset — MultiSet + NonEmpty/Builder/Context/Advanced + const
│   ├── hashed.ts             # @rimbu/multiset/hashed  — HashMultiSet  (context)
│   └── sorted.ts             # @rimbu/multiset/sorted  — SortedMultiSet (context)
└── internal/                 # NEVER exported; "#multiset/*" only
    ├── builder.ts            # MultiSetBuilder
    ├── context-factory.ts    # MultiSetContextImpl + MultiSetContext
    └── immutable/
        ├── empty.ts          # MultiSetEmpty
        └── non-empty.ts      # MultiSetNonEmptyBase
```

### Key rule: imports inside `src/`

- `@rimbu/multiset/advanced/*` for anything in `src/advanced/*`.
- `#multiset/*` for anything in `src/internal/*`.
- `@rimbu/multiset` (and sub-paths) for the public types.
- **Never** relative imports — banned by Biome.

## Architecture

### One collection type, three contexts

There is a **single** `MultiSet<T>` type. `HashMultiSet` and `SortedMultiSet` are not types — they
are `MultiSet.Context` instances, each a one-liner:

```ts
export const HashMultiSet: MultiSet.Context<any> = MultiSet.createContext({
	countMapContext: HashMap.collectionContext,
});
```

| Export | Backing count map |
|---|---|
| `MultiSet` (root const) | `HashMap` |
| `HashMultiSet` | `HashMap` |
| `SortedMultiSet` | `SortedMap` |

`MultiSet.typeTag` is therefore uniformly `'MultiSet'`: the tag describes the collection, not
the backing. **This means `toString()` output does not reveal the backing** —
`HashMultiSet.of('a','b').toString()` is `MultiSet(a, b)`, not `HashMultiSet(a, b)`. That is
intentional and matches `MultiMap` / `BiMultiMap`.

Any other backing is `MultiSet.createContext({ countMapContext })`. `createContext` lives on
`MultiSetCollection.Advanced.ContextApi`, so **every** context has it, and its options are
optional — an omitted `countMapContext` inherits the context's own backing.

### `countMap` is generic, not per-variant

`countMap` is `MapCollection<T, number>` (`MapCollection.NonEmpty<T, number>` on non-empty
instances) on **every** backing. The concrete `HashMap`/`SortedMap` is an implementation detail,
exactly as `BiMap` exposes its delegate maps generically. This is the one caller-visible loss in
the variant collapse: `HashMultiSet<T>['countMap']` used to be a `HashMap<T, number>`.

### Family / HKT

`MultiSet.Advanced.Family<T>` (in `public/`) is the family: it extends
`MultiSetCollection.Advanced.FamilyBase<T>`, `ValuedCollection.Advanced.Family<T>`, and the
element-level `Collection.Capability.WithAdd` / `WithAddEach` / `WithToBuilder`, then pins the
slots:

| Slot | Value |
|---|---|
| `_NORMAL` | `MultiSet<T>` |
| `_NON_EMPTY` | `MultiSet.NonEmpty<T>` |
| `_BUILDER` | `MultiSet.Builder<T>` |
| `_CONTEXT` | `MultiSet.Context<T>` |
| `_UPPER_E` | `T` |
| `_INVARIANT` | `(element: T) => T` |
| `_FAM` / `_NEW_FAMILY` | `Family<T>` / `Family<this['_NEW_E']>` |

`_INVARIANT` is load-bearing: a MultiSet takes `(value, count)` pairs and count-wise algebra
operands, so it is invariant in `T`. `test-d/contexts.test-d.ts` asserts invariance directly,
since there is no covariant variant tier left to compare against.

### Capability suite (`advanced/multiset-base.ts`)

| Capability | Members |
|---|---|
| `WithCount` | `count`, `sizeDistinct` |
| `WithCountStreams` | `streamDistinct`, `streamWithCounts` |
| `WithCountMap` | `countMap` |
| `WithSetCount` | `setCount`, `modifyCount` |
| `WithAddEachWithCounts` | `addEachWithCounts` |
| `WithFilterWithCounts` | `filterWithCounts` |
| `WithRemove` | `remove(value, amount?)` |
| `WithRemoveEach` | `removeEach(values)` |
| `WithRemoveAll` | `removeAll(value)` |
| `WithUnion` / `WithIntersection` / `WithDifference` / `WithSymmetricDifference` | count-wise algebra |

The amount-carrying `add(value, amount)` overload is declared on top of the generic
`Collection.Capability.WithAdd`, using the **literal-amount trick**
`0 extends N ? Tp['_SELF'] : Tp['_NON_EMPTY']`, so `add(v, 0)` keeps the current kind while
`add(v, n>0)` is non-empty. `setCount` uses the same trick.

## Core API semantics (deliberate — do not "fix")

### Iteration shapes
- `stream()` / `toArray()` yield **each occurrence** (`{1,2,2}` → `[1,2,2]`).
- `streamDistinct()` yields each distinct value once.
- `streamWithCounts()` yields `[value, count]` per distinct value.
- `forEach(f)` yields each occurrence; `forEachIndexed(f)` adds `index` / `halt`.

### Count-wise algebra
Operands are `MultiSet<U>` with `U extends T`, so hashed and sorted MultiSets interoperate.
Per value:

| Operation | Result |
|---|---|
| `union` | `max(this, other)` |
| `intersection` | `min(this, other)` |
| `difference` | `max(0, this − other)` |
| `symmetricDifference` | `abs(this − other)` |

### Removal
- `remove(value, amount?)` removes `amount` occurrences (default `1`). No `'ALL'` option and no
  options object — `amount` is positional.
- `removeAll(value)` removes **all** occurrences of a single `value`. Root `AGENTS.md` §1.1
  names this the deliberate literal exception to the `*Each` rule: `All` refers to *all
  occurrences of one value*, not to "the whole collection". The capability is
  `WithRemoveAll`; its bulk form is `WithRemoveEach`.
- `removeEach(values)` removes **one occurrence for each element yielded by `values`**. Since
  `values` is a `StreamSource`, the multiplicity comes from the operand: `removeEach([2])` drops
  2's count by one, while `removeEach(MultiSet.of(2, 2))` drops it by two. Consequently
  `m.removeEach(m)` empties `m` — each value loses exactly as many occurrences as it has.
  Note this is *not* "remove every occurrence of each listed value": for that use
  `removeAll(value)` or `remove(value, amount)`.

### NonEmpty tracking
`add` → non-empty. `union` → non-empty whenever **either** operand is. `intersection`,
`difference` and `symmetricDifference` may empty and return the normal type. `setCount(v, n>0)`
→ non-empty, `setCount(v, 0)` → normal. `modifyCount` likewise.

### The literal-amount trick is load-bearing
`0 extends N` distinguishes a literal `0` from a widened `number`. It is why `add(v, 0)` does not
claim to produce a non-empty collection. Do not "simplify" it to a plain `N extends 0`.

## Deliberate deviations

- **`countMap` generic rather than per-variant** — see above.
- **`removeAll` keeps its name** — root `AGENTS.md` §1.1's named exception.
- **`MultiSetCreators` is a deprecated alias** for `MultiSet.Context<any>`, kept only so
  existing references resolve. It is not part of the intended surface; do not add to it.

## Known deviations in `@rimbu/collection-types`

- `MultiSetContextImpl` extends `ContextBaseWithAddEach<FAM>` but implements `createContext`
  itself. `createContext` is on `MultiSetCollection.Advanced.ContextApi` (a package-local
  addition) rather than a shared capability, because the backing to vary is a **count map**, not
  the collection's own element shape.
- `MultiSetEmpty` extends a **local** `MultiSetEmptyBase`, itself
  `ValuedCollectionEmpty.WithMixin(CollectionEmpty.Constructor)`. The valued mixin contributes the
  boolean set algebra (`add`, `remove`, `union`, `intersection`, …), all of which a MultiSet must
  override with count-wise semantics; only `mutate` / `recompose` survive from it. The count API
  (`countMap`, `count`, …) is implemented directly on the class.
- `MultiSetNonEmptyBase` does the same via `MultiSetNonEmptyMixin` =
  `ValuedCollectionNonEmpty.WithMixin(CollectionNonEmpty.Constructor)`, and stores a non-empty
  count map plus a total `size`.
- `MultiSetBuilder` extends `CollectionBuilderBase<T, Tp['_FAM'], Tp>`.

## Testing

| Directory | Purpose |
|---|---|
| `test/` | Runtime tests — `runMultiSetTestsWith(name, context)`, run for both contexts |
| `test-d/multiset.test-d.ts` | Type-level tests for the method surface (the bulk of the coverage) |
| `test-d/contexts.test-d.ts` | Type-level tests for the **factory** dimension: variants-are-contexts, uniform `typeTag`, context interoperability, `createContext`, invariance |
| `test-random/` | Randomized tests against a `Map`-based model |

**There is no per-variant `test-d` file, and that is deliberate.** Before the variant collapse,
`hash-multiset.test-d.ts` and `sorted-multiset.test-d.ts` existed — but diffing their assertion
groups showed each was a strict *subset* of `multiset.test-d.ts` (identical except the generic
file also covered `.intersection`). Their only unique content was the variant *types*. With the
types gone they were pure duplication, so they were replaced by `contexts.test-d.ts`.

When adding a method, extend `multiset.test-d.ts` only. Add to `contexts.test-d.ts` only when the
change is about contexts rather than methods.

Note that the context dimension is asserted by **plain assignability** rather than
`expectTypeOf`: the `ContextApi` is wide enough that a structural comparison produces spurious
mismatches, and assignability is the real contract.

## Tooling

Always `bun run build:seq` (from the repo root) before `typecheck`/`test`.

| Command | Purpose |
|---|---|
| `bun run typecheck` | `tsc -p tsconfig.json --noEmit` (src + test + test-d) |
| `bun run test` | `bun test test/* --tsconfig-override tsconfig.common.json` |
| `bun run test:random` | `bun test ./test-random` (requires a build) |
| `bun run build` | emit this package to `dist/` |
| `bun run biome:check` / `biome:fix` | lint + format `src` |

Always use the package scripts rather than bare `bun test test/`. The scripts pass
`--tsconfig-override tsconfig.common.json`; without it, cross-package subpath imports fail to
resolve and you will see a wave of bogus `Cannot find module '@rimbu/collection-types/test-utils/…'`
failures. Likewise prefer `bun test ./test-random` over `bun test test-random` — without the
`./` the argument is a *filter* and can pull in other packages' suites.

The `noExplicitAny` warnings are the accepted pattern for the polymorphic
`MultiSet.Context<any>` context entries.

## How to add a method

1. Decide where it belongs: an existing shared capability, or a new
   `MultiSetCollection.Capability.WithX` in `advanced/multiset-base.ts`.
2. Add the `Api` (and `BuilderApi` if the builder can do it) and include it in
   `MultiSetCollection.Advanced.Api` / `.BuilderApi`.
3. Implement it in `internal/immutable/empty.ts` and `non-empty.ts`, and in
   `internal/builder.ts` if it belongs on the builder. `empty.ts` needs an entry for every
   collection method; `non-empty.ts` needs the `NonEmpty` overloads, with the
   **non-empty-preserving overload first** (root `AGENTS.md` §1.1).
4. Preserve the semantics above: count-wise (not boolean) algebra, positional `amount`, and the
   literal-amount trick for anything taking a count.
5. Add runtime coverage to `test/multiset-test-standard.ts` and type coverage to
   `test-d/multiset.test-d.ts` — not to a variant file, there are none.
6. If a new capability is needed, add a row to the capability table in this file.

## Changesets

Removing `VariantMultiSet`, changing `remove`/`removeEach` signatures, renaming
`intersect`/`symDifference` to `intersection`/`symmetricDifference`, collapsing the variant types
into contexts, making `typeTag` uniform, and widening `countMap` are all **breaking** and require
a `major` bump. Because all Rimbu packages are lockstep-fixed, a single changeset listing
`@rimbu/multiset` and `@rimbu/core` bumps them both.
