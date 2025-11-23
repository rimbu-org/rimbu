/**
 * @packageDocumentation
 *
 * The `@rimbu/task` package provides a lightweight, type‑safe abstraction for asynchronous
 * tasks, offering structured concurrency, cancellation, retries, timeouts and composition
 * utilities on top of plain `Promise` workflows.<br/>
 * Use it to build composable async flows (sequential, parallel, competitive) with clear
 * supervision semantics and cancellable jobs, and combine it with `@rimbu/task/ops` for
 * higher‑level operators.<br/>
 * See the package README and the [Task API docs](https://rimbu.org/api/rimbu/task) for details.
 */

export {
  CancellationError,
  RetryExhaustedError,
  Task,
  TimeoutError,
} from './internal.ts';
