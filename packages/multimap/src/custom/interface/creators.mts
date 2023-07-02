import type { RMap, RSet } from '@rimbu/collection-types';
import type { HashMap, HashSet } from '@rimbu/hashed';
import type { SortedMap, SortedSet } from '@rimbu/sorted';

import type {
  HashMultiMapHashValue,
  HashMultiMapSortedValue,
  MultiMap,
  SortedMultiMapHashValue,
  SortedMultiMapSortedValue,
} from '#multimap/main';
import type { MultiMapBase } from '#multimap/custom';

export interface MultiMapCreators {
  /**
   * Returns a new MultiMap context instance based on the given `options`.
   * @typeparam UK - the upper key type for which the context can create instances
   * @typeparam UV - the upper value type for which the context can create instances
   * @param options - an object containing the following properties:<br/>
   * - keyMapContext - the map context to use for key to valueset mappings<br/>
   * - keyMapValuesContext - the set context to use for value sets
   */
  createContext<UK, UV>(options: {
    keyMapContext: RMap.Context<UK>;
    keyMapValuesContext: RSet.Context<UV>;
  }): MultiMap.Context<UK, UV>;
}
export interface HashMultiMapHashValueCreators
  extends MultiMapBase.Factory<HashMultiMapHashValue.Types> {
  /**
   * Returns a new HashMultiMapHashValue context instance based on the given `options`.
   * @typeparam UK - the upper key type for which the context can create instances
   * @typeparam UV - the upper value type for which the context can create instances
   * @param options - (optional) an object containing the following properties:<br/>
   * - keyMapContext - (optional) the map context to use for key to valueset mappings<br/>
   * - keyMapValuesContext - (optional) the set context to use for value sets
   */
  createContext<UK, UV>(options?: {
    keyMapContext?: HashMap.Context<UK>;
    keyMapValuesContext?: HashSet.Context<UV>;
  }): HashMultiMapHashValue.Context<UK, UV>;
  /**
   * Returns the default context for HashMultiMapHashValue.
   * @typeparam UK - the upper key type for which the context can create instances
   * @typeparam UV - the upper value type for which the context can create instances
   */
  defaultContext<UK, UV>(): HashMultiMapHashValue.Context<UK, UV>;
}

export interface HashMultiMapSortedValueCreators
  extends MultiMapBase.Factory<HashMultiMapSortedValue.Types> {
  /**
   * Returns a new HashMultiMapSortedValue context instance based on the given `options`.
   * @typeparam UK - the upper key type for which the context can create instances
   * @typeparam UV - the upper value type for which the context can create instances
   * @param options - (optional) an object containing the following properties:<br/>
   * - keyMapContext - (optional) the map context to use for key to valueset mappings<br/>
   * - keyMapValuesContext - (optional) the set context to use for value sets
   */
  createContext<K, V>(options?: {
    keyMapContext?: HashMap.Context<K>;
    keyMapValuesContext?: SortedSet.Context<V>;
  }): HashMultiMapSortedValue.Context<K, V>;
  /**
   * Returns the default context for HashMultiMapSortedValue.
   * @typeparam UK - the upper key type for which the context can create instances
   * @typeparam UV - the upper value type for which the context can create instances
   */
  defaultContext<UK, UV>(): HashMultiMapSortedValue.Context<UK, UV>;
}

export interface SortedMultiMapHashValueCreators
  extends MultiMapBase.Factory<SortedMultiMapHashValue.Types> {
  /**
   * Returns a new SortedMultiMapHashValue context instance based on the given `options`.
   * @typeparam UK - the upper key type for which the context can create instances
   * @typeparam UV - the upper value type for which the context can create instances
   * @param options - (optional) an object containing the following properties:<br/>
   * - keyMapContext - (optional) the map context to use for key to valueset mappings<br/>
   * - keyMapValuesContext - (optional) the set context to use for value sets
   */
  createContext<K, V>(options?: {
    keyMapContext?: SortedMap.Context<K>;
    keyMapValuesContext?: HashSet.Context<V>;
  }): SortedMultiMapHashValue.Context<K, V>;
  /**
   * Returns the default context for SortedMultiMapHashValue.
   * @typeparam UK - the upper key type for which the context can create instances
   * @typeparam UV - the upper value type for which the context can create instances
   */
  defaultContext<K, V>(): SortedMultiMapHashValue.Context<K, V>;
}

export interface SortedMultiMapSortedValueCreators
  extends MultiMapBase.Factory<SortedMultiMapSortedValue.Types> {
  /**
   * Returns a new SortedMultiMapSortedValue context instance based on the given `options`.
   * @typeparam UK - the upper key type for which the context can create instances
   * @typeparam UV - the upper value type for which the context can create instances
   * @param options - (optional) an object containing the following properties:<br/>
   * - keyMapContext - (optional) the map context to use for key to valueset mappings<br/>
   * - keyMapValuesContext - (optional) the set context to use for value sets
   */
  createContext<K, V>(options?: {
    keyMapContext?: SortedMap.Context<K>;
    keyMapValuesContext?: SortedSet.Context<V>;
  }): SortedMultiMapSortedValue.Context<K, V>;
  /**
   * Returns the default context for HashMultiMapHashValue.
   * @typeparam UK - the upper key type for which the context can create instances
   * @typeparam UV - the upper value type for which the context can create instances
   */
  defaultContext<UK, UV>(): SortedMultiMapSortedValue.Context<UK, UV>;
}
