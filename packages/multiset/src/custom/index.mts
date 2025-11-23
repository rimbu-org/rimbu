/**
 * @packageDocumentation
 *
 * The `@rimbu/multiset/custom` entry exposes internal interfaces, creators, contexts and
 * implementations for MultiSets, so you can construct custom multiset variants on top of
 * different underlying map contexts.<br/>
 * For typical “bag of values” scenarios the main `@rimbu/multiset` API is sufficient;
 * this entry is aimed at advanced integration and tuning use cases.
 */

export * from './interface/base.mjs';
export * from './interface/creators.mjs';
export * from './implementation/base.mjs';
