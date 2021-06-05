import { CustomBase } from '@rimbu/collection-types';
import { Eq, OmitStrong } from '@rimbu/common';
import { List } from '@rimbu/list';
import { Streamable } from '@rimbu/stream';
import { HashSetContext } from '../hashset-custom';
import { Hasher } from '../internal';

/**
 * A type-invariant immutable Set of value type T.
 * In the Set, there are no duplicate values.
 * @typeparam T - the value type
 * * The `HashSet` uses the context's `hasher` instance to hash keys for performance.
 * * The `HashSet` uses the context's `eq` function to determine equivalence between keys.
 * @example
 * const s1 = HashSet.empty<string>()
 * const s2 = HashSet.of('a', 'b', 'c')
 */
export interface HashSet<T> extends CustomBase.RSetBase<T, HashSet.Types> {}

export namespace HashSet {
  /**
   * A non-empty type-invariant immutable Set of value type T.
   * In the Set, there are no duplicate values.
   * @typeparam T - the value type
   * * The `HashSet` uses the context's `hasher` instance to hash keys for performance.
   * * The `HashSet` uses the context's `eq` function to determine equivalence between keys.
   * @example
   * const s1 = HashSet.empty<string>()
   * const s2 = HashSet.of('a', 'b', 'c')
   */
  export interface NonEmpty<T>
    extends CustomBase.RSetBase.NonEmpty<T, HashSet.Types>,
      Streamable.NonEmpty<T> {}

  /**
   * A context instance for a `HashSet` that acts as a factory for every instance of this
   * type of collection.
   * @typeparam UT - the upper value bound for which the context can be used
   */
  export interface Context<UT>
    extends CustomBase.RSetBase.Context<UT, HashSet.Types> {
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
   * @typeparam T - the value type
   */
  export interface Builder<T>
    extends CustomBase.RSetBase.Builder<T, HashSet.Types> {}

  export interface Types extends CustomBase.RSetBase.Types {
    normal: HashSet<this['_T']>;
    nonEmpty: HashSet.NonEmpty<this['_T']>;
    context: HashSet.Context<this['_T']>;
    builder: HashSet.Builder<this['_T']>;
  }
}

function createContext<UT>(options?: {
  hasher?: Hasher<UT>;
  eq?: Eq<UT>;
  blockSizeBits?: number;
  listContext?: List.Context;
}): HashSet.Context<UT> {
  return new HashSetContext(
    options?.hasher ?? Hasher.defaultHasher(),
    options?.eq ?? Eq.defaultEq(),
    options?.blockSizeBits ?? 5,
    options?.listContext ?? List.defaultContext()
  );
}

const _defaultContext: HashSet.Context<any> = createContext();

const _contextHelpers = {
  /**
   * Returns a new HashSet context instance based on the given `options`.
   * @typeparam UT - the upper element type for which the context can create instances
   * @param options - (optional) an object containing the following properties:
   * * hasher - (optional) a `Hasher` instance used to hash the map keys
   * * eq - (optional) an `Eq` instance used to determine key equality
   * * blockSizeBits - (optional) determines the maximum block size as 2 to the power of `blockSizeBits`
   * * listContext - (optional) the context to use to create list instances (for collisions)
   */
  createContext,
  /**
   * Returns the default context for HashSets.
   * @typeparam UT - the upper element type for which the context can create instances
   */
  defaultContext<UT>(): HashSet.Context<UT> {
    return _defaultContext;
  },
};

type Export = OmitStrong<
  HashSet.Context<any>,
  '_types' | 'typeTag' | 'isValidValue'
> &
  typeof _contextHelpers;

export const HashSet: Export = {
  ..._defaultContext,
  ..._contextHelpers,
};
