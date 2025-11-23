/**
 * Entry point re-exporting the public API of the base package.
 * Provides array utilities (`Arr`), tuple helpers (`Entry`), error types (`RimbuError`),
 * plain-object type predicates, and internal tokens.
 */
export * as Arr from './arr.mjs';
export * as Entry from './entry.mjs';
export * as RimbuError from './rimbu-error.mjs';
export * from './plain-object.mjs';

// Internal exports (may change without notice)
export * from './internal.mjs';
