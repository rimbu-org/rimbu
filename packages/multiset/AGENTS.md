# @rimbu/multiset — Package Agent Guide

This package provides Rimbu's **immutable multiset**: a collection where a value may
occur any number of times (its *count*). It is backed internally by a count map
(`value → count`), so add/remove/set-count operations are O(log N) and the collection
stays fully immutable.

Two concrete variants exist:
- `HashMultiSet` — count map is a `HashMap` (hash-ordered iteration).
- `SortedMultiSet` — count map is a `SortedMap` (sorted iteration).

Both also share a type-variant read-only base `VariantMultiSet` (see `variant.ts`), and
every type is re-exported from `@rimbu/core/multiset`.

> For workspace-wide conventions (biome rules, `build:seq` before typecheck/test, the
> Interface + Namespace pattern, HKT `Types` slots, NonEmpty tracking, `OptLazy`,
> `RelatedTo`, and the changeset workflow) see the **root `AGENTS.md`**. This file only
> covers what is specific to `@rimbu/multiset`.

## Source layout

```
src/
├── multiset.ts     # exports["."]             — type-invariant MultiSet interface + creators
├── public/        # exports["./*"]           — public subpaths (dist/public/*)
│   ├── hashed.ts   # @rimbu/multiset/hashed   — HashMultiSet
│   ├── sorted.ts   # @rimbu/multiset/sorted   — SortedMultiSet
│   └── variant.ts  # @rimbu/multiset/variant  — VariantMultiSet (type-variant read-only base)
└── internal/        # NEVER exported; "#multiset/*" only
    ├── types.ts        # ALL interface declarations: VariantMultiSetBase, MultiSetBase, Builder, Factory, Context
    ├── base.ts         # Implementations: MultiSetEmpty, MultiSetNonEmpty, MultiSetBuilder
    ├── context-factory.ts  # createMultiSetContextModule — the Module/context factory
    └── creators.ts     # MultiSetCreators / HashMultiSetCreators / SortedMultiSetCreators
```

### Restructure note (deviation from draft plan)

The draft `plans/multiset.md` proposed moving `variant.ts` to `advanced/`
(`@rimbu/multiset/advanced/variant`). **This was not followed**, because `@rimbu/core`
re-exports `@rimbu/multiset/variant` and `packages/multiset/test-d/multiset.test-d.ts`
imports `VariantMultiSet` from `@rimbu/multiset/variant`. Moving it to `advanced/` would
break both. Instead, the only change made was to relocate `hashed.ts`, `sorted.ts`, and
`variant.ts` under `public/`, and repoint the leaking `"./*" → "./dist/*.js"` export
at `"./*" → "./dist/public/*"`, so `internal/` is no longer reachable. No `./advanced/*`
tier was added.

### Key rule: imports inside `src/`
- Use the package alias `#multiset/*` for anything in `src/internal/*`
  (e.g. `import type { MultiSetBase } from '#multiset/types'`).
- Use `@rimbu/multiset` (and sub-paths) for the public types.
- Use `@rimbu/collection-types`, `@rimbu/hashed`, `@rimbu/sorted`, `@rimbu/stream`,
  `@rimbu/common` for dependencies.

## Architecture

### Three layers
1. **`VariantMultiSetBase`** (`types.ts`) — type-variant, read-only base. Has `stream()`,
   `streamDistinct()`, `streamWithCounts()`, `count`, `has`, `size`, `sizeDistinct`,
   `filterWithCounts`, `addAllWithCounts`, `removeAll`. No context, no mutation.
2. **`MultiSetBase`** (`types.ts`) — extends `VariantMultiSetBase` and adds the context,
   mutating-style operations (`add`, `addAll`, `setCount`, `modifyCount`, `remove`,
   `removeAll`), the **set algebra** (`union`/`intersect`/`difference`/`symDifference`),
   and `toBuilder()`.
3. **`MultiSet` / `HashMultiSet` / `SortedMultiSet`** — concrete interfaces that bind the
   HKT `Types` slot to the real collection and re-declare `NonEmpty` overloads where
   useful. They contain almost no method signatures; everything lives in the bases.

### Implementations (`base.ts`)
- `MultiSetEmpty<T>` extends `EmptyBase` — all queries return empty/false/`this`; mutations
  delegate to `this.context` (e.g. `add` builds a new non-empty from `countMapContext`).
- `MultiSetNonEmpty<T>` extends `NonEmptyBase` — holds `countMap` (a non-empty RMap) and
  `size`; only this class actually stores data.
- `MultiSetBuilder<T>` — mutable accumulator over a `countMap` builder; `build()` returns
  an immutable instance.

### HKT `Types` slot
`MultiSetBase.Types` (and the variant equivalent) must provide `normal`, `nonEmpty`,
`context`, `builder`, and `countMap`/`countMapNonEmpty`. A concrete type (e.g.
`HashMultiSet.Types`) binds these to the real classes so abstract method return types
resolve to the concrete collection.

## Core API semantics

### Iteration shapes (deliberate — do not "fix")
- `stream()` yields **each occurrence** of each value (e.g. `{1,2,2}` → `[1,2,2]`). This is
  the generalization of `Set.stream()`, and matches Guava's `Multiset.iterator()`. It is
  lazy, so it costs nothing unless consumed.
- `streamDistinct()` yields each **distinct** value once.
- `streamWithCounts()` yields `[value, count]` tuples for each distinct value.
- `toArray()` returns the occurrence-expanded array (`[1,2,2]`), consistent with `stream()`.

### Set algebra (`union` / `intersect` / `difference` / `symDifference`)
Defined element-wise on **counts** (this is what makes a multiset a multiset, as opposed
to a plain `Set`):
- `union`          → `max(thisCount, otherCount)`
- `intersect`      → `min(thisCount, otherCount)`
- `difference`     → `max(0, thisCount − otherCount)`
- `symDifference`  → `|thisCount − otherCount|`

Operands are `MultiSet<U>` (where `U extends T`). Implementation: read the other's counts
via `other.streamWithCounts()` and fold into a builder of `this` context, so it works even
across variants (hashed ∪ sorted).

### NonEmpty tracking
Follows the workspace rule: operations that provably keep data non-empty return the
`NonEmpty` variant.
- `add` → `nonEmpty`.
- `union` returns `nonEmpty` whenever **either** the source or the operand is non-empty
  (`union(other: MultiSet.NonEmpty<U>): nonEmpty` overload). This is the key invariant:
  `max(this.size, other.size) >= 1` if either side is non-empty.
- `intersect` / `difference` / `symDifference` may empty the collection, so they return the
  normal (possibly-empty) type.

### Removal
`remove(value, { amount })` removes one or `'ALL'` occurrences of a single value.
`removeAll(values, { amount })` consolidates the old `removeAllSingle` /
`removeAllEvery`: `amount: 'ALL'` (default) removes all occurrences of every value in
`values`; `amount: 1` removes a single occurrence of each. Both exist on the instance and
the `Builder`.

### Naming
- `addAllWithCounts` (was `addEntries`) — add `[value, count]` tuples; `WithCounts` mirrors
  the `addAll` family.
- `filterWithCounts` (was `filterEntries`) — predicate over `[value, count]` pairs.
- `streamWithCounts` — distinct value/count pairs.
These renames were a breaking change (see Changesets below).

## How to add a method

1. **Declare** it in `types.ts`:
   - read-only / occurrence-level → `VariantMultiSetBase` (so `VariantMultiSet` also gets it);
   - anything needing a `context` or producing a new collection → `MultiSetBase`.
   - Add `NonEmpty` overloads in `MultiSetBase.NonEmpty` (and `VariantMultiSetBase.NonEmpty`)
     **first** where the result is provably non-empty (overload order matters — see root
     AGENTS.md).
2. **Implement** in `base.ts` for `MultiSetEmpty`, `MultiSetNonEmpty`, and `MultiSetBuilder`
   as needed. Empty-class methods usually delegate to `this.context` / `this.toBuilder()`.
3. **Export** from `@rimbu/core/multiset` if it is part of the public stable API (it already
   re-exports `* from '@rimbu/multiset'`, so usually nothing to do).
4. **Test**: add runtime cases in `test/multiset-test-standard.ts`, type-level assertions in
   `test-d/*.test-d.ts`, and (if useful) randomized cases in `test-random/`.

## Tooling

All commands run from this package directory. Per the root guide, **always
`bun run build:seq` (from the repo root) before `typecheck`/`test`** so dependent `dist/`
outputs are current.

| Command | Purpose |
|---|---|
| `bun run typecheck` | `tsc -p tsconfig.json --noEmit` (includes `src`, `test`, `test-d`) |
| `bun run test` | `bun test test/* --tsconfig-override tsconfig.common.json` |
| `bun run build` | emit this package to `dist/` |
| `bun run biome:check` / `biome:fix` | lint + format |

## Changesets

Removing or renaming public methods (`filterEntries`→`filterWithCounts`,
`addEntries`→`addAllWithCounts`, `removeAllSingle`/`removeAllEvery`→`removeAll`) is a
**breaking change** and requires a `major` bump. Because all Rimbu packages are
lockstep-fixed, a single changeset listing `@rimbu/multiset` **and** `@rimbu/core` (which
re-exports this package) bumps both. Add it under `.changeset/`.
