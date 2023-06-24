import { HashMap } from '../../../../hashed/map/index.ts';
import type { Stream, Streamable } from '../../../../stream/mod.ts';

import { type MultiSetBase, MultiSetContext } from '../../../../multiset/custom/index.ts';
import type { HashMultiSetCreators } from '../../../../multiset/custom/index.ts';

/**
 * A type-invariant immutable MultiSet of value type T.
 * In the MultiSet, each value can occur multiple times.
 * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the [HashMultiSet API documentation](https://rimbu.org/api/rimbu/multiset/HashMultiSet/interface)
 * @typeparam T - the value type
 * @note
 * - The `HashMultiSet` uses the contexts' `HashMap` `mapContext` to hash
 * the values.
 * @example
 * ```ts
 * const m1 = HashMultiSet.empty<string>()
 * const m2 = HashMultiSet.of('a', 'b', 'a', 'c')
 * ```
 */
export interface HashMultiSet<T> extends MultiSetBase<T, HashMultiSet.Types> {}

export namespace HashMultiSet {
  /**
   * A type-invariant immutable MultiSet of value type T.
   * In the MultiSet, each value can occur multiple times.
   * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the [HashMultiSet API documentation](https://rimbu.org/api/rimbu/multiset/HashMultiSet/interface)
   * @typeparam T - the value type
   * @note
   * - The `HashMultiSet` uses the contexts' `HashMap` `mapContext` to hash
   * the values.
   * @example
   * ```ts
   * const m1 = HashMultiSet.empty<string>()
   * const m2 = HashMultiSet.of('a', 'b', 'a', 'c')
   * ```
   */
  export interface NonEmpty<T>
    extends MultiSetBase.NonEmpty<T, HashMultiSet.Types>,
      Omit<HashMultiSet<T>, keyof MultiSetBase.NonEmpty<any, any>>,
      Streamable.NonEmpty<T> {
    stream(): Stream.NonEmpty<T>;
  }

  /**
   * A context instance for an `HashMultiSet` that acts as a factory for every instance of this
   * type of collection.
   * @typeparam UT - the upper value type bound for which the context can be used
   */
  export interface Context<UT>
    extends MultiSetBase.Context<UT, HashMultiSet.Types> {
    readonly typeTag: 'HashMultiSet';
  }

  /**
   * A mutable `HashMultiSet` builder used to efficiently create new immutable instances.
   * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the [HashMultiSet.Builder API documentation](https://rimbu.org/api/rimbu/multiset/HashMultiSet/Builder/interface)
   * @typeparam T - the value type
   */
  export interface Builder<T>
    extends MultiSetBase.Builder<T, HashMultiSet.Types> {}

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends MultiSetBase.Types {
    readonly normal: HashMultiSet<this['_T']>;
    readonly nonEmpty: HashMultiSet.NonEmpty<this['_T']>;
    readonly context: HashMultiSet.Context<this['_T']>;
    readonly builder: HashMultiSet.Builder<this['_T']>;
    readonly countMap: HashMap<this['_T'], number>;
    readonly countMapNonEmpty: HashMap.NonEmpty<this['_T'], number>;
    readonly countMapContext: HashMap.Context<this['_T']>;
  }
}

function createContext<UT>(options?: {
  countMapContext?: HashMap.Context<UT>;
}): HashMultiSet.Context<UT> {
  return Object.freeze(
    new MultiSetContext<UT, 'HashMultiSet', any>(
      'HashMultiSet',
      options?.countMapContext ?? HashMap.defaultContext()
    )
  );
}

const _defaultContext: HashMultiSet.Context<any> = createContext();

export const HashMultiSet: HashMultiSetCreators = Object.freeze({
  ..._defaultContext,
  createContext,
  defaultContext<UT>(): HashMultiSet.Context<UT> {
    return _defaultContext;
  },
});
