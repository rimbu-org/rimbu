import type { CustomBase, RMapBase } from '@rimbu/collection-types';
import type { List } from '@rimbu/list';
import type { Stream, Streamable } from '@rimbu/stream';
import type { OrderedMapNonEmpty } from '../../ordered-custom';
import type { OrderedMapContextImpl } from '../implementation/context';

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
    normal: OrderedMapBase<this['_K'], this['_V']>;
    nonEmpty: OrderedMapBase.NonEmpty<this['_K'], this['_V']>;
    context: OrderedMapBase.Context<this['_K']>;
    builder: OrderedMapBase.Builder<this['_K'], this['_V']>;
    sourceContext: CustomBase.RMapBase.Context<this['_K']>;
    sourceMap: CustomBase.RMapBase<this['_K'], this['_V']>;
    sourceMapNonEmpty: CustomBase.RMapBase.NonEmpty<this['_K'], this['_V']>;
    sourceBuilder: CustomBase.RMapBase.Builder<this['_K'], this['_V']>;
  }
}

export interface OrderedMapContext<UK, Tp extends OrderedMapTypes>
  extends OrderedMapBase.Context<UK, Tp> {
  builder<K extends UK, V>(): CustomBase.WithKeyValue<Tp, K, V>['builder'];

  createBuilder<K extends UK, V>(
    source?: OrderedMapNonEmpty<K, V, Tp>
  ): CustomBase.WithKeyValue<Tp, K, V>['builder'];

  createNonEmpty<K extends UK, V>(
    order: List.NonEmpty<K>,
    sourceMap: RMapBase.NonEmpty<K, V>
  ): CustomBase.WithKeyValue<Tp, K, V>['nonEmpty'];
}

export interface OrderedMapTypes extends OrderedMapBase.Types {
  context: OrderedMapContextImpl<this['_K']>;
  // normal: OrderedMapBase<this['_K'], this['_V']>;
  // nonEmpty: OrderedMapNonEmpty<this['_K'], this['_V']>;
  // builder: OrderedMapBuilder<this['_K'], this['_V']>;
}
