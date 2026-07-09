# @rimbu/task — Agent & Contributor Guide

This document supplements the root `AGENTS.md` with details specific to the `@rimbu/task` package. Read the root guide first.

---

## 1. What is @rimbu/task?

`@rimbu/task` provides composable, cancellable, supervised async task orchestration. Its core concepts:

- **`Task<R, A>`** — a unit of async work: a function `(context: Task.Context, ...args: A) => Task.Result<R>`.
- **`Task.Context`** — the execution environment passed to every running task. Tracks cancellation state, child contexts, and `AbortSignal`. Implements `Disposable` (cancels on dispose).
- **`Task.Job<R>`** — a handle to a background task launched with `ctx.launch(...)`. Supports `join`, `cancel`, `cancelAndJoin`. Implements `Disposable` (cancels on dispose).
- **`Task.Modifier<E>`** — a higher-order function that wraps a task to add behaviour (timeout, retry, error handling, etc.).

The single global entry point is `Task` (from `@rimbu/task`). It holds `Task.rootContext`, `Task.fn`, `Task.modifier`, and `Task.launch`.

---

## 2. Public Sub-paths

| Import path | Purpose |
|---|---|
| `@rimbu/task` | Core types (`Task`, `Task.Context`, `Task.Job`, `Task.Modifier`, `Task.Chain`, `Task.ChildOptions`), error classes (`TaskCancellationError`, `TaskTimeoutError`, `TaskRetryExhaustedError`), utility types (`Cleanup`, `DisposableCallback`), and the `Task` factory |
| `@rimbu/task/ops` | Everything else: all ops, modifiers, and utilities (barrel re-export of `ops-impl`, `modifiers`, `utils`) |

**Rule:** if it creates or transforms a task, it's in `@rimbu/task/ops`. If it defines the shape of a task or is needed in a `catch` block, it's in `@rimbu/task`.

The following sub-paths also exist as source files and are individually accessible, but users should prefer `@rimbu/task/ops`:

| Path | Contains |
|---|---|
| `@rimbu/task/ops-impl` | Primitive task ops: `chain`, `race`, `any`, `all`, `allSettled`, `delay`, `effect`, `throwError`, `throwErrorClass`, `cancelContext`, `cancelAllChildren`, `runSingleCancelPrevious`, `runSingleCancelNew` |
| `@rimbu/task/modifiers` | Modifier functions: `combined`, `withTimeout`, `retryWhen`, `withRetry`, `withArgs`, `mapOutput`, `mapOutputArr`, `catchError`, `catchAll`, `repeat`, `repeatWithIndex` |
| `@rimbu/task/utils` | `taskify`, `joinAll` |

`#task/*` internal imports map to `src/internal/*.ts` and must not be used outside `src/`.

---

## 3. Internal Module Map

```
src/internal/
├── task-context-impl.ts   # TaskContextImpl — the sole impl of Task.Context
├── task-module.ts         # Module.create wiring; creates the Task factory object
└── utils.ts               # Low-level helpers: DisposablePromise, DisposableCallback,
                           #   disposableDelay, withTimeout, cleanupOn, toDisposableCallback,
                           #   cleanupToCallback, promiseToDisposable
```

Never import from `#task/*` outside `src/`. Tests use the public sub-paths or `#task/*` for internal utility testing only.

---

## 4. Error Classes

Errors are defined in `task.ts` as standalone classes and re-exported as namespace aliases:

| Standalone export | Namespace alias | When thrown |
|---|---|---|
| `TaskCancellationError` | `Task.CancellationError` | Context or job cancelled |
| `TaskTimeoutError` | `Task.TimeoutError` | `withTimeout` competitor wins |
| `TaskRetryExhaustedError` | `Task.RetryExhaustedError` | (exported for completeness; `withRetry` re-throws the last error, not this) |

**Important:** `Task.CancellationError` is a type alias only in the namespace — not a value. Use `TaskCancellationError` when you need the constructor (e.g. `instanceof` checks, `throw new TaskCancellationError()`). This is a tsgo limitation: `export const` inside a namespace that shares its name with an outer `export type` + `export const` causes a duplicate identifier error in tsgo 7.

---

## 5. Key Design Invariants

### Cancellation propagates downward, not upward (unless non-isolated)

- When a parent context is cancelled, all child contexts are cancelled transitively.
- When a child context throws an **unhandled error** and the parent is **not isolated** (`isolated: false`, the default), the parent is also cancelled.
- An **isolated** context (`isolated: true`) absorbs child failures — children can fail without cancelling the parent. Used internally by `race`, `any`, and `allSettled`.

### `TaskCancellationError` is never swallowed

Every `catch` block in this package re-throws `TaskCancellationError`. When adding error-handling logic, always check `error instanceof TaskCancellationError` and re-throw it.

### `using` / `Symbol.dispose` for cleanup

Cancellation cleanup is expressed with `using` declarations (TC39 Explicit Resource Management). `Task.Context` and `Task.Job` both implement `Disposable`. Internal utilities (`DisposablePromise`, `DisposableCallback`) also implement `Disposable`. This is why the package requires `"lib": ["ES2025", "ESNext.Disposable", "DOM"]` in the shared tsconfig — do **not** remove `ESNext.Disposable` from `config/tsconfig.common.json`.

### `chain` passes the first task's original args; subsequent tasks receive the previous result as a single argument

```ts
chain(
  async (_ctx, id: number) => ({ id, name: 'User ' + id }), // receives [id] from args
  async (_ctx, user: { id: number; name: string }) => user.name, // receives { id, name } as single arg
  mapOutput((name: string) => name.length),                   // receives "name" as single arg
)
// Task<number, [number]>
```

### `ctx.run` vs `ctx.launch`

- `ctx.run(task, args)` — executes a task inline in the current context. Awaits it and all its children before returning. Use for sequential work.
- `ctx.launch(task, options)` — starts a task as a background `Job` in a new child context. Returns immediately with a `Job` handle. Use for concurrent work.

### `context.delay(ms)` requires a number argument

`delay` is not optional. Use `context.yield()` for a zero-delay event-loop yield.

---

## 6. Adding a New Modifier

Modifiers live in `src/modifiers.ts`. Rules:

1. Always re-throw `TaskCancellationError` — never catch it silently.
2. Use `context.run(task, args)` to execute the wrapped task, not `await task(context, ...args)` directly — this ensures cancellation checks run.
3. Use `retryWhen` as the primitive for any retry-based modifier.
4. Export from `src/modifiers.ts` only. The `ops.ts` barrel re-exports everything automatically.

### Adding a New Op

Ops live in `src/ops-impl.ts`. For concurrent ops that need isolation, set `isolated: true` in the `launch` options, matching the pattern in `race`, `any`, and `allSettled`.

---

## 7. Dependencies

- `@rimbu/channel` — used for `Semaphore` (max-branch limiting) and `WaitGroup` (waiting for all children to finish before a parent `run` returns).
- `@rimbu/common` — used for `Module` (factory wiring).

No other `@rimbu/*` packages are allowed as dependencies without a deliberate decision.

---

## 8. Testing

Tests live in `test/` and are split by concern:

| File | What it covers |
|---|---|
| `task.test.ts` | `Task.fn`, `Task.launch`, basic execution, `maxBranch` |
| `task-context.test.ts` | `Task.Context` API: parent/child relationships |
| `task-exceptions.test.ts` | Error propagation, `TaskCancellationError` behaviour, `recover` |
| `task-modifiers.test.ts` | All modifiers: `withRetry`, `retryWhen`, `withTimeout`, `withArgs`, `mapOutput`, `mapOutputArr`, `repeat`, `repeatWithIndex`, `combined`, `catchError`, `catchAll` |
| `task-operations.test.ts` | All ops: `chain`, `race`, `all`, `any`, `allSettled`, `delay`, `effect`, `cancelContext`, `cancelAllChildren`, `runSingleCancelPrevious`, `runSingleCancelNew` |
| `task-utils.test.ts` | `taskify`, `joinAll` |
| `utils.test.ts` | Internal utilities (`disposableDelay`, `cleanupOn`, etc.) |

Run tests:

```sh
bun run build   # always build first
bun run test
```

---

## 9. Common Pitfalls

- **Do not use `task(context, ...args)` directly.** Always go through `context.run(task, args)` so cancellation is checked before and after execution.
- **Do not add `@rimbu/channel` primitives to the public API.** They are an implementation detail of `TaskContextImpl`.
- **Do not remove `ESNext.Disposable` from `config/tsconfig.common.json`.** The `Disposable` global is only available in `esnext.disposable`, not in `ES2025`, in the current TypeScript version (tsgo 7.0.1-rc).
- **`chain` passes the first task its original args directly.** Only subsequent tasks receive the previous task's result as a single wrapped argument.
- **Isolated contexts do not cancel on child error; non-isolated contexts do.** Default is non-isolated. Use `isolated: true` for supervisor-style contexts.
- **Error classes in the `Task` namespace are type aliases only.** `Task.CancellationError` is a type, not a constructor value in the namespace. Use `TaskCancellationError` (standalone export) for `instanceof` checks and `throw new ...` — this is a tsgo limitation.
- **`context.delay(ms)` requires a number.** There is no default. Use `context.yield()` for a zero-delay yield.
