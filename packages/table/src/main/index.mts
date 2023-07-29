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

export * from './interface/variant.mjs';
export * from './interface/generic.mjs';

export * from '@rimbu/table/hash-row';
export * from '@rimbu/table/sorted-row';
