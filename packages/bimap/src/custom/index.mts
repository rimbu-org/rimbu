/**
 * @packageDocumentation
 *
 * The `@rimbu/bimap/custom` entry exposes the underlying context, builder and implementation
 * types used to construct custom `BiMap` variants, for example with specialized underlying
 * map contexts or configuration.<br/>
 * Use this entry only in advanced scenarios where you need to wire BiMaps to custom map
 * implementations; for regular usage prefer the main `@rimbu/bimap` API.<br/>
 * See the `@rimbu/bimap` README for an overview of BiMap concepts.
 */

export * from './implementation/builder.mjs';
export * from './implementation/immutable.mjs';
export * from './implementation/context.mjs';
export * from './interface.mjs';
