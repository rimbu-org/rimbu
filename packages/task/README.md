<p align="center">
  <img src="https://github.com/rimbu-org/rimbu/raw/main/assets/rimbu_logo.svg" height="96" alt="Rimbu Logo" />
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/@rimbu%2Ftask.svg)](https://www.npmjs.com/package/@rimbu/task)
![License](https://img.shields.io/github/license/rimbu-org/rimbu)
![Types Included](https://img.shields.io/badge/TypeScript-ready-blue)
![Node](https://img.shields.io/badge/Node-18+-6DA55F?logo=node.js&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-%23000000.svg)
![ESM + CJS](https://img.shields.io/badge/modules-ESM%20%2B%20CJS-informational)

</div>

# `@rimbu/task`

**Composable, cancellable, and supervised async task orchestration for TypeScript & JavaScript.**

`@rimbu/task` gives you a lightweight, type-safe abstraction over asynchronous workflows. Build complex flows (sequential, parallel, competitive), add cancellation, timeouts, retries, error recovery, supervise child tasks, and convert existing `AbortSignal` based APIs – all using a small, functional, composable core.

> Think: ergonomic structured concurrency + functional composition for the JS ecosystem.

Inspired by structured concurrency patterns from Kotlin Coroutines, adapted for the TypeScript / JavaScript ecosystem in a small, functional API.

---

## Table of Contents

1. [Why Rimbu Task?](#why-rimbu-task)
2. [Feature Highlights](#feature-highlights)
3. [Quick Start](#quick-start)
4. [Core Concepts](#core-concepts)
5. [Composing Tasks](#composing-tasks)
6. [Modifiers & Error Handling](#modifiers--error-handling)
7. [Cancellation & Supervision Patterns](#cancellation--supervision-patterns)
8. [Integrating Existing APIs (`taskify`)](#integrating-existing-apis-taskify)
9. [Advanced Usage](#advanced-usage)
10. [Type Safety Deep Dive](#type-safety-deep-dive)
11. [Installation](#installation)
12. [FAQ](#faq)
13. [Ecosystem & Integration](#ecosystem--integration)
14. [Roadmap](#roadmap)
15. [Contributing](#contributing)
16. [License](#license)

---

## Why Rimbu Task?

Traditional async composition in JavaScript often relies on manual `Promise` orchestration, ad‑hoc cancellation flags, or heavy Observable-style abstractions. `@rimbu/task` focuses on:

- **Structured concurrency**: parent contexts supervise children; cancelling a parent propagates.
- **Explicit cancellation**: via `AbortSignal` integration and context propagation.
- **Composable units**: every Task is just `(context, ...args) => result`.
- **Deterministic composition**: declarative utilities (`all`, `race`, `any`, `chain`, `repeat`).
- **Minimal overhead**: thin, typed layer – no hidden magic or runtime dependency graph.

If you need clearer async flows without adopting a new paradigm (like full Observables), `@rimbu/task` slots in naturally.

---

## Feature Highlights

- **Task & Context Abstraction** – isolate execution with lifecycle & cancellation.
- **Supervision** – child contexts managed and bulk-cancelled (`cancelAllChildren`).
- **Composable Operations** – `all`, `race`, `any`, `allSettled`, `chain`.
- **Selective Concurrency Control** – `maxBranch` option limits parallel branches.
- **Cancellation & Timeouts** – `withTimeout(ms)` modifier uses supervised `race`.
- **Retries & Backoff** – `withRetry(times, [delays])` preserves cancellation semantics.
- **Argument Binding** – `withArgs(task, ...args)` creates zero‑arg variant.
- **Error Recovery** – `catchError(fn)` and `catchAll()` modifiers.
- **Result Mapping** – `mapOutput` / `mapOutputArr` for transforming flows.
- **AbortSignal Bridging** – `taskify(fn, index, prop?)` wraps existing APIs.
- **Single Flight Patterns** – `runSingleCancelPrevious` / `runSingleCancelNew` utilities.

---

## Quick Start

```ts
import { Task } from '@rimbu/task';
import { withTimeout } from '@rimbu/task/ops';

// Define a simple Task
const greet = Task.create(async (ctx, name: string) => {
  await ctx.delay(50);
  return `Hello, ${name}!`;
});

// Add a timeout modifier (fails if > 100ms)
const greetFast = withTimeout(100)(greet);

// Launch as a supervised background job
const job = Task.launch(greetFast, { args: ['Rimbu'] });

const result = await job.join();
console.log(result); // => 'Hello, Rimbu!'

// Cancel mid-flight
const slowJob = Task.launch(greet, { args: ['World'] });
slowJob.cancel();
await slowJob.join({ recover: () => 'Recovered' }); // => 'Recovered'
```

---

## Core Concepts

| Concept          | Description                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| `Task<R, A>`     | Pure async unit: `(context, ...args: A) => R \| PromiseLike<R>` – function or sequence tuple.       |
| `Task.Result<R>` | Either `R` or a `PromiseLike<R>` returned by a Task.                                                |
| `Task.Context`   | Hierarchical execution scope (cancellation, supervision, child management, delay helpers).          |
| `Task.Job<R>`    | Handle for a launched Task; `join({ timeoutMs?, recover? })`, `cancel()`, `cancelAndJoin()`.        |
| `Task.Seq`       | Tuple form sequence: `[task1, task2, ..., finalTask]` auto-chained; previous output passed forward. |
| `Task.Chain`     | Strongly typed chain spec used by `chain([...])`; enforces per-step typing.                         |
| Modifier         | Higher-order transformer returning a new Task (e.g. `withTimeout`, `withRetry`).                    |

### Sequence vs `chain`

- Using a tuple (`Task.Seq`) directly (e.g. `Task.launch([t1, t2, cleanup], { args })`) gives an inline pipeline; each task receives the previous output as a single argument.
- `chain([...])` builds a reusable composed Task with static type inference for each intermediate result.

### Job `join` Options

`job.join({ timeoutMs, recover })`

- `timeoutMs`: abort waiting if the job takes too long (throws `TimeoutError` unless recovered).
- `recover(error)`: map an error (including cancellation or timeout) to an alternate value; if provided, error is swallowed and mapped value returned.

### Built-in Error Types

- `CancellationError` – context or job cancelled.
- `TimeoutError` – `withTimeout` competitor wins or join timeout triggers.
- `RetryExhaustedError` – retries exceeded in `withRetry`.

Handle via modifiers (`catchError`, `catchAll`) or `recover` in `join`.

### Context Essentials

- `context.cancel()` – cancels current and propagates to children.
- `context.cancelAllChildren()` – granular bulk cancellation.
- `context.delay(ms)` – cancellable delay respecting `AbortSignal`.
- `context.run(task, args)` – run sequentially inside existing context.
- `context.launch(task, { args, maxBranch })` – spawn supervised background job.

---

## Composing Tasks

```ts
import { all, race, any, chain, delay } from '@rimbu/task/ops';

const fetchUser = async (ctx, id: number) => ({ id, name: 'User ' + id });
const fetchPosts = async (ctx, user: { id: number }) => ['post1', 'post2'];

// Sequential (chain): result of one feeds next
const userPosts = chain([fetchUser, fetchPosts]);

// Parallel (all)
const combined = all([
  delay(50), // simple delay task
  userPosts,
]);

// Competitive (race)
const fastest = race([delay(10), delay(20)]);

// First successful (any)
const firstOk = any([
  async () => {
    throw new Error('fail');
  },
  async () => 'ok',
]);
```

---

## Modifiers & Error Handling

```ts
import { withRetry, withTimeout, catchError, combined } from '@rimbu/task/ops';

const unstable = async (ctx) => {
  if (Math.random() < 0.7) throw new Error('Random');
  return 'Success';
};

const resilient = combined(
  withTimeout(500), // guard duration
  withRetry(5, [50, 100, 150]), // backoff pattern
  catchError((err) => () => `Recovered: ${String(err)}`)
)(unstable);

console.log(await Task.launch(resilient, { args: [] }).join());
```

Available modifiers:

- `withTimeout(ms)` – cancel & throw `TimeoutError`.
- `withRetry(times, delays[])` – controlled retry attempts; stops on cancellation.
- `withArgs(task, ...bound)` – pre-bind arguments.
- `mapOutput(fn)` / `mapOutputArr(fn)` – transform results.
- `catchError(fn)` / `catchAll()` – selective error recovery.
- `repeat(times)` – invoke a Task multiple times, index appended.
- `combined(...mods)` – compose multiple modifiers left-to-right.

Note: `withTimeout(ms)` uses a supervised `race` between your task and a delayed timeout branch. If the timeout branch wins, remaining branches are cancelled automatically.

---

## Cancellation & Supervision Patterns

```ts
import { cancelAllChildren, runSingleCancelPrevious } from '@rimbu/task/ops';

// Single-flight pattern: cancel previous if new starts
const runLatest = runSingleCancelPrevious();

const noisy = async (ctx, label: string) => {
  await ctx.delay(80);
  return label;
};

runLatest(noisy, 'A');
runLatest(noisy, 'B'); // cancels 'A'

// Explicit bulk cancellation inside a supervisor
const supervisor = Task.launch([noisy, cancelAllChildren], {
  args: ['Root'],
  isSupervisor: true,
});

await supervisor.join();
```

Patterns:

- **Replace Active** – `runSingleCancelPrevious()`.
- **Reject If Busy** – `runSingleCancelNew()` returns cancellation if one active.
- **Propagated Cancellation** – cancelling parent auto-cancels children.
- **Competitive** – `race` cancels losers automatically.

---

## Integrating Existing APIs (`taskify`)

Wrap `AbortSignal` aware APIs to participate in Task cancellation:

```ts
import { taskify } from '@rimbu/task/ops';
import { readFile } from 'fs/promises';

// Argument index 1 expected to contain `{ signal }`
const readFileTask = taskify(readFile, 1);

const job = Task.launch(readFileTask, {
  args: ['package.json', { encoding: 'utf-8' }],
});
job.cancel();
const text = await job.join({ recover: () => 'Cancelled gracefully' });
```

Works for browser fetch-like APIs, streaming libraries, and Node core modules that accept `AbortSignal`.

---

## Advanced Usage

### Chained Transformations

```ts
import { chain, mapOutput } from '@rimbu/task/ops';

const toUpper = mapOutput((s: string) => s.toUpperCase());
const exclaim = mapOutput((s: string) => s + '!');

const loud = chain([async (_ctx, name: string) => name, toUpper, exclaim]);

console.log(await Task.launch(loud, { args: ['rimbu'] }).join()); // RIMBU!
```

### Graceful Recovery

```ts
import { catchError, withTimeout } from '@rimbu/task/ops';

const mayHang = async (ctx) => ctx.delay(2000);
const safe = catchError(() => () => 'Fallback')(withTimeout(100)(mayHang));
```

### Concurrency Limiting

Use `maxBranch` when launching supervisor tasks to cap parallelism:

```ts
import { all } from '@rimbu/task/ops';
// internally uses `launch(... { maxBranch })`
const limited = all([async () => 'a', async () => 'b', async () => 'c'], {
  maxBranch: 2,
});
```

---

## Type Safety Deep Dive

`Task.Chain<RS, A>` infers each intermediate output feeding next input. This means refactors surface compile errors rather than silent runtime surprises.

Example of typed chaining:

```ts
const pipeline = chain([
  async (_ctx, id: number) => ({ id, name: 'U' + id }), // { id, name }
  async (_ctx, user: { id: number; name: string }) => user.name, // string
  mapOutput((name: string) => name.length), // number
]);

// pipeline: Task<number, [number]>
```

---

## Installation

### Node / Bun / npm / Yarn

```sh
npm install @rimbu/task
# or
yarn add @rimbu/task
# or
bun add @rimbu/task
# or
deno add npm:@rimbu/task
```

### Browser / ESM

Use any modern bundler; package ships ESM & CJS builds.

---

## FAQ

**Q: How is a Task different from a Promise?**  
A Task is a recipe; launching creates a `Job` you can cancel or join. It encapsulates context & composition before execution.

**Q: Do I need Observables / Streams?**  
No. Tasks target discrete async operations; combine with `@rimbu/stream` for streaming scenarios.

**Q: How do I cancel a running Task?**  
Call `job.cancel()` or `context.cancel()`. Loser branches in `race` are auto-cancelled.

**Q: What happens to retries on cancellation?**  
`withRetry` stops immediately if a `CancellationError` occurs.

**Q: Is this safe for production?**  
Yes—minimal surface, type-rich, no global state beyond root context.

---

## Ecosystem & Integration

- Works seamlessly with other Rimbu collections (e.g. produce tasks that populate `HashMap` / `List`).
- Combine with `@rimbu/stream` for processing pipelines.
- Use `taskify` to wrap fetch, filesystem, or custom cancellation-aware APIs.

---

## Roadmap

- Structured timeout groups / deadline contexts.
- Pluggable tracing / instrumentation hooks.
- Built-in exponential backoff helper.
- DevTools integration example / diagnostics.

Have ideas? Open an issue or PR!

---

## Contributing

See the [Contributing Guide](https://github.com/rimbu-org/rimbu/blob/main/CONTRIBUTING.md). Issues, discussions, and PRs welcome.

## License

MIT © Rimbu contributors. See [LICENSE](./LICENSE).

---

## Attributions

Created and maintained by [Arvid Nicolaas](https://github.com/vitoke). Logo © Rimbu.

---

## Quick Reference (API Surface)

```ts
// Core
Task.create(fn)            // wrap a function as Task
Task.launch(task, { args }) // start background job, returns Job
Task.rootContext            // global root context

// Context methods
context.run(task, args?)
context.launch(task, { args, maxBranch })
context.delay(ms)
context.cancel(); context.cancelAllChildren();
context.onCancelled(cleanup)
context.throwIfCancelled()

// Job
job.join({ timeoutMs?, recover? })
job.cancel(); job.cancelAndJoin()

// Operations
all([...tasks])
allSettled([...tasks])
race([...tasks])
any([...tasks])
chain([...tasks])
delay(ms)
cancelContext / cancelAllChildren / cancelParent
effect(fn)
clog(...values) / clogArgs
throwErrorClass(MyErr) / throwError(() => err)

// Modifiers & utils
withTimeout(ms)
withRetry(times, delays?)
withArgs(task, ...args)
mapOutput(fn)
mapOutputArr(fn)
catchError(handler?) / catchAll(task?)
repeat(times)
combined(...modifiers)
taskify(fn, argIndex, propName?)

// Patterns
runSingleCancelPrevious()
runSingleCancelNew()

// Error types
CancellationError / TimeoutError / RetryExhaustedError
```

Explore full API docs: https://rimbu.org/api/rimbu/task
