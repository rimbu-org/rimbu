/**
 * @packageDocumentation
 *
 * The `@rimbu/table` package provides implementations for tables (2-dimensional maps).<br/>
 * <br/>
 * See the [Rimbu docs Table page](/docs/collections/table) for more information.<br/>
 * <br/>
 * For convenience, this package also exports everything from the following sub-packages:<br/>
 * - [`@rimbu/table/hash-row`](./table/hash-row)<br/>
 * - [`@rimbu/table/sorted-row`](./table/sorted-row)<br/>
 */

export * from './interface/variant.ts';
export * from './interface/generic.ts';

export * from '../../table/hash-row/index.ts';
export * from '../../table/sorted-row/index.ts';
