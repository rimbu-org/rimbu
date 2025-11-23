/**
 * @packageDocumentation
 *
 * The `@rimbu/sorted/set-custom` entry exposes creators, builders, contexts and internal
 * implementations for `SortedSet`, allowing you to configure custom comparators and
 * tree characteristics for ordered sets.<br/>
 * Reach for this entry only when you need to tune sorted set internals; for everyday
 * use the main `@rimbu/sorted` and `@rimbu/sorted/set` APIs are recommended.
 */

export * from './creators.mjs';
export * from './implementation/builder.mjs';
export * from './implementation/immutable.mjs';
export * from './implementation/context.mjs';
