/**
 * Entry point re-exporting the public API of the base package.
 * Provides array utilities (`Arr`), tuple helpers (`Entry`), error types (`RimbuError`),
 * plain-object type predicates, and internal tokens.
 */
export * as Arr from './arr.ts';
export * as Entry from './entry.ts';
export * as RimbuError from './rimbu-error.ts';
export * from './plain-object.ts';

// Internal exports (may change without notice)
export * from './internal.ts';
