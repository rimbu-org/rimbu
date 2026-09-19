import type { Collection } from '@rimbu/collection-types/collection';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { SetCollection } from '@rimbu/collection-types/set';

import { OrderedSetContext } from '#ordered/set/context';

/**
 * A type-invariant immutable Set of value type T that keeps its elements in
 * insertion order.
 *
 * Iteration follows the order in which elements were first added; adding an
 * element that is already present does not change its position.
 *
 * @typeparam T - the element type
 * @example
 * ```ts
 * import { OrderedSet } from '@rimbu/ordered';
 * const s = OrderedSet.of(1, 2, 3);
 * s.add(1).toArray(); // [1, 2, 3]
 * ```
 */
export interface OrderedSet<T>
	extends OrderedSet.Advanced.Api<
		T,
		Collection.Advanced.Types<OrderedSet.Advanced.Family<T>, T>
	> {}

export namespace OrderedSet {
	/**
	 * A **non-empty** type-invariant immutable Set of value type T.
	 *
	 * @typeparam T - the element type
	 */
	export interface NonEmpty<T>
		extends Advanced.Api<
			T,
			Collection.Advanced.TypesNonEmpty<Advanced.Family<T>, T>
		> {}

	/**
	 * A mutable `OrderedSet` builder used to efficiently create new immutable
	 * instances.
	 *
	 * @typeparam T - the element type
	 */
	export interface Builder<T>
		extends Advanced.BuilderApi<
			T,
			Collection.Advanced.Types<Advanced.Family<T>, T>
		> {}

	/**
	 * A context instance for an `OrderedSet` that acts as a factory for every
	 * instance of this type of collection.
	 *
	 * @typeparam UT - the upper element type bound for which the context can be
	 * used
	 */
	export interface Context<UT>
		extends Advanced.ContextApi<UT, OrderedSet.Advanced.Family<UT>> {}

	export namespace Advanced {
		export interface Api<E, Tp extends Collection.Advanced.TypesBase>
			extends SetCollection.Advanced.Api<E, Tp> {}

		export interface BuilderApi<E, Tp extends Collection.Advanced.TypesBase>
			extends SetCollection.Advanced.BuilderApi<E, Tp> {}

		export interface ContextApi<
			UE,
			F extends Collection.Advanced.FamilyBase<UE>,
		> extends SetCollection.Advanced.ContextApi<F>,
				Collection.Capability.WithReducer.ContextApi<F> {
			readonly typeTag: 'OrderedSet';

			/**
			 * The context used to store the elements and their ordering indicators.
			 * Defaults to a `HashMap` context.
			 */
			readonly keyMapContext: MapCollection.Context<
				MapCollection.Advanced.Family<UE, any>
			>;

			/**
			 * The block size used by the internal sorted map that stores the
			 * insertion ordering.
			 */
			readonly indicatorBlockSizeBits: number;
		}

		export interface Family<E> extends SetCollection.Advanced.Family<E> {
			_NORMAL: OrderedSet<E>;
			_NON_EMPTY: OrderedSet.NonEmpty<E>;
			_BUILDER: OrderedSet.Builder<E>;
			_CONTEXT: OrderedSet.Context<E>;
			_SELF: this['_NORMAL'];

			_UPPER_E: E;
			_INVARIANT: (element: E) => E;

			_FAM: Family<E>;
			_NEW_FAMILY: Family<this['_NEW_E']>;
		}

		export type DefaultFactory = Pick<
			Context<any>,
			'builder' | 'empty' | 'from' | 'of' | 'reducer'
		> & {
			createContext<E>(options?: {
				keyMapContext?:
					| MapCollection.Context<MapCollection.Advanced.Family<E, any>>
					| undefined;
				indicatorBlockSizeBits?: number | undefined;
			}): Context<E>;
		};
	}
}

/**
 * The default `OrderedSet` context, exposed as a factory object.
 */
export const OrderedSet: OrderedSet.Advanced.DefaultFactory =
	OrderedSetContext.createDefault();
