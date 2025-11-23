/**
 * @packageDocumentation
 *
 * The `@rimbu/table/custom` entry exposes the lower‑level interfaces, creators and
 * implementations that power `Table` variants, enabling advanced users to build
 * custom table configurations on top of specific map contexts for rows and columns.<br/>
 * For typical 2‑dimensional table usage the main `@rimbu/table` and its `hash-row`
 * / `sorted-row` sub‑packages are recommended; this entry targets specialized setups.
 */

export * from './interface/base.ts';
export * from './interface/creators.ts';
export * from './implementation/base.ts';
