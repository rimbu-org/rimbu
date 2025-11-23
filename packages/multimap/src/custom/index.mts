/**
 * @packageDocumentation
 *
 * The `@rimbu/multimap/custom` entry exposes internal interfaces, creators, contexts and
 * implementations for MultiMaps, allowing advanced users to wire multimap behaviour to
 * custom underlying map and set contexts.<br/>
 * Prefer the high‑level `@rimbu/multimap` API for normal one‑to‑many use cases; reach for
 * this entry only when you need to build specialized MultiMap variants.
 */

export * from './interface/base.mjs';
export * from './interface/creators.mjs';
export * from './implementation/base.mjs';
