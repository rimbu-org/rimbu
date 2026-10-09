# @rimbu/collection-types — Package Agent Guide

This package defines the **abstract base interfaces and HKT machinery** shared by all Rimbu collections. It does not contain any implementations — only interface definitions and base modules.

## Source layout

```
src/
├── collection-types.ts    # exports["."]           — re-exports the capability surface
├── public/                # exports["./*"]          — the public capability API
│   ├── collection.ts      # Collection, Collection.Advanced, Collection.Capability
│   ├── types.ts           # TypesKey, Op, and the HKT slot types
│   ├── map.ts             # MapCollection
│   ├── set.ts             # SetCollection
│   └── collection/        # the per-shape capability namespaces
│       ├── valued.ts      # ValuedCollection      (add / remove / union / …)
│       ├── keyed.ts       # KeyedCollection       (get / has / removeKeyAndReturn / …)
│       ├── indexed.ts     # IndexedCollection     (at / updateAt / …)
│       ├── sorted.ts      # SortedCollection      (order-sensitive members)
│       └── indexed-*.ts   # the intersections of the above
├── advanced/              # exports["./advanced/*"] — implementer / extension API
│   ├── common.ts          # KeyValue, WithElem, common HKT helpers
│   ├── common/
│   │   └── empty-base.ts  # EmptyBase / NonEmptyBase classes
│   ├── collection-base.ts # CollectionBase
│   ├── map-base.ts        # MapCollectionBase
│   ├── set-base.ts        # SetCollectionBase
│   └── collection/        # the per-shape base classes
└── internal/              # NEVER exported; "#collection-types/*" only
    └── common/
        ├── types.ts       # WithElem, KeyValue HKT slot types
        └── utils.ts       # internal HKT helpers
```

## Removed: the `RMap` / `RSet` / `Variant*` surface

`collection-types.ts` used to re-export `RMap`, `RSet`, `VariantMap` and
`VariantSet`, backed by `advanced/{map,set}/base.ts` (the `RMapBase` /
`VariantMapBase` / `RSetBase` / `VariantSetBase` interfaces),
`advanced/{map,set}/base-module.ts` (the `*ContextBaseModule` factories) and
`internal/{map,set}/types/*.ts`. **All of it has been deleted** (~2,300
lines); the capability families replaced it.

What went away, and why the replacement is strictly better:

- The **read-only / invariant split** (`VariantMapBase` vs `RMapBase`). It
  existed so a variant type could be covariant in `K` and `V`. The capability
  model gets covariance from the individual member signatures instead, so no
  separate base class is needed.
- The **second types record** (`Types` with `normal` / `nonEmpty`) alongside the
  family's `_TYPES` / `_TYPES_NON_EMPTY`. Two records describing the same
  binding had to be kept in sync by hand.

Do not reintroduce either. If a capability is missing, add it as a
`Capability.With*` member and widen `Advanced.Family`.

## Package imports (`#` paths)

```jsonc
"#collection-types/*": "./dist/internal/*.{js,d.ts}"
// covers: #collection-types/common/types, #collection-types/map/types/generic, etc.
```

## Key abstractions

### HKT pattern (`Tp extends Collection.Advanced.TypesBase`)

The `Tp` type parameter is a "types record" that binds the concrete collection
type to the abstract method return types:

```ts
// Abstract:
interface ValuedCollection<E, Tp extends Collection.Advanced.TypesBase> {
  filter(...): Tp['_SELF'];
  // '_SELF' resolves to the concrete type via the types binding
}

// Concrete binding in @rimbu/hashed, via a family slot:
export interface Family<K, V> extends MapCollection.Advanced.Family<K, V> {
  _NORMAL: HashMap<K, V>;
  _NON_EMPTY: HashMap.NonEmpty<K, V>;
  _BUILDER: HashMap.Builder<K, V>;
  _CONTEXT: HashMap.Context<K>;
}
```

**Always declare a family as a named `interface` extending the aggregate**
(`interface MyCapabilities extends SetCollection.Advanced.Family<any> {}`), never
as an ad-hoc intersection of individual `Capability.*` families. See the root
`AGENTS.md` §6.4 — the intersection form silently loses `_BUILDER` / `_CONTEXT` /
`_NORMAL` members and is dramatically slower to resolve.

### Context base classes

`MapCollectionBase` / `SetCollectionBase` (in `advanced/map-base.ts` and
`advanced/set-base.ts`) provide the shared context factory implementations.
Contexts extend these and supply the create/`createContext` members.

## When to modify this package

**Only** modify when:
1. Adding a new abstract method that ALL map or set implementations should have
2. Changing the HKT types machinery

After any change here, verify all concrete implementations still compile:
- `@rimbu/hashed` (HashMap, HashSet)
- `@rimbu/sorted` (SortedMap, SortedSet)
- `@rimbu/ordered` (OrderedMap, OrderedSet)
- `@rimbu/bimap`, `@rimbu/bimultimap`, `@rimbu/multimap`, `@rimbu/multiset`

## Sub-path exports used by other packages

```ts
// The capability surface (public)
import type { MapCollection } from '@rimbu/collection-types/map';
import type { SetCollection } from '@rimbu/collection-types/set';
import type { KeyValue } from '@rimbu/collection-types/advanced/common';

// The implementer-facing base classes (advanced)
import { MapCollectionBase } from '@rimbu/collection-types/advanced/map-base';
```

The `advanced` sub-path holds the implementer-facing base classes and context
modules. HKT slot types are package-private under `internal/` and surfaced only
through `advanced/`.

There is no `advanced/map/base` or `advanced/set/base` sub-path any more — those
held the deleted `RMapBase` / `RSetBase`.

## `test-utils/` — the shared cross-package harnesses

```
test-utils/
├── map/
│   ├── map-collection-standard.ts  # runMapTestsWith       — hashed, sorted, proximity, ordered
│   └── map-random.ts               # runMapRandomTestsWith — hashed, sorted, proximity
└── set/
    ├── set-collection-standard.ts  # runSetTestsWith       — hashed, sorted, ordered
    └── set-random.ts               # runSetRandomTestsWith — hashed, sorted
```

The two `*-standard.ts` legacy single-collection runners (`map/map-standard.ts`,
`set/set-standard.ts`) were **deleted** with the `WithValueResult` removal. Both
were orphans — nothing imported their module paths — and both were typed against
the legacy `RMap`/`RSet`, so their `removeKeyAndGet` / `updateAtAndGet` cases
tested methods that no longer exist. The capability-based
`map-collection-standard.ts` / `set-collection-standard.ts` are the live runners.

This directory is deliberately **outside `src/`**, so it is not emitted to `dist/` and is not in
`package.json` `exports`. It is resolved by consumers through two mechanisms, both of which are
required:

- `tsconfig.common.json` in each consuming package maps `"@rimbu/collection-types/*"` into this
  directory, and
- the consuming package's `test:random` script must pass
  `--tsconfig-override tsconfig.common.json`.

Omit the override and the suites exit immediately with
`Cannot find module '@rimbu/collection-types/test-utils/...'`. That is not hypothetical: `hashed`,
`sorted` and `proximity` all shipped a `test:random` script without it, so their randomized suites
had never run. `map-random.ts` also carried a `// @ts-nocheck`, which hid the same drift from
`tsc`; it has been removed.

**These files rot silently, so keep them compiling.** They call the concrete collections, not the
abstract bases, so a capability rename (`intersect` → `intersection`, `addEntry` → `set`,
`modifyAt` → `modifyAtKey`, `removeKeyAndGet` → `removeKeyAndReturn`) breaks them without
breaking any package's `src`. Two rules keep that visible:

- Type the harness's context as the capability family the way
  `map-collection-standard.ts` does — a **named** interface extending the aggregate
  `MapCollection.Advanced.Family`, then `MapCollection.Context<Capabilities>['keyedContext']` —
  and compare contents through a **structural** helper (`expectMap` / `expectSet`) rather than
  `expect(collection).toEqual(collection)`, which walks internal representation and fails on
  structurally equal collections.
- Every `checklock` case gets a fresh builder plus a post-condition, and the random cases use the
  `CHECK_FULL_EVERY` schedule plus a final `ent.checkFull()`. See root `AGENTS.md` §9.
