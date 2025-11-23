/**
 * @packageDocumentation
 *
 * The `@rimbu/task/ops` entry exposes the composable operations and modifiers that work
 * with core `Task` values from `@rimbu/task`, such as `all`, `race`, `withTimeout`,
 * `withRetry`, `chain`, and helpers for supervision and error handling.<br/>
 * Import from this entry when you want to build higher‑level task pipelines or apply
 * reusable behaviours like timeouts, retries, argument binding and result mapping.
 */

export * from './internal.ts';
