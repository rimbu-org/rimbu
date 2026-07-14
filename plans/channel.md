# @rimbu/channel — restructuring plan

## Current state (violations)
- Root file `src/channel.ts` exists (correct name) and already re-exports all sub-modules
  via `@rimbu/channel/<sub>` self-imports (good — conforms to model A).
- All 9 other top-level public modules sit at the package root instead of `src/public/`
  (model C1): `cross-channel.ts`, `mutex.ts`, `remote-channel.ts`,
  `remote-channel-client.ts`, `remote-channel-server.ts`, `remote-object.ts`,
  `rpc-proxy.ts`, `semaphore.ts`, `wait-group.ts`.
- `package.json` `exports` uses `"./*": { "types": "./dist/*.d.ts", "default": "./dist/*.js" }`,
  i.e. `"./*" → "./dist/*"` (model B1 requires `"./*" → "./dist/public/*"`).
- `src/internal/` is correctly private and only reachable via `#channel/*`.

## Target layout
```
src/
  channel.ts    # root "."  → re-exports whole surface
  public/       # "./*" → dist/public/*   (normal user API)
    cross-channel.ts
    mutex.ts
    remote-channel.ts
    remote-channel-client.ts
    remote-channel-server.ts
    remote-object.ts
    rpc-proxy.ts
    semaphore.ts
    wait-group.ts
  internal/     # never exported; "#channel/*" only   (private impl)
    channel-error.ts
    channel-impl.ts
    remote-channel-client-impl.ts
    remote-channel-impl.ts
    remote-channel-server-impl.ts
    remote-object-error.ts
    remote-object-impl.ts
    rpc-proxy-error.ts
    rpc-proxy-impl.ts
    semaphore-error.ts
    semaphore-impl.ts
    utils.ts
    wait-group-error.ts
    wait-group-impl.ts
```

## File mapping (current → target)
| Current file | Tier | New Path |
|---|---|---|
| src/channel.ts | root | src/channel.ts (unchanged) |
| src/cross-channel.ts | public | src/public/cross-channel.ts |
| src/mutex.ts | public | src/public/mutex.ts |
| src/remote-channel.ts | public | src/public/remote-channel.ts |
| src/remote-channel-client.ts | public | src/public/remote-channel-client.ts |
| src/remote-channel-server.ts | public | src/public/remote-channel-server.ts |
| src/remote-object.ts | public | src/public/remote-object.ts |
| src/rpc-proxy.ts | public | src/public/rpc-proxy.ts |
| src/semaphore.ts | public | src/public/semaphore.ts |
| src/wait-group.ts | public | src/public/wait-group.ts |
| src/internal/*.ts (14 files) | internal | src/internal/*.ts (unchanged) |

## package.json exports / imports changes
Target `exports`:
```json
"exports": {
  ".":   { "types": "./dist/channel.d.ts", "import": "./dist/channel.js" },
  "./*": { "types": "./dist/public/*.d.ts", "default": "./dist/public/*.js" }
}
```
Target `imports`:
```json
"imports": {
  "#channel/*": { "types": "./dist/internal/*.d.ts", "default": "./dist/internal/*.js" }
}
```
- REPLACE `"./*" → "./dist/*"` with `"./*" → "./dist/public/*"`.
- KEEP `#channel/*` import.

## Root fix
`src/channel.ts` already re-exports the whole surface. After moving modules to
`src/public/`, its existing self-imports (`@rimbu/channel/cross-channel`, etc.) continue to
resolve via the `"./*"` wildcard to `dist/public/*`. No change to the re-export set needed,
only ensure all 9 public files are imported/re-exported (they already are).

## Naming / intentional deviations
- All top-level modules are intended public API → all move to `public/`. None are advanced.
- No obvious naming inconsistencies to fix.

## Notes
- `cross-channel.ts` exists (verified) and is referenced by `remote-object.ts`,
  `remote-channel*.ts`, and `channel.ts`; moving it to `public/` keeps it reachable.
- `tsconfig.common.json` must add a path so `@rimbu/channel/<sub>` resolves to
  `./public/<sub>.ts` for in-package typechecking.
