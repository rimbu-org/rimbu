# @rimbu/core — Package Agent Guide

`@rimbu/core` is the **umbrella package**: it re-exports the whole stable Rimbu
public surface from a single entry point (`@rimbu/core`) plus one subpath per
subpackage (e.g. `@rimbu/core/hashed`). It contains **no implementation files**
of its own.

## Source layout

```
src/
├── core.ts                    # exports["."]   — re-exports all subpackages
├── bimap.ts                   # @rimbu/core/bimap
├── bimultimap.ts              # @rimbu/core/bimultimap
├── collection-types.ts        # @rimbu/core/collection-types    (+ HKT helpers via advanced/common)
├── collection-types/
│   └── advanced.ts            # @rimbu/core/collection-types/advanced — ct's advanced tier
├── common.ts                  # @rimbu/core/common
├── deep.ts                    # @rimbu/core/deep
├── graph.ts                   # @rimbu/core/graph
├── hashed.ts                  # @rimbu/core/hashed
├── list.ts                    # @rimbu/core/list
├── multimap.ts                # @rimbu/core/multimap
├── multiset.ts                # @rimbu/core/multiset
├── sorted.ts                  # @rimbu/core/sorted
├── stream.ts                  # @rimbu/core/stream
└── stream/
    └── advanced.ts            # @rimbu/core/stream/advanced     — stream's advanced tier
```

There are no `public/`, `advanced/`, or `internal/` folders at the core level —
the subpackage re-export files ARE the public surface. The 3-tier convention
applies to each subpackage, not to core itself.

## Exports model (wildcard + folder structure)

`package.json` uses a `"./*"` wildcard so the **folder structure defines the
exports** (this is intentional for an umbrella package — it is the one place the
catch-all wildcard is acceptable):

```jsonc
"exports": {
  ".":  { "types": "./dist/core.d.ts",        "default": "./dist/core.js" },
  "./*": { "types": "./dist/*.d.ts",           "default": "./dist/*.js" }
}
```

- `@rimbu/core/<name>` (e.g. `bimap`) → `src/<name>.ts` flat file.
- `@rimbu/core/<name>/advanced` → `src/<name>/advanced.ts` sub-folder file.

This means every top-level `src/*.ts` file and `src/<name>/*.ts` file becomes a
published subpath automatically — no manual `exports` entry per subpath.

## Advanced sub-paths

Core surfaces each subpackage's `advanced` tier as a **sub-folder**, not a root
umbrella:

- **`@rimbu/core/collection-types/advanced`** — `collection-types`' advanced tier
  (`KeyValue`, `WithElem`, `Elem`, `RMapBase`, `RSetBase`, `EmptyBase`, …).
- **`@rimbu/core/stream/advanced`** — `stream`'s advanced tier
  (`StreamBase`, `FastIteratorBase`, `AsyncFastIteratorBase`, `AsyncFromStream`).

There is deliberately **no `@rimbu/core/advanced` root umbrella** — callers pick
the per-package advanced entry they need.

`src/collection-types.ts` (the `@rimbu/core/collection-types` entry) additionally
surfaces the commonly-used HKT helpers from `@rimbu/collection-types/advanced/common`
so they are reachable without the `/advanced` suffix.

## Adding a subpackage to core

1. Create `src/<name>.ts` doing `export * from '@rimbu/<name>'` (and
   `export * from '@rimbu/<name>/advanced/common'` if its HKT helpers should be public).
2. Add `export * from '@rimbu/core/<name>'` to `src/core.ts`.
3. Add `@rimbu/<name>` to `dependencies`.
4. If the subpackage has an `advanced` tier, add `src/<name>/advanced.ts`
   re-exporting its advanced subpaths — it is automatically exposed as
   `@rimbu/core/<name>/advanced` by the `"./*"` wildcard.
