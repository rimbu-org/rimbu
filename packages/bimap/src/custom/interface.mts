import type { BiMap } from '@rimbu/bimap';

import type { RMap } from '@rimbu/collection-types';
import type { ArrayNonEmpty } from '@rimbu/common';
import type { Reducer, StreamSource } from '@rimbu/stream';

export interface BiMapFactory<UK = unknown, UV = unknown> {
  /**
   * Returns the (singleton) empty instance of this type and context with given key and value types.
   * @example
   * ```ts
   * BiMap.empty<number, string>()    // => BiMap<number, string>
   * BiMap.empty<string, boolean>()   // => BiMap<string, boolean>
   * ```
   */
  empty<K extends UK, V extends UV>(): BiMap<K, V>;
  /**
   * Returns an immutable `BiMap`, containing the given `entries`.
   * @param entries - a non-empty array of key-value entries
   * @example
   * ```ts
   * BiMap.of([1, 'a'], [2, 'b'])    // => BiMap.NonEmpty<number, string>
   * ```
   */
  of<K extends UK, V extends UV>(
    ...entries: ArrayNonEmpty<readonly [K, V]>
  ): BiMap.NonEmpty<K, V>;
  /**
   * Returns an immutable BiMap, containing the entries in the given `sources` `StreamSource` instances.
   * @param sources - an array of `StreamSource` instances contaning key-value entries
   * @example
   * ```ts
   * BiMap.from([[1, 'a'], [2, 'b']])    // => BiMap.NonEmpty<number, string>
   * ```
   */
  from<K extends UK, V extends UV>(
    ...sources: ArrayNonEmpty<StreamSource<readonly [K, V]>>
  ): BiMap.NonEmpty<K, V>;
  from<K extends UK, V extends UV>(
    ...sources: ArrayNonEmpty<StreamSource.NonEmpty<readonly [K, V]>>
  ): BiMap<K, V>;
  /**
   * Returns an empty `BiMap` builder instance.
   * @example
   * ```ts
   * BiMap.builder<number, string>()    // => BiMap.Builder<number, string>
   * ```
   */
  builder<K extends UK, V extends UV>(): BiMap.Builder<K, V>;
  /**
   * Returns a `Reducer` that adds received tuples to a BiMap and returns the BiMap as a result. When a `source` is given,
   * the reducer will first create a BiMap from the source, and then add tuples to it.
   * @param source - (optional) an initial source of tuples to add to
   * @example
   * ```ts
   * const someSource = BiMap.of([1, 'a'], [2, 'b']);
   * const result = Stream.of([1, 'c'], [3, 'a']).reduce(BiMap.reducer(someSource))
   * result.toArray()   // => [[1, 'c'], [2, 'b'], [3, 'a']]
   * ```
   * @note uses a builder under the hood. If the given `source` is a BiMap in the same context, it will directly call `.toBuilder()`.
   */
  reducer<K extends UK, V extends UV>(
    source?: StreamSource<readonly [K, V]>
  ): Reducer<readonly [K, V], BiMap<K, V>>;
}

export interface BiMapCreators extends BiMapFactory {
  /**
   * Returns a new BiMap context instance based on the given `options`.
   * @typeparam UK - the upper key type for which the context can create instances
   * @typeparam UV - the upper value type for which the context can create instances
   * @param options - (optional) an object containing the following properties:<br/>
   * - keyValueContext: (optional) the map context to use for key value mappings<br/>
   * - valueKeyContext: (optional) the map context to use for value key mappings
   */
  createContext<UK, UV>(options?: {
    keyValueContext?: RMap.Context<UK>;
    valueKeyContext?: RMap.Context<UV>;
  }): BiMap.Context<UK, UV>;
  /**
   * Returns the default context for BiMaps.
   * @typeparam UK - the upper key type for which the context can create instances
   * @typeparam UV - the upper value type for which the context can create instances
   */
  defaultContext<UK, UV>(): BiMap.Context<UK, UV>;
}
