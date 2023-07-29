import type { BiMultiMapHashed } from '@rimbu/bimultimap/custom';
import {
  type BiMultiMapBase,
  BiMultiMapContext,
} from '@rimbu/bimultimap/custom';

import type { HashSet } from '@rimbu/hashed';
import { HashMultiMapHashValue } from '@rimbu/multimap';
import type { Streamable } from '@rimbu/stream';

/**
 * A type-invariant immutable bi-directional MultiMap where keys and values have a
 * many-to-many mapping. Its keys and values are hashed.
 * See the [BiMultiMap documentation](https://rimbu.org/docs/collections/bimultimap) and the [HashBiMultiMap API documentation](https://rimbu.org/api/rimbu/bimultimap/HashBiMultiMap/interface)
 * @typeparam K - the key type
 * @typeparam V - the value type
 * @example
 * ```ts
 * const h1 = HashBiMultiMap.empty<number, string>()
 * const h1 = HashBiMultiMap.of([1, 'a'], [1, 'b'])
 * ```
 */
export interface HashBiMultiMap<K, V>
  extends BiMultiMapBase<K, V, HashBiMultiMap.Types> {}

export namespace HashBiMultiMap {
  /**
   * A non-empty type-invariant immutable bi-directional MultiMap where keys and values have a
   * many-to-many mapping. Its keys and values are hashed.
   * See the [BiMultiMap documentation](https://rimbu.org/docs/collections/bimultimap) and the [HashBiMultiMap API documentation](https://rimbu.org/api/rimbu/bimultimap/HashBiMultiMap/interface)
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface NonEmpty<K, V>
    extends BiMultiMapBase.NonEmpty<K, V, HashBiMultiMap.Types>,
      Omit<HashBiMultiMap<K, V>, keyof BiMultiMapBase<any, any, any>>,
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
   * See the [BiMultiMap documentation](https://rimbu.org/docs/collections/bimultimap) and the [HashBiMultiMap.Builder API documentation](https://rimbu.org/api/rimbu/bimultimap/HashBiMultiMap/Builder/interface)
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface Builder<K, V>
    extends BiMultiMapBase.Builder<K, V, HashBiMultiMap.Types> {}

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
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
  return Object.freeze(
    new BiMultiMapContext<UK, UV, 'HashBiMultiMap', any>(
      'HashBiMultiMap',
      options?.keyValueMultiMapContext ??
        HashMultiMapHashValue.defaultContext(),
      options?.valueKeyMultiMapContext ?? HashMultiMapHashValue.defaultContext()
    )
  );
}

const _defaultContext: HashBiMultiMap.Context<any, any> = createContext();

export const HashBiMultiMap: BiMultiMapHashed.Creators = Object.freeze({
  ..._defaultContext,
  createContext,
  defaultContext<UK, UV>(): HashBiMultiMap.Context<UK, UV> {
    return _defaultContext;
  },
});
