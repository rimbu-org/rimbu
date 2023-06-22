/**
 * @packageDocumentation
 *
 * The `@rimbu/deep` package provides utilities to patch and match plain JavaScript objects.<br/>
 * <br/>
 * See the [Rimbu docs Deep overview page](/docs/deep/overview) for more information.
 */

export { Tuple } from './tuple.mjs';

export type { Protected, Patch } from './internal.mjs';
export { Path, type Selector, type Match } from './internal.mjs';

export * from './deep.mjs';

import * as Deep from './deep.mjs';
export {
  /**
   * Convenience namespace offering access to most common functions used in the `@rimbu/deep` package.
   * These are mainly utilities to patch and match plain JavaScript objects.
   */
  Deep,
};
