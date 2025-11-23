/**
 * Creation "menu" for the Rimbu collections.
 *
 * @remarks
 * This module collects the main Rimbu collection types and exposes them in a
 * grouped form that is re-exported as the default from `@rimbu/core/menu`.
 * The individual collection types and their methods are documented in their
 * respective packages, such as `@rimbu/list`, `@rimbu/stream`, and the
 * various map, set, and table packages.
 */
export { List } from '../../list/mod.ts';
export { AsyncStream, Stream } from '../../stream/mod.ts';

export * as BiMultiMap from './bimultimap.ts';
export * as Graph from './graph/index.ts';
export * as Map from './map/index.ts';
export * as MultiSet from './multiset.ts';
export * as Set from './set/index.ts';
export * as Table from './table/index.ts';
