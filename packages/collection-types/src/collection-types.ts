/**
 * @packageDocumentation
 *
 * The `@rimbu/collection-types` package is a convenience package that exports the
 * generic higher-kinded collection types (`RMap`, `RSet`, `VariantMap`, `VariantSet`).<br/>
 * <br/>
 * The implementer-facing base interfaces and context modules live under the
 * `advanced` subpath:<br/>
 * - [`@rimbu/collection-types/advanced/map`](./advanced/map)<br/>
 * - [`@rimbu/collection-types/advanced/set`](./advanced/set)<br/>
 * - [`@rimbu/collection-types/advanced/common`](./advanced/common)<br/>
 * <br/>
 * See the [Rimbu docs Map page](https://rimbu.org/docs/collections/map) and
 * the [Rimbu docs Set page](https://rimbu.org/docs/collections/set) for more information.
 */

export type * from '#collection-types/map/types/generic';
export type * from '#collection-types/map/types/variant';
export type * from '#collection-types/set/types/generic';
export type * from '#collection-types/set/types/variant';
