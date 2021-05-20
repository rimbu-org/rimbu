import { Streamable } from '@rimbu/stream';
import { RSetBase } from '../custom-base';

/**
 * A type-invariant immutable Set of value type T.
 * In the Set, there are no duplicate values.
 * @typeparam T - the value type
 */
export interface RSet<T> extends RSetBase<T, RSet.Types> {}

export namespace RSet {
  /**
   * A non-empty type-invariant immutable Set of value type T.
   * In the Set, there are no duplicate values.
   * @typeparam T - the value type
   */
  export interface NonEmpty<T>
    extends RSetBase.NonEmpty<T, RSet.Types>,
      Streamable.NonEmpty<T> {}

  /**
   * A context instance for Map implementations that acts as a factory for every instance of this
   * type of collection.
   * @typeparam UT - the upper value type bound for which the context can be used
   */
  export interface Context<UT> extends RSetBase.Context<UT, RSet.Types> {}

  /**
   * A mutable Set builder used to efficiently create new immutable instances.
   * @typeparam T - the value type
   */
  export interface Builder<T> extends RSetBase.Builder<T, RSet.Types> {}

  export interface Types extends RSetBase.Types {
    normal: RSet<this['_T']>;
    nonEmpty: RSet.NonEmpty<this['_T']>;
    context: RSet.Context<this['_T']>;
    builder: RSet.Builder<this['_T']>;
  }
}
