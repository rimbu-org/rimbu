import type { Collection } from '@rimbu/collection-types/collection';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { HashMap } from '@rimbu/hashed';
import type { MultiSet } from '@rimbu/multiset';
import type { Stream } from '@rimbu/stream';

import { HashMultiSetContext } from '#multiset/context-factory';

/**
 * A type-invariant immutable MultiSet of value type T.
 * In the MultiSet, each value can occur multiple times.
 * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the [HashMultiSet API documentation](https://rimbu.org/api/rimbu/multiset/HashMultiSet/interface)
 * @typeparam T - the value type
 * @note
 * - The `HashMultiSet` uses the contexts' `HashMap` `countMapContext` to hash
 * the values.
 * @example
 * ```ts
 * import { HashMultiSet } from '@rimbu/multiset/hashed';
 *
 * console.log(HashMultiSet.empty<string>().toArray()); // => []
 * console.log(HashMultiSet.of('a', 'b', 'a', 'c').toArray()); // => [ "a", "a", "b", "c" ]
 * ```
 */
export interface HashMultiSet<T>
	extends HashMultiSet.Advanced.Api<
		T,
		Collection.Advanced.Types<HashMultiSet.Advanced.Family<T>, T>
	> {
	readonly countMap: HashMap<T, number>;
}

export namespace HashMultiSet {
	/**
	 * A non-empty type-invariant immutable MultiSet of value type T.
	 * See the [HashMultiSet API documentation](https://rimbu.org/api/rimbu/multiset/HashMultiSet/interface)
	 * @typeparam T - the value type
	 */
	export interface NonEmpty<T>
		extends Advanced.Api<
			T,
			Collection.Advanced.TypesNonEmpty<Advanced.Family<T>, T>
		> {
		readonly countMap: HashMap.NonEmpty<T, number>;
		asNormal(): HashMultiSet<T>;
		stream(): Stream.NonEmpty<T>;
		streamDistinct(): Stream.NonEmpty<T>;
		streamWithCounts(): Stream.NonEmpty<readonly [T, number]>;
	}

	/**
	 * A mutable `HashMultiSet` builder used to efficiently create new immutable instances.
	 * See the [HashMultiSet.Builder API documentation](https://rimbu.org/api/rimbu/multiset/HashMultiSet/Builder/interface)
	 * @typeparam T - the value type
	 */
	export interface Builder<T>
		extends Advanced.BuilderApi<
			T,
			Collection.Advanced.Types<Advanced.Family<T>, T>
		> {}

	/**
	 * A context instance for a `HashMultiSet` that acts as a factory for every instance of this
	 * type of collection.
	 * @typeparam UT - the upper value type bound for which the context can be used
	 */
	export interface Context<UT>
		extends Advanced.ContextApi<UT, Advanced.Family<UT>> {
		readonly typeTag: 'HashMultiSet';
	}

	export namespace Advanced {
		export interface Api<T, Tp extends Collection.Advanced.TypesBase>
			extends MultiSet.Advanced.Api<T, Tp> {}

		export interface BuilderApi<T, Tp extends Collection.Advanced.TypesBase>
			extends MultiSet.Advanced.BuilderApi<T, Tp> {}

		export interface ContextApi<UT, FAM extends MultiSet.Advanced.Family<UT>>
			extends MultiSet.Advanced.ContextApi<UT, FAM> {}

		export interface Family<T> extends MultiSet.Advanced.Family<T> {
			_NORMAL: HashMultiSet<T>;
			_NON_EMPTY: HashMultiSet.NonEmpty<T>;
			_BUILDER: HashMultiSet.Builder<T>;
			_CONTEXT: HashMultiSet.Context<T>;

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
 * The default `HashMultiSet` creators and context.
 *
 * Use this exported value to create and work with immutable `HashMultiSet` instances.
 * See the [HashMultiSet API documentation](https://rimbu.org/api/rimbu/multiset/HashMultiSet/interface).
 */
export const HashMultiSet: HashMultiSet.Advanced.DefaultFactory =
	HashMultiSetContext.createDefault();
