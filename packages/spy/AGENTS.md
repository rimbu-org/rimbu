# @rimbu/spy — Package Agent Guide

This package provides experimental, framework-agnostic utilities for spying on, stubbing and
mocking functions, objects and classes in TypeScript (`Spy`, call tracking, etc.).

## Source layout

```
src/
└── spy.ts    # exports["."]   — Spy + all related types and helpers (whole surface)
```

`Spy` is a **single-file package**: its entire public API lives in `src/spy.ts` and is exposed
through the `"."` export. There are no `public/`, `advanced/`, or `internal/` directories
(this is intentional — a single-file package needs no folder tiers). No `"./*"` wildcard and
no `"./internal/*"` leak exist; there is no `#` import alias.

## Adding a feature

1. Add the type/helper to `src/spy.ts`.
2. Add tests in `test/`.

If a future change introduces private helpers, create `src/internal/` + `#spy/*` and keep
`spy.ts` as the sole root entry.

## Pre-existing known issues

None currently.
