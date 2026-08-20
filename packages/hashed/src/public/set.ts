import type { Collection } from '@rimbu/collection-types/collection';
import type { SetCollection } from '@rimbu/collection-types/set';
import type { Eq } from '@rimbu/common';
import type { Hasher } from '@rimbu/hashed';
import type { List } from '@rimbu/list';

export interface HashSet<E>
	extends HashSet.Advanced.Api<
		E,
		Collection.Advanced.Types<HashSet.Advanced.Family<E>, E>
	> {}

export namespace HashSet {
	export interface NonEmpty<E>
		extends Advanced.Api<
			E,
			Collection.Advanced.TypesNonEmpty<Advanced.Family<E>, E>
		> {}

	export interface Builder<E>
		extends Advanced.BuilderApi<
			E,
			Collection.Advanced.Types<Advanced.Family<E>, E>
		> {}

	export interface Context<
		F extends Advanced.Family<any> = Advanced.Family<any>,
	> extends Advanced.ContextApi<F> {}

	export namespace Advanced {
		export type Api<
			E,
			Tp extends Collection.Advanced.TypesBase,
		> = Collection.Capability.WithFlatMap.Api<E, Tp> &
			Collection.Capability.WithMap.Api<E, Tp> &
			Collection.Capability.WithMutate.Api<E, Tp> &
			Collection.Capability.WithRecompose.Api<E, Tp> &
			Collection.Capability.WithToBuilder.Api<E, Tp> &
			SetCollection.Advanced.Api<E, Tp> &
			SetCollection.Capability.WithAdd.Api<E, Tp> &
			SetCollection.Capability.WithDifferenceAndIntersection.Api<E, Tp> &
			SetCollection.Capability.WithRemove.Api<E, Tp> &
			SetCollection.Capability.WithSymmetricDifferenceAndUnion.Api<E, Tp>;

		export type BuilderApi<
			E,
			Tp extends Collection.Advanced.TypesBase,
		> = SetCollection.Advanced.BuilderApi<E, Tp> &
			SetCollection.Capability.WithAdd.BuilderApi<E, Tp> &
			SetCollection.Capability.WithRemove.BuilderApi<E, Tp>;

		export interface ContextApi<F extends Collection.Advanced.FamilyBase<any>>
			extends SetCollection.Advanced.ContextApi<F> {
			readonly blockSizeBits: number;
			readonly hasher: Hasher<F['_UPPER_E']>;
			readonly eq: Eq<F['_UPPER_E']>;

			createContext<UE extends F['_UPPER_E']>(options: {
				hasher?: Hasher<UE> | undefined;
				eq?: Eq<UE> | undefined;
				blockSizeBits?: number | undefined;
				listContext?: List.Context | undefined;
			}): F['_CONTEXT'];
		}

		export interface Family<E> extends SetCollection.Advanced.Family<E> {
			_NORMAL: HashSet<E>;
			_NON_EMPTY: HashSet.NonEmpty<E>;
			_BUILDER: HashSet.Builder<E>;
			_CONTEXT: HashSet.Context;

			_INVARIANT: (element: E) => E;

			_FAM: Family<E>;
			_NEW_FAMILY: Family<this['_NEW_E']>;
		}

		export type DefaultFactory = Context<Advanced.Family<any>>;
	}
}

export const HashSet: HashSet.Advanced.DefaultFactory = 0 as any;

// /**
//  * A type-invariant immutable Set of value type T.
//  * In the Set, there are no duplicate values.
//  * See the [Set documentation](https://rimbu.org/docs/collections/set) and the [HashSet API documentation](https://rimbu.org/api/rimbu/hashed/HashSet/interface)
//  * @typeparam T - the value type
//  * @note
//  * - The `HashSet` uses the context's `hasher` instance to hash values for performance.
//  * - The `HashSet` uses the context's `eq` function to determine equivalence between values.
//  * @example
//  * ```ts
//  * import { HashSet } from '@rimbu/hashed';
//  *
//  * const s1 = HashSet.empty<string>();
//  * const s2 = HashSet.of('a', 'b', 'c');
//  * console.log(s2.toString()); // => HashSet(a, b, c)
//  * ```
//  */
// export interface HashSet<T> extends RSetBase<T, HashSet.Types> {}

// export namespace HashSet {
// 	/**
// 	 * A non-empty type-invariant immutable Set of value type T.
// 	 * In the Set, there are no duplicate values.
// 	 * See the [Set documentation](https://rimbu.org/docs/collections/set) and the [HashSet API documentation](https://rimbu.org/api/rimbu/hashed/HashSet/interface)
// 	 * @typeparam T - the value type
// 	 * @note
// 	 * - The `HashSet` uses the context's `hasher` instance to hash values for performance.
// 	 * - The `HashSet` uses the context's `eq` function to determine equivalence between values.
// 	 * @example
// 	 * ```ts
// 	 * import { HashSet } from '@rimbu/hashed';
// 	 *
// 	 * const s1 = HashSet.empty<string>();
// 	 * const s2 = HashSet.of('a', 'b', 'c');
// 	 * console.log(s2.toString()); // => HashSet(a, b, c)
// 	 * ```
// 	 */
// 	export interface NonEmpty<T>
// 		extends RSetBase.NonEmpty<T, HashSet.Types>,
// 			Omit<HashSet<T>, keyof RSetBase.NonEmpty<any, any>>,
// 			Streamable.NonEmpty<T> {}

// 	/**
// 	 * A context instance for a `HashSet` that acts as a factory for every instance of this
// 	 * type of collection.
// 	 * @typeparam UT - the upper value bound for which the context can be used
// 	 */
// 	export interface Context<UT> extends RSetBase.Context<UT, HashSet.Types> {
// 		readonly typeTag: 'HashSet';

// 		/**
// 		 * A `Hasher` instance used to hash the values.
// 		 */
// 		readonly hasher: Hasher<UT>;
// 		/**
// 		 * An `Eq` instance used to check value equivalence.
// 		 */
// 		readonly eq: Eq<UT>;
// 	}

// 	/**
// 	 * A mutable `HashSet` builder used to efficiently create new immutable instances.
// 	 * See the [Set documentation](https://rimbu.org/docs/collections/set) and the [HashSet.Builder API documentation](https://rimbu.org/api/rimbu/hashed/HashSet/Builder/interface)
// 	 * @typeparam T - the value type
// 	 */
// 	export interface Builder<T> extends RSetBase.Builder<T, HashSet.Types> {}

// 	/**
// 	 * Utility interface that provides higher-kinded types for this collection.
// 	 */
// 	export interface Types extends RSetBase.Types {
// 		readonly normal: HashSet<this['_T']>;
// 		readonly nonEmpty: HashSet.NonEmpty<this['_T']>;
// 		readonly context: HashSet.Context<this['_T']>;
// 		readonly builder: HashSet.Builder<this['_T']>;
// 	}
// }

// /**
//  * @expandType HashSetCreators
//  */
// export const HashSet: HashSetCreators = createHashSetContextModule().build();
