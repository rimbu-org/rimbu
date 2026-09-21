import type { MapCollection } from '@rimbu/collection-types/map';
import type { MultiSetCollection } from '@rimbu/multiset/advanced/multiset-collection';

import { MultiSetContext } from '#multiset/context-factory';

/**
 * A type-invariant immutable MultiSet of value type T.
 * In the MultiSet, each value can occur multiple times.
 * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the [MultiSet API documentation](https://rimbu.org/api/rimbu/multiset/MultiSet/interface)
 * @typeparam T - the value type
 */
export interface MultiSet<T>
	extends MultiSetCollection<
		T,
		MultiSetCollection.Advanced.CountMapFamily<T>
	> {}

export namespace MultiSet {
	/**
	 * A non-empty type-invariant immutable MultiSet of value type T.
	 * In the MultiSet, each value can occur multiple times.
	 * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the [MultiSet API documentation](https://rimbu.org/api/rimbu/multiset/MultiSet/interface)
	 * @typeparam T - the value type
	 */
	export interface NonEmpty<T>
		extends MultiSetCollection.NonEmpty<
			T,
			MultiSetCollection.Advanced.CountMapFamily<T>
		> {}

	/**
	 * A mutable `MultiSet` builder used to efficiently create new immutable instances.
	 * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the [MultiSet.Builder API documentation](https://rimbu.org/api/rimbu/multiset/MultiSet/Builder/interface)
	 * @typeparam T - the value type
	 */
	export interface Builder<T>
		extends MultiSetCollection.Builder<
			T,
			MultiSetCollection.Advanced.CountMapFamily<T>
		> {}

	/**
	 * A context instance for `MultiSet` implementations that acts as a factory for every instance of this
	 * type of collection.
	 * @typeparam UT - the upper value type bound for which the context can be used
	 */
	export interface Context<UT>
		extends MultiSetCollection.Context<
			UT,
			MultiSetCollection.Advanced.CountMapFamily<UT>
		> {}

	export namespace Advanced {
		/**
		 * The generic MultiSet family. It carries the count-map family `F` so that
		 * the concrete `countMap`/context types are preserved through element
		 * retyping (e.g. the `filterWithCounts` type-guard overloads) and NonEmpty
		 * refinement.
		 *
		 * This is an alias of {@link MultiSetCollection.Advanced.Family}; the
		 * concrete variants pin `F`.
		 */
		export type Family<
			T,
			F extends
				MultiSetCollection.Advanced.AnyFamily = MultiSetCollection.Advanced.CountMapFamily<T>,
		> = MultiSetCollection.Advanced.Family<T, F>;
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
		typeTag: string;
	}): MultiSet.Context<UT> {
		return MultiSetContext.createDefault(
			options.countMapContext,
			options.typeTag,
		);
	},
});
