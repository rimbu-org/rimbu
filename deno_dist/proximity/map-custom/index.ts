/**
 * @packageDocumentation
 *
 * The `@rimbu/proximity/map-custom` entry exposes internal builders, contexts and
 * implementations for `ProximityMap`, allowing advanced users to tailor proximity
 * behaviour and backing maps beyond the defaults exported from `@rimbu/proximity`.<br/>
 * Prefer the high‑level `@rimbu/proximity` and `@rimbu/proximity/map` APIs for normal
 * nearest‑neighbour map use; this entry is aimed at custom integration scenarios.
 */

export * from './implementation/index.ts';

export * from './builder.ts';
export * from './context.ts';
