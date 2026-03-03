import type { ListBase } from '@rimbu/list/internal/list-base';

/**
 * A random accessible immutable sequence of values of type T.
 * See the [List documentation](https://rimbu.org/docs/collections/list) and the [List API documentation](https://rimbu.org/api/rimbu/list/List/interface)
 * @typeparam T - the value type
 * @example
 * ```ts
 * const l1 = List.empty<string>()
 * const l2 = List.of(1, 3, 2)
 * ```
 */
export interface List<T> extends ListBase<T, List.Types> {}

export namespace List {
	/**
	 * A non-empty random accessible immutable sequence of values of type T.
	 * See the [List documentation](https://rimbu.org/docs/collections/list) and the [List API documentation](https://rimbu.org/api/rimbu/list/List/interface)
	 * @typeparam T - the value type
	 * @example
	 * ```ts
	 * const l = List.of(1, 3, 2)
	 * ```
	 */
	export interface NonEmpty<T>
		extends ListBase.NonEmpty<T, List.Types>,
			Omit<List<T>, keyof ListBase.NonEmpty<any>> {}

	/**
	 * A mutable builder to create immutable `List` instances in a more efficient way.
	 * See the [List documentation](https://rimbu.org/docs/collections/list) and the [List.Builder API documentation](https://rimbu.org/api/rimbu/list/List/Builder/interface)
	 * @typeparam T - the value type
	 * @example
	 * ```ts
	 * const b = List.builder<T>();
	 * b.append(1);
	 * b.prepend(2);
	 * b.insert(1, 3);
	 * b.build().toArray();
	 * // => [2, 3, 1]
	 * ```
	 */
	export interface Builder<T> extends ListBase.Builder<T, List.Types> {}

	/**
	 * A context instance for `List` that acts as a factory for every instance of this
	 * type of collection.
	 */
	export interface Context extends ListBase.Context<List.Types> {
		readonly typeTag: 'List';
	}

	/**
	 * A utility interface to extract related List types.
	 */
	export interface Types extends ListBase.Types {
		readonly _UT: any;
		readonly context: List.Context;
		readonly normal: List<this['_T']>;
		readonly nonEmpty: List.NonEmpty<this['_T']>;
		readonly builder: List.Builder<this['_T']>;
	}
}

/**
 * The default `List` creators and context.
 *
 * Use this exported value to create and work with immutable `List` instances.
 * See the [List documentation](https://rimbu.org/docs/collections/list) and the [List API documentation](https://rimbu.org/api/rimbu/list/List/interface).
 * @expandType ListCreators
 */
export const List: ListBase.Factory<List.Types> = 0 as any;
