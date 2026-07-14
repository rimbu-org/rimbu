# @rimbu/bimultimap — Package Agent Guide

This package provides `BiMultiMap<K, V>` — an immutable bidirectional many-to-many map (key↔value), plus hashed and sorted variants.

## Source layout

```
src/
├── bimultimap.ts   # exports["."]       — BiMultiMap base + contexts (whole surface)
├── public/         # exports["./*"]     — public variant subpaths (dist/public/*)
│   ├── hashed.ts    # @rimbu/bimultimap/hashed  — BiMultiMapHashed
│   └── sorted.ts    # @rimbu/bimultimap/sorted  — BiMultiMapSorted
└── internal/        # NEVER exported; "#bimultimap/*" only
    ├── base.ts
    ├── builder.ts
    ├── context-factory.ts
    ├── generic.ts
    ├── immutable.ts
    ├── hashed-interface.ts   # variant namespace (was src/hashed/interface.ts)
    └── sorted-interface.ts   # variant namespace (was src/sorted/interface.ts)
```

The `public/` tier is exposed via the `"./*"` wildcard export (`exports["./*"] → "./dist/public/*"`).
`internal/` is never exported and is reachable only via the `#bimultimap/*` import alias.

## Package imports (`#` paths)

```jsonc
"#bimultimap/*": "./dist/internal/*.{js,d.ts}"
```

## Variant namespaces

`BiMultiMapHashed` / `BiMultiMapSorted` namespaces live in `src/internal/hashed-interface.ts`
and `src/internal/sorted-interface.ts`. They are implementation detail of the variant entries and are
referenced internally via `#bimultimap/hashed-interface` / `#bimultimap/sorted-interface`. The variant
entries (`public/hashed.ts`, `public/sorted.ts`) are the public API surface; the interface namespaces
are intentionally subpath-inaccessible.

## Adding a method to BiMultiMap

1. Add the method signature to `src/bimultimap.ts` (base) and propagate to variants as needed.
2. Implement in `src/internal/*`.
3. Add tests in `test/`.

## Pre-existing known issues

- 18 `any` warnings in internal code (by-design type escapements); not introduced by the restructure.
