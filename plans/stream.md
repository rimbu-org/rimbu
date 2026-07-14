# @rimbu/stream — restructuring plan

## Current state (violations)
- `package.json` exports `.`, `./async`, `./async/internal/fast-iterator-base`, `./async/internal/stream-base`, and `"./*"` → `"./dist/*.js"`. The two `./async/internal/*` entries **leak internal** files, and the `"./*"` wildcard leaks everything else in `dist/`.
- `src/stream-types.ts` and `src/internal/async-stream-types.ts` are **foundational PUBLIC interfaces** (`FastIterable`/`Streamable`/`StreamSource`, `AsyncFastIterable`/`AsyncStreamable`/`AsyncStreamSource`) re-exported from root, yet physically live in `internal/` — violates "internal never exported".
- `src/internal/stream-types.ts` is imported & re-exported in `stream.ts` via the `#private/stream-types` alias; `async-stream.ts` uses `#private/async-stream-types`. The `#private/*` alias is redundant with `#stream/*` (both point at `./dist/internal/*`) and must be folded away.
- Entry files `async-stream.ts`, `reducer.ts`, `transformer.ts`, `async/reducer.ts`, `async/transformer.ts` live at `src/`/`src/async/` top level and must move under `src/public/`.

## Target layout
```
src/
  stream.ts                 # root "."  → re-exports whole surface (incl. public/stream-types)
  public/                   # "./*" → dist/public/*   (normal user API)
    async.ts                # (from src/async-stream.ts)  subpath @rimbu/stream/async
    reducer.ts              # (from src/reducer.ts)
    transformer.ts          # (from src/transformer.ts)
    stream-types.ts         # (from src/internal/stream-types.ts)  FastIterable/Streamable/StreamSource
    async/
      reducer.ts            # (from src/async/reducer.ts)
      transformer.ts        # (from src/async/transformer.ts)
      async-stream-types.ts # (from src/internal/async-stream-types.ts)
  advanced/                 # (none)
  internal/                 # NEVER exported; "#stream/*" / "#async/*" only
    factory-module.ts
    factory.ts
    base.ts
    fast-iterator-base.ts
    fast-iterator-factory-module.ts
    fast-iterator-factory.ts
    reducer-base.ts
    reducer-errors.ts
    reducer-factory-module.ts
    reducer-factory.ts
    reducer-instance.ts
    utils.ts
    async/
      constructors.ts
      factory-module.ts
      factory.ts
      fast-iterator-base.ts
      fast-iterator-factory-module.ts
      fast-iterator-factory.ts
      reducer-base.ts
      reducer-errors.ts
      reducer-factory-module.ts
      reducer-factory.ts
      reducer-instance.ts
      stream-base.ts
      utils.ts
```

## File mapping (current → target)
| Current file | Tier | New path |
|---|---|---|
| src/stream.ts | root | src/stream.ts (edit imports) |
| src/async-stream.ts | public | src/public/async.ts |
| src/reducer.ts | public | src/public/reducer.ts |
| src/transformer.ts | public | src/public/transformer.ts |
| src/async/reducer.ts | public | src/public/async/reducer.ts |
| src/async/transformer.ts | public | src/public/async/transformer.ts |
| src/internal/stream-types.ts | public | src/public/stream-types.ts |
| src/internal/async-stream-types.ts | public | src/public/async/async-stream-types.ts |
| src/internal/factory-module.ts | internal | src/internal/factory-module.ts (unchanged) |
| src/internal/factory.ts | internal | src/internal/factory.ts (unchanged) |
| src/internal/base.ts | internal | src/internal/base.ts (unchanged) |
| src/internal/fast-iterator-base.ts | internal | src/internal/fast-iterator-base.ts (unchanged) |
| src/internal/fast-iterator-factory-module.ts | internal | src/internal/fast-iterator-factory-module.ts (unchanged) |
| src/internal/fast-iterator-factory.ts | internal | src/internal/fast-iterator-factory.ts (unchanged) |
| src/internal/reducer-base.ts | internal | src/internal/reducer-base.ts (unchanged) |
| src/internal/reducer-errors.ts | internal | src/internal/reducer-errors.ts (unchanged) |
| src/internal/reducer-factory-module.ts | internal | src/internal/reducer-factory-module.ts (unchanged) |
| src/internal/reducer-factory.ts | internal | src/internal/reducer-factory.ts (unchanged) |
| src/internal/reducer-instance.ts | internal | src/internal/reducer-instance.ts (unchanged) |
| src/internal/utils.ts | internal | src/internal/utils.ts (unchanged) |
| src/internal/async/constructors.ts | internal | src/internal/async/constructors.ts (unchanged) |
| src/internal/async/factory-module.ts | internal | src/internal/async/factory-module.ts (unchanged) |
| src/internal/async/factory.ts | internal | src/internal/async/factory.ts (unchanged) |
| src/internal/async/fast-iterator-base.ts | internal | src/internal/async/fast-iterator-base.ts (unchanged) |
| src/internal/async/fast-iterator-factory-module.ts | internal | src/internal/async/fast-iterator-factory-module.ts (unchanged) |
| src/internal/async/fast-iterator-factory.ts | internal | src/internal/async/fast-iterator-factory.ts (unchanged) |
| src/internal/async/reducer-base.ts | internal | src/internal/async/reducer-base.ts (unchanged) |
| src/internal/async/reducer-errors.ts | internal | src/internal/async/reducer-errors.ts (unchanged) |
| src/internal/async/reducer-factory-module.ts | internal | src/internal/async/reducer-factory-module.ts (unchanged) |
| src/internal/async/reducer-factory.ts | internal | src/internal/async/reducer-factory.ts (unchanged) |
| src/internal/async/reducer-instance.ts | internal | src/internal/async/reducer-instance.ts (unchanged) |
| src/internal/async/stream-base.ts | internal | src/internal/async/stream-base.ts (unchanged) |
| src/internal/async/utils.ts | internal | src/internal/async/utils.ts (unchanged) |

## package.json exports / imports changes
Target `exports`:
```jsonc
"exports": {
  ".": {
    "types": "./dist/stream.d.ts",
    "default": "./dist/stream.js"
  },
  "./async": {
    "types": "./dist/public/async.d.ts",
    "default": "./dist/public/async.js"
  },
  "./*": {
    "types": "./dist/public/*.d.ts",
    "default": "./dist/public/*.js"
  }
}
```
- **Remove** `"./async/internal/fast-iterator-base"`, `"./async/internal/stream-base"`, and the old `"./*"` → `"./dist/*.js"`.
- Keep `imports`, dropping `#private/*` and folding its usages into `#stream/*`:
```jsonc
"imports": {
  "#async/*": {
    "types": "./dist/internal/async/*.d.ts",
    "default": "./dist/internal/async/*.js"
  },
  "#stream/*": {
    "types": "./dist/internal/*.d.ts",
    "default": "./dist/internal/*.js"
  }
}
```

`tsconfig.common.json` paths:
```jsonc
"@rimbu/stream": ["./src/stream.ts"],
"@rimbu/stream/async": ["./src/public/async.ts"],
"@rimbu/stream/*": ["./src/public/*.ts", "./src/public/*"],
"#async/*": ["./src/internal/async/*.ts"],
"#stream/*": ["./src/internal/*.ts"]
```

## Root fix
`src/stream.ts` currently does `import type { ... } from '#private/stream-types'` and `export type * from '#private/stream-types'`. Because `stream-types.ts` is now **public**, change to the package path:
```ts
import type { FastIterable, Streamable, StreamSource } from '@rimbu/stream/stream-types';
export type * from '@rimbu/stream/stream-types';
```
`src/public/async.ts` (formerly `async-stream.ts`) changes `#private/async-stream-types` → `@rimbu/stream/async/async-stream-types`, and keeps `#async/constructors` / `#async/factory-module` (still internal). All other `#private/...` usages in `src/` become `#stream/...` / `#async/...`.

## Naming / intentional deviations
- `stream-types.ts` (sync) and `async-stream-types.ts` (async) — distinct, intentional; no rename. Note that sync types keep the bare name `stream-types` while async live under `public/async/`.
- No `advanced/` tier: stream has only public + internal; the implementer-facing bases already reside in `internal/` (private by design).

## Notes
- Subpath continuity: `@rimbu/stream/async` (explicit), `@rimbu/stream/reducer`, `@rimbu/stream/transformer`, `@rimbu/stream/stream-types`, `@rimbu/stream/async/reducer`, `@rimbu/stream/async/transformer`, `@rimbu/stream/async/async-stream-types` all remain resolvable via the new `"./*"` → `dist/public/*` mapping.
- Internal-only files (`factory*`, `reducer-*`, `base.ts`, `fast-iterator-*`, `async/*`) are no longer reachable from outside the package — the leaked `./async/internal/*` entries are gone.
- `@rimbu/stream/async` imported by `async/reducer.ts` and `async/transformer.ts` still resolves (now `public/async.ts`).
