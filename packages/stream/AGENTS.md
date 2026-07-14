# @rimbu/stream — Package Agent Guide

This is the most complex package in Rimbu. It contains the lazy `Stream` and `AsyncStream` types along with `Reducer` and `Transformer`.

## Source layout

```
src/
├── stream.ts            # exports["."]   — sync Stream API (main entry)
├── public/              # exports["./*"]  — public subpaths (dist/public/*)
│   ├── async.ts             # @rimbu/stream/async        — AsyncStream API
│   ├── reducer.ts            # @rimbu/stream/reducer      — Reducer type
│   ├── transformer.ts        # @rimbu/stream/transformer   — Transformer type
│   ├── stream-types.ts      # @rimbu/stream/stream-types — FastIterable/Streamable/StreamSource
│   ├── async/
│   │   ├── reducer.ts            # @rimbu/stream/async/reducer
│   │   ├── transformer.ts        # @rimbu/stream/async/transformer
│   │   └── async-stream-types.ts # @rimbu/stream/async/async-stream-types
├── advanced/           # exports["./advanced/*"]  — extension bases (dist/advanced/*)
│   ├── base.ts             # @rimbu/stream/advanced/base          → StreamBase
│   ├── fast-iterator-base.ts # @rimbu/stream/advanced/fast-iterator-base → FastIteratorBase
│   └── async/
│       ├── fast-iterator-base.ts # @rimbu/stream/advanced/async/fast-iterator-base → AsyncFastIteratorBase
│       └── stream-base.ts        # @rimbu/stream/advanced/async/stream-base    → AsyncFromStream
└── internal/             # NEVER exported; "#stream/*" / "#async/*" only
    ├── base.ts                 # sync stream base implementation
    ├── factory.ts              # sync stream factory
    ├── factory-module.ts       # sync stream module builder
    ├── fast-iterator-base.ts   # sync FastIterator base
    ├── fast-iterator-factory.ts
    ├── fast-iterator-factory-module.ts
    ├── reducer-base.ts         # sync Reducer base
    ├── reducer-instance.ts     # sync Reducer instance
    ├── reducer-factory.ts      # sync Reducer factory
    ├── reducer-factory-module.ts
    ├── reducer-errors.ts
    ├── utils.ts                # sync internal utilities
    └── async/                  # all async internals mirror the sync structure
        ├── stream-base.ts
        ├── factory.ts
        ├── factory-module.ts
        ├── fast-iterator-base.ts
        ├── fast-iterator-factory.ts
        ├── fast-iterator-factory-module.ts
        ├── reducer-base.ts
        ├── reducer-instance.ts
        ├── reducer-factory.ts
        ├── reducer-factory-module.ts
        ├── reducer-errors.ts
        ├── constructors.ts
        └── utils.ts
```

### Restructure note (deviation from draft plan)

- Moved the public entry files to `src/public/`: `async-stream.ts` → `public/async.ts`
  (subpath `@rimbu/stream/async`), `reducer.ts`/`transformer.ts`, and
  `async/{reducer,transformer}.ts`. The foundional type files `stream-types.ts`
  and `async-stream-types.ts` (previously under `internal/`) are genuinely public
  (`FastIterable`/`Streamable`/`StreamSource`, `AsyncStreamable`/etc.) so they
  were promoted to `public/` rather than kept private.
- `package.json`: removed the leaking `"./*" → "./dist/*.js"` (now `"./*" →
  "./dist/public/*"`); added a `"./advanced/*" → "./dist/advanced/*"` tier;
  removed the redundant `#private/*` import alias (folded into `#stream/*` /
  package paths).
- **`advanced/` tier added (no leaks).** `@rimbu/channel` and `@rimbu/graph`
  extend stream's base classes to build custom streams. Those extension bases
  are now exposed through `advanced/` (not raw `internal/`):
  - `@rimbu/stream/advanced/base` → `StreamBase`
  - `@rimbu/stream/advanced/fast-iterator-base` → `FastIteratorBase`
  - `@rimbu/stream/advanced/async/fast-iterator-base` → `AsyncFastIteratorBase`
  - `@rimbu/stream/advanced/async/stream-base` → `AsyncFromStream`
  The `src/advanced/*` files simply re-export the symbols from their `internal/`
  homes, so the definitions stay private while the extension API is curated.
  `internal/` is now completely unreachable from outside the package.
- `tsconfig.common.json`: `@rimbu/stream/async` → `./src/public/async.ts`;
  added `"./*" → "./src/public/*.ts"` and `"./advanced/*" → "./src/advanced/*.ts"`
  (incl. `./advanced/async/*`).

## Package imports (`#` paths)

```jsonc
"#stream/*": "./dist/internal/*.{js,d.ts}"        // sync internals
"#async/*": "./dist/internal/async/*.{js,d.ts}"   // async internals
```

## Key types

| Type | File | Purpose |
|---|---|---|
| `Stream<T>` | `src/stream.ts` | Lazy sync iterable with rich operations |
| `Stream.NonEmpty<T>` | `src/stream.ts` | Refinement: known non-empty |
| `AsyncStream<T>` | `src/async-stream.ts` | Lazy async iterable |
| `Reducer<I, O>` | `src/reducer.ts` | Composable fold: input type `I`, output type `O` |
| `Transformer<T, R>` | `src/transformer.ts` | Stream transformation |
| `AsyncReducer<I, O>` | `src/async/reducer.ts` | Async Reducer |

## FastIterator pattern

Rimbu implements its own `FastIterator<T>` protocol for performance — it avoids the overhead of standard JS iterators by using a sentinel value (`Token`) instead of `{ value, done }` objects:

```ts
// Internal protocol — used in implementations
interface FastIterator<T> {
  fastNext<O>(otherwise: OptLazy<O>): T | O;
}

// Token is the sentinel for "no more values"
import { Token } from '@rimbu/base';
const result = iter.fastNext(Token);
if (result === Token) break; // exhausted
```

Implementations in `src/internal/fast-iterator-base.ts` and `src/internal/fast-iterator-factory.ts`.

## Adding a new Stream method

1. Add the method signature to `Stream<T>` and `Stream.NonEmpty<T>` in `src/stream.ts`
2. Add the overloads with correct NonEmpty return types
3. Implement in `src/internal/base.ts` (the `StreamBase` class)
4. Mirror the method on `AsyncStream` in `src/async-stream.ts` + `src/internal/async/stream-base.ts`
5. Add tests in `test/stream.test.ts` and `test-d/stream.test-d.ts`

## Adding a new Reducer

1. Add static factory method to the `Reducer` namespace in `src/reducer.ts`
2. Implement in `src/internal/reducer-factory.ts`
3. Add tests in `test/reducer.test.ts`
4. Mirror on `AsyncReducer` if applicable
