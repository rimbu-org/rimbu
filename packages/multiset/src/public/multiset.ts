import type { Collection } from '@rimbu/collection-types/collection';
import type { ValuedCollection } from '@rimbu/collection-types/collection/valued';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { MultiSetCollection } from '@rimbu/multiset/advanced/multiset-base';

import { MultiSetContext } from '#multiset/context-factory';

/**
 * A type-invariant immutable MultiSet of value type T, backed by the count-map
 * family `F`.
 *
 * This is the generic entry point: `F` selects the kind of `MapCollection` used
 * to store the value→count mapping, and the resulting `countMap` (and matching
 * context) are concretely typed. Use {@link MultiSet} for the default
 * `MapCollection`-typed variant, or alias this base directly to obtain a
 * concretely typed MultiSet over any map:
 *
 * ```ts
 * import { HashMap } from '@rimbu/hashed/map';
 * type HashMultiSet<T> = MultiSetBase<T, HashMap.Advanced.Family<T, number>>;
 * ```
 *
 * In the MultiSet, each value can occur multiple times.
 * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the [MultiSet API documentation](https://rimbu.org/api/rimbu/multiset/MultiSet/interface)
 * @typeparam T - the value type
 * @typeparam F - the count-map family, defaulting to the generic `MapCollection`
 */
export interface MultiSetBase<
	T,
	F extends
		MultiSetCollection.Advanced.CountMapFamily<T> = MultiSetCollection.Advanced.CountMapFamily<T>,
> extends MultiSetCollection.Advanced.Api<
		T,
		Collection.Advanced.Types<MultiSet.Advanced.Family<T, F>, T>
	> {}

export namespace MultiSetBase {
	/**
	 * A non-empty type-invariant immutable MultiSet of value type T, backed by
	 * the count-map family `F`.
	 * @typeparam T - the value type
	 * @typeparam F - the count-map family
	 */
	export interface NonEmpty<
		T,
		F extends
			MultiSetCollection.Advanced.CountMapFamily<T> = MultiSetCollection.Advanced.CountMapFamily<T>,
	> extends MultiSetCollection.Advanced.Api<
			T,
			Collection.Advanced.TypesNonEmpty<MultiSet.Advanced.Family<T, F>, T>
		> {}

	/**
	 * A mutable `MultiSet` builder used to efficiently create new immutable instances.
	 * @typeparam T - the value type
	 * @typeparam F - the count-map family
	 */
	export interface Builder<
		T,
		F extends
			MultiSetCollection.Advanced.CountMapFamily<T> = MultiSetCollection.Advanced.CountMapFamily<T>,
	> extends MultiSetCollection.Advanced.BuilderApi<
			T,
			Collection.Advanced.Types<MultiSet.Advanced.Family<T, F>, T>
		> {}

	/**
	 * A context instance for `MultiSet` implementations that acts as a factory
	 * for every instance of this type of collection.
	 * @typeparam UT - the upper value type bound for which the context can be used
	 * @typeparam F - the count-map family
	 */
	export interface Context<
		UT,
		F extends
			MultiSetCollection.Advanced.CountMapFamily<UT> = MultiSetCollection.Advanced.CountMapFamily<UT>,
	> extends MultiSetCollection.Advanced.ContextApi<
			UT,
			MultiSet.Advanced.Family<UT, F>
		> {}
}

/**
 * A type-invariant immutable MultiSet of value type T.
 * In the MultiSet, each value can occur multiple times.
 * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the [MultiSet API documentation](https://rimbu.org/api/rimbu/multiset/MultiSet/interface)
 * @typeparam T - the value type
 */
export interface MultiSet<T>
	extends MultiSetBase<T, MultiSetCollection.Advanced.CountMapFamily<T>> {}

export namespace MultiSet {
	/**
	 * A non-empty type-invariant immutable MultiSet of value type T.
	 * In the MultiSet, each value can occur multiple times.
	 * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the [MultiSet API documentation](https://rimbu.org/api/rimbu/multiset/MultiSet/interface)
	 * @typeparam T - the value type
	 */
	export interface NonEmpty<T>
		extends MultiSetBase.NonEmpty<
			T,
			MultiSetCollection.Advanced.CountMapFamily<T>
		> {}

	/**
	 * A mutable `MultiSet` builder used to efficiently create new immutable instances.
	 * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the [MultiSet.Builder API documentation](https://rimbu.org/api/rimbu/multiset/MultiSet/Builder/interface)
	 * @typeparam T - the value type
	 */
	export interface Builder<T>
		extends MultiSetBase.Builder<
			T,
			MultiSetCollection.Advanced.CountMapFamily<T>
		> {}

	/**
	 * A context instance for `MultiSet` implementations that acts as a factory for every instance of this
	 * type of collection.
	 * @typeparam UT - the upper value type bound for which the context can be used
	 */
	export interface Context<UT>
		extends MultiSetBase.Context<
			UT,
			MultiSetCollection.Advanced.CountMapFamily<UT>
		> {}

	export namespace Advanced {
		/**
		 * The generic MultiSet family. It carries the count-map family `F` so that
		 * the concrete `countMap`/context types are preserved through element
		 * retyping (`map`/`flatMap`) and NonEmpty refinement.
		 *
		 * Concrete variants extend this and pin both the collection slots and `F`.
		 */
		export interface Family<
			T,
			F extends
				MultiSetCollection.Advanced.AnyFamily = MultiSetCollection.Advanced.CountMapFamily<T>,
		> extends MultiSetCollection.Advanced.FamilyBase<T, F>,
				ValuedCollection.Advanced.Family<T>,
				Collection.Capability.WithAdd<T>,
				Collection.Capability.WithAddAll<T>,
				Collection.Capability.WithToBuilder<T> {
			_NORMAL: MultiSetBase<
				T,
				F & MultiSetCollection.Advanced.CountMapFamily<T>
			>;
			_NON_EMPTY: MultiSetBase.NonEmpty<
				T,
				F & MultiSetCollection.Advanced.CountMapFamily<T>
			>;
			_BUILDER: MultiSetBase.Builder<
				T,
				F & MultiSetCollection.Advanced.CountMapFamily<T>
			>;
			_CONTEXT: MultiSetBase.Context<
				T,
				F & MultiSetCollection.Advanced.CountMapFamily<T>
			>;

			_UPPER_E: T;
			_INVARIANT: (element: T) => T;

			_FAM: Family<T, F>;
			_NEW_FAMILY: Family<
				this['_NEW_E'],
				Collection.Advanced.ReTypeFam<F, readonly [this['_NEW_E'], number]>
			>;
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
		typeTag: string;
	}): MultiSet.Context<UT> {
		return MultiSetContext.createDefault(
			options.countMapContext,
			options.typeTag,
		);
	},
});
