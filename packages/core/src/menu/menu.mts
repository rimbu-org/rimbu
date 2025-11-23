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
export { List } from '@rimbu/list';
export { AsyncStream, Stream } from '@rimbu/stream';

export * as BiMultiMap from './bimultimap.mjs';
export * as Graph from './graph/index.mjs';
export * as Map from './map/index.mjs';
export * as MultiSet from './multiset.mjs';
export * as Set from './set/index.mjs';
export * as Table from './table/index.mjs';
