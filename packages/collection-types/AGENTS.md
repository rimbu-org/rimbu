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
