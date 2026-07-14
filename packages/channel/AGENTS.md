# @rimbu/channel — Package Agent Guide

`@rimbu/channel` offers Go-style typed channels, mutexes, semaphores, wait groups,
and remote-channel / RPC machinery for synchronizing asynchronous processes.

## Source layout

```
src/
├── channel.ts       # exports["."]   — the Channel type + factory, re-exports whole surface
├── public/          # exports["./*"]  — normal user API (dist/public/*)
│   ├── cross-channel.ts
│   ├── mutex.ts
│   ├── remote-channel.ts
│   ├── remote-channel-client.ts
│   ├── remote-channel-server.ts
│   ├── remote-object.ts
│   ├── rpc-proxy.ts
│   ├── semaphore.ts
│   └── wait-group.ts
└── internal/        # NEVER exported; "#channel/*" only   (private impl)
    ├── channel-error.ts
    ├── channel-impl.ts
    ├── remote-channel-client-impl.ts
    ├── remote-channel-impl.ts
    ├── remote-channel-server-impl.ts
    ├── remote-object-error.ts
    ├── remote-object-impl.ts
    ├── rpc-proxy-error.ts
    ├── rpc-proxy-impl.ts
    ├── semaphore-error.ts
    ├── semaphore-impl.ts
    ├── utils.ts
    ├── wait-group-error.ts
    └── wait-group-impl.ts
```

There is **no `advanced/` tier** — every top-level module is normal user API.

## Exports model

```jsonc
"exports": {
  ".":   { "types": "./dist/channel.d.ts", "import": "./dist/channel.js" },
  "./*": { "types": "./dist/public/*.d.ts", "default": "./dist/public/*.js" }
}
```

`@rimbu/channel/<name>` (e.g. `semaphore`, `wait-group`) resolves to
`src/public/<name>.ts`. Subpaths are consumed externally — note `@rimbu/task`
imports `@rimbu/channel/semaphore` and `@rimbu/channel/wait-group`, so these must
stay reachable (they do, via the `"./*"` wildcard).

## Package imports (`#` paths)

```jsonc
"#channel/*": "./dist/internal/*.{js,d.ts}"
// covers: #channel/channel-error, #channel/channel-impl, etc.
```

All 9 public modules and `channel.ts` import internal implementations via
`#channel/*`; the moved public modules continue to self-reference each other via
`@rimbu/channel/<name>` (resolved by the `"./*"` wildcard).

## Restructure note

- Moved the 9 top-level public modules into `src/public/` (no import rewrites
  needed — they already used `@rimbu/channel/<name>` self-imports and `#channel/*`
  for internals, never relative paths).
- `package.json`: replaced the leaking `"./*" → "./dist/*"` with
  `"./*" → "./dist/public/*"`. Kept `#channel/*`.
- `tsconfig.common.json` / `tsconfig.json` / `tsconfig.esm.json`:
  repointed `@rimbu/channel/*` to `src/public/*.ts` (and `public/*.ts` for the
  esm build) so in-package typechecking resolves the moved modules.
- (`#private/*` is present in the tsconfig path maps but currently unused; left
  as-is.)

## Known pre-existing lint

`biome:check` reports `noExplicitAny` / `noConfusingVoidType` warnings in the
untouched files `src/channel.ts` and `src/internal/channel-error.ts`. These are
pre-existing and intentionally left as-is (structure-focus, per D1).

## Adding a new public module

1. Create `src/public/<name>.ts` exporting the public API.
2. Import its internals via `#channel/*`; import sibling public modules via
   `@rimbu/channel/<name>`.
3. Add `export { ... } from '@rimbu/channel/<name>'` to `src/channel.ts`.
4. No `exports` entry needed — the `"./*"` wildcard picks it up automatically.
