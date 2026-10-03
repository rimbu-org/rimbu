import type { Collection } from '@rimbu/collection-types/collection';
import type { ValuedCollection } from '@rimbu/collection-types/collection/valued';
import type { MultiSetCollection } from '@rimbu/multiset/advanced/multiset-base';

import { HashMap } from '@rimbu/hashed';

import { MultiSetContextImpl } from '#multiset/context-factory';

/**
 * A type-invariant immutable MultiSet of value type T.
 * In the MultiSet, each value can occur multiple times.
 * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the [MultiSet API documentation](https://rimbu.org/api/rimbu/multiset/MultiSet/interface)
 * @typeparam T - the value type
 */
export interface MultiSet<T>
	extends MultiSetCollection.Advanced.Api<
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
		extends MultiSetCollection.Advanced.Api<
			T,
			Collection.Advanced.TypesNonEmpty<Advanced.Family<T>, T>
		> {}

	/**
	 * A mutable `MultiSet` builder used to efficiently create new immutable instances.
	 * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the [MultiSet.Builder API documentation](https://rimbu.org/api/rimbu/multiset/MultiSet/Builder/interface)
	 * @typeparam T - the value type
	 */
	export interface Builder<T>
		extends MultiSetCollection.Advanced.BuilderApi<
			T,
			Collection.Advanced.Types<Advanced.Family<T>, T>
		> {}

	/**
	 * A context instance for `MultiSet` implementations that acts as a factory for every instance of this
	 * type of collection.
	 * @typeparam UT - the upper value type bound for which the context can be used
	 */
	export interface Context<UT>
		extends MultiSetCollection.Advanced.ContextApi<UT, Advanced.Family<UT>> {}

	export namespace Advanced {
		/**
		 * The default MultiSet family. Concrete variants extend this and pin the
		 * HKT slots to their own collection types.
		 */
		export interface Family<T>
			extends MultiSetCollection.Advanced.FamilyBase<T>,
				ValuedCollection.Advanced.Family<T>,
				Collection.Capability.WithAdd<T>,
				Collection.Capability.WithAddEach<T>,
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
 * The `MultiSet` creators and default context.
 *
 * Use this exported value to create and work with an immutable `MultiSet`. It is a
 * complete {@link MultiSet.Context}, backed by a `HashMap` count map — the same
 * default `MultiMap` and `BiMultiMap` use for their root const.
 * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the
 * [MultiSet API documentation](https://rimbu.org/api/rimbu/multiset/MultiSet/interface).
 * @expandType MultiSetCreators
 */
export const MultiSet: MultiSet.Context<any> =
	MultiSetContextImpl.createDefault(HashMap.collectionContext);

/**
 * @deprecated `createContext` moved onto the shared
 * {@link MultiSetCollection.Advanced.ContextApi}, so every `MultiSet` context exposes
 * it and the root const is now an ordinary context. This alias is kept so existing
 * references keep resolving; it is just the context type.
 */
export type MultiSetCreators = MultiSet.Context<any>;
