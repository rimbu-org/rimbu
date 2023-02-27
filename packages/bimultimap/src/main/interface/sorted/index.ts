import {
  BiMultiMapBase,
  BiMultiMapContext,
  BiMultiMapSorted,
} from '@rimbu/bimultimap/custom';
import { SortedMultiMapSortedValue } from '@rimbu/multimap';
import type { SortedSet } from '@rimbu/sorted';
import type { Streamable } from '@rimbu/stream';

/**
 * A type-invariant immutable bi-directional MultiMap where keys and values have a
 * many-to-many mapping. Its keys and values are sorted.
 * See the [BiMultiMap documentation](https://rimbu.org/docs/collections/bimultimap) and the [HashBiMultiMap API documentation](https://rimbu.org/api/rimbu/bimultimap/SortedBiMultiMap/interface)
 * @typeparam K - the key type
 * @typeparam V - the value type
 * @example
 * ```ts
 * const h1 = SortedBiMultiMap.empty<number, string>()
 * const h1 = SortedBiMultiMap.of([1, 'a'], [1, 'b'])
 * ```
 */
export interface SortedBiMultiMap<K, V>
  extends BiMultiMapBase<K, V, SortedBiMultiMap.Types> {}

export namespace SortedBiMultiMap {
  /**
   * A non-empty type-invariant immutable bi-directional MultiMap where keys and values have a
   * many-to-many mapping. Its keys and values are sorted.
   * See the [BiMultiMap documentation](https://rimbu.org/docs/collections/bimultimap) and the [HashBiMultiMap API documentation](https://rimbu.org/api/rimbu/bimultimap/SortedBiMultiMap/interface)
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface NonEmpty<K, V>
    extends BiMultiMapBase.NonEmpty<K, V, SortedBiMultiMap.Types>,
      Omit<
        SortedBiMultiMap<K, V>,
        keyof BiMultiMapBase.NonEmpty<any, any, any>
      >,
      Streamable.NonEmpty<[K, V]> {}

  /**
   * The SortedBiMultiMap's Context instance that serves as a factory for all related immutable instances and builders.
   * @typeparam UK - the upper type limit for key types for which this context can create instances
   * @typeparam UV - the upper type limit for value types for which this context can create instances
   */
  export interface Context<UK, UV>
    extends BiMultiMapBase.Context<UK, UV, SortedBiMultiMap.Types> {
    readonly typeTag: 'SortedBiMultiMap';
  }

  export namespace Context {
    export interface Options<UK, UV> {
      contextId?: string;
      keyValueMultiMapContext?: SortedMultiMapSortedValue.Context<UK, UV>;
      valueKeyMultiMapContext?: SortedMultiMapSortedValue.Context<UV, UK>;
    }
  }

  /**
   * A mutable `SortedBiMultiMap` builder used to efficiently create new immutable instances.
   * See the [BiMultiMap documentation](https://rimbu.org/docs/collections/bimultimap) and the [HashBiMultiMap.Builder API documentation](https://rimbu.org/api/rimbu/bimultimap/SortedBiMultiMap/Builder/interface)
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface Builder<K, V>
    extends BiMultiMapBase.Builder<K, V, SortedBiMultiMap.Types> {}

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends BiMultiMapBase.Types {
    readonly context: SortedBiMultiMap.Context<this['_K'], this['_V']>;
    readonly normal: SortedBiMultiMap<this['_K'], this['_V']>;
    readonly nonEmpty: SortedBiMultiMap.NonEmpty<this['_K'], this['_V']>;
    readonly builder: SortedBiMultiMap.Builder<this['_K'], this['_V']>;
    readonly keyValueMultiMapContext: SortedMultiMapSortedValue.Context<
      this['_K'],
      this['_V']
    >;
    readonly valueKeyMultiMapContext: SortedMultiMapSortedValue.Context<
      this['_V'],
      this['_K']
    >;
    readonly keyValueMultiMap: SortedMultiMapSortedValue<
      this['_K'],
      this['_V']
    >;
    readonly valueKeyMultiMap: SortedMultiMapSortedValue<
      this['_V'],
      this['_K']
    >;
    readonly keyValueMultiMapNonEmpty: SortedMultiMapSortedValue.NonEmpty<
      this['_K'],
      this['_V']
    >;
    readonly valueKeyMultiMapNonEmpty: SortedMultiMapSortedValue.NonEmpty<
      this['_V'],
      this['_K']
    >;
    readonly keyMultiMapValues: SortedSet<this['_V']>;
    readonly valueMultiMapValues: SortedSet<this['_K']>;
  }
}

function createContext<UK, UV>(
  options?: SortedBiMultiMap.Context.Options<UK, UV>
): SortedBiMultiMap.Context<UK, UV> {
  return Object.freeze(
    new BiMultiMapContext<UK, UV, 'SortedBiMultiMap', any>(
      'SortedBiMultiMap',
      options?.keyValueMultiMapContext ??
        SortedMultiMapSortedValue.defaultContext(),
      options?.valueKeyMultiMapContext ??
        SortedMultiMapSortedValue.defaultContext(),
      options?.contextId
    )
  );
}

const _defaultContext: SortedBiMultiMap.Context<any, any> = createContext({
  contextId: 'default',
});

export const SortedBiMultiMap: BiMultiMapSorted.Creators = Object.freeze({
  ..._defaultContext,
  createContext,
  defaultContext<UK, UV>(): SortedBiMultiMap.Context<UK, UV> {
    return _defaultContext;
  },
});
