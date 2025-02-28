import type { RMap } from '../../../collection-types/map/index.ts';
import type {
  RMapBase,
  WithElem,
  WithKeyValue,
} from '../../../collection-types/map-custom/index.ts';
import type { List } from '../../../list/mod.ts';
import type { Stream, Streamable } from '../../../stream/mod.ts';

export interface OrderedMapBase<
  K,
  V,
  Tp extends OrderedMapBase.Types = OrderedMapBase.Types,
> extends RMapBase<K, V, Tp> {
  /**
   * Returns a `List` instance containing the key order of the Map.
   * @example
   * ```ts
   * const m = OrderedHashMap.of([2, 'b'], [1, 'a'], [3, 'c'])
   * console.log(m.keyOrder.toArray())
   * // => [2, 1, 3]
   * ```
   */
  readonly keyOrder: List<K>;
  /**
   * Returns the contained `Map` instance.
   * @example
   * ```ts
   * const m = OrderedHashMap.of([2, 'b'], [1, 'a'])
   * console.log(m.sourceMap.toString())
   * // => HashMap(1 -> 'a', 2 -> 'b')
   * ```
   */
  readonly sourceMap: WithKeyValue<Tp, K, V>['sourceMap'];
}

export namespace OrderedMapBase {
  export interface NonEmpty<
    K,
    V,
    Tp extends OrderedMapBase.Types = OrderedMapBase.Types,
  > extends RMapBase.NonEmpty<K, V, Tp>,
      Omit<OrderedMapBase<K, V, Tp>, keyof RMapBase.NonEmpty<any, any, any>>,
      Streamable.NonEmpty<readonly [K, V]> {
    /**
     * Returns a non-empty `List` instance containing the key order of the Map.
     * @example
     * ```ts
     * const m = OrderedHashMap.of([2, 'b'], [1, 'a'], [3, 'c'])
     * console.log(m.keyOrder.toArray())
     * // => [2, 1, 3]
     * ```
     */
    readonly keyOrder: List.NonEmpty<K>;
    /**
     * Returns the contained non-empty `Map` instance.
     * @example
     * ```ts
     * const m = OrderedHashMap.of([2, 'b'], [1, 'a'])
     * console.log(m.sourceMap.toString())
     * // => HashMap(1 -> 'a', 2 -> 'b')
     * ```
     */
    readonly sourceMap: WithKeyValue<Tp, K, V>['sourceMapNonEmpty'];
    stream(): Stream.NonEmpty<readonly [K, V]>;
  }

  export interface Builder<
    K,
    V,
    Tp extends OrderedMapBase.Types = OrderedMapBase.Types,
  > extends RMapBase.Builder<K, V, Tp> {}

  export interface Context<
    UK,
    Tp extends OrderedMapBase.Types = OrderedMapBase.Types,
  > extends RMapBase.Context<UK, Tp> {
    readonly typeTag: 'OrderedMap';

    /**
     * The List context used to create Lists to keep value insertion order.
     */
    readonly listContext: List.Context;
    /**
     * The Map context used to create the wrapped Map instances.
     */
    readonly mapContext: WithElem<Tp, UK>['sourceContext'];
  }

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends RMapBase.Types {
    readonly normal: OrderedMapBase<this['_K'], this['_V']>;
    readonly nonEmpty: OrderedMapBase.NonEmpty<this['_K'], this['_V']>;
    readonly context: OrderedMapBase.Context<this['_K']>;
    readonly builder: OrderedMapBase.Builder<this['_K'], this['_V']>;
    readonly sourceContext: RMap.Context<this['_K']>;
    readonly sourceMap: RMap<this['_K'], this['_V']>;
    readonly sourceMapNonEmpty: RMap.NonEmpty<this['_K'], this['_V']>;
    readonly sourceBuilder: RMap.Builder<this['_K'], this['_V']>;
  }
}
