# @rimbu/task — Agent & Contributor Guide

This document supplements the root `AGENTS.md` with details specific to the `@rimbu/task` package. Read the root guide first.

---

## 1. What is @rimbu/task?

`@rimbu/task` provides composable, cancellable, supervised async task orchestration. Its core concepts:

- **`Task<R, A>`** — a unit of async work, either a `Task.Fun` (a function) or a `Task.Seq` (an ordered tuple of tasks where each task passes its result to the next).
- **`Task.Context`** — the execution environment passed to every running task. Tracks cancellation state, child contexts, and `AbortSignal`. Implements `Disposable` (cancels on dispose).
- **`Task.Job<R>`** — a handle to a background task launched with `ctx.launch(...)`. Supports `join`, `cancel`, `cancelAndJoin`. Implements `Disposable` (cancels on dispose).
- **`Task.Modifier<E>`** — a higher-order function that wraps a task to add behaviour (timeout, retry, error handling, etc.).

The single global entry point is `Task` (from `@rimbu/task`). It holds `Task.rootContext`, `Task.create`, and `Task.launch`.

---

## 2. Public Sub-paths

| Import path | Source file | Purpose |
|---|---|---|
| `@rimbu/task` | `src/task.ts` | Core types and the `Task` factory |
| `@rimbu/task/errors` | `src/errors.ts` | `CancellationError`, `TimeoutError`, `RetryExhaustedError` |
| `@rimbu/task/modifiers` | `src/modifiers.ts` | `withTimeout`, `withRetry`, `withArgs`, `catchError`, `catchAll`, `combined`, `repeat`, `mapOutput`, `mapOutputArr` |
| `@rimbu/task/ops` | `src/ops.ts` | Primitive tasks: `delay`, `race`, `any`, `all`, `allSettled`, `chain`, `effect`, `clog`, `clogArgs`, `cancelContext`, `cancelAllChildren`, `cancelParent`, `throwError`, `throwErrorClass`, `runSingleCancelPrevious`, `runSingleCancelNew` |
| `@rimbu/task/utils` | `src/utils.ts` | `taskify`, `joinAll` |

`#task/*` internal imports map to `src/internal/*.ts` and must not be imported from outside the package.

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

Never import from `#task/*` outside `src/`. Tests use the public sub-paths.

---

## 4. Key Design Invariants

### Cancellation propagates downward, not upward (unless non-supervisor)

- When a parent context is cancelled, all child contexts are cancelled transitively.
- When a child context throws an **unhandled error** and the parent is **not a supervisor** (`isSupervisor: false`), the parent is also cancelled. This is the "structured concurrency" default.
- A **supervisor** context (`isSupervisor: true`) isolates child failures — children can fail without cancelling the parent. Use supervisor contexts for `race`, `any`, and `allSettled`.

### `CancellationError` is never swallowed

Every `catch` block in this package re-throws `CancellationError`. When adding error-handling logic, always check `error instanceof CancellationError` and re-throw it.

### `using` / `Symbol.dispose` for cleanup

Cancellation cleanup is expressed with `using` declarations (TC39 Explicit Resource Management). `Task.Context` and `Task.Job` both implement `Disposable`. Internal utilities (`DisposablePromise`, `DisposableCallback`) also implement `Disposable`. This is why the package requires `"lib": ["ES2025", "ESNext.Disposable", "DOM"]` in the shared tsconfig — do **not** remove `ESNext.Disposable` from `config/tsconfig.common.json`.

### `Task.Seq` executes sequentially; later tasks receive no args

In a `Task.Seq` tuple `[t1, t2, t3]`, `t1` receives the original `args`, but `t2` and `t3` receive no arguments — they are called with an empty arg list. The result of the last task is the result of the sequence. See `unpackTask` in `src/internal/task-context-impl.ts`.

### `ctx.run` vs `ctx.launch`

- `ctx.run(task, args)` — executes a task inline in the current context. Awaits it and all its children before returning. Use for sequential work.
- `ctx.launch(task, options)` — starts a task as a background `Job` in a new child context. Returns immediately with a `Job` handle. Use for concurrent work.

---

## 5. Adding a New Modifier or Op

### Adding to `src/modifiers.ts`

Modifiers have the signature `(task: Task<R, A>) => Task<R | E, A>` (for `Task.Modifier<E>`) or the narrower `ModifierIO` form. Rules:

1. Always re-throw `CancellationError` — never catch it silently.
2. Use `context.run(task, args)` to execute the wrapped task, not a raw `await task(context, ...args)` — this ensures cancellation checks run.
3. Export the function from `src/modifiers.ts` only. Do not add it to `src/ops.ts`.

### Adding to `src/ops.ts`

Ops are tasks or task factories (functions that return a `Task`). For concurrent ops that need isolation use a supervisor child context, matching the pattern in `race`, `any`, and `allSettled`.

---

## 6. Dependencies

- `@rimbu/channel` — used for `Semaphore` (max-branch limiting) and `WaitGroup` (waiting for all children to finish before a parent `run` returns).
- `@rimbu/common` — used for `Module` (factory wiring) and `ErrBase.CustomError` (error base class).

No other `@rimbu/*` packages are allowed as dependencies without a deliberate decision.

---

## 7. Testing

Tests live in `test/` and are split by concern:

| File | What it covers |
|---|---|
| `task.test.ts` | `Task.create`, `Task.launch`, basic execution |
| `task-context.test.ts` | `Task.Context` API: cancellation, children, signals |
| `task-exceptions.test.ts` | Error propagation and `CancellationError` behaviour |
| `task-modifiers.test.ts` | All modifiers in `src/modifiers.ts` |
| `task-operations.test.ts` | All ops in `src/ops.ts` |
| `task-utils.test.ts` | `taskify`, `joinAll` |
| `utils.test.ts` | Internal utilities (`disposableDelay`, `cleanupOn`, etc.) |

Run tests:

```sh
bun run build   # always build first
bun run test
```

When adding a modifier: add tests to `task-modifiers.test.ts`.
When adding an op: add tests to `task-operations.test.ts`.
When adding a utility in `src/utils.ts`: add tests to `task-utils.test.ts`.
When modifying internal utilities: add tests to `utils.test.ts`.

---

## 8. Common Pitfalls

- **Do not use `task(context, ...args)` directly.** Always go through `context.run(task, args)` so cancellation is checked before and after execution.
- **Do not add `@rimbu/channel` primitives to the public API.** They are an implementation detail of `TaskContextImpl`.
- **Do not remove `ESNext.Disposable` from `config/tsconfig.common.json`.** The `Disposable` global is only available in `esnext.disposable`, not in `ES2025`, in the current TypeScript version used by this repo (7.0.1-rc / typescript-go).
- **`Task.Seq` passes no args to tasks after the first.** If your task needs data from a previous step, use `chain` from `ops.ts` instead, which threads results as arguments.
- **Supervisor contexts do not cancel on child error; non-supervisor contexts do.** Get this wrong and you will either leak running jobs or cancel the context unintentionally.
