/**
 * @packageDocumentation
 *
 * The `@rimbu/hashed/map-custom` entry exposes the internal interfaces, builders and
 * contexts behind `HashMap`, allowing you to define custom hash‑map variants that plug
 * in specific hashers, equality comparers or block configurations.<br/>
 * Use it only when you need low‑level control over hashed map internals; for everyday
 * hash‑map usage the main `@rimbu/hashed` and `@rimbu/hashed/map` APIs are recommended.
 */

// pure interfaces
export * from './interface.ts';

// pure classes and files
export * from './implementation/immutable.ts';
export * from './implementation/builder.ts';

// circular dependencies
export * from './implementation/context.ts';
