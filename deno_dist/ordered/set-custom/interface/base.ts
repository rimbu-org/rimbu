import type { RSetBase, WithElem } from '../../../collection-types/set-custom/index.ts';
import type { List } from '../../../list/mod.ts';
import type { Streamable } from '../../../stream/mod.ts';

export interface OrderedSetBase<
  T,
  Tp extends OrderedSetBase.Types = OrderedSetBase.Types,
> extends RSetBase<T, Tp> {
  /**
   * Returns a `List` instance containing the order of the elements.
   * @example
   * ```ts
   * const s = OrderedHashSet.of('b', 'a', 'c')
   * console.log(s.order.toArray())
   * // => ['b', 'a', 'c']
   * ```
   */
  readonly order: List<T>;
  /**
   * Returns the contained `Set` instance.
   * @example
   * ```ts
   * const s = OrderedHashSet.of('b', 'a', 'c')
   * console.log(m.sourceSet.toString())
   * // => HashSet('a', 'b', 'c')
   * ```
   */
  readonly sourceSet: WithElem<Tp, T>['sourceSet'];
}

export namespace OrderedSetBase {
  export interface NonEmpty<
    T,
    Tp extends OrderedSetBase.Types = OrderedSetBase.Types,
  > extends RSetBase.NonEmpty<T, Tp>,
      Streamable.NonEmpty<T> {
    /**
     * Returns a non-empty `List` instance containing the order of the elements.
     * @example
     * ```ts
     * const s = OrderedHashSet.of('b', 'a', 'c')
     * console.log(s.order.toArray())
     * // => ['b', 'a', 'c']
     * ```
     */
    readonly order: List.NonEmpty<T>;
    /**
     * Returns the contained non-empty `Set` instance.
     * @example
     * ```ts
     * const s = OrderedHashSet.of('b', 'a', 'c')
     * console.log(m.sourceSet.toString())
     * // => HashSet('a', 'b', 'c')
     * ```
     */
    readonly sourceSet: WithElem<Tp, T>['sourceSetNonEmpty'];
  }

  export interface Builder<
    T,
    Tp extends OrderedSetBase.Types = OrderedSetBase.Types,
  > extends RSetBase.Builder<T, Tp> {}

  export interface Context<
    UT,
    Tp extends OrderedSetBase.Types = OrderedSetBase.Types,
  > extends RSetBase.Context<UT, Tp> {
    readonly typeTag: 'OrderedSet';

    /**
     * The List context used create Lists to keep value insertion order.
     */
    readonly listContext: List.Context;
    /**
     * The wrapped Set context type.
     */
    readonly setContext: WithElem<Tp, UT>['sourceContext'];
  }

  /**
   * Utility interface that provides higher-kinded types for this collection.
   */
  export interface Types extends RSetBase.Types {
    readonly normal: OrderedSetBase<this['_T']>;
    readonly nonEmpty: OrderedSetBase.NonEmpty<this['_T']>;
    readonly context: OrderedSetBase.Context<this['_T']>;
    readonly builder: OrderedSetBase.Builder<this['_T']>;
    readonly sourceContext: RSetBase.Context<this['_T']>;
    readonly sourceSet: RSetBase<this['_T']>;
    readonly sourceSetNonEmpty: RSetBase.NonEmpty<this['_T']>;
    readonly sourceBuilder: RSetBase.Builder<this['_T']>;
  }
}
