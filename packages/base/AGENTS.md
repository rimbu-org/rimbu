# @rimbu/base — Package Agent Guide

This package provides Rimbu's **foundational utilities** shared across all
collections: array primitives (`arr`), tuple accessors (`entry`),
plain-object helpers (`plain-object`), the `RimbuError` type (`rimbu-error`),
and the `Token` sentinel (`token`).

> For workspace-wide conventions (biome rules, `build:seq` before typecheck/test,
> etc.) see the **root `AGENTS.md`**.

## Source layout

```
src/
├── base.ts       # exports["."]   — re-exports whole public surface
└── public/       # exports["./*"]  — public subpaths (dist/public/*)
    ├── arr.ts
    ├── entry.ts
    ├── plain-object.ts
    ├── rimbu-error.ts
    └── token.ts
```

### Restructure note

Previously every file sat at `src/` root and the package exposed only a
leaking `"./*" → "./dist/*.js"` wildcard (note: the old entry also used the
non-standard `"import"` key instead of `"default"`). All files were moved under
`src/public/`, a real root `src/base.ts` was created re-exporting the surface,
and `exports` now has a proper `"."` entry plus `"./*" → "./dist/public/*"`.
No `internal/` tier exists; all 5 modules are public utilities.

### Key rule: imports inside `src/`
- Use `@rimbu/base/<name>` for the public modules (e.g. `@rimbu/base/arr`).
- Use `@rimbu/common/<name>` for the one dependency.

## Tooling

| Command | Purpose |
|---|---|
| `bun run typecheck` | `tsc -p tsconfig.json --noEmit` |
| `bun run test` | `bun test test/* --tsconfig-override tsconfig.common.json` |
| `bun run build` | emit this package to `dist/` |
| `bun run biome:check` / `biome:fix` | lint + format |
