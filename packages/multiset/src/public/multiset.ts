import type { Collection } from '@rimbu/collection-types/collection';
import type { ValuedCollection } from '@rimbu/collection-types/collection/valued';
import type { MapCollection } from '@rimbu/collection-types/map';
import type {
	MultiSetBase,
	MultiSetBuilderBase,
} from '@rimbu/multiset/advanced/multiset-base';
import type { Stream } from '@rimbu/stream';

import { MultiSetContext } from '#multiset/context-factory';

/**
 * A type-invariant immutable MultiSet of value type T.
 * In the MultiSet, each value can occur multiple times.
 * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the [MultiSet API documentation](https://rimbu.org/api/rimbu/multiset/MultiSet/interface)
 * @typeparam T - the value type
 */
export interface MultiSet<T>
	extends MultiSet.Advanced.Api<
		T,
		Collection.Advanced.Types<MultiSet.Advanced.Family<T>, T>
	> {}

export namespace MultiSet {
	/**
	 * A non-empty type-invariant immutable MultiSet of value type T.
	 * In the MultiSet, each value can occur multiple times.
	 * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the [MultiSet API documentation](https://rimbu.org/api/rimbu/multiset/MultiSet/interface)
	 * @typeparam T - the value type
	 */
	export interface NonEmpty<T>
		extends Advanced.Api<
			T,
			Collection.Advanced.TypesNonEmpty<Advanced.Family<T>, T>
		> {
		readonly countMap: MapCollection.NonEmpty<T, number>;
		asNormal(): MultiSet<T>;
		streamDistinct(): Stream.NonEmpty<T>;
		streamWithCounts(): Stream.NonEmpty<readonly [T, number]>;
	}

	/**
	 * A mutable `MultiSet` builder used to efficiently create new immutable instances.
	 * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the [MultiSet.Builder API documentation](https://rimbu.org/api/rimbu/multiset/MultiSet/Builder/interface)
	 * @typeparam T - the value type
	 */
	export interface Builder<T>
		extends Advanced.BuilderApi<
			T,
			Collection.Advanced.Types<Advanced.Family<T>, T>
		> {}

	/**
	 * A context instance for `MultiSet` implementations that acts as a factory for every instance of this
	 * type of collection.
	 * @typeparam UT - the upper value type bound for which the context can be used
	 */
	export interface Context<UT>
		extends Advanced.ContextApi<UT, Advanced.Family<UT>> {}

	export namespace Advanced {
		export interface Api<T, Tp extends Collection.Advanced.TypesBase>
			extends MultiSetBase<T, Tp> {}

		export interface BuilderApi<T, Tp extends Collection.Advanced.TypesBase>
			extends MultiSetBuilderBase<T, Tp> {}

		export interface ContextApi<
			UT,
			FAM extends ValuedCollection.Advanced.Family<UT>,
		> extends ValuedCollection.Advanced.ContextApi<FAM>,
				Collection.Capability.WithReducer.ContextApi<FAM> {
			readonly typeTag: string;
			readonly countMapContext: MapCollection.Context<
				MapCollection.Advanced.Family<UT, number>
			>;
			isValidElem(value: unknown): value is UT;
		}

		/**
		 * The default MultiSet family. Concrete variants extend this and pin the
		 * HKT slots to their own collection types.
		 */
		export interface Family<T>
			extends ValuedCollection.Advanced.Family<T>,
				Collection.Capability.WithAdd<T>,
				Collection.Capability.WithAddAll<T>,
				Collection.Capability.WithToBuilder<T> {
			_NORMAL: MultiSet<T>;
			_NON_EMPTY: MultiSet.NonEmpty<T>;
			_BUILDER: MultiSet.Builder<T>;
			_CONTEXT: MultiSet.Context<T>;

			_UPPER_E: T;
			_INVARIANT: (element: T) => T;

			_FAM: Family<T>;
			_NEW_FAMILY: Family<this['_NEW_E']>;
		}
	}
}

/**
 * The factory interface implemented by the root `MultiSet` value.
 */
export interface MultiSetCreators {
	/**
	 * Returns a new `MultiSet` context instance based on the given `options`.
	 * @typeparam UT - the upper element type for which the context can create instances
	 * @param options - an object containing the following properties:<br/>
	 * - countMapContext: the map context to use for value to count mapping
	 */
	createContext<UT>(options: {
		countMapContext: MapCollection.Context<
			MapCollection.Advanced.Family<UT, number>
		>;
	}): MultiSet.Context<UT>;
}

/**
 * The `MultiSet` creators and context.
 *
 * Use this exported value to create and work with a generic immutable
 * `MultiSet` instance backed by any `MapCollection` count map.
 * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the
 * [MultiSet API documentation](https://rimbu.org/api/rimbu/multiset/MultiSet/interface).
 * @expandType MultiSetCreators
 */
export const MultiSet: MultiSetCreators = Object.freeze<MultiSetCreators>({
	createContext<UT>(options: {
		countMapContext: MapCollection.Context<
			MapCollection.Advanced.Family<UT, number>
		>;
	}): MultiSet.Context<UT> {
		return MultiSetContext.createDefault(options.countMapContext);
	},
});
