/**
 * @packageDocumentation
 *
 * The `@rimbu/proximity/map` package provides the `ProximityMap` implementation.<br/>
 * <br/>
 * See the [Rimbu docs Map page](/docs/collections/map) for more information.
 */

import type { RMap } from '../../collection-types/mod.ts';
import type { RMapBase } from '../../collection-types/map-custom/index.ts';
import type { Stream, Streamable } from '../../stream/mod.ts';
import { HashMap } from '../../hashed/map/index.ts';

import { DistanceFunction } from '../../proximity/common/index.ts';
import { ProximityMapContext } from '../../proximity/map-custom/index.ts';

/**
 * A type-invariant immutable Map of key type K, and value type V.
 * In the Map, each key has exactly one value, and the Map cannot contain
 * duplicate keys.
 * See the [Map documentation](/docs/collections/map) and the
 * [ProximityMap API documentation](/api/rimbu/proximity/map/ProximityMap/interface)
 * @typeparam K - the key type
 * @typeparam V - the value type
 * @note
 * The `get()` method is designed to perform a linear scan of all the keys, returning
 * the value associated with the key having the least distance from the input key;
 * however, optimized distance functions can greatly improve efficiency by
 * preventing a full scan.
 * @example
 * ```ts
 * const m1 = ProximityMap.empty<number, string>()
 * const m2 = ProximityMap.of([1, 'a'], [2, 'b'])
 * ```
 */
export interface ProximityMap<K, V>
  extends RMapBase<K, V, ProximityMap.Types> {}

export namespace ProximityMap {
  /**
   * A **non-empty** type-invariant immutable Map of key type K, and value type V.
   * In the Map, each key has exactly one value, and the Map cannot contain
   * duplicate keys.<br/>
   * See the [Map documentation](/docs/collections/map) and the
   * [ProximityMap API documentation](/api/rimbu/proximity/map/ProximityMap/interface)
   * @typeparam K - the key type
   * @typeparam V - the value type
   * @note
   * The `get()` method is designed to perform a linear scan of all the keys, returning
   * the value associated with the key having the least distance from the input key;
   * however, optimized distance functions can greatly improve efficiency by
   * preventing a full scan.
   * @example
   * ```ts
   * const m1 = ProximityMap.empty<number, string>()
   * const m2 = ProximityMap.of([1, 'a'], [2, 'b'])
   * ```
   */
  export interface NonEmpty<K, V>
    extends RMapBase.NonEmpty<K, V, ProximityMap.Types>,
      Omit<ProximityMap<K, V>, keyof RMapBase.NonEmpty<any, any, any>>,
      Streamable.NonEmpty<readonly [K, V]> {
    stream(): Stream.NonEmpty<readonly [K, V]>;
  }

  /**
   * A context instance for a `ProximityMap` that acts as a factory
   * for every instance of this type of collection.
   *
   * @typeparam UK - the upper key type bound for which the context can be used
   */
  export interface Context<UK>
    extends RMapBase.Context<UK, ProximityMap.Types> {
    readonly typeTag: 'ProximityMap';

    /**
     * The function used to compute the distance between stored keys and any research key
     */
    readonly distanceFunction: DistanceFunction<UK>;

    /**
     * The context used by the internal HashMap
     */
    readonly hashMapContext: HashMap.Context<UK>;

    /**
     * Creates a builder given the optional non-empty source map
     *
     * @param source Optional non-empty map used to fill the builder
     */
    createBuilder<K extends UK, V>(
      source?: ProximityMap.NonEmpty<K, V>
    ): ProximityMap.Builder<K, V>;
  }

  /**
   * A mutable `ProximityMap` builder used to efficiently create new immutable instances.
   * See the [Map documentation](/docs/collections/map) and the
   * [ProximityMap.Builder API documentation](/api/rimbu/proximity/map/ProximityMap/Builder/interface)
   * @typeparam K - the key type
   * @typeparam V - the value type
   */
  export interface Builder<K, V>
    extends RMapBase.Builder<K, V, ProximityMap.Types> {}

  /**
   * Utility interface that provides higher-level types for this collection.
   */
  export interface Types extends RMap.Types {
    readonly normal: ProximityMap<this['_K'], this['_V']>;
    readonly nonEmpty: ProximityMap.NonEmpty<this['_K'], this['_V']>;
    readonly context: ProximityMap.Context<this['_K']>;
    readonly builder: ProximityMap.Builder<this['_K'], this['_V']>;
  }
}

function createProximityMapContext<UK>(options?: {
  distanceFunction?: DistanceFunction<UK>;
  hashMapContext?: HashMap.Context<UK>;
}): ProximityMap.Context<UK> {
  return Object.freeze(
    new ProximityMapContext(
      options?.distanceFunction ?? DistanceFunction.defaultFunction,
      options?.hashMapContext ?? HashMap.defaultContext()
    )
  );
}

const _defaultContext: ProximityMap.Context<any> = createProximityMapContext();

interface ProximityMapCreators extends RMapBase.Factory<ProximityMap.Types> {
  /**
   * Returns a new ProximityMap context instance based on the given `options`.
   * @typeparam UK - the upper key type for which the context can create instances
   * @param options - (optional) an object containing the following properties:<br/>
   * - distanceFunction: (optional) the distance function used to compare the proximity between keys<br/>
   * - listContext: (optional) the context to use to create the internal hashmap instances
   */
  createContext<UK>(options?: {
    distanceFunction?: DistanceFunction<UK>;
    hashMapContext?: HashMap.Context<UK>;
  }): ProximityMap.Context<UK>;
  /**
   * Returns the default context for ProximityMaps.
   * @typeparam UK - the upper key type for which the context can create instances
   */
  defaultContext<UK>(): ProximityMap.Context<UK>;
}

export const ProximityMap: ProximityMapCreators = Object.freeze({
  ..._defaultContext,
  createContext: createProximityMapContext,
  defaultContext<UK>(): ProximityMap.Context<UK> {
    return _defaultContext;
  },
});
