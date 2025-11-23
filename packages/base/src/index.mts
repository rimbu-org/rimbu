/**
 * @packageDocumentation
 *
 * The `@rimbu/base` package provides foundational immutable array utilities, tuple helpers,
 * plain‑object type predicates and structured error types that power all other Rimbu collections.<br/>
 * Use it directly when you need low‑level, performance‑aware primitives for persistent data
 * structures without pulling in the higher‑level collection packages.<br/>
 * See the Rimbu docs and API reference for more information.
 */
export * as Arr from './arr.mjs';
export * as Entry from './entry.mjs';
export * as RimbuError from './rimbu-error.mjs';
export * from './plain-object.mjs';

// Internal exports (may change without notice)
export * from './internal.mjs';
