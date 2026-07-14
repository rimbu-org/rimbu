# @rimbu/table — Package Agent Guide

This package provides Rimbu's **immutable `Table`**: a row × column → value
structure backed internally by two nested maps (`Map<R, Map<C, V>>`). It supports
four variants based on whether the row map and/or column map are hash- or
sorted-ordered.

> For workspace-wide conventions (biome rules, `build:seq` before typecheck/test,
> the Interface + Namespace pattern, HKT `Types` slots, NonEmpty tracking,
> `OptLazy`, `RelatedTo`, and the changeset workflow) see the **root `AGENTS.md`**.
> This file only covers what is specific to `@rimbu/table`.

## Source layout

```
src/
├── table.ts      # exports["."]              — Table interface + creators
├── public/       # exports["./*"]            — public subpaths (dist/public/*)
│   ├── hash-row/                          # @rimbu/table/hash-row/*
│   │   ├── hash-column.ts   # HashTableHashColumn
│   │   └── sorted-column.ts # HashTableSortedColumn
│   └── sorted-row/                        # @rimbu/table/sorted-row/*
│       ├── hash-column.ts   # SortedTableHashColumn
│       └── sorted-column.ts # SortedTableSortedColumn
└── internal/       # NEVER exported; "#table/*" only
    ├── base.ts
    ├── context-factory.ts
    ├── creators.ts
    ├── types.ts
    └── variant.ts
```

### Restructure note

The variant row constructors were first moved to `src/advanced/`, but the decision
was revised: users reach for `HashTableHashColumn` / `SortedTableSortedColumn` / etc.
**more often than** the generic `Table` constructor (which requires more configuration),
so they are genuinely public API. They were therefore placed under `src/public/`
(`@rimbu/table/hash-row/*`, `@rimbu/table/sorted-row/*`). The old `"./*" → "./dist/*.js"`
leak was repointed to `"./*" → "./dist/public/*"` (no `./advanced/*` tier exists).
The variant files' relative `../internal/context-factory` import was fixed to the
`#table/context-factory` alias. Internal `creators.ts` and all tests were repointed
from `@rimbu/table/advanced/{hash-row,sorted-row}/...` to `@rimbu/table/{hash-row,sorted-row}/...`.

### Key rule: imports inside `src/`
- Use the package alias `#table/*` for anything in `src/internal/*`.
- Use `@rimbu/table/hash-row/*` and `@rimbu/table/sorted-row/*`
  for the variant constructors (public tier).
- Use `@rimbu/hashed`, `@rimbu/sorted`, `@rimbu/stream`, `@rimbu/common`,
  `@rimbu/base`, `@rimbu/collection-types` for dependencies.

## Architecture

- **`Table<R, C, V>`** (`table.ts`) — the public interface; `get`/`set`/`removeRow`/
  `removeColumn`/`rowMap`/`columnMap`, etc.
- **`TableBase`** (`internal/types.ts`) — the abstract base holding the two nested
  maps and the shared logic.
- **Variant constructors** (`public/{hash,sorted}-row/*`) — `HashTableHashColumn`,
  `HashTableSortedColumn`, `SortedTableHashColumn`, `SortedTableSortedColumn`: each
  builds a `Table.Context` with the matching row/column ordering. They are public
  because users reach for them directly more often than the generic `Table` constructor.
- **`createTableContextModule`** (`internal/context-factory.ts`) — the `Module`
  factory used by every variant constructor.

## Tooling

All commands run from this package directory. Per the root guide, **always
`bun run build:seq` (from the repo root) before `typecheck`/`test`** so dependent
`dist/` outputs are current.

| Command | Purpose |
|---|---|
| `bun run typecheck` | `tsc -p tsconfig.json --noEmit` (includes `src`, `test`, `test-d`) |
| `bun run test` | `bun test test/* --tsconfig-override tsconfig.common.json` |
| `bun run build` | emit this package to `dist/` |
| `bun run biome:check` / `biome:fix` | lint + format |
