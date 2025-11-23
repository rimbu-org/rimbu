/**
 * @packageDocumentation
 *
 * The `@rimbu/sorted/map-custom` entry exposes creators, builders, contexts and internal
 * implementations for `SortedMap`, enabling advanced configuration of comparators and
 * tree parameters beyond what the default factories provide.<br/>
 * Use it when you need fine‑grained control over sorted map internals; for typical ordered
 * map usage the main `@rimbu/sorted` and `@rimbu/sorted/map` APIs are sufficient.
 */

export * from './creators.mjs';
export * from './implementation/builder.mjs';
export * from './implementation/immutable.mjs';
export * from './implementation/context.mjs';
