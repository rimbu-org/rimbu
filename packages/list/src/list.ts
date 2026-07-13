import type { ListBase } from '#list/list-base';

import { ListHelpers } from '#list/list-helpers';

/**
 * A random accessible immutable sequence of values of type T.
 * See the [List documentation](https://rimbu.org/docs/collections/list) and the [List API documentation](https://rimbu.org/api/rimbu/list/List/interface)
 * @typeparam T - the value type
 * @note
 * - The `List` is implemented as a block-based balanced tree, giving efficient
 *   random access, updates, and concatenation regardless of size.
 * - Indices follow mathematical convention: a negative index counts from the end,
 *   e.g. -1 is the last value.
 * @example
 * ```ts
 * const l1 = List.empty<number>()
 * const l2 = List.of(1, 2, 3)
 * ```
 */
export interface List<T> extends ListBase<T, ListHelpers.Types> {}

export namespace List {
	export interface NonEmpty<T>
		extends ListBase.NonEmpty<T, ListHelpers.Types>,
			Omit<List<T>, keyof ListBase.NonEmpty<any>> {}

	export interface Builder<T> extends ListBase.Builder<T, ListHelpers.Types> {}

	export interface Context extends ListHelpers.Context {}
}

export const List: ListHelpers.Factory = ListHelpers.createListContext();
