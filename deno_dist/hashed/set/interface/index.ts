import type { RSetBase } from '../../../collection-types/set-custom/index.ts';
import type { Eq } from '../../../common/mod.ts';
import type { Streamable } from '../../../stream/mod.ts';

import type { HashSetCreators } from '../../../hashed/set-custom/index.ts';

import type { Hasher } from '../../common/index.ts';
import { createHashSetContext } from '../../../hashed/set-custom/index.ts';

/**
 * A type-invariant immutable Set of value type T.
 * In the Set, there are no duplicate values.
 * See the [Set documentation](https://rimbu.org/docs/collections/set) and the [HashSet API documentation](https://rimbu.org/api/rimbu/hashed/HashSet/interface)
 * @typeparam T - the value type
 * @note
 * - The `HashSet` uses the context's `hasher` instance to hash keys for performance.<b/r>
 * - The `HashSet` uses the context's `eq` function to determine equivalence between keys.
 * @example
 * ```ts
 * const s1 = HashSet.empty<string>()
 * const s2 = HashSet.of('a', 'b', 'c')
 * ```
 */
export interface HashSet<T> extends RSetBase<T, HashSet.Types> {}

export namespace HashSet {
  /**
   * A non-empty type-invariant immutable Set of value type T.
   * In the Set, there are no duplicate values.
   * See the [Set documentation](https://rimbu.org/docs/collections/set) and the [HashSet API documentation](https://rimbu.org/api/rimbu/hashed/HashSet/interface)
   * @typeparam T - the value type
   * @note
   * - The `HashSet` uses the context's `hasher` instance to hash keys for performance.
   * - The `HashSet` uses the context's `eq` function to determine equivalence between keys.
   * @example
   * ```ts
   * const s1 = HashSet.empty<string>()
   * const s2 = HashSet.of('a', 'b', 'c')
   * ```
   */
  export interface NonEmpty<T>
    extends RSetBase.NonEmpty<T, HashSet.Types>,
      Omit<HashSet<T>, keyof RSetBase.NonEmpty<any, any>>,
      Streamable.NonEmpty<T> {}

  /**
   * A context instance for a `HashSet` that acts as a factory for every instance of this
   * type of collection.
   * @typeparam UT - the upper value bound for which the context can be used
   */
  export interface Context<UT> extends RSetBase.Context<UT, HashSet.Types> {
    readonly typeTag: 'HashSet';

    /**
     * A `Hasher` instance used to hash the values.
     */
    readonly hasher: Hasher<UT>;
    /**
     * An `Eq` instance used to check value equivalence.
     */
    readonly eq: Eq<UT>;
  }

  /**
   * A mutable `HashSet` builder used to efficiently create new immutable instances.
   * See the [Set documentation](https://rimbu.org/docs/collections/set) and the [HashSet.Builder API documentation](https://rimbu.org/api/rimbu/hashed/HashSet/Builder/interface)
   * @typeparam T - the value type
   */
  export interface Builder<T> extends RSetBase.Builder<T, HashSet.Types> {}

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends RSetBase.Types {
    readonly normal: HashSet<this['_T']>;
    readonly nonEmpty: HashSet.NonEmpty<this['_T']>;
    readonly context: HashSet.Context<this['_T']>;
    readonly builder: HashSet.Builder<this['_T']>;
  }
}

const _defaultContext: HashSet.Context<any> = createHashSetContext();

export const HashSet: HashSetCreators = {
  ..._defaultContext,
  createContext: createHashSetContext,
  defaultContext<UT>(): HashSet.Context<UT> {
    return _defaultContext;
  },
};
