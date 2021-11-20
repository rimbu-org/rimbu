import type { OmitStrong } from '../../../common/mod.ts';
import type { HashSet } from '../../../hashed/mod.ts';
import { HashMultiMapHashValue } from '../../../multimap/mod.ts';
import type { Streamable } from '../../../stream/mod.ts';
import { BiMultiMapBase, BiMultiMapContext } from '../../bimultimap-custom.ts';

/**
 * A type-invariant immutable bi-directional MultiMap where keys and values have a
 * many-to-many mapping. Its keys and values are hashed.
 * @typeparam K - the key type
 * @typeparam V - the value type
 * @example
 * const h1 = HashBiMultiMap.empty<number, string>()
 * const h1 = HashBiMultiMap.of([1, 'a'], [1, 'b'])
 */
export interface HashBiMultiMap<K, V>
  extends BiMultiMapBase<K, V, HashBiMultiMap.Types> {}

export namespace HashBiMultiMap {
  /**
   * A non-empty type-invariant immutable bi-directional MultiMap where keys and values have a
   * many-to-many mapping. Its keys and values are hashed.
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface NonEmpty<K, V>
    extends BiMultiMapBase.NonEmpty<K, V, HashBiMultiMap.Types>,
      Streamable.NonEmpty<[K, V]> {}

  /**
   * The HashBiMultiMap's Context instance that serves as a factory for all related immutable instances and builders.
   * @typeparam UK - the upper type limit for key types for which this context can create instances
   * @typeparam UV - the upper type limit for value types for which this context can create instances
   */
  export interface Context<UK, UV>
    extends BiMultiMapBase.Context<UK, UV, HashBiMultiMap.Types> {
    readonly typeTag: 'HashBiMultiMap';
  }

  /**
   * A mutable `HashBiMultiMap` builder used to efficiently create new immutable instances.
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface Builder<K, V>
    extends BiMultiMapBase.Builder<K, V, HashBiMultiMap.Types> {}

  export interface Types extends BiMultiMapBase.Types {
    readonly context: HashBiMultiMap.Context<this['_K'], this['_V']>;
    readonly normal: HashBiMultiMap<this['_K'], this['_V']>;
    readonly nonEmpty: HashBiMultiMap.NonEmpty<this['_K'], this['_V']>;
    readonly builder: HashBiMultiMap.Builder<this['_K'], this['_V']>;
    readonly keyValueMultiMap: HashMultiMapHashValue<this['_K'], this['_V']>;
    readonly valueKeyMultiMap: HashMultiMapHashValue<this['_V'], this['_K']>;
    readonly keyMultiMapValues: HashSet<this['_V']>;
    readonly valueMultiMapValues: HashSet<this['_K']>;
  }
}

function createContext<UK, UV>(options?: {
  keyValueMultiMapContext?: HashMultiMapHashValue.Context<UK, UV>;
  valueKeyMultiMapContext?: HashMultiMapHashValue.Context<UV, UK>;
}): HashBiMultiMap.Context<UK, UV> {
  return new BiMultiMapContext<UK, UV, 'HashBiMultiMap', any>(
    'HashBiMultiMap',
    options?.keyValueMultiMapContext ?? HashMultiMapHashValue.defaultContext(),
    options?.valueKeyMultiMapContext ?? HashMultiMapHashValue.defaultContext()
  );
}

const _defaultContext: HashBiMultiMap.Context<any, any> = createContext();

const _contextHelpers = {
  /**
   * Returns a new HashBiMultiMap context instance based on the given `options`.
   * @typeparam UK - the upper key type for which the context can create instances
   * @typeparam UV - the upper value type for which the context can create instances
   * @param options - (optional) an object containing the following properties:
   * * keyValueMultiMapContext - (optional) the map context to use for key value multimaps
   * * valueKeyMultiMapContext - (optional) the set context to use for value key multimaps
   */
  createContext,
  /**
   * Returns the default context for HashBiMultiMaps.
   * @typeparam UK - the upper key type for which the context can create instances
   * @typeparam UV - the upper value type for which the context can create instances
   */
  defaultContext<UK, UV>(): HashBiMultiMap.Context<UK, UV> {
    return _defaultContext;
  },
};

type Export = OmitStrong<
  HashBiMultiMap.Context<any, any>,
  '_types' | 'typeTag' | 'keyValueMultiMapContext' | 'valueKeyMultiMapContext'
> &
  typeof _contextHelpers;

export const HashBiMultiMap: Export = {
  ..._defaultContext,
  ..._contextHelpers,
};
