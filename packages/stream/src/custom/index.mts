/**
 * @packageDocumentation
 *
 * The `@rimbu/stream/custom` entry exposes custom constructors, fast iterator helpers and
 * internal stream implementations that underlie the main `Stream` API in `@rimbu/stream`.<br/>
 * It is intended for advanced scenarios where you need to build specialized stream sources
 * or integrate with the fast‑iterator infrastructure; for most use cases the main
 * `@rimbu/stream` entry is sufficient.
 */

export * from './constructors.mjs';

export * from './fast-iterator-custom.mjs';
export * from './stream-custom.mjs';
