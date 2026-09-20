import type { Collection } from '@rimbu/collection-types/collection';
import type { MultiSetCollection } from '@rimbu/multiset';

import { SortedMap } from '@rimbu/sorted/map';

import { MultiSetContext } from '#multiset/context-factory';

/**
 * A type-invariant immutable MultiSet of value type T.
 * In the MultiSet, each value can occur multiple times.
 * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the [SortedMultiSet API documentation](https://rimbu.org/api/rimbu/multiset/SortedMultiSet/interface)
 * @typeparam T - the value type
 * @note
 * - The `SortedMultiSet` uses the contexts' `SortedMap` `countMapContext` to sort
 * the values.
 * @example
 * ```ts
 * import { SortedMultiSet } from '@rimbu/multiset/sorted';
 *
 * console.log(SortedMultiSet.empty<string>().toArray()); // => []
 * console.log(SortedMultiSet.of('a', 'b', 'a', 'c').toArray()); // => [ "a", "a", "b", "c" ]
 * ```
 */
export interface SortedMultiSet<T>
	extends MultiSetCollection.Advanced.Api<
		T,
		Collection.Advanced.Types<SortedMultiSet.Advanced.Family<T>, T>
	> {}

export namespace SortedMultiSet {
	/**
	 * A non-empty type-invariant immutable MultiSet of value type T.
	 * See the [SortedMultiSet API documentation](https://rimbu.org/api/rimbu/multiset/SortedMultiSet/interface)
	 * @typeparam T - the value type
	 */
	export interface NonEmpty<T>
		extends MultiSetCollection.Advanced.Api<
			T,
			Collection.Advanced.TypesNonEmpty<Advanced.Family<T>, T>
		> {}

	/**
	 * A mutable `SortedMultiSet` builder used to efficiently create new immutable instances.
	 * See the [SortedMultiSet.Builder API documentation](https://rimbu.org/api/rimbu/multiset/SortedMultiSet/Builder/interface)
	 * @typeparam T - the value type
	 */
	export interface Builder<T>
		extends MultiSetCollection.Advanced.BuilderApi<
			T,
			Collection.Advanced.Types<Advanced.Family<T>, T>
		> {}

	/**
	 * A context instance for a `SortedMultiSet` that acts as a factory for every instance of this
	 * type of collection.
	 * @typeparam UT - the upper value type bound for which the context can be used
	 */
	export interface Context<UT>
		extends MultiSetCollection.Advanced.ContextApi<UT, Advanced.Family<UT>> {
		readonly typeTag: 'SortedMultiSet';
	}

	export namespace Advanced {
		export interface Family<T>
			extends MultiSetCollection.Advanced.FamilyBase<T> {
			_NORMAL: SortedMultiSet<T>;
			_NON_EMPTY: SortedMultiSet.NonEmpty<T>;
			_BUILDER: SortedMultiSet.Builder<T>;
			_CONTEXT: SortedMultiSet.Context<T>;

			_COUNT_MAP_CONTEXT: SortedMap.Context<T>;
			_COUNT_MAP: SortedMap<T, number>;
			_COUNT_MAP_NON_EMPTY: SortedMap.NonEmpty<T, number>;

			_FAM: Family<T>;
			_NEW_FAMILY: Family<this['_NEW_E']>;
		}

		export type DefaultFactory = Pick<
			Context<any>,
			'builder' | 'defaultContext' | 'empty' | 'from' | 'of' | 'reducer'
		> & {
			createContext<T>(options?: {
				countMapContext?: SortedMap.Context<T> | undefined;
			}): Context<T>;
		};
	}
}

/**
 * The default `SortedMultiSet` creators and context.
 *
 * Use this exported value to create and work with immutable `SortedMultiSet` instances.
 * See the [SortedMultiSet API documentation](https://rimbu.org/api/rimbu/multiset/SortedMultiSet/interface).
 */
export const SortedMultiSet: SortedMultiSet.Advanced.DefaultFactory =
	MultiSetContext.createDefault(
		SortedMap.collectionContext,
		'SortedMultiSet',
	) as any as SortedMultiSet.Advanced.DefaultFactory;
