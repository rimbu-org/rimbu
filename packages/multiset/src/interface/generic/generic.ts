import type { RMap } from '@rimbu/collection-types';
import type { Streamable } from '@rimbu/stream';
import { MultiSetBase, MultiSetContext } from '../../multiset-custom';

/**
 * A type-invariant immutable MultiSet of value type T.
 * In the MultiSet, each value can occur multiple times.
 * @typeparam T - the value type
 */
export interface MultiSet<T> extends MultiSetBase<T, MultiSet.Types> {}

export namespace MultiSet {
  /**
   * A non-empty type-invariant immutable MultiSet of value type T.
   * In the MultiSet, each value can occur multiple times.
   * @typeparam T - the value type
   */
  export interface NonEmpty<T>
    extends MultiSetBase.NonEmpty<T, MultiSet.Types>,
      Streamable.NonEmpty<T> {}

  /**
   * A context instance for `MultiSet` implementations that acts as a factory for every instance of this
   * type of collection.
   * @typeparam UT - the upper value type bound for which the context can be used
   */
  export interface Context<UT>
    extends MultiSetBase.Context<UT, MultiSet.Types> {}

  /**
   * A mutable `MultiSet` builder used to efficiently create new immutable instances.
   * @typeparam T - the value type
   */
  export interface Builder<T> extends MultiSetBase.Builder<T, MultiSet.Types> {}

  export interface Types extends MultiSetBase.Types {
    readonly normal: MultiSet<this['_T']>;
    readonly nonEmpty: MultiSet.NonEmpty<this['_T']>;
    readonly countMap: RMap<this['_T'], number>;
    readonly countMapNonEmpty: RMap.NonEmpty<this['_T'], number>;
    readonly context: MultiSet.Context<this['_T']>;
    readonly builder: MultiSet.Builder<this['_T']>;
  }
}

export const MultiSet = {
  /**
   * Returns a new MultiSet context instance based on the given `options`.
   * @typeparam UT - the upper element type for which the context can create instances
   * @param options - an object containing the following properties:
   * * countMapContext - the map context to use for key to count mapping
   */
  createContext<UT>(options: {
    countMapContext: RMap.Context<UT>;
  }): MultiSet.Context<UT> {
    return new MultiSetContext<UT, 'MultiSet'>(
      'MultiSet',
      options.countMapContext
    );
  },
};
