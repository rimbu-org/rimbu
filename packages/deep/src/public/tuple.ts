import type { Update } from '@rimbu/common/update';

import * as Arr from '@rimbu/base/arr';

/**
 * A readonly array of fixed length and types.
 */
export type Tuple<T extends Tuple.Source> = Readonly<T>;

export namespace Tuple {
	/**
	 * A non-empty readonly array that can serve as a source for a Tuple.
	 */
	export type NonEmptySource = readonly [unknown, ...unknown[]];

	/**
	 * A readonly array that can serve as a source for a Tuple.
	 */
	export type Source = readonly unknown[];

	/**
	 * Determines whether the given type `T` is a tuple type.
	 * @typeparam T - the input type
	 */
	export type IsTuple<T> = T extends { length: infer L }
		? 0 extends L
			? false
			: true
		: false;

	/**
	 * Returns the indices/keys that are in a tuple.
	 * @typeparam T - the input tuple type
	 */
	export type KeysOf<T> = { [K in keyof T]: K }[keyof T & number];

	/**
	 * Convenience method to type Tuple types
	 * @typeparam T - the tuple source type
	 * @param values - the values of the tuple
	 * @returns a `Tuple<T>` containing the provided values
	 * @example
	 * ```ts
	 * const t = Tuple.of(1, 'a', true)
	 * // type of t => Tuple<[number, string, boolean]>
	 * ```
	 */
	export function of<T extends Tuple.NonEmptySource>(...values: T): Tuple<T> {
		return values as any;
	}

	/**
	 * Returns the item at the given `index` in the given `tuple`.
	 * @typeparam T - the tuple source type
	 * @typeparam K - the index/key type
	 * @param tuple - the tuple to get the item from
	 * @param index - the index of the tuple element
	 * @returns the tuple element at `index`
	 * @example
	 * ```ts
	 * const t = Tuple.of(1, 'a', true)
	 * console.log(Tuple.getIndex(t, 1))
	 * // => 'a'
	 * ```
	 */
	export function getIndex<T extends Tuple.Source, K extends keyof T = keyof T>(
		tuple: T,
		index: K,
	): T[K] {
		return tuple[index];
	}

	/**
	 * Returns the first element of a Tuple.
	 * @typeparam T - the tuple source type
	 * @param tuple - the source tuple
	 * @returns the first element of `tuple`
	 * @example
	 * ```ts
	 * const t = Tuple.of(1, 'a', true)
	 * console.log(Tuple.first(t))
	 * // => 1
	 * ```
	 */
	export function first<T extends Tuple.Source>(tuple: T): T[0] {
		return tuple[0];
	}

	/**
	 * Returns the second element of a Tuple.
	 * @typeparam T - the tuple source type
	 * @param tuple - the source tuple
	 * @returns the second element of `tuple`
	 * @example
	 * ```ts
	 * const t = Tuple.of(1, 'a', true)
	 * console.log(Tuple.second(t))
	 * // => 'a'
	 * ```
	 */
	export function second<T extends Tuple.Source>(tuple: T): T[1] {
		return tuple[1];
	}

	/**
	 * Returns the last element of a Tuple.
	 * @typeparam T - tail tuple element types
	 * @typeparam R - the last element type
	 * @param tuple - the source tuple
	 * @returns the last element of `tuple`
	 * @example
	 * ```ts
	 * const t = Tuple.of(1, 'a', true)
	 * console.log(Tuple.last(t))
	 * // => true
	 * ```
	 */
	export function last<T extends readonly unknown[], R>(
		tuple: readonly [...T, R],
	): R {
		return tuple[tuple.length - 1] as any;
	}

	/**
	 * Returns a copy of the given `tuple` where the element at given `index` is updated with the
	 * given `updater`.
	 * @typeparam T - the tuple source type
	 * @typeparam K - the index/key type
	 * @param tuple - the source tuple
	 * @param index - the index in the tuple
	 * @param updater - the updater for the value
	 * @returns a new tuple with the value at `index` updated
	 * @example
	 * ```ts
	 * const t = Tuple.of(1, 'a', true)
	 * console.log(Tuple.updateAt(t, 1, 'b'))
	 * // => [1, 'b', true]
	 * ```
	 */
	export function updateAt<T extends Tuple.Source, K extends keyof T = keyof T>(
		tuple: T,
		index: K,
		updater: Update<T[K]>,
	): T {
		return Arr.update(tuple, index as number, updater) as T;
	}

	/**
	 * Returns the given `tuple` with the given `values` appended.
	 * @typeparam T - the tuple source type
	 * @typeparam V - the values to append tuple type
	 * @param tuple - the source tuple
	 * @param values - the values to append
	 * @returns a new tuple with `values` appended to `tuple`
	 * @example
	 * ```ts
	 * const t = Tuple.of(1, 'a')
	 * console.log(Tuple.append(t, true, 5))
	 * // => [1, 'a', true, 5]
	 * ```
	 */
	export function append<
		T extends Tuple.Source,
		V extends readonly [unknown, ...unknown[]],
	>(tuple: T, ...values: V): readonly [...T, ...V] {
		return [...tuple, ...values];
	}

	/**
	 * Returns a Tuple containing the elements of given `tuple1` followed by the elements
	 * of given `tuple2`.
	 * @typeparam T1 - the first tuple source type
	 * @typeparam T2 - the second tuple source type
	 * @param tuple1 - the first Tuple
	 * @param tuple2 - the second Tuple
	 * @returns a new tuple containing elements of `tuple1` followed by `tuple2`
	 * @example
	 * ```ts
	 * const t1 = Tuple.of(1, 'a')
	 * const t2 = Tuple.of(true, 5)
	 * console.log(Tuple.concat(t1, t2))
	 * // => [1, 'a', true, 5]
	 * ```
	 */
	export function concat<T1 extends Tuple.Source, T2 extends Tuple.Source>(
		tuple1: T1,
		tuple2: T2,
	): readonly [...T1, ...T2] {
		return tuple1.concat(tuple2) as any;
	}

	/**
	 * Returns a Tuple containing all but the last element of the given `tuple`.
	 * @typeparam T - the tuple element types
	 * @param tuple - the source tuple
	 * @returns a tuple with the last element removed
	 * @example
	 * ```ts
	 * const t = Tuple.of(1, 'a', true)
	 * console.log(Tuple.init(t))
	 * // => [1, 'a']
	 * ```
	 */
	export function init<T extends readonly unknown[]>(
		tuple: readonly [...T, unknown],
	): Readonly<T> {
		return Arr.init(tuple) as any;
	}

	/**
	 * Returns a Tuple containing all but the first element of the given `tuple`.
	 * @typeparam T - the tail tuple element types
	 * @param tuple - the source tuple
	 * @returns a tuple containing all but the first element
	 * @example
	 * ```ts
	 * const t = Tuple.of(1, 'a', true)
	 * console.log(Tuple.tail(t))
	 * // => ['a', true]
	 * ```
	 */
	export function tail<T extends readonly [...unknown[]]>(
		tuple: readonly [unknown, ...T],
	): Readonly<T> {
		return Arr.tail(tuple) as any;
	}
}
