/**
 * @packageDocumentation
 *
 * The `@rimbu/hashed/set-custom` entry exposes the internal interfaces, builders and
 * contexts behind `HashSet`, so you can construct custom hashed set variants that rely
 * on tailored hashers, equality logic or internal configuration.<br/>
 * For normal hashed set usage prefer the main `@rimbu/hashed` and `@rimbu/hashed/set`
 * APIs; this entry targets advanced customization scenarios.
 */

// pure interfaces
export * from './interface.mjs';

// pure classes and files
export * from './implementation/immutable.mjs';
export * from './implementation/builder.mjs';

// circular dependencies
export * from './implementation/context.mjs';
