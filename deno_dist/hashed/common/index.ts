/**
 * @packageDocumentation
 *
 * The `@rimbu/hashed/common` entry provides shared hasher utilities and supporting types
 * used by the hash‑based maps and sets in `@rimbu/hashed` and other Rimbu packages.<br/>
 * Import from this module when you need to configure or implement custom `Hasher`
 * instances (for numbers, strings, objects, streams, etc.) to plug into hash‑based
 * collections.
 */

export * from './hasher.ts';
export * from './hashed-custom.ts';
