import type { RSetBase } from '../../../collection-types/set-custom/index.ts';
import type { Streamable } from '../../../stream/mod.ts';

/**
 * A type-invariant immutable Set of value type T.
 * In the Set, there are no duplicate values.
 * See the [Set documentation](https://rimbu.org/docs/collections/set) and the [RSet API documentation](https://rimbu.org/api/rimbu/collection-types/set/RSet/interface)
 * @typeparam T - the value type
 */
export interface RSet<T> extends RSetBase<T, RSet.Types> {}

export namespace RSet {
  /**
   * A non-empty type-invariant immutable Set of value type T.
   * In the Set, there are no duplicate values.
   * See the [Set documentation](https://rimbu.org/docs/collections/set) and the [RSet API documentation](https://rimbu.org/api/rimbu/collection-types/set/RSet/interface)
   * @typeparam T - the value type
   */
  export interface NonEmpty<T>
    extends RSetBase.NonEmpty<T, RSet.Types>,
      Omit<RSet<T>, keyof RSetBase<any, any>>,
      Streamable.NonEmpty<T> {}

  /**
   * A context instance for Map implementations that acts as a factory for every instance of this
   * type of collection.
   * @typeparam UT - the upper value type bound for which the context can be used
   */
  export interface Context<UT> extends RSetBase.Context<UT, RSet.Types> {}

  /**
   * A mutable Set builder used to efficiently create new immutable instances.
   * See the [Set documentation](https://rimbu.org/docs/collections/set) and the [RSet.Builder API documentation](https://rimbu.org/api/rimbu/collection-types/set/RSet/Builder/interface)
   * @typeparam T - the value type
   */
  export interface Builder<T> extends RSetBase.Builder<T, RSet.Types> {}

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends RSetBase.Types {
    readonly normal: RSet<this['_T']>;
    readonly nonEmpty: RSet.NonEmpty<this['_T']>;
    readonly context: RSet.Context<this['_T']>;
    readonly builder: RSet.Builder<this['_T']>;
  }
}
