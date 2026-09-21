import type { Collection } from '@rimbu/collection-types/collection';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { MapCollection } from '@rimbu/collection-types/map';

import { OrderedMapContext } from '#ordered/map/context';

/**
 * A type-invariant immutable Map of key type K, and value type V that keeps
 * its entries in key insertion order.
 *
 * In the Map, each key has exactly one value, and the Map cannot contain
 * duplicate keys. Iteration follows the order in which keys were first added;
 * re-setting an existing key updates its value in place without moving it.
 *
 * @typeparam K - the key type
 * @typeparam V - the value type
 * @example
 * ```ts
 * import { OrderedMap } from '@rimbu/ordered';
 * const m = OrderedMap.of([1, 'a'], [2, 'b']);
 * m.set(1, 'c').streamKeys().toArray(); // [1, 2]
 * ```
 */
export interface OrderedMap<K, V>
	extends OrderedMap.Advanced.Api<
		K,
		V,
		Collection.Advanced.Types<OrderedMap.Advanced.Family<K, V>, readonly [K, V]>
	> {}

export namespace OrderedMap {
	/**
	 * A **non-empty** type-invariant immutable Map of key type K, and value type V.
	 *
	 * @typeparam K - the key type
	 * @typeparam V - the value type
	 */
	export interface NonEmpty<K, V>
		extends Advanced.Api<
			K,
			V,
			Collection.Advanced.TypesNonEmpty<Advanced.Family<K, V>, readonly [K, V]>
		> {}

	/**
	 * A mutable `OrderedMap` builder used to efficiently create new immutable
	 * instances.
	 *
	 * @typeparam K - the key type
	 * @typeparam V - the value type
	 */
	export interface Builder<K, V>
		extends Advanced.BuilderApi<
			K,
			V,
			Collection.Advanced.Types<Advanced.Family<K, V>, readonly [K, V]>
		> {}

	/**
	 * A context instance for an `OrderedMap` that acts as a factory for every
	 * instance of this type of collection.
	 *
	 * @typeparam UK - the upper key type bound for which the context can be used
	 */
	export interface Context<UK>
		extends Advanced.ContextApi<UK, OrderedMap.Advanced.Family<UK, any>> {}

	export namespace Advanced {
		export interface Api<
			K,
			V,
			Tp extends Collection.Advanced.Types<
				KeyedCollection.Advanced.FamilyBase<K, V>,
				readonly [K, V]
			>,
		> extends MapCollection.Advanced.Api<K, V, Tp> {}

		export interface BuilderApi<
			K,
			V,
			Tp extends Collection.Advanced.Types<
				KeyedCollection.Advanced.FamilyBase<K, V>,
				readonly [K, V]
			>,
		> extends MapCollection.Advanced.BuilderApi<K, V, Tp> {}

		export interface ContextApi<
			UK,
			FAM extends KeyedCollection.Advanced.Family<UK, any>,
		> extends MapCollection.Advanced.ContextApi<FAM> {
			readonly typeTag: 'OrderedMap';

			/**
			 * The context used to store the keys and their associated values and
			 * ordering indicators. Defaults to a `HashMap` context.
			 */
			readonly keyMapContext: MapCollection.Context<
				MapCollection.Advanced.Family<UK, any>
			>;

			/**
			 * The block size used by the internal sorted map that stores the
			 * insertion ordering.
			 */
			readonly indicatorBlockSizeBits: number;
		}

		export interface KeyedContextApi<
			UK,
			FAM extends KeyedCollection.Advanced.Family<UK, any>,
		> extends MapCollection.Advanced.KeyedContextApi<FAM> {
			/**
			 * Returns a new `OrderedMap` context based on the given `options`.
			 * @param options - (optional) the key map context to use for key
			 * storage, and the block size to use for the internal ordering map
			 */
			createContext<K>(options?: {
				keyMapContext?:
					| MapCollection.Context<MapCollection.Advanced.Family<K, any>>
					| undefined;
				indicatorBlockSizeBits?: number | undefined;
			}): Context<K>;
		}

		export interface Family<K, V> extends MapCollection.Advanced.Family<K, V> {
			_NORMAL: OrderedMap<K, V>;
			_NON_EMPTY: OrderedMap.NonEmpty<K, V>;
			_BUILDER: OrderedMap.Builder<K, V>;
			_CONTEXT: OrderedMap.Context<K>;
			_KEYED_CONTEXT: KeyedContextApi<K, this['_FAM']>;

			_UPPER_E: readonly [K, any];

			_FAM: Family<K, V>;
			_NEW_FAMILY: Family<this['_NEW_K'], this['_NEW_V']>;
		}

		export type DefaultFactory = KeyedContextApi<any, Family<any, any>>;
	}
}

/**
 * The default `OrderedMap` context, exposed as a factory object.
 */
export const OrderedMap: OrderedMap.Advanced.DefaultFactory =
	OrderedMapContext.createDefault().keyedContext;
