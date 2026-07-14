# @rimbu/typical — Package Agent Guide

This package is a **type-level library**: it offers numeric and string operations on
TypeScript literal types (advanced compile-time constraints and computed literal results).

## Source layout

```
src/
├── typical.ts   # exports["."]   — re-exports the whole surface (type namespaces)
└── internal/    # NEVER exported; "#typical/*" only   (private impl)
    ├── num.ts
    ├── str.ts
    ├── strnum.ts
    └── utils.ts
```

The entire public API is the root `src/typical.ts`, which re-exports four type namespaces:
`U`, `Str`, `StrNum`, `Num`. There are no public subpaths, so no `public/` directory exists
(this is intentional for a type-only package). `internal/` is never exported and is reachable
only via the `#typical/*` import alias. No `"./*"` wildcard and no `"./internal/*"` leak exist.

## Package imports (`#` paths)

```jsonc
"#typical/*": "./dist/internal/*.{js,d.ts}"
```

## Adding a type-level operation

1. Implement the type machinery under `src/internal/` (e.g. `num.ts`, `str.ts`).
2. Re-export the relevant namespace from `src/typical.ts` via `export type { ... }`.
3. Add type tests in `test-d/`.

If future public subpaths are added, create `src/public/` + `"./*" → "./dist/public/*"`.

## Pre-existing known issues

None currently.
