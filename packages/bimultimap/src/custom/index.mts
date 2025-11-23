/**
 * @packageDocumentation
 *
 * The `@rimbu/bimultimap/custom` entry exposes the low‑level interfaces, contexts, builders
 * and implementations behind `BiMultiMap`, enabling advanced users to construct custom
 * hash‑ or sorted‑based BiMultiMap variants.<br/>
 * Use this entry when you need to integrate BiMultiMaps with bespoke map or multimap
 * contexts; for typical many‑to‑many use cases the main `@rimbu/bimultimap` API is preferred.
 */

export * from './interface/base.mjs';
export * from './interface/generic.mjs';
export * from './interface/hashed.mjs';
export * from './interface/sorted.mjs';
export * from './implementation/immutable.mjs';
export * from './implementation/builder.mjs';
export * from './implementation/context.mjs';
