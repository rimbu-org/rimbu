# @rimbu/collection-types — Package Agent Guide

This package defines the **abstract base interfaces and HKT machinery** shared by all Rimbu collections. It does not contain any implementations — only interface definitions and base modules.

## Source layout

```
src/
├── collection-types.ts    # exports["."]           — re-exports all base types (RMap, RSet, VariantMap, VariantSet)
├── advanced/              # exports["./advanced/*"] — implementer / extension API
│   ├── common.ts          # KeyValue, WithElem, common HKT helpers
│   ├── common/
│   │   └── empty-base.ts  # EmptyBase / NonEmptyBase classes
│   ├── map/
│   │   ├── base.ts        # RMapBase, VariantMapBase interfaces
│   │   └── base-module.ts # RMapContextBaseModule
│   └── set/
│       ├── base.ts        # RSetBase, VariantSetBase interfaces
│       └── base-module.ts # RSetContextBaseModule
└── internal/              # NEVER exported; "#collection-types/*" only (package-private HKT machinery)
    ├── common/
    │   └── types.ts       # WithElem, KeyValue HKT slot types
    ├── map/types/
    │   ├── generic.ts     # Generic map type slots
    │   └── variant.ts     # Variant map type slots
    └── set/types/
        ├── generic.ts     # Generic set type slots
        └── variant.ts     # Variant set type slots
```

## Package imports (`#` paths)

```jsonc
"#collection-types/*": "./dist/internal/*.{js,d.ts}"
// covers: #collection-types/common/types, #collection-types/map/types/generic, etc.
```

## Key abstractions

### VariantMapBase vs RMapBase

- **`VariantMapBase<K, V, Tp>`**: Type-variant base — `K` and `V` are covariant. Used for read-only views.
- **`RMapBase<K, V, Tp>`**: Type-invariant base — extends `VariantMapBase`. Full mutation interface (set, remove, etc.). All concrete maps extend this.

### HKT pattern (`Tp extends RMapBase.Types`)

The `Tp` type parameter is a "types record" that binds the concrete collection type to the abstract method return types:

```ts
// Abstract:
interface RMapBase<K, V, Tp extends RMapBase.Types> {
  filter(...): WithKeyValue<Tp, K, V>['normal'];
  // 'normal' resolves to the concrete type via the Types binding
}

// Concrete binding in @rimbu/hashed:
export namespace HashMap {
  export interface Types extends KeyValue {
    readonly normal: HashMap<this['_K'], this['_V']>;
    readonly nonEmpty: HashMap.NonEmpty<this['_K'], this['_V']>;
  }
}
```

### base-module.ts pattern

`RMapContextBaseModule` provides the standard factory method implementations (`of`, `from`, `builder`, `reducer`) that all map contexts share. Contexts extend this and provide the `createEmpty()` and related methods.

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
import type { RMap, RSet, VariantMap } from '@rimbu/collection-types';
import type { KeyValue } from '@rimbu/collection-types/advanced/common';
import type { RMapBase } from '@rimbu/collection-types/advanced/map/base';
```

The `advanced` sub-path holds the implementer-facing base interfaces and context modules. HKT slot types are package-private under `internal/` and surfaced only through `advanced/`.

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
