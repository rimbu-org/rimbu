/**
 * @packageDocumentation
 *
 * The `@rimbu/sorted/map-custom` entry exposes creators, builders, contexts and internal
 * implementations for `SortedMap`, enabling advanced configuration of comparators and
 * tree parameters beyond what the default factories provide.<br/>
 * Use it when you need fine‑grained control over sorted map internals; for typical ordered
 * map usage the main `@rimbu/sorted` and `@rimbu/sorted/map` APIs are sufficient.
 */

export * from './creators.ts';
export * from './implementation/builder.ts';
export * from './implementation/immutable.ts';
export * from './implementation/context.ts';
