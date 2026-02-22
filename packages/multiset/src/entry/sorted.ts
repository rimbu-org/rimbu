import type { SortedMultiSetCreators } from '@rimbu/multiset/internal/creators';
import type { Stream, Streamable } from '@rimbu/stream';

import type { MultiSetBase } from '#multiset/types';

import { createMultiSetContextModule } from '@rimbu/multiset/internal/context-factory';
import { SortedMap } from '@rimbu/sorted/map';

/**
 * A type-invariant immutable MultiSet of value type T.
 * In the MultiSet, each value can occur multiple times.
 * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the [SortedMultiSet API documentation](https://rimbu.org/api/rimbu/multiset/SortedMultiSet/interface)
 * @typeparam T - the value type
 * @note
 * - The `SortedMultiSet` uses the contexts' `SortedMap` `mapContext` to sort
 * the values.
 * @example
 * ```ts
 * const s1 = SortedMultiSet.empty<string>()
 * const s2 = SortedMultiSet.of('a', 'b', 'a', 'c')
 * ```
 */
export interface SortedMultiSet<T>
	extends MultiSetBase<T, SortedMultiSet.Types> {
	stream(options?: { reversed?: boolean }): Stream<T>;
}

export namespace SortedMultiSet {
	/**
	 * A type-invariant immutable MultiSet of value type T.
	 * In the MultiSet, each value can occur multiple times.
	 * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the [SortedMultiSet API documentation](https://rimbu.org/api/rimbu/multiset/SortedMultiSet/interface)
	 * @typeparam T - the value type
	 * @note
	 * - The `SortedMultiSet` uses the contexts' `SortedMap` `mapContext` to sort
	 * the values.
	 * @example
	 * ```ts
	 * const s1 = SortedMultiSet.empty<string>()
	 * const s2 = SortedMultiSet.of('a', 'b', 'a', 'c')
	 * ```
	 */
	export interface NonEmpty<T>
		extends MultiSetBase.NonEmpty<T, SortedMultiSet.Types>,
			Omit<SortedMultiSet<T>, keyof MultiSetBase.NonEmpty<any, any>>,
			Streamable.NonEmpty<T> {
		stream(options?: { reversed?: boolean }): Stream.NonEmpty<T>;
	}

	/**
	 * A context instance for an `SortedMultiSet` that acts as a factory for every instance of this
	 * type of collection.
	 * @typeparam UT - the upper value type bound for which the context can be used
	 */
	export interface Context<UT>
		extends MultiSetBase.Context<UT, SortedMultiSet.Types> {
		readonly typeTag: 'SortedMultiSet';
	}

	/**
	 * A mutable `SortedMultiSet` builder used to efficiently create new immutable instances.
	 * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the [SortedMultiSet.Builder API documentation](https://rimbu.org/api/rimbu/multiset/SortedMultiSet/Builder/interface)
	 * @typeparam T - the value type
	 */
	export interface Builder<T>
		extends MultiSetBase.Builder<T, SortedMultiSet.Types> {}

	/**
	 * Utility interface that provides higher-kinded types for this collection.
	 */
	export interface Types extends MultiSetBase.Types {
		readonly normal: SortedMultiSet<this['_T']>;
		readonly nonEmpty: SortedMultiSet.NonEmpty<this['_T']>;
		readonly context: SortedMultiSet.Context<this['_T']>;
		readonly builder: SortedMultiSet.Builder<this['_T']>;
		readonly countMap: SortedMap<this['_T'], number>;
		readonly countMapNonEmpty: SortedMap.NonEmpty<this['_T'], number>;
		readonly countMapContext: SortedMap.Context<this['_T']>;
	}
}

/**
 * The default `SortedMultiSet` creators and context.
 *
 * Use this exported value to create and work with immutable `SortedMultiSet` instances.
 * See the [MultiSet documentation](https://rimbu.org/docs/collections/multiset) and the
 * [SortedMultiSet API documentation](https://rimbu.org/api/rimbu/multiset/SortedMultiSet/interface).
 */
export const SortedMultiSet: SortedMultiSetCreators =
	createMultiSetContextModule('SortedMultiSet', {
		get countMapContext() {
			return SortedMap.defaultContext();
		},
	}).build();
