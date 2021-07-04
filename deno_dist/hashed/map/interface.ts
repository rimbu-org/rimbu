import type { CustomBase, RMap } from '../../collection-types/mod.ts';
import { Eq, OmitStrong } from '../../common/mod.ts';
import { List } from '../../list/mod.ts';
import type { Stream, Streamable } from '../../stream/mod.ts';
import { Hasher } from '../hasher.ts';
import { HashMapContext } from '../hashmap-custom.ts';

/**
 * A type-invariant immutable Map of key type K, and value type V.
 * In the Map, each key has exactly one value, and the Map cannot contain
 * duplicate keys.
 * * The `HashMap` uses the context's `hasher` instance to hash keys for performance.
 * * The `HashMap` uses the context's `eq` function to determine equivalence between keys.
 * @typeparam K - the key type
 * @typeparam V - the value type
 * @example
 * const m1 = HashMap.empty<number, string>()
 * const m2 = HashMap.of([1, 'a'], [2, 'b'])
 */
export interface HashMap<K, V>
  extends CustomBase.RMapBase<K, V, HashMap.Types> {}

export namespace HashMap {
  type NonEmptyBase<K, V> = CustomBase.RMapBase.NonEmpty<K, V, HashMap.Types> &
    HashMap<K, V>;

  /**
   * A non-empty type-invariant immutable Map of key type K, and value type V.
   * In the Map, each key has exactly one value, and the Map cannot contain
   * duplicate keys.
   * * The `HashMap` uses the context's `hasher` instance to hash keys for performance.
   * * The `HashMap` uses the context's `eq` function to determine equivalence between keys.
   * @typeparam K - the key type
   * @typeparam V - the value type
   * const m1 = HashMap.empty<number, string>()
   * const m2 = HashMap.of([1, 'a'], [2, 'b'])
   */
  export interface NonEmpty<K, V>
    extends NonEmptyBase<K, V>,
      Streamable.NonEmpty<readonly [K, V]> {
    stream(): Stream.NonEmpty<readonly [K, V]>;
  }

  /**
   * A context instance for a `HashMap` that acts as a factory for every instance of this
   * type of collection.
   * @typeparam UK - the upper key type bound for which the context can be used
   */
  export interface Context<UK>
    extends CustomBase.RMapBase.Context<UK, HashMap.Types> {
    readonly typeTag: 'HashMap';

    /**
     * A `Hasher` instance used to hash the map keys.
     */
    readonly hasher: Hasher<UK>;
    /**
     * An `Eq` instance used to check key equivalence.
     */
    readonly eq: Eq<UK>;
  }

  /**
   * A mutable `HashMap` builder used to efficiently create new immutable instances.
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface Builder<K, V>
    extends CustomBase.RMapBase.Builder<K, V, HashMap.Types> {}

  export interface Types extends RMap.Types {
    normal: HashMap<this['_K'], this['_V']>;
    nonEmpty: HashMap.NonEmpty<this['_K'], this['_V']>;
    context: HashMap.Context<this['_K']>;
    builder: HashMap.Builder<this['_K'], this['_V']>;
  }
}

function createContext<UK>(options?: {
  hasher?: Hasher<UK>;
  eq?: Eq<UK>;
  blockSizeBits?: number;
  listContext?: List.Context;
}): HashMap.Context<UK> {
  return new HashMapContext(
    options?.hasher ?? Hasher.defaultHasher(),
    options?.eq ?? Eq.defaultEq(),
    options?.blockSizeBits ?? 5,
    options?.listContext ?? List.defaultContext()
  );
}

const _defaultContext: HashMap.Context<any> = createContext();

const _contextHelpers = {
  /**
   * Returns a new HashMap context instance based on the given `options`.
   * @typeparam UK - the upper key type for which the context can create instances
   * @param options - (optional) an object containing the following properties:
   * * hasher - (optional) a `Hasher` instance used to hash the map keys
   * * eq - (optional) an `Eq` instance used to determine key equality
   * * blockSizeBits - (optional) determines the maximum block size as 2 to the power of `blockSizeBits`
   * * listContext - (optional) the context to use to create list instances (for collisions)
   */
  createContext,
  /**
   * Returns the default context for HashMaps.
   * @typeparam UK - the upper key type for which the context can create instances
   */
  defaultContext<UK>(): HashMap.Context<UK> {
    return _defaultContext;
  },
};

type Export = OmitStrong<
  HashMap.Context<any>,
  '_types' | 'typeTag' | 'hasher' | 'eq' | 'isValidKey'
> &
  typeof _contextHelpers;

export const HashMap: Export = {
  ..._defaultContext,
  ..._contextHelpers,
};
