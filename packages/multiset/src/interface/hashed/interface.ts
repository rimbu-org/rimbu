import { OmitStrong } from '@rimbu/common';
import { HashMap } from '@rimbu/hashed';
import { Stream, Streamable } from '@rimbu/stream';
import { MultiSetBase, MultiSetContext } from '../../multiset-custom';

/**
 * A type-invariant immutable MultiSet of value type T.
 * In the MultiSet, each value can occur multiple times.
 * @typeparam T - the value type
 * * The `HashMultiSet` uses the contexts' `HashMap` `mapContext` to hash
 * the values.
 * @example
 * const m1 = HashMultiSet.empty<string>()
 * const m2 = HashMultiSet.of('a', 'b', 'a', 'c')
 */
export interface HashMultiSet<T> extends MultiSetBase<T, HashMultiSet.Types> {}

export namespace HashMultiSet {
  type NonEmptyBase<T> = MultiSetBase.NonEmpty<T, HashMultiSet.Types> &
    HashMultiSet<T>;

  /**
   * A type-invariant immutable MultiSet of value type T.
   * In the MultiSet, each value can occur multiple times.
   * @typeparam T - the value type
   * * The `HashMultiSet` uses the contexts' `HashMap` `mapContext` to hash
   * the values.
   */
  export interface NonEmpty<T> extends NonEmptyBase<T>, Streamable.NonEmpty<T> {
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
   * @typeparam T - the value type
   */
  export interface Builder<T>
    extends MultiSetBase.Builder<T, HashMultiSet.Types> {}

  export interface Types extends MultiSetBase.Types {
    normal: HashMultiSet<this['_T']>;
    nonEmpty: HashMultiSet.NonEmpty<this['_T']>;
    context: HashMultiSet.Context<this['_T']>;
    builder: HashMultiSet.Builder<this['_T']>;
    countMap: HashMap<this['_T'], number>;
    countMapNonEmpty: HashMap.NonEmpty<this['_T'], number>;
    countMapContext: HashMap.Context<this['_T']>;
  }
}

interface TypesImpl extends HashMultiSet.Types {
  context: MultiSetContext<this['_T'], 'HashMultiSet', any>;
}

function createContext<UT>(options?: {
  countMapContext?: HashMap.Context<UT>;
}): HashMultiSet.Context<UT> {
  return new MultiSetContext<UT, 'HashMultiSet', TypesImpl>(
    'HashMultiSet',
    options?.countMapContext ?? HashMap.defaultContext()
  );
}

const _defaultContext: HashMultiSet.Context<any> = createContext();

const _contextHelpers = {
  /**
   * Returns a new HashMultiSet context instance based on the given `options`.
   * @typeparam UT - the upper element type for which the context can create instances
   * @param options - (optional) an object containing the following properties:
   * * countMapContext - (optional) the map context to use for key to count mapping
   */
  createContext,
  /**
   * Returns the default context for HashMultiSet.
   * @typeparam UT - the upper element type for which the context can create instances
   */
  defaultContext<UT>(): HashMultiSet.Context<UT> {
    return _defaultContext;
  },
};

type Export = OmitStrong<
  HashMultiSet.Context<any>,
  '_types' | 'typeTag' | 'isValidElem' | 'countMapContext'
> &
  typeof _contextHelpers;

export const HashMultiSet: Export = {
  ..._defaultContext,
  ..._contextHelpers,
};
