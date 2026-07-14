# @rimbu/bimap — Package Agent Guide

This package provides `BiMap<K, V>` — an immutable bi-directional map with a one-to-one
key↔value invariant.

## Source layout

```
src/
├── bimap.ts    # exports["."]   — BiMap + Context + Builder + creators (whole surface)
└── internal/   # NEVER exported; "#bimap/*" only   (private impl)
    ├── builder.ts
    ├── context-factory.ts
    ├── factory.ts
    └── immutable.ts
```

The package has a single public entry (the root `bimap.ts`); there are no separate public
subpaths, so no `public/` directory exists. `internal/` is never exported and is reachable
only via the `#bimap/*` import alias. No `"./*"` wildcard and no `"./internal/*"` leak exist.

## Package imports (`#` paths)

```jsonc
"#bimap/*": "./dist/internal/*.{js,d.ts}"
```

## Intentional API deviations

- **`getValue` / `getKey` instead of a single `get`:** because of the 1-to-1 bidirectional
  invariant, retrieving by key and by value are distinct operations. `BiMap` exposes
  `getKey(value)` and `getValue(key)` rather than a single overloaded `get`.
- **No `mapValues`:** mapping values would break the one-to-one invariant, so `mapValues`
  is intentionally absent (unlike `HashMap`). Do not add `get`/`mapValues` parity with
  `HashMap`.

## Adding a method to BiMap

1. Add the method signature (and NonEmpty override) to `src/bimap.ts`.
2. Implement in `src/internal/immutable.ts` (and `builder.ts` if relevant).
3. Propagate to `RMapBase` in `@rimbu/collection-types` only if it belongs on the abstract base.
4. Add tests in `test/`.

## Pre-existing known issues

None currently.
