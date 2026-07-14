# @rimbu/actor — Package Agent Guide

This package provides experimental state management tools: `Actor`, `Action`, `Slice`, and the React integration hooks `use-immer` / `use-patch`.

## Source layout

```
src/
├── actor.ts        # exports["."]        — re-exports Actor + Action + Slice (whole surface)
├── public/         # exports["./*"]      — public subpaths (dist/public/*)
│   ├── action.ts    # @rimbu/actor/action     — Action interface + creator
│   ├── slice.ts     # @rimbu/actor/slice      — Slice type + combinators
│   ├── use-immer.ts # @rimbu/actor/use-immer  — React immer hook (subpath-only, NOT re-exported from root)
│   └── use-patch.ts # @rimbu/actor/use-patch  — React patch hook (subpath-only, NOT re-exported from root)
└── internal/        # NEVER exported; "#actor/*" only
    ├── action-base.ts  # ActionBase base type
    ├── lookup.ts       # internal lookup helpers
    ├── slice-config.ts # SliceConfig base
    └── utils.ts        # internal utilities
```

The `public/` tier is exposed via the `"./*"` wildcard export (`exports["./*"] → "./dist/public/*"`).
`internal/` is never exported and is reachable only via the `#actor/*` import alias.

The React hooks `use-immer` / `use-patch` are deliberately absent from the root re-export
(model A): they remain importable as `@rimbu/actor/use-immer` and `@rimbu/actor/use-patch` via the
wildcard, but are not part of the convenience root surface.

## Package imports (`#` paths)

```jsonc
"#actor/*": "./dist/internal/*.{js,d.ts}"
```

## Adding a method / symbol

1. Add the public API in `src/public/<sub>.ts` (use `@rimbu/actor/<sub>` self-imports and `#actor/*` for internals).
2. If it belongs on the root surface, re-export it from `src/actor.ts`.
3. Implement internals under `src/internal/` and reference them via `#actor/*`.
4. Add tests under `test/`.

## Pre-existing known issues

- Biome warns on `noExplicitAny` / unused parameters in untouched `internal/` and `public/slice.ts`
  files; left as-is (pre-existing, D1).
