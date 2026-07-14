# @rimbu/multimap — Package Agent Guide

An immutable `Map` where each key is associated with **one or more** values. Each key maps to a non-empty value `Set`, so the collection always has at least one value per key. Four concrete variants combine a **hashed or sorted** key map with a **hashed or sorted** value set.

## Source layout

```
src/
├── multimap.ts                # exports["."]       — type-invariant MultiMap API (main entry)
├── public/                    # exports["./*"]    — public subpaths (dist/public/*)
│   ├── variant.ts            # @rimbu/multimap/variant — type-VARIANT MultiMap API
│   ├── hash-key/
│   │   ├── hash-value.ts     # @rimbu/multimap/hash-key/hash-value    — HashMultiMapHashValue
│   │   └── sorted-value.ts  # @rimbu/multimap/hash-key/sorted-value  — HashMultiMapSortedValue
│   └── sorted-key/
│       ├── hash-value.ts     # @rimbu/multimap/sorted-key/hash-value  — SortedMultiMapHashValue
│       └── sorted-value.ts  # @rimbu/multimap/sorted-key/sorted-value — SortedMultiMapSortedValue
└── internal/                  # NEVER exported; "#multimap/*" only
    ├── types.ts               # ALL interface declarations (VariantMultiMapBase, MultiMapBase, NonEmpty, Builder, Types)
    ├── base.ts                # ALL implementations (MultiMapEmpty, MultiMapNonEmpty, MultiMapBuilder)
    ├── context-factory.ts     # createMultiMapContextModule() — the sealed factory/Module
    └── creators.ts           # Creators interfaces for the 4 concrete variants
```

### Restructure note (deviation from draft plan)

The draft `plans/multimap.md` proposed moving the four `hash-key/*` / `sorted-key/*` variant
entries to `internal/` and `variant.ts` to `advanced/`. **This was not followed**, because the
dependency graph proves they are genuinely public:

- `@rimbu/core` re-exports all five (`@rimbu/multimap/hash-key/hash-value`,
  `.../sorted-value`, `.../sorted-key/hash-value`, `.../sorted-key/sorted-value`,
  `@rimbu/multimap/variant`).
- `@rimbu/bimultimap` imports `HashMultiMapHashValue` and `SortedMultiMapSortedValue`
  directly from `@rimbu/multimap/hash-key/hash-value` and `.../sorted-key/sorted-value`.

Moving them to `internal/`/`advanced/` would break both consumers. Instead, the only change made
was to relocate the five public subpaths under `public/` and repoint the leaking
`"./*" → "./dist/*.js"` export at `"./*" → "./dist/public/*"`, so `internal/` (base,
context-factory, creators, types) is no longer reachable. No `./advanced/*` tier was added.

### Key rule: where declarations live

- **`internal/types.ts`** holds every interface: `VariantMultiMapBase`, `MultiMapBase` and their `NonEmpty` namespaces, `Builder`, and the HKT `Types` interfaces.
- **`internal/base.ts`** holds the three concrete classes that implement those interfaces: `MultiMapEmpty` (the `isEmpty` case), `MultiMapNonEmpty` (the non-empty case), and `MultiMapBuilder`.
- The per-variant entry files (`hash-key/hash-value.ts`, etc.) only **declare** the variant-specific `Types`/`Context`/`keyMap*` slots and call `createMultiMapContextModule(typeTag, {keyMapContext, keyMapValuesContext}).build()`. They contain almost no logic.

## Package imports (`#` paths)

```jsonc
"#multimap/*": "./dist/internal/*.{js,d.ts}"   // internal implementations
```

Inside `src/` use package paths, never relative paths:
```ts
import type { MultiMapBase } from '#multimap/types';
import { MultiMapEmpty } from '#multimap/base';
```

## The data model

A `MultiMap` is stored as a single `keyMap`:

```
keyMap: RMap<K, RSet.NonEmpty<V>>
```

- Each key points to a **non-empty** value `Set`. A key is only present when it has ≥ 1 value.
- `size` = total number of key-value **pairs** (not number of keys). `keySize` = number of distinct keys.
- `getValues(key)` returns the value set (empty `RSet` if the key is absent — never `undefined`).
- Adding a `(key, value)` that already exists is a **no-op**: it returns the same instance (referential equality), and `size` is unchanged.

This is the central invariant to respect in every method: **never store an empty value set**, and keep `size` exact by diffing old/new `RSet.size` whenever you mutate a value set.

## Key types

| Type | File | Purpose |
|---|---|---|
| `VariantMultiMap<K, V>` | `variant.ts` | Type-**variant** (covariant) read/filter API |
| `MultiMap<K, V>` | `multimap.ts` | Type-**invariant** full API (add/transform) |
| `*.NonEmpty<K, V>` | same file | Refinement: compiler knows ≥ 1 entry |
| `*.Context<UK, UV>` | same file | Factory for instances + builders |
| `*.Builder<K, V>` | same file | Mutable accumulator |
| `VariantMultiMapBase` / `MultiMapBase` | `internal/types.ts` | Shared abstract interfaces + `Types` HKT |
| `MultiMapEmpty` / `MultiMapNonEmpty` / `MultiMapBuilder` | `internal/base.ts` | Implementations |

## Variant vs invariant — the single most important design rule

There are **two** base interfaces, and the split is deliberate:

- **`VariantMultiMapBase<K, V>` is covariant** in both `K` and `V`. Because of this it can only expose **read** and **filter** operations — anything that takes a `(value: V, key: K) => …` callback would be *contravariant* in `V` and break covariance.
  - Lives here: `stream`, `streamKeys`, `streamValues`, `getValues`, `hasKey`, `hasEntry`, `filter`, `transform` (the read side), `count`, `remove*` (removing only narrows), `toArray`, `keyMap`.
- **`MultiMapBase<K, V>` extends `VariantMultiMapBase` and adds the operations that can *add or rewrite* values.** It is invariant.
  - Lives here: `add`, `addEntries`, `setValues`, `addValues`, `mapValues`, `flatMapValues`, `flatMap`, `modifyAt`, `union`, `intersect`, `difference`, `symDifference`.

> **Variance caveat:** methods that take a `(value: V, key: K) => W` callback — `mapValues`, `flatMapValues` — MUST be declared on `MultiMapBase` (invariant) only. If you put them on `VariantMultiMapBase` the covariant `V` collides with the contravariant callback param and the build fails. `count` is safe on `VariantMultiMapBase` because its only parameter is `(key)` (covariant).

## The four concrete variants

All four are produced by the same machinery with different `keyMapContext` / `keyMapValuesContext`:

| Export | Key map | Value set |
|---|---|---|
| `HashMultiMapHashValue` | `HashMap` | `HashSet` |
| `HashMultiMapSortedValue` | `HashMap` | `SortedSet` |
| `SortedMultiMapHashValue` | `SortedMap` | `HashSet` |
| `SortedMultiMapSortedValue` | `SortedMap` | `SortedSet` |

A `Context` carries exactly two sub-contexts: `keyMapContext` (an `RMap.Context`) and `keyMapValuesContext` (an `RSet.Context`). Any value operation delegates to the value set's own context, which is why `mapValues`/`flatMapValues` must build results **in the same context** (see below).

## Module / factory pattern

`createMultiMapContextModule(typeTag, { keyMapContext, keyMapValuesContext })` returns a `Module.Definition`; `.build()` yields the exported constant (e.g. `HashMultiMapHashValue`). The module implements `empty`, `of`, `from`, `builder`, `reducer`, `createContext`, `defaultContext`, plus the internal `createNonEmpty` / `createBuilder` / `isNonEmptyInstance` used by `base.ts`. **Add factory behavior in `context-factory.ts`, not in the entry files.**

## Higher-kinded `Types` interface

Both bases expose a `Types` interface that carries the concrete slots used by return types:

```ts
export interface Types extends KeyValue {
  readonly normal: MultiMapBase<this['_K'], this['_V']>;
  readonly nonEmpty: MultiMapBase.NonEmpty<this['_K'], this['_V']>;
  readonly context: MultiMapBase.Context<this['_K'], this['_V']>;
  readonly builder: MultiMapBase.Builder<this['_K'], this['_V']>;
  readonly keyMap: RMap<this['_K'], RSet.NonEmpty<this['_V']>>;
  readonly keyMapContext: RMap.Context<this['_K']>;
  readonly keyMapValuesContext: RSet.Context<this['_V']>;
  readonly keyMapValues: RSet<this['_V']>;
  readonly keyMapValuesNonEmpty: RSet.NonEmpty<this['_V']>;
}
```

Return types in the interfaces use the `WithKeyValue<Tp, K, V>['slot']` helper so a method on `HashMultiMapHashValue` returns `HashMultiMapHashValue`, not the generic base.

## How to add a new method

1. **Decide the base interface** by variance:
   - pure read/filter → `VariantMultiMapBase`
   - adds/rewrites values, or takes a `(value: V, key: K) => …` callback → `MultiMapBase`
2. **Declare it** in `internal/types.ts` on the interface and on `MultiMapBase.NonEmpty` if the result can be proved non-empty.
3. **Overload order for NonEmpty variants:** when a method has two overloads (one returning `normal`, one returning `nonEmpty`), the `nonEmpty`-returning overload MUST be **first** (see `transform` at `types.ts:400`, `union` at `types.ts:614`). TS picks the first matching overload; if the `normal` one comes first, a callback returning a `StreamSource.NonEmpty` is matched by it and the precise type is lost.
4. **Implement** in `MultiMapEmpty` and `MultiMapNonEmpty` in `internal/base.ts`. Return `any` from the empty-class methods that need to satisfy both normal and NonEmpty overloads (mirrors `addEntries`/`transform`).
5. **Same-context building:** any method that produces new values (`mapValues`, `flatMapValues`, `modifyAt`, `union`, …) MUST build the new value sets through `this.context.keyMapValuesContext.from(...)` / `.builder()`, because the value set has its own context/equality. The resulting `keyMap` is built via the context's `keyMap` APIs, and turned into an instance with `this.context.createNonEmpty(keyMap, size)`.
6. **Preserve `size` exactly.** When mutating a value set from `oldSize` to `newSize`, adjust `this.size` by `newSize - oldSize`, never recompute from scratch.
7. **Empty-key guarantee.** A key whose value set becomes empty must be *removed* (returning the parent map, possibly unchanged). `difference` reuses `removeEntries` for exactly this reason.
8. **Add to `Builder`** if it makes sense for the mutable accumulator (`base.ts`, `MultiMapBuilder`), returning `boolean` for changed-or-not.
9. **Tests:** add runtime coverage to `test/multimap-test-standard.ts` (the `runMultiMapTestsWith` helper already runs against all 4 variants) and type assertions to `test-d/multimap.test-d.ts` (it checks the variant/invariant/NonEmpty return-type matrix for every method).
10. **Export:** if the method belongs to the public `MultiMap` API, nothing extra is needed — `@rimbu/core` re-exports `@rimbu/multimap` via `export *`.

## Common pitfalls

- **Don't return `undefined` from `getValues`** — return the empty `RSet` (`base.ts:114`).
- **`<W extends V>` / `<K2 extends K, V2 extends V>`, not free type params.** New values are built in the *same* context, so `W`/`V2` must be subtypes of `V`; you cannot map to an unrelated value type without building a fresh collection explicitly (see the `transform`/`flatMap` docs, which tell callers to use `MultiMap.from(stream.map(...))`).
- **Referential equality for no-ops.** `add` of an existing pair, `removeKey` of an absent key, etc., must return the same instance (`return this`), so callers can rely on `===` for "did it change".
- **Builder locking.** Mutating a builder while iterating it (`forEach`) throws `RimbuError.ModifiedBuilderWhileLoopingOverItError` — set `this._lock` around the loop (`base.ts:819`).
- **Typecheck OOM.** `bun run typecheck` on this package can be killed by the container OOM killer. To check the `test-d` files, typecheck them in isolation (they resolve `@rimbu/*` against `dist`, which `bun run build:seq` has already produced) — do NOT include `src` or `test`, which pull in the whole monorepo type graph.
