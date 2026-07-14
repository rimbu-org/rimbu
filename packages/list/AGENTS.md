# @rimbu/list — Package Agent Guide

This package provides Rimbu's **immutable `List`**: an efficient random-access
sequence (block-tree / bitmapped-vector trie). It also ships three specialized
variants: `CharList` (string-backed ranges), `BitList` (boolean bitset), and
`TypedArrayList` (typed-array-backed).

> For workspace-wide conventions (biome rules, `build:seq` before typecheck/test,
> the Interface + Namespace pattern, HKT `Types` slots, NonEmpty tracking,
> `OptLazy`, `RelatedTo`, and the changeset workflow) see the **root `AGENTS.md`**.
> This file only covers what is specific to `@rimbu/list`.

## Source layout

```
src/
├── list.ts       # exports["."]   — List interface + creators
├── public/       # exports["./*"]  — public subpaths (dist/public/*)
│   ├── char.ts        # @rimbu/list/char        → CharList
│   ├── bit.ts         # @rimbu/list/bit         → BitList
│   └── typed-array.ts # @rimbu/list/typed-array → TypedArrayList
└── internal/       # NEVER exported; "#list/*" only
    ├── bit-list-helpers.ts
    ├── char-list-helpers.ts
    ├── char-list-impl.ts
    ├── context-module.ts
    ├── list-base.ts
    ├── list-helpers.ts
    ├── list-impl.ts
    ├── typed-array-helpers.ts
    ├── immutable/ (cache-map, empty, inner-block, inner-tree, outer-base,
    │             outer-block, outer-tree, reversed-outer-block, tree-base, utils)
    └── mutable/    (builder-base, builder, inner-block-builder, inner-tree-builder,
                      outer-block-builder, outer-tree-builder, tree-builder)
```

### Restructure note

- The root `src/list.ts` now **re-exports the whole surface** (`CharList`/`BitList`/
  `TypedArrayList`) via `export * from '@rimbu/list/{char,bit,typed-array}'`.
- `char.ts`/`bit.ts`/`typed-array.ts` moved from `src/` root to `src/public/`.
- `package.json`: removed the explicit `"./char"`/`"./bit"`/`"./typed-array"` entries
  and the leaking `"./internal/*"` export; added `"./*" → "./dist/public/*"`.
- `tsconfig.common.json`: `@rimbu/list/{char,bit,typed-array}` repointed at
  `src/public/*.ts`; added `"./*" → "./src/public/*.ts"`.
- The 3 test files that imported `@rimbu/list/internal/...` were repointed to the
  `#list/...` alias (the `"./internal/*"` export no longer exists, so the alias is
  the only runtime-valid path for internal access).

### Key rule: imports inside `src/`
- Use the package alias `#list/*` for anything in `src/internal/*`.
- Use `@rimbu/list/char`, `@rimbu/list/bit`, `@rimbu/list/typed-array` for the
  public variants.
- Use `@rimbu/base`, `@rimbu/collection-types`, `@rimbu/common`, `@rimbu/stream`
  for dependencies.

## Architecture (brief)

- **`List<T>`** (`list.ts`) — extends `ListBase<T, ListHelpers.Types>`; the main
  random-access sequence. Creators come from `ListHelpers.createListContext()`.
- **`CharList` / `BitList` / `TypedArrayList`** (`public/*`) — specialized variants
  layered on top of the same block-tree machinery; each re-declares `NonEmpty`/
  `Context`/`Builder`/`Types`.
- **`ListBase` / `ListHelpers`** (`internal/list-base.ts`, `internal/list-helpers.ts`)
  — the abstract base and the context/creator factory.
- **`immutable/` + `mutable/`** — the block-tree implementation (outer/inner blocks,
  trees, builders, cache map, reversed blocks). Never exported.

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
