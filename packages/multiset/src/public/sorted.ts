import type { Collection } from '@rimbu/collection-types/collection';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { MultiSet } from '@rimbu/multiset';
import type { SortedMap } from '@rimbu/sorted/map';
import type { Stream } from '@rimbu/stream';

import { SortedMultiSetContext } from '#multiset/context-factory';

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
	extends SortedMultiSet.Advanced.Api<
		T,
		Collection.Advanced.Types<SortedMultiSet.Advanced.Family<T>, T>
	> {
	readonly countMap: SortedMap<T, number>;
	stream(options?: { reversed?: boolean }): Stream<T>;
}

export namespace SortedMultiSet {
	/**
	 * A non-empty type-invariant immutable MultiSet of value type T.
	 * See the [SortedMultiSet API documentation](https://rimbu.org/api/rimbu/multiset/SortedMultiSet/interface)
	 * @typeparam T - the value type
	 */
	export interface NonEmpty<T>
		extends Advanced.Api<
			T,
			Collection.Advanced.TypesNonEmpty<Advanced.Family<T>, T>
		> {
		readonly countMap: SortedMap.NonEmpty<T, number>;
		asNormal(): SortedMultiSet<T>;
		stream(options?: { reversed?: boolean }): Stream.NonEmpty<T>;
		streamDistinct(): Stream.NonEmpty<T>;
		streamWithCounts(): Stream.NonEmpty<readonly [T, number]>;
	}

	/**
	 * A mutable `SortedMultiSet` builder used to efficiently create new immutable instances.
	 * See the [SortedMultiSet.Builder API documentation](https://rimbu.org/api/rimbu/multiset/SortedMultiSet/Builder/interface)
	 * @typeparam T - the value type
	 */
	export interface Builder<T>
		extends Advanced.BuilderApi<
			T,
			Collection.Advanced.Types<Advanced.Family<T>, T>
		> {}

	/**
	 * A context instance for a `SortedMultiSet` that acts as a factory for every instance of this
	 * type of collection.
	 * @typeparam UT - the upper value type bound for which the context can be used
	 */
	export interface Context<UT>
		extends Advanced.ContextApi<UT, Advanced.Family<UT>> {
		readonly typeTag: 'SortedMultiSet';
	}

	export namespace Advanced {
		export interface Api<T, Tp extends Collection.Advanced.TypesBase>
			extends MultiSet.Advanced.Api<T, Tp> {}

		export interface BuilderApi<T, Tp extends Collection.Advanced.TypesBase>
			extends MultiSet.Advanced.BuilderApi<T, Tp> {}

		export interface ContextApi<UT, FAM extends MultiSet.Advanced.Family<UT>>
			extends MultiSet.Advanced.ContextApi<UT, FAM> {}

		export interface Family<T> extends MultiSet.Advanced.Family<T> {
			_NORMAL: SortedMultiSet<T>;
			_NON_EMPTY: SortedMultiSet.NonEmpty<T>;
			_BUILDER: SortedMultiSet.Builder<T>;
			_CONTEXT: SortedMultiSet.Context<T>;

			_UPPER_E: T;
			_INVARIANT: (element: T) => T;

			_FAM: Family<T>;
			_NEW_FAMILY: Family<this['_NEW_E']>;
		}

		export type DefaultFactory = Pick<
			Context<any>,
			'builder' | 'defaultContext' | 'empty' | 'from' | 'of' | 'reducer'
		> & {
			createContext<T>(options?: {
				countMapContext?:
					| MapCollection.Context<MapCollection.Advanced.Family<T, number>>
					| undefined;
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
	SortedMultiSetContext.createDefault();
