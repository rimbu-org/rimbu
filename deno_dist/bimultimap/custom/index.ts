/**
 * @packageDocumentation
 *
 * The `@rimbu/bimultimap/custom` entry exposes the low‑level interfaces, contexts, builders
 * and implementations behind `BiMultiMap`, enabling advanced users to construct custom
 * hash‑ or sorted‑based BiMultiMap variants.<br/>
 * Use this entry when you need to integrate BiMultiMaps with bespoke map or multimap
 * contexts; for typical many‑to‑many use cases the main `@rimbu/bimultimap` API is preferred.
 */

export * from './interface/base.ts';
export * from './interface/generic.ts';
export * from './interface/hashed.ts';
export * from './interface/sorted.ts';
export * from './implementation/immutable.ts';
export * from './implementation/builder.ts';
export * from './implementation/context.ts';
