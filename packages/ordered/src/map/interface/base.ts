import type { CustomBase, RMap } from '@rimbu/collection-types';
import type { List } from '@rimbu/list';
import type { Stream, Streamable } from '@rimbu/stream';

export interface OrderedMapBase<
  K,
  V,
  Tp extends OrderedMapBase.Types = OrderedMapBase.Types
> extends CustomBase.RMapBase<K, V, Tp> {
  /**
   * Returns a `List` instance containing the key order of the Map.
   * @example
   * const m = OrderedHashMap.of([2, 'b'], [1, 'a'], [3, 'c'])
   * console.log(m.keyOrder.toArray())
   * // => [2, 1, 3]
   */
  readonly keyOrder: List<K>;
  /**
   * Returns the contained `Map` instance.
   * @example
   * const m = OrderedHashMap.of([2, 'b'], [1, 'a'])
   * console.log(m.sourceMap.toString())
   * // => HashMap(1 -> 'a', 2 -> 'b')
   */
  readonly sourceMap: CustomBase.WithKeyValue<Tp, K, V>['sourceMap'];
}

export namespace OrderedMapBase {
  export interface NonEmpty<
    K,
    V,
    Tp extends OrderedMapBase.Types = OrderedMapBase.Types
  > extends CustomBase.RMapBase.NonEmpty<K, V, Tp>,
      Omit<
        OrderedMapBase<K, V, Tp>,
        keyof CustomBase.RMapBase.NonEmpty<any, any, any>
      >,
      Streamable.NonEmpty<readonly [K, V]> {
    /**
     * Returns a non-empty `List` instance containing the key order of the Map.
     * @example
     * const m = OrderedHashMap.of([2, 'b'], [1, 'a'], [3, 'c'])
     * console.log(m.keyOrder.toArray())
     * // => [2, 1, 3]
     */
    readonly keyOrder: List.NonEmpty<K>;
    /**
     * Returns the contained non-empty `Map` instance.
     * @example
     * const m = OrderedHashMap.of([2, 'b'], [1, 'a'])
     * console.log(m.sourceMap.toString())
     * // => HashMap(1 -> 'a', 2 -> 'b')
     */
    readonly sourceMap: CustomBase.WithKeyValue<Tp, K, V>['sourceMapNonEmpty'];
    stream(): Stream.NonEmpty<readonly [K, V]>;
  }

  export interface Builder<
    K,
    V,
    Tp extends OrderedMapBase.Types = OrderedMapBase.Types
  > extends CustomBase.RMapBase.Builder<K, V, Tp> {}

  export interface Context<
    UK,
    Tp extends OrderedMapBase.Types = OrderedMapBase.Types
  > extends CustomBase.RMapBase.Context<UK, Tp> {
    readonly typeTag: 'OrderedMap';

    /**
     * The List context used to create Lists to keep value insertion order.
     */
    readonly listContext: List.Context;
    /**
     * The Map context used to create the wrapped Map instances.
     */
    readonly mapContext: CustomBase.WithElem<Tp, UK>['sourceContext'];
  }

  export interface Types extends CustomBase.RMapBase.Types {
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
