---
severity: low
impact: package
complexity: small
pass: implementation
package: task
confidence: medium
effort_estimate: 0.5d
title: "Task.run does not await children when context is cancelled (contradicts documented guarantee)"
---

## Summary
`Task.Context.run` is documented ("awaits it and all its children before returning"), but its `finally` block calls `waitIgnoringAbort`, which swallows the abort when the context has been cancelled and returns immediately without waiting for children. So after `ctx.cancel()`, a `ctx.run(...)` that launched children returns as soon as the task body finishes, leaving children unawaited. The safe bounded-shutdown path is only available via `ctx.cancelWithTimeout(ms)`.

## Evidence
`packages/task/src/internal/task-context-impl.ts:23-32` (helper swallows abort) and `:255-261`:
```ts
run = async (task, args) => {
  try {
    return await unpackTask(task)(this, ...args);
  } finally {
    await waitIgnoringAbort(this.#childrenWaitGroup, this.cancelledSignal);
  }
}
```
`waitIgnoringAbort` (`:27-31`) catches and ignores any abort from the wait group. The same asymmetry is acknowledged in the `run`/`cancelWithTimeout` doc comments but is not surfaced as a behavioral caveat on `run` itself.

## Impact
Callers who `cancel()` and then rely on `run` having joined all children will observe children still running. This is a sharp edge relative to the documented "awaits all its children" contract and can cause flaky teardown in tests/examples.

## Recommendation
Document the cancellation behavior directly on `run` (and/or on `Task.Context.cancel`), clarifying that `cancel()` + `run` returns without awaiting children and that `cancelWithTimeout(ms)` is required for bounded shutdown. Optionally, make `run`'s `finally` await children unless an explicit `cancelWithTimeout` detach already occurred.
