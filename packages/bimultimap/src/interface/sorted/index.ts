import { OmitStrong } from '@rimbu/common';
import { SortedMultiMapSortedValue } from '@rimbu/multimap';
import { SortedSet } from '@rimbu/sorted';
import { Streamable } from '@rimbu/stream';
import { BiMultiMapBase, BiMultiMapContext } from '../../bimultimap-custom';

/**
 * A type-invariant immutable bi-directional MultiMap where keys and values have a
 * many-to-many mapping. Its keys and values are sorted.
 * @typeparam K - the key type
 * @typeparam V - the value type
 * @example
 * const h1 = SortedBiMultiMap.empty<number, string>()
 * const h1 = SortedBiMultiMap.of([1, 'a'], [1, 'b'])
 */
export interface SortedBiMultiMap<K, V>
  extends BiMultiMapBase<K, V, SortedBiMultiMap.Types> {}

export namespace SortedBiMultiMap {
  /**
   * A non-empty type-invariant immutable bi-directional MultiMap where keys and values have a
   * many-to-many mapping. Its keys and values are sorted.
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface NonEmpty<K, V>
    extends BiMultiMapBase.NonEmpty<K, V, SortedBiMultiMap.Types>,
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

  /**
   * A mutable `SortedBiMultiMap` builder used to efficiently create new immutable instances.
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface Builder<K, V>
    extends BiMultiMapBase.Builder<K, V, SortedBiMultiMap.Types> {}

  export interface Types extends BiMultiMapBase.Types {
    context: SortedBiMultiMap.Context<this['_K'], this['_V']>;
    normal: SortedBiMultiMap<this['_K'], this['_V']>;
    nonEmpty: SortedBiMultiMap.NonEmpty<this['_K'], this['_V']>;
    builder: SortedBiMultiMap.Builder<this['_K'], this['_V']>;
    keyValueMultiMapContext: SortedMultiMapSortedValue.Context<
      this['_K'],
      this['_V']
    >;
    valueKeyMultiMapContext: SortedMultiMapSortedValue.Context<
      this['_V'],
      this['_K']
    >;
    keyValueMultiMap: SortedMultiMapSortedValue<this['_K'], this['_V']>;
    valueKeyMultiMap: SortedMultiMapSortedValue<this['_V'], this['_K']>;
    keyValueMultiMapNonEmpty: SortedMultiMapSortedValue.NonEmpty<
      this['_K'],
      this['_V']
    >;
    valueKeyMultiMapNonEmpty: SortedMultiMapSortedValue.NonEmpty<
      this['_V'],
      this['_K']
    >;
    keyMultiMapValues: SortedSet<this['_V']>;
    valueMultiMapValues: SortedSet<this['_K']>;
  }
}

interface Types extends SortedBiMultiMap.Types {
  context: BiMultiMapContext<this['_K'], this['_V'], any, any>;
}

function createContext<K, V>(options?: {
  keyValueMultiMapContext?: SortedMultiMapSortedValue.Context<K, V>;
  valueKeyMultiMapContext?: SortedMultiMapSortedValue.Context<V, K>;
}): SortedBiMultiMap.Context<K, V> {
  return new BiMultiMapContext<K, V, 'SortedBiMultiMap', Types>(
    'SortedBiMultiMap',
    options?.keyValueMultiMapContext ??
      SortedMultiMapSortedValue.defaultContext(),
    options?.valueKeyMultiMapContext ??
      SortedMultiMapSortedValue.defaultContext()
  );
}

const _defaultContext: SortedBiMultiMap.Context<any, any> = createContext();

const _contextHelpers = {
  /**
   * Returns a new SortedBiMultiMap context instance based on the given `options`.
   * @typeparam UK - the upper key type for which the context can create instances
   * @typeparam UV - the upper value type for which the context can create instances
   * @param options - (optional) an object containing the following properties:
   * * keyValueMultiMapContext - (optional) the map context to use for key value multimaps
   * * valueKeyMultiMapContext - (optional) the set context to use for value key multimaps
   */
  createContext,
  /**
   * Returns the default context for SortedBiMultiMap.
   * @typeparam UK - the upper key type for which the context can create instances
   * @typeparam UV - the upper value type for which the context can create instances
   */
  defaultContext<UK, UV>(): SortedBiMultiMap.Context<UK, UV> {
    return _defaultContext;
  },
};

type Export = OmitStrong<
  SortedBiMultiMap.Context<any, any>,
  '_types' | 'typeTag' | 'keyValueMultiMapContext' | 'valueKeyMultiMapContext'
> &
  typeof _contextHelpers;

export const SortedBiMultiMap: Export = {
  ..._defaultContext,
  ..._contextHelpers,
};
