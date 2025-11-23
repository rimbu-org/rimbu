/**
 * @packageDocumentation
 *
 * The `@rimbu/graph/custom` entry exposes low‑level graph interfaces, contexts and
 * implementations that underlie the main `@rimbu/graph` API, including generic,
 * arrow and edge graph variants and their valued counterparts.<br/>
 * It is intended for advanced use cases where you need fine‑grained control over
 * graph internals or want to build custom graph abstractions on top of Rimbu’s
 * core graph building blocks.
 */

// pure interfaces
export * from './non-valued/interface/arrow-graph-base.ts';
export * from './non-valued/interface/edge-graph-base.ts';
export * from './non-valued/interface/arrow-graph-creators.ts';
export * from './non-valued/interface/edge-graph-creators.ts';
export * from './valued/interface/generic/variant-valued-graph-base.ts';
export * from './valued/interface/generic/valued-graph-base.ts';
export * from './valued/interface/arrow/arrow-valued-graph-base.ts';
export * from './valued/interface/edge/edge-valued-graph-base.ts';
export * from './valued/interface/arrow/arrow-valued-graph-creators.ts';
export * from './valued/interface/edge/edge-valued-graph-creators.ts';

// pure classes and files
export * from './non-valued/implementation/non-empty.ts';
export * from './valued/implementation/non-empty.ts';

export * from './common/index.ts';

// circular dependencies
export * from './non-valued/implementation/empty.ts';
export * from './non-valued/implementation/builder.ts';

export * from './valued/implementation/empty.ts';
export * from './valued/implementation/builder.ts';

export * from './non-valued/implementation/context.ts';
export * from './valued/implementation/context.ts';
