# @rimbu/common — Package Agent Guide

This package provides Rimbu's **shared utilities** used across all collections:
equality (`Eq`), comparison (`Comp`), optional-lazy values (`OptLazy`),
reducers/collectors (`collect`), ranges (`Range`, `IndexRange`), error
helpers (`RimbuError`/`err`), the `Module` factory helper, and common
types.

> For workspace-wide conventions (biome rules, `build:seq` before typecheck/test,
> etc.) see the **root `AGENTS.md`**.

## Source layout

```
src/
├── common.ts     # exports["."]   — re-exports whole public surface
└── public/       # exports["./*"]  — public subpaths (dist/public/*)
    ├── async-opt-lazy.ts
    ├── collect.ts
    ├── comp.ts
    ├── eq.ts
    ├── err.ts
    ├── index-range.ts
    ├── module.ts
    ├── opt-lazy.ts
    ├── range.ts
    ├── traverse-state.ts
    └── types.ts
```

### Restructure note

Previously every file sat at `src/` root and the package exposed only a
leaking `"./*" → "./dist/*.js"` wildcard (no `"."` entry). All 11 modules
were moved under `src/public/`, a real root `src/common.ts` was created
re-exporting the surface, and `exports` now has a `"."` entry plus
`"./*" → "./dist/public/*"`. No `internal/` tier exists; all modules are
public utilities.

### Documented naming note (do not rename — rule D1)

`range.ts` (`Range` — a numeric/value range) and `index-range.ts`
(`IndexRange` — a positional index range) are similarly named but serve
different purposes. Keep both; document the distinction so users don't confuse
them.

### Key rule: imports inside `src/`
- Use `@rimbu/common/<name>` for the public modules (e.g. `@rimbu/common/eq`).
- `@rimbu/common` (root) re-exports all of them.
- No internal tier, so no `#common/*` alias is needed.

## Tooling

| Command | Purpose |
|---|---|
| `bun run typecheck` | `tsc -p tsconfig.json --noEmit` |
| `bun run test` | `bun test test/* --tsconfig-override tsconfig.common.json` |
| `bun run build` | emit this package to `dist/` |
| `bun run biome:check` / `biome:fix` | lint + format |
