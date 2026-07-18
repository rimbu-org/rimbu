import type { Elem, WithElem } from '@rimbu/collection-types/advanced/common';
import type { CollectFun } from '@rimbu/common/collect';
import type { Comp } from '@rimbu/common/comp';
import type { IndexRange } from '@rimbu/common/index-range';
import type { OptLazy } from '@rimbu/common/opt-lazy';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type {
	ArrayNonEmpty,
	SuperOf,
	WithValueResult,
} from '@rimbu/common/types';
import type {
	FastIterable,
	Stream,
	Streamable,
	StreamSource,
} from '@rimbu/stream';
import type { Reducer } from '@rimbu/stream/reducer';

export interface ListBase<T, Tp extends ListBase.Types = ListBase.Types>
	extends FastIterable<T>,
		Streamable<T> {
	/**
	 * The list context that acts as a factory for all related list instances.
	 */
	readonly context: Tp['context'];
	/**
	 * Returns the number of values in the collection
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * console.log(List.empty<number>().length); // => 0
	 * console.log(List.of(0, 1, 2).length); // => 3
	 * ```
	 */
	readonly length: number;
	/**
	 * Returns true if the collection is empty
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * console.log(List.empty<number>().isEmpty); // => true
	 * console.log(List.of(0, 1, 2).isEmpty); // => false
	 * ```
	 */
	readonly isEmpty: boolean;
	/**
	 * Returns true if there is at least one value in the collection, and instructs the compiler to treat the collection
	 * as a .NonEmpty type.
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * const source: List<number> = List.of(1, 2, 2);
	 * console.log(source.stream().first(0)); // => 1
	 * if (source.nonEmpty()) {
	 *   // within this block the compiler treats `source` as non-empty
	 *   console.log(source.stream().first()); // => 1
	 * }
	 * ```
	 */
	nonEmpty(): this is WithElem<Tp, T>['nonEmpty'];
	/**
	 * Returns the same collection typed as non-empty.
	 * @throws `RimbuError.EmptyCollectionAssumedNonEmptyError` if the collection is empty
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * const nonEmptyList = List.from([0, 1, 2]).assumeNonEmpty();
	 * console.log(nonEmptyList.toString()); // => List(0, 1, 2)
	 * // List.empty<number>().assumeNonEmpty() throws RimbuError.EmptyCollectionAssumedNonEmptyError
	 * ```
	 */
	assumeNonEmpty(): WithElem<Tp, T>['nonEmpty'];
	/**
	 * Returns a Stream containing the values in order of the List, or in reverse order if `reversed` is true.
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - reversed: (default: false) if true reverses the order of the elements
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * console.log(List.of(0, 1, 2).stream().toArray()); // => [ 0, 1, 2 ]
	 * console.log(List.of(0, 1, 2).stream({ reversed: true }).toArray()); // => [ 2, 1, 0 ]
	 * ```
	 * @returns A `Stream` containing the values in order (or reversed when `options.reversed` is true).
	 */
	stream(options?: { reversed?: boolean }): Stream<T>;
	/**
	 * Returns a Stream containing the values contained in the given index `range`, in order of the List,
	 * or in reverse order if `reversed` is true.
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - reversed: (default: false) if true reverses the order of the included elements
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * const initialList = List.of(0, 1, 2, 3, 4);
	 * console.log(initialList.streamRange({ start: 1, amount: 2 }).toArray()); // => [ 1, 2 ]
	 * console.log(initialList.streamRange({ start: 1, amount: 2 }, { reversed: true }).toArray()); // => [ 2, 1 ]
	 * ```
	 * @returns A `Stream` containing the values in the given `range` in order (or reversed when `options.reversed` is true).
	 */
	streamRange(range: IndexRange, options?: { reversed?: boolean }): Stream<T>;
	/**
	 * Returns the value in the List at the given `index`.
	 * @param index - the element index
	 * @param otherwise - (default: undefined) an `OptLazy` value to return if the index is out of bounds
	 * @typeparam O - the type of the `otherwise` value
	 * @note a negative `index` will be treated as follows:<br/>
	 * - -1: the last value in the list<br/>
	 * - -2: the second-last value in the list<br/>
	 * - ...etc
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * const initialList = List.of(0, 1, 2);
	 * console.log(initialList.at(5, 'other')); // => other
	 * console.log(initialList.at(1, 'other')); // => 1
	 * console.log(initialList.at(-1, 'other')); // => 2
	 * ```
	 * @note O(logB(N)) for block size B
	 */
	at(index: number): T | undefined;
	at<O>(index: number, otherwise: OptLazy<O>): T | O;
	/**
	 * Returns the List where at the given `index` the value is replaced or updated by the given `update`.
	 * @param index - the index at which to update the value
	 * @param update - a new value or function taking the current value and returning a new value
	 *
	 * @note a negative `index` will be treated as follows:<br/>
	 * - -1: the last element in the list<br/>
	 * - -2: the second-last element in the list<br/>
	 * - ...etc
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * const initialList = List.of(0, 1, 2);
	 * console.log(initialList.updateAt(1, () => 10).toString()); // => List(0, 10, 2)
	 * console.log(initialList.updateAt(1, (v) => v + 1).toString()); // => List(0, 2, 2)
	 * console.log(initialList.updateAt(-1, () => 10).toString()); // => List(0, 1, 10)
	 * ```
	 * @note O(logB(N)) for block size B
	 */
	updateAt(index: number, update: (current: T) => T): WithElem<Tp, T>['normal'];
	updateAtAndGet(
		index: number,
		update: (current: T) => T,
	): WithValueResult<WithElem<Tp, T>['nonEmpty'], T, WithElem<Tp, T>['normal']>;
	/**
	 * Returns the List with the value at the given `index` replaced by the given `value`.
	 * @param index - the index at which to replace the value
	 * @param value - the new value to set at the given index
	 *
	 * @note a negative `index` will be treated as follows:<br/>
	 * - -1: the last element in the list<br/>
	 * - -2: the second-last element in the list<br/>
	 * - ...etc
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * const initialList = List.of(0, 1, 2);
	 * console.log(initialList.with(1, 10).toString()); // => List(0, 10, 2)
	 * console.log(initialList.with(-1, 10).toString()); // => List(0, 1, 10)
	 * ```
	 * @note O(logB(N)) for block size B
	 */
	with(index: number, value: T): WithElem<Tp, T>['normal'];
	withAndGet(
		index: number,
		value: T,
	): WithValueResult<WithElem<Tp, T>['nonEmpty'], T, WithElem<Tp, T>['normal']>;
	/**
	 * Returns the first value of the List, or the `otherwise` value if the list is empty.
	 * @param otherwise - (default: undefined) an `OptLazy` value to return if the List is empty
	 * @typeparam O - the type of the `otherwise` value
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * const emptyList: List<number> = List.empty<number>();
	 * const filledList: List<number> = List.of(0, 1, 2);
	 * console.log(emptyList.first('other')); // => other
	 * console.log(filledList.first('other')); // => 0
	 * ```
	 * @note O(1)
	 */
	first(): T | undefined;
	first<O>(otherwise: OptLazy<O>): T | O;
	/**
	 * Returns the last value of the List, or the `otherwise` value if the list is empty.
	 * @param otherwise - (default: undefined) an `OptLazy` value to return if the List is empty
	 * @typeparam O - the type of the `otherwise` value
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * const emptyList: List<number> = List.empty<number>();
	 * const filledList: List<number> = List.of(0, 1, 2);
	 * console.log(emptyList.last('other')); // => other
	 * console.log(filledList.last('other')); // => 2
	 * ```
	 * @note O(1)
	 */
	last(): T | undefined;
	last<O>(otherwise: OptLazy<O>): T | O;
	/**
	 * Returns the List with the given `value` added to the start.
	 * @param value - the value to prepend
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * console.log(List.of(0, 1, 2).prepend(-10).toString()); // => List(-10, 0, 1, 2)
	 * ```
	 * @note O(logB(N)) for block size B - mostly o(1)
	 */
	prepend(value: T): WithElem<Tp, T>['nonEmpty'];
	/**
	 * Returns the List with the given `value` added to the end.
	 * @param value - the value to append.
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * console.log(List.of(0, 1, 2).append(-10).toString()); // => List(0, 1, 2, -10)
	 * ```
	 * @note O(logB(N)) for block size B - mostly o(1)
	 */
	append(value: T): WithElem<Tp, T>['nonEmpty'];
	/**
	 * Returns a List containing the first (or last) given `amount` values of this List.
	 * @param amount - the desired amount of values to include
	 *
	 * @note a negative `index` will be treated as follows:
	 * - -1: the last element in the list
	 * - -2: the second-last element in the list
	 * - ...etc
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * const initialList = List.of(0, 1, 2, 3);
	 * console.log(initialList.take(2).toString()); // => List(0, 1)
	 * console.log(initialList.take(10).toString()); // => List(0, 1, 2, 3)
	 * console.log(initialList.take(-2).toString()); // => List(2, 3)
	 * ```
	 * @note O(logB(N)) for block size B
	 */
	take(amount: number): WithElem<Tp, T>['normal'];
	/**
	 * Returns a List skipping the first given `amount` elements of this List.
	 * @param amount - the desired amount of values to include
	 *
	 * @note a negative `index` will be treated as follows:<br/>
	 * - -1: the last element in the list<br/>
	 * - -2: the second-last element in the list<br/>
	 * - ...etc
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * const initialList = List.of(0, 1, 2, 3);
	 * console.log(initialList.drop(2).toString()); // => List(2, 3)
	 * console.log(initialList.drop(10).toString()); // => List()
	 * console.log(initialList.drop(-2).toString()); // => List(0, 1)
	 * ```
	 * @note O(logB(N)) for block size B
	 */
	drop(amount: number): WithElem<Tp, T>['normal'];
	/**
	 * Returns the List containing the values within the given index `range`, potentially
	 * reversed in order if `reversed` is true.
	 * @param range - the index range to include
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - reversed: (default: false) if true reverses the order of the elements
	 *
	 * @note a negative `index` will be treated as follows:<br/>
	 * - -1: the last element in the list<br/>
	 * - -2: the second-last element in the list<br/>
	 * - ...etc
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * const initialList = List.of(0, 1, 2, 3);
	 * console.log(initialList.slice({ start: 1, amount: 2 }).toString()); // => List(1, 2)
	 * console.log(initialList.slice({ start: -2, amount: 2 }, { reversed: true }).toString()); // => List(3, 2)
	 * ```
	 * @note O(logB(N)) for block size B
	 */
	slice(
		range: IndexRange,
		options?: { reversed?: boolean },
	): WithElem<Tp, T>['normal'];
	/**
	 * Returns the List, where at the given `index` the `remove` amount of values are replaced by the values
	 * from the optionally given `insert` `StreamSource`.
	 * @param options - object containing the following<br/>
	 * - index: the index at which to replace values<br/>
	 * - remove: (default: 0) the amount of values to remove<br/>
	 * - insert: (default: []) a `StreamSource` of values to insert
	 *
	 * @note a negative `index` will be treated as follows:<br/>
	 * - -1: the last element in the list<br/>
	 * - -2: the second-last element in the list<br/>
	 * - ...etc
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * const initialList = List.of(0, 1, 2, 3);
	 * console.log(initialList.splice({ index: 2, remove: 1 }).toString()); // => List(0, 1, 3)
	 * console.log(initialList.splice({ index: 1, remove: 2, insert: [10, 11] }).toString()); // => List(0, 10, 11, 3)
	 * ```
	 * @note O(logB(N)) for block size B
	 */
	splice(options: {
		index?: number | undefined;
		remove?: number | undefined;
		insert: StreamSource.NonEmpty<T>;
	}): WithElem<Tp, T>['nonEmpty'];
	splice(options: {
		index?: number | undefined;
		remove?: number | undefined;
		insert?: StreamSource<T> | undefined;
	}): WithElem<Tp, T>['normal'];
	spliceAndGet(options: {
		index?: number | undefined;
		remove?: number | undefined;
		insert: StreamSource.NonEmpty<T>;
	}): WithValueResult<WithElem<Tp, T>['nonEmpty'], WithElem<Tp, T>['nonEmpty']>;
	spliceAndGet(options: {
		index?: number | undefined;
		remove?: number | undefined;
		insert?: StreamSource<T> | undefined;
	}): WithValueResult<
		WithElem<Tp, T>['normal'],
		WithElem<Tp, T>['nonEmpty'],
		WithElem<Tp, T>['normal']
	>;

	/**
	 * Returns the List with the given `values` inserted at the given `index`.
	 * @param index - the index at which to insert the values
	 * @param values - a `StreamSource` of values to insert
	 *
	 * @note a negative `index` will be treated as follows:<br/>
	 * - -1: the last element in the list<br/>
	 * - -2: the second-last element in the list<br/>
	 * - ...etc
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * const initialList = List.of(0, 1, 2, 3);
	 * console.log(initialList.insert(2, [10, 11]).toString()); // => List(0, 1, 10, 11, 2, 3)
	 * console.log(initialList.insert(-1, [10, 11]).toString()); // => List(0, 1, 2, 10, 11, 3)
	 * ```
	 * @note O(logB(N)) for block size B
	 */
	insert(
		index: number,
		values: StreamSource.NonEmpty<T>,
	): WithElem<Tp, T>['nonEmpty'];
	insert(index: number, values: StreamSource<T>): WithElem<Tp, T>['normal'];
	/**
	 * Returns the List with the given `amount` of values removed at the given `index`.
	 * @param index - the index at which to remove values
	 * @param options - object containing the following<br/>
	 * - amount: (default: 1) the amount of elements to remove
	 *
	 * @note  a negative `index` will be treated as follows:<br/>
	 * - -1: the last element in the list<br/>
	 * - -2: the second-last element in the list<br/>
	 * - ...etc
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * const initialList = List.of(0, 1, 2, 3);
	 * console.log(initialList.remove(1, { amount: 2 }).toString()); // => List(0, 3)
	 * console.log(initialList.remove(-2, { amount: 1 }).toString()); // => List(0, 1, 3)
	 * ```
	 * @note O(logB(N)) for block size B
	 */
	remove(
		index: number,
		options?: { amount?: number | undefined } | undefined,
	): WithElem<Tp, T>['normal'];
	removeAndGet(
		index: number,
		options?: { amount?: number | undefined } | undefined,
	): WithValueResult<WithElem<Tp, T>['normal'], WithElem<Tp, T>['nonEmpty']>;
	/**
	 * Returns a List that contains this List the given `amount` of times.
	 * @param amount - the amount of times to repeat the values in this List
	 *
	 * @note if the given amount <= -1, the reverse List is repeated
	 * @note if the given amount is 0 or 1, the List itself is returned
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * const initialList = List.of(0, 1, 2);
	 * console.log(initialList.repeat(2).toString()); // => List(0, 1, 2, 0, 1, 2)
	 * console.log(initialList.repeat(0).toString()); // => List(0, 1, 2)
	 * ```
	 * @note O(logB(N)) for block size B
	 */
	repeat(amount: number): WithElem<Tp, T>['normal'];
	/**
	 * Returns the List where the elements are shifted to right by `shiftRoundAmount` position, and the elements at the end are placed at the beginning.
	 * @param shiftRightAmount - the amount of values to shift the elements to the right
	 *
	 * @note if the `shiftRightAmount` is negative, the elements will be shifted to the left.
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * const initialList = List.of(0, 1, 2, 3);
	 * console.log(initialList.rotate(2).toString()); // => List(2, 3, 0, 1)
	 * console.log(initialList.rotate(-1).toString()); // => List(1, 2, 3, 0)
	 * ```
	 * @note O(logB(N)) for block size B
	 */
	rotate(shiftRightAmount: number): WithElem<Tp, T>['normal'];
	/**
	 * Returns the List where, if given `length` is larger than the List length, the given `fill` value is added to the start and/or end
	 * of the List according to the `positionPercentage` such that the result length is equal to `length`.
	 * @param length - the target length of the resulting list
	 * @param fill - the element used to fill up empty space in the resulting List
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - positionPercentage: (default: 0) a percentage indicating how much of the filling elements should be to the right
	 * side of the current List
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * const initialList = List.of(0, 1);
	 * console.log(initialList.padTo(4, 10).toString()); // => List(0, 1, 10, 10)
	 * console.log(initialList.padTo(4, 10, { positionPercentage: 50 }).toString()); // => List(10, 0, 1, 10)
	 * console.log(initialList.padTo(4, 10, { positionPercentage: 100 }).toString()); // => List(10, 10, 0, 1)
	 * console.log(List.of(0, 1, 2).padTo(2, 10).toString()); // => List(0, 1, 2)
	 * ```
	 * @note O(logB(N)) for block size B
	 */
	padTo(
		length: number,
		fill: T,
		options?: { positionPercentage?: number },
	): WithElem<Tp, T>['normal'];
	/**
	 * Returns the values sorted according to the given, optional Comp.
	 *
	 * **Performance warning**: this method is not designed for frequent calls;
	 * should you need to keep in order a collection with potentially duplicate values,
	 * please consider `SortedMultiSet` instead.
	 *
	 * @param comp The comparison logic to use; if missing, the default JavaScript sorting algorithm is applied
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - inverse: (default: false) when true will invert the sorting order
	 * @returns A sorted copy of the list
	 */
	sorted<TC = T>(
		comp?: Comp<SuperOf<TC, T>> | undefined,
		options?: { inverse?: boolean } | undefined,
	): WithElem<Tp, T>['normal'];
	/**
	 * Returns the List in reversed order.
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * console.log(List.of(0, 1, 2).reversed().toString()); // => List(2, 1, 0)
	 * ```
	 * @note O(logB(n)) for block size B
	 */
	reversed(): WithElem<Tp, T>['normal'];
	/**
	 * Returns the List succeeded by the values from all given `StreamSource` instances given in `sources`.
	 * @param sources - an array of `StreamSource` instances containing values to be added to the list
	 * @typeparam T2 - the type of the source elements to add
	 * @note this operation is most efficient when the given sources are instances of List from the same context.
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * const initialList = List.of(0, 1, 2);
	 * console.log(initialList.concat([10, 11]).toString()); // => List(0, 1, 2, 10, 11)
	 * console.log(initialList.concat([10, 11], new Set([12, 13])).toString()); // => List(0, 1, 2, 10, 11, 12, 13)
	 * ```
	 * @note O(logB(N)) for block size B
	 */
	concat(
		...sources: ArrayNonEmpty<StreamSource.NonEmpty<T>>
	): WithElem<Tp, T>['nonEmpty'];
	concat(...sources: ArrayNonEmpty<StreamSource<T>>): WithElem<Tp, T>['normal'];
	/**
	 * Performs given function `f` for each value of the List.
	 * @param f - the function to perform for each element, receiving<br/>
	 * - `value`: the next value<br/>
	 * - `index`: the index of the value<br/>
	 * - `halt`: a function that, if called, ensures that no new elements are passed
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - reversed: (default: false) when true will reverse the element order
	 * - state: (optional) the traversal state
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * const collected: number[] = [];
	 * List.of(0, 1, 2, 3).forEach((value, i, halt) => {
	 *   collected.push(value * 2);
	 *   if (i >= 1) halt();
	 * });
	 * console.log(collected); // => [ 0, 2 ]
	 * ```
	 * @note O(N)
	 */
	forEach(
		f: (value: T, index: number, halt: () => void) => void,
		options?: { reversed?: boolean; state?: TraverseState } | undefined,
	): void;
	/**
	 * Returns a List containing the result of applying given `mapFun` to each value in this List.
	 * If `reversed` is true, the order of the values is reversed.
	 * @param mapFun - a function receiving a value and its index, and returning a new value
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - reversed: (default: false) if true, reverses the order of the values
	 * @typeparam T2 - the result element type
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * console.log(List.of(1, 2, 3).map((v) => `value: ${v + 2}`).toArray());
	 * // => [ "value: 3", "value: 4", "value: 5" ]
	 * ```
	 */
	map<T2 extends Tp['_UT']>(
		mapFun: (value: T, index: number) => T2,
		options?: { reversed?: boolean },
	): WithElem<Tp, T2>['normal'];
	/**
	 * Returns a List containing the result of applying given `mapFun` to each value in this List.
	 * If `reversed` is true, the order of the values is reversed. Unlike `map`, `mapFun` receives
	 * only the value and not its index, allowing the mapping to be cached and reused for improved performance.
	 * @param mapFun - a pure function receiving a value and returning a new value
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - reversed: (default: false) if true, reverses the order of the values
	 * @typeparam T2 - the result element type
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * console.log(List.of(1, 2, 3).mapPure((v) => `value: ${v + 2}`).toArray());
	 * // => [ "value: 3", "value: 4", "value: 5" ]
	 * ```
	 */
	mapPure<T2 extends Tp['_UT']>(
		mapFun: (value: T) => T2,
		options?: { reversed?: boolean },
	): WithElem<Tp, T2>['normal'];
	/**
	 * Returns a List containing the joined results of applying given `flatMapFun` to each value in this List.
	 * @param flatMapFun - a function taking the next value and its index, and returning a `StreamSource`
	 * of value to include in the resulting collection
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - range: (optional) the range of the list to include in the filtering process<br/>
	 * - reversed: (default: false) if true reverses the elements within the given range
	 * @typeparam T2 - the result element type
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * console.log(List.of(1, 2, 3).flatMap((v) => [v, v + 1]).toArray()); // => [ 1, 2, 2, 3, 3, 4 ]
	 * ```
	 */
	flatMap<T2 extends Tp['_UT']>(
		flatMapFun: (value: T, index: number) => StreamSource<T2>,
		options?: {
			range?: IndexRange;
			reversed?: boolean;
		},
	): WithElem<Tp, T2>['normal'];
	/**
	 * Returns a List that is the result of applying given `transformFun` to the `Stream` of all values of this List.
	 *
	 * This is a general-purpose transformation method: `transformFun` receives the values of this List as a `Stream`,
	 * and can apply any `Stream` operation such as `map`, `flatMap`, `filter`, `partition`, or `collect`
	 * to produce the resulting values. The returned `StreamSource` is used to build a new List in the same context.
	 * @typeparam T2 - the value type of the resulting List
	 * @param transformFun - a function that receives the `Stream` of values of this List, and returns a `StreamSource` of resulting values
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * console.log(List.of(1, 2, 3).transform((s) => s.map((v) => v * 2)).toArray()); // => [ 2, 4, 6 ]
	 * ```
	 * @note because the resulting List is built in the same context, `T2` must be a subtype of `T`. To transform to an
	 * unrelated value type, build a new List explicitly, for example `List.from(stream.map(...))`.
	 */
	transform<T2 extends T>(
		transformFun: (stream: Stream<T>) => StreamSource<T2>,
	): WithElem<Tp, T2>['normal'];
	/**
	 * Returns a List containing only those values within optionally given `range` that satisfy given `pred` predicate.
	 * If `reversed` is true, the order of the values is reversed.
	 * @param pred - a predicate function receiving<br/>
	 * - `value`: the next value<br/>
	 * - `index`: the value index<br/>
	 * - `halt`: a function that, when called, ensures no next elements are passed
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - range: (optional) the range of the list to include in the filtering process<br/>
	 * - reversed: (default: false) if true reverses the elements within the given range
	 * @note if the predicate is a type guard, the return type is automatically inferred
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * const initialList = List.of(0, 1, 2, 3);
	 * const smallValues = initialList.filter((v) => v < 2);
	 * console.log(smallValues.toString()); // => List(0, 1)
	 * const reversedFiltered = initialList.filter((_, i) => i > 1, { reversed: true });
	 * console.log(reversedFiltered.toString()); // => List(1, 0)
	 * ```
	 */
	filter<TF extends T>(
		pred: (value: T, index: number, halt: () => void) => value is TF,
		options?: {
			range?: IndexRange;
			reversed?: boolean;
			negate?: false | undefined;
		},
	): WithElem<Tp, TF>['normal'];
	filter<TF extends T, TR extends T = Exclude<T, TF>>(
		pred: (value: T, index: number, halt: () => void) => value is TF,
		options: {
			range?: IndexRange;
			reversed?: boolean;
			negate: true;
		},
	): WithElem<Tp, TR>['normal'];
	filter(
		pred: (value: T, index: number, halt: () => void) => boolean,
		options?: { range?: IndexRange; reversed?: boolean; negate?: boolean },
	): WithElem<Tp, T>['normal'];
	/**
	 * Returns a List containing the values resulting from applying given `collectFun` to each value in this List.
	 * @param collectFun - a function receiving<br/>
	 * - `value`: the next value<br/>
	 * - `index`: the value index<br/>
	 * - `skip`: a token that, when returned, will not add a value to the resulting collection<br/>
	 * - `halt`: a function that, when called, ensures no next elements are passed
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - range: (optional) the range of the list to include in the filtering process<br/>
	 * - reversed: (default: false) if true reverses the elements within the given range
	 * @typeparam T2 - the result element type
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * const initialList = List.of(0, 1, 2, 3);
	 * const flags = initialList.collect((v) => v > 1);
	 * console.log(flags.toString()); // => List(false, false, true, true)
	 * const skipped = initialList.collect((v, i, skip) => (v === 1 ? skip : v * 2));
	 * console.log(skipped.toString()); // => List(0, 4, 6)
	 * const halted = initialList.collect((v, i, skip, halt) => {
	 *   if (v > 1) halt();
	 *   return v * 2;
	 * });
	 * console.log(halted.toString()); // => List(0, 2, 4)
	 * ```
	 */
	collect<T2 extends Tp['_UT']>(
		collectFun: CollectFun<T, T2>,
		options?: {
			range?: IndexRange;
			reversed?: boolean;
		},
	): WithElem<Tp, T2>['normal'];
	/**
	 * Returns an array containing the values within given `range` (default: all) in this collection.
	 * If `reversed` is true, reverses the order of the values.
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - range: (optional) the range of the list to include in the filtering process<br/>
	 * - reversed: (default: false) if true reverses the elements within the given range
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * const initialList = List.of(0, 1, 2, 3);
	 * console.log(initialList.toArray()); // => [ 0, 1, 2, 3 ]
	 * console.log(initialList.toArray({ range: { amount: 2 } })); // => [ 0, 1 ]
	 * console.log(initialList.toArray({ range: { amount: 2 }, reversed: true })); // => [ 1, 0 ]
	 * ```
	 * @note O(logB(N)) for block size B
	 * @note it is safe to mutate the returned array, however, the array elements are not copied, thus should be treated as read-only
	 */
	toArray(options?: { range?: IndexRange; reversed?: boolean }): T[];
	/**
	 * Returns a builder object containing the values of this collection.
	 * @example
	 * ```ts
	 * import { List } from '@rimbu/list';
	 *
	 * const builder = List.of(0, 1, 2, 3).toBuilder();
	 * console.log(builder.length); // => 4
	 * ```
	 */
	toBuilder(): WithElem<Tp, T>['builder'];
}

export namespace ListBase {
	export interface NonEmpty<T, Tp extends ListBase.Types = ListBase.Types>
		extends ListBase<T, Tp>,
			Streamable.NonEmpty<T> {
		/**
		 * Returns false since this collection is known to be non-empty.
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * console.log(List.of(0, 1, 2).isEmpty); // => false
		 * ```
		 */
		readonly isEmpty: false;
		/**
		 * Returns true since this collection is known to be non-empty
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * console.log(List.of(0, 1, 2).nonEmpty()); // => true
		 * ```
		 */
		nonEmpty(): this is WithElem<Tp, T>['nonEmpty'];
		/**
		 * Returns a self reference since this collection is known to be non-empty.
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * const nonEmptyList = List.of(0, 1, 2);
		 * console.log(nonEmptyList === nonEmptyList.assumeNonEmpty()); // => true
		 * ```
		 */
		assumeNonEmpty(): WithElem<Tp, T>['nonEmpty'];
		/**
		 * Returns this collection typed as a 'possibly empty' collection.
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * const normalList = List.of(0, 1, 2).asNormal(); // type: List<number>
		 * console.log(normalList.toString()); // => List(0, 1, 2)
		 * ```
		 */
		asNormal(): WithElem<Tp, T>['normal'];
		/**
		 * Returns a non-empty Stream containing the values in order of the List, or in reverse order if `reversed` is true.
		 * @param options - (optional) an object containing the following properties:<br/>
		 * - reversed: (default: false) if true reverses the order of the elements
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * console.log(List.of(0, 1, 2).stream().toArray()); // => [ 0, 1, 2 ]
		 * console.log(List.of(0, 1, 2).stream({ reversed: true }).toArray()); // => [ 2, 1, 0 ]
		 * ```
		 * @returns A non-empty `Stream` containing the values in order (or reversed when `options.reversed` is true).
		 */
		stream(options?: { reversed?: boolean }): Stream.NonEmpty<T>;
		/**
		 * Returns the non-empty List where at the given `index` the value is replaced or updated by the given `update`.
		 * @param index - the index at which to update the value
		 * @param update - a new value or function taking the current value and returning a new value
		 *
		 * @note a negative `index` will be treated as follows:<br/>
		 * - -1: the last element in the list<br/>
		 * - -2: the second-last element in the list<br/>
		 * - ...etc
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * const initialList = List.of(0, 1, 2);
		 * console.log(initialList.updateAt(1, () => 10).toString()); // => List(0, 10, 2)
		 * console.log(initialList.updateAt(1, (v) => v + 1).toString()); // => List(0, 2, 2)
		 * console.log(initialList.updateAt(-1, () => 10).toString()); // => List(0, 1, 10)
		 * ```
		 * @note O(logB(N)) for block size B
		 */
		updateAt(
			index: number,
			update: (current: T) => T,
		): WithElem<Tp, T>['nonEmpty'];
		updateAtAndGet(
			index: number,
			update: (current: T) => T,
		): WithValueResult<WithElem<Tp, T>['nonEmpty'], T>;
		/**
		 * Returns the non-empty List with the value at the given `index` replaced by the given `value`.
		 * @param index - the index at which to replace the value
		 * @param value - the new value to set at the given index
		 *
		 * @note a negative `index` will be treated as follows:<br/>
		 * - -1: the last element in the list<br/>
		 * - -2: the second-last element in the list<br/>
		 * - ...etc
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * const initialList = List.of(0, 1, 2);
		 * console.log(initialList.with(1, 10).toString()); // => List(0, 10, 2)
		 * console.log(initialList.with(-1, 10).toString()); // => List(0, 1, 10)
		 * ```
		 * @note O(logB(N)) for block size B
		 */
		with(index: number, value: T): WithElem<Tp, T>['nonEmpty'];
		withAndGet(
			index: number,
			value: T,
		): WithValueResult<WithElem<Tp, T>['nonEmpty'], T>;
		/**
		 * Returns the first value of the List.
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * console.log(List.of(0, 1, 2).first()); // => 0
		 * ```
		 * @note O(1)
		 */
		first(): T;
		/**
		 * Returns the last value of the List.
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * console.log(List.of(0, 1, 2).last()); // => 2
		 * ```
		 * @note O(1)
		 */
		last(): T;
		/**
		 * Returns a List containing the first (or last) given `amount` values of this List.
		 * @param amount - the desired amount of values to include
		 * @typeparam N - the literal numeric type of amount
		 * @note a negative `index` will be treated as follows:<br/>
		 * - -1: the last element in the list<br/>
		 * - -2: the second-last element in the list<br/>
		 * - ...etc
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * const initialList = List.of(0, 1, 2, 3);
		 * console.log(initialList.take(2).toString()); // => List(0, 1)
		 * console.log(initialList.take(10).toString()); // => List(0, 1, 2, 3)
		 * console.log(initialList.take(-2).toString()); // => List(2, 3)
		 * ```
		 * @note O(logB(N)) for block size B
		 */
		take<N extends number>(
			amount: N,
		): 0 extends N ? WithElem<Tp, T>['normal'] : WithElem<Tp, T>['nonEmpty'];
		/**
		 * Returns the List, where at the given `index` the `remove` amount of values are replaced by the values
		 * from the optionally given `insert` `StreamSource`.
		 * @param options - object containing the following<br/>
		 * - index: the index at which to replace values<br/>
		 * - remove: (default: 0) the amount of values to remove<br/>
		 * - insert: (default: []) a `StreamSource` of values to insert
		 *
		 * @note a negative `index` will be treated as follows:
		 * - -1: the last element in the list
		 * - -2: the second-last element in the list
		 * - ...etc
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * const initialList = List.of(0, 1, 2, 3);
		 * console.log(initialList.splice({ index: 2, remove: 1 }).toString()); // => List(0, 1, 3)
		 * console.log(initialList.splice({ index: 1, remove: 2, insert: [10, 11] }).toString()); // => List(0, 10, 11, 3)
		 * ```
		 * @note O(logB(N)) for block size B
		 */
		splice(options: {
			index?: number | undefined;
			remove?: number | undefined;
			insert: StreamSource.NonEmpty<T>;
		}): WithElem<Tp, T>['nonEmpty'];
		splice(options: {
			index?: number | undefined;
			remove?: number | undefined;
			insert?: StreamSource<T> | undefined;
		}): WithElem<Tp, T>['normal'];
		spliceAndGet(options: {
			index?: number | undefined;
			remove?: number | undefined;
			insert: StreamSource.NonEmpty<T>;
		}): WithValueResult<
			WithElem<Tp, T>['nonEmpty'],
			WithElem<Tp, T>['nonEmpty']
		>;
		spliceAndGet(options: {
			index?: number | undefined;
			remove?: number | undefined;
			insert?: StreamSource<T> | undefined;
		}): WithValueResult<
			WithElem<Tp, T>['normal'],
			WithElem<Tp, T>['nonEmpty'],
			WithElem<Tp, T>['normal']
		>;
		/**
		 * Returns the non-empty List with the given `values` inserted at the given `index`.
		 * @param index - the index at which to insert the values
		 * @param values - a `StreamSource` of values to insert
		 *
		 * @note a negative `index` will be treated as follows:<br/>
		 * - -1: the last element in the list<br/>
		 * - -2: the second-last element in the list<br/>
		 * - ...etc
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * const initialList = List.of(0, 1, 2, 3);
		 * console.log(initialList.insert(2, [10, 11]).toString()); // => List(0, 1, 10, 11, 2, 3)
		 * console.log(initialList.insert(-1, [10, 11]).toString()); // => List(0, 1, 2, 10, 11, 3)
		 * ```
		 * @note O(logB(N)) for block size B
		 */
		insert(index: number, values: StreamSource<T>): WithElem<Tp, T>['nonEmpty'];
		/**
		 * Returns the non-empty List succeeded by the values from all given `StreamSource` instances given in `sources`.
		 * @param sources - an array of `StreamSource` instances containing values to be added to the list
		 * @note this operation is most efficient when the given sources are instances of List from the same context.
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * const initialList = List.of(0, 1, 2);
		 * console.log(initialList.concat([10, 11]).toString()); // => List(0, 1, 2, 10, 11)
		 * console.log(initialList.concat([10, 11], new Set([12, 13])).toString()); // => List(0, 1, 2, 10, 11, 12, 13)
		 * ```
		 * @note O(logB(N)) for block size B
		 */
		concat(
			...sources: ArrayNonEmpty<StreamSource<T>>
		): WithElem<Tp, T>['nonEmpty'];
		/**
		 * Returns a non-empty List containing the result of applying given `mapFun` to each value in this List.
		 * If `reversed` is true, the order of the values is reversed.
		 * @param mapFun - a function receiving a value and its index, and returning a new value
		 * @param options - (optional) an object containing the following properties:<br/>
		 * - reversed: (default: false) if true, reverses the order of the values
		 * @typeparam T2 - the result element type
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * console.log(List.of(1, 2, 3).map((v) => `value: ${v + 2}`).toArray());
		 * // => [ "value: 3", "value: 4", "value: 5" ]
		 * ```
		 */
		map<T2 extends Tp['_UT']>(
			mapFun: (value: T, index: number) => T2,
			options?: { reversed?: boolean },
		): WithElem<Tp, T2>['nonEmpty'];
		/**
		 * Returns a non-empty List containing the result of applying given `mapFun` to each value in this List.
		 * If `reversed` is true, the order of the values is reversed. Unlike `map`, `mapFun` receives
		 * only the value and not its index, allowing the mapping to be cached and reused for improved performance.
		 * @param mapFun - a pure function receiving a value and returning a new value
		 * @param options - (optional) an object containing the following properties:<br/>
		 * - reversed: (default: false) if true, reverses the order of the values
		 * @typeparam T2 - the result element type
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * console.log(List.of(1, 2, 3).mapPure((v) => `value: ${v + 2}`).toArray());
		 * // => [ "value: 3", "value: 4", "value: 5" ]
		 * ```
		 */
		mapPure<T2 extends Tp['_UT']>(
			mapFun: (value: T) => T2,
			options?: { reversed?: boolean },
		): WithElem<Tp, T2>['nonEmpty'];
		/**
		 * Returns a List containing the joined results of applying given `flatMapFun` to each value in this List.
		 * @param flatMapFun - a function taking the next value and its index, and returning a `StreamSource`
		 * of value to include in the resulting collection
		 * @param options - (optional) an object containing the following properties:<br/>
		 * - range: (optional) the range of the list to include in the filtering process<br/>
		 * - reversed: (default: false) if true reverses the elements within the given range
		 * @typeparam T2 - the result element type
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * console.log(List.of(1, 2, 3).flatMap((v) => [v, v + 1]).toArray()); // => [ 1, 2, 2, 3, 3, 4 ]
		 * ```
		 */
		flatMap<T2 extends Tp['_UT']>(
			flatMapFun: (value: T, index: number) => StreamSource.NonEmpty<T2>,
			options?: { range?: undefined; reversed?: boolean },
		): WithElem<Tp, T2>['nonEmpty'];
		flatMap<T2>(
			flatMapFun: (value: T, index: number) => StreamSource<T2>,
			options?: { range?: IndexRange; reversed?: boolean },
		): WithElem<Tp, T2>['normal'];
		/**
		 * Returns a List that is the result of applying given `transformFun` to the `Stream` of all values of this List.
		 *
		 * This is a general-purpose transformation method: `transformFun` receives the values of this List as a non-empty `Stream`,
		 * and can apply any `Stream` operation such as `map`, `flatMap`, `filter`, `partition`, or `collect`
		 * to produce the resulting values. The returned `StreamSource` is used to build a new List in the same context.
		 * @typeparam T2 - the value type of the resulting List
		 * @param transformFun - a function that receives the non-empty `Stream` of values of this List, and returns a `StreamSource` of resulting values
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * console.log(List.of(1, 2, 3).transform((s) => s.map((v) => v * 2)).toArray()); // => [ 2, 4, 6 ]
		 * ```
		 * @note because the resulting List is built in the same context, `T2` must be a subtype of `T`. To transform to an
		 * unrelated value type, build a new List explicitly, for example `List.from(stream.map(...))`.
		 */
		transform<T2 extends T>(
			transformFun: (stream: Stream.NonEmpty<T>) => StreamSource.NonEmpty<T2>,
		): WithElem<Tp, T2>['nonEmpty'];
		transform<T2 extends T>(
			transformFun: (stream: Stream.NonEmpty<T>) => StreamSource<T2>,
		): WithElem<Tp, T2>['normal'];
		removeAndGet(
			index: number,
			options?: { amount?: number },
		): WithValueResult<
			WithElem<Tp, T>['normal'],
			WithElem<Tp, T>['nonEmpty'],
			WithElem<Tp, T>['nonEmpty']
		>;
		/**
		 * Returns a non-empty List that contains this List the given `amount` of times.
		 * @param amount - the amount of times to repeat the values in this List
		 *
		 * @note if the given amount <= 1, the List itself is returned
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * const initialList = List.of(0, 1, 2);
		 * console.log(initialList.repeat(2).toString()); // => List(0, 1, 2, 0, 1, 2)
		 * console.log(initialList.repeat(0).toString()); // => List(0, 1, 2)
		 * ```
		 * @note O(logB(N)) for block size B
		 */
		repeat(amount: number): WithElem<Tp, T>['nonEmpty'];
		/**
		 * Returns the non-empty List where the first given `shiftAmount` of values are removed from this List, and are appended at the end.
		 * @param shiftAmount - the amount of values to rotate
		 *
		 * @note if the `shiftAmount` is negative, the last `shiftAmount` values will be removed from the List and will be prepended.
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * const initialList = List.of(0, 1, 2, 3);
		 * console.log(initialList.rotate(2).toString()); // => List(2, 3, 0, 1)
		 * console.log(initialList.rotate(-1).toString()); // => List(1, 2, 3, 0)
		 * ```
		 * @note O(logB(N)) for block size B
		 */
		rotate(shiftAmount: number): WithElem<Tp, T>['nonEmpty'];
		/**
		 * Returns the non-empty List where, if given `length` is larger than the List length, the given `fill` value is added to the start and/or end
		 * of the List according to the `positionPercentage` such that the result length is equal to `length`.
		 * @param length - the target length of the resulting list
		 * @param fill - the element used to fill up empty space in the resulting List
		 * @param options - (optional) an object containing the following properties:<br/>
		 * - positionPercentage: (default: 0) a percentage indicating how much of the filling elements should be to the right
		 * side of the current List
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * const initialList = List.of(0, 1);
		 * console.log(initialList.padTo(4, 10).toString()); // => List(0, 1, 10, 10)
		 * console.log(initialList.padTo(4, 10, { positionPercentage: 50 }).toString()); // => List(10, 0, 1, 10)
		 * console.log(initialList.padTo(4, 10, { positionPercentage: 100 }).toString()); // => List(10, 10, 0, 1)
		 * console.log(List.of(0, 1, 2).padTo(2, 10).toString()); // => List(0, 1, 2)
		 * ```
		 * @note O(logB(N)) for block size B
		 */
		padTo(
			length: number,
			fill: T,
			options?: { positionPercentage?: number },
		): WithElem<Tp, T>['nonEmpty'];
		/**
		 * Returns the values sorted according to the given, optional Comp.
		 *
		 * **Performance warning**: this method is not designed for frequent calls;
		 * should you need to keep in order a collection with potentially duplicate values,
		 * please consider `SortedMultiSet` instead.
		 *
		 * @param comp The comparison logic to use; if missing, the default JavaScript sorting algorithm is applied
		 * @param options - (optional) an object containing the following properties:<br/>
		 * - inverse: (default: false) when true will reverse the sorting order
		 * @returns A sorted copy of the list
		 */
		sorted<TC = T>(
			comp?: Comp<SuperOf<TC, T>> | undefined,
			options?: { inverse?: boolean } | undefined,
		): WithElem<Tp, T>['nonEmpty'];
		/**
		 * Returns the non-empty List in reversed order.
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * console.log(List.of(0, 1, 2).reversed().toString()); // => List(2, 1, 0)
		 * ```
		 * @note O(logB(n)) for block size B
		 */
		reversed(): WithElem<Tp, T>['nonEmpty'];
		/**
		 * Returns an array containing the values within given `range` (default: all) in this collection.
		 * If `reversed` is true, reverses the order of the values.
		 * @param options - (optional) an object containing the following properties:<br/>
		 * - range: (optional) the range of the list to include in the filtering process<br/>
		 * - reversed: (default: false) if true reverses the elements within the given range
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * const initialList = List.of(0, 1, 2, 3);
		 * console.log(initialList.toArray()); // => [ 0, 1, 2, 3 ]
		 * console.log(initialList.toArray({ range: { amount: 2 } })); // => [ 0, 1 ]
		 * console.log(initialList.toArray({ range: { amount: 2 }, reversed: true })); // => [ 1, 0 ]
		 * ```
		 * @note O(logB(N)) for block size B
		 * @note it is safe to mutate the returned array, however, the array elements are not copied, thus should be treated as read-only
		 */
		toArray(options?: {
			range?: undefined;
			reversed?: boolean;
		}): ArrayNonEmpty<T>;
		toArray(options?: { range?: IndexRange; reversed?: boolean }): T[];
	}

	export interface Builder<T, Tp extends ListBase.Types = ListBase.Types> {
		/**
		 * Returns true if there are no values in the builder.
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * console.log(List.of(1, 2, 3).toBuilder().isEmpty); // => false
		 * ```
		 */
		get isEmpty(): boolean;
		/**
		 * Returns the amount of values in the builder.
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * console.log(List.of(1, 2, 3).toBuilder().length); // => 3
		 * ```
		 */
		get length(): number;
		/**
		 * Returns the value in the List builder at the given `index`.
		 * @param index - the element index
		 * @param otherwise - (default: undefined) an `OptLazy` value to return if the index is out of bounds
		 * @typeparam O - the type of the `otherwise` value
		 * @note a negative `index` will be treated as follows:<br/>
		 * - -1: the last value in the list<br/>
		 * - -2: the second-last value in the list<br/>
		 * - ...etc
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * const builder = List.of(0, 1, 2).toBuilder();
		 * console.log(builder.at(5, 'other')); // => other
		 * console.log(builder.at(1, 'other')); // => 1
		 * console.log(builder.at(-1, 'other')); // => 2
		 * ```
		 * @note O(logB(N)) for block size B
		 */
		at(index: number): T | undefined;
		at<O>(index: number, otherwise: OptLazy<O>): T | O;
		/**
		 * Adds the given `value` to the start of the builder values.
		 * @param value - the value to prepend
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * const builder = List.of(1, 2, 3).toBuilder();
		 * builder.prepend(10);
		 * console.log(builder.build().toArray()); // => [ 10, 1, 2, 3 ]
		 * ```
		 * @note O(logB(N)) for block size B - mostly o(1)
		 */
		prepend(value: T): void;
		/**
		 * Adds the given `value` to the end of the builder values.
		 * @param value - the value to append
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * const builder = List.of(1, 2, 3).toBuilder();
		 * builder.append(10);
		 * console.log(builder.build().toArray()); // => [ 1, 2, 3, 10 ]
		 * ```
		 * @note O(logB(N)) for block size B - mostly o(1)
		 */
		append(value: T): void;
		/**
		 * Adds all given `values` at the end of the builder values
		 * @param values - a `StreamSource` containing values to add
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * const builder = List.of(1, 2, 3).toBuilder();
		 * builder.appendAll([10, 11]);
		 * console.log(builder.build().toArray()); // => [ 1, 2, 3, 10, 11 ]
		 * ```
		 */
		appendAll(values: StreamSource<T>): void;
		/**
		 * Inserts the given `value` at the given `index` in the builder.
		 * @param index - the index at which to insert the value
		 * @param value - the value to insert
		 *
		 * @note a negative `index` will be treated as follows:<br/>
		 * - -1: the last value in the list<br/>
		 * - -2: the second-last value in the list<br/>
		 * - ...etc
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * const builder = List.of(1, 2, 3).toBuilder();
		 * builder.insert(1, 10);
		 * console.log(builder.build().toArray()); // => [ 1, 10, 2, 3 ]
		 * ```
		 */
		insert(index: number, value: T): void;
		/**
		 * Removes the value at the given `index` in the builder.
		 * @param index - the index at which to remove a value
		 * @param otherwise - (default: undefined) the value to return if the index is out of bounds
		 * @typeparam O - the type of the `otherwise` value
		 * @note a negative `index` will be treated as follows:<br/>
		 * - -1: the last value in the list<br/>
		 * - -2: the second-last value in the list<br/>
		 * - ...etc
		 * @returns the removed value, or the `otherwise` value if the index is out of bounds
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * const builder = List.of(1, 2, 3).toBuilder();
		 * console.log(builder.remove(10, 'a')); // => a
		 * console.log(builder.remove(1)); // => 2
		 * console.log(builder.remove(0, 'a')); // => 1
		 * ```
		 */
		remove(index: number): T | undefined;
		remove<O>(index: number, otherwise: OptLazy<O>): T | O;
		/**
		 * Updates the element at the given `index` with the given `update` function.
		 * @param index - the index of the element to update
		 * @param update - a function taking the current value and returning a new value
		 * @param otherwise - (default: undefined) the `OptLazy` value to return if there is no element at given index
		 * @typeparam O - the type of the `otherwise` value
		 * @returns the old value at the given index, or the `otherwise` value if the index is out of bounds
		 * @note a negative `index` will be treated as follows:<br/>
		 * - -1: the last element in the list<br/>
		 * - -2: the second-last element in the list<br/>
		 * - ...etc
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * const builder = List.of(1, 2, 3).toBuilder();
		 * console.log(builder.updateAt(0, (v) => v + 10)); // => 1
		 * console.log(builder.updateAt(1, (v) => v + 10, 'a')); // => 2
		 * console.log(builder.updateAt(10, (v) => v, 'a')); // => a
		 * ```
		 * @note O(logB(N)) for block size B
		 */
		updateAt(index: number, update: (current: T) => T): T | undefined;
		updateAt<O>(
			index: number,
			update: (current: T) => T,
			otherwise: OptLazy<O>,
		): T | O;
		/**
		 * Sets the element at the given `index` to the given `value`.
		 * @param index - the index of the element to set.
		 * @param value - the new value to set.
		 * @param otherwise - (default: undefined) the `OptLazy` value to return if there is no element at given index
		 * @typeparam O - the type of the `otherwise` value
		 * @returns the old value at the given index, or the `otherwise` value if the index is out of bounds
		 * @note a negative `index` will be treated as follows:<br/>
		 * - -1: the last element in the list<br/>
		 * - -2: the second-last element in the list<br/>
		 * - ...etc
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * const builder = List.of(1, 2, 3).toBuilder();
		 * console.log(builder.set(0, 10)); // => 1
		 * console.log(builder.set(1, 10, 'a')); // => 2
		 * console.log(builder.set(10, 0, 'a')); // => a
		 * ```
		 * @note O(logB(N)) for block size B
		 */
		set(index: number, value: T): T | undefined;
		set<O>(index: number, value: T, otherwise: OptLazy<O>): T | O;
		/**
		 * Performs given function `f` for each value of the List builder.
		 * @param f - the function to perform for each element, receiving<br/>
		 * - `value`: the next value<br/>
		 * - `index`: the index of the value<br/>
		 * - `halt`: a function that, if called, ensures that no new elements are passed
		 * @param options - (optional) an object containing the following properties:<br/>
		 * - state: (optional) the traversal state
		 * @throws RimbuError.ModifiedBuilderWhileLoopingOverItError if the builder is modified while
		 * looping over it
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * const collected: number[] = [];
		 * List.of(0, 1, 2, 3).toBuilder().forEach((value, i, halt) => {
		 *   collected.push(value * 2);
		 *   if (i >= 1) halt();
		 * });
		 * console.log(collected); // => [ 0, 2 ]
		 * ```
		 * @note O(N)
		 */
		forEach(
			f: (value: T, index: number, halt: () => void) => void,
			options?: { reversed?: boolean; state?: TraverseState },
		): void;
		/**
		 * Returns an immutable instance containing the values in this builder.
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * const builder = List.of(1, 2, 3).toBuilder();
		 * const built = builder.build();
		 * console.log(built.toArray()); // => [ 1, 2, 3 ]
		 * ```
		 */
		build(): WithElem<Tp, T>['normal'];
		/**
		 * Returns an immutable instance containing the result of applying given `mapFun` to each value in the builder.
		 * @typeparam T2 - the result element type
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * const builder = List.of(1, 2, 3).toBuilder();
		 * const built = builder.buildMap((v) => String(v));
		 * console.log(built.toArray()); // => [ "1", "2", "3" ]
		 * ```
		 */
		buildMap<T2 extends Tp['_UT'] = T>(
			mapFun: (value: T) => T2,
		): WithElem<Tp, T2>['normal'];
	}

	export interface Context<Tp extends ListBase.Types = ListBase.Types>
		extends ListBase.Factory<Tp> {
		readonly blockSizeBits: number;
		readonly minBlockSize: number;
		readonly maxBlockSize: number;
	}

	export interface Factory<Tp extends ListBase.Types = ListBase.Types> {
		empty<T extends Tp['_UT']>(): WithElem<Tp, T>['normal'];
		of<T extends Tp['_UT']>(
			...values: ArrayNonEmpty<T>
		): WithElem<Tp, T>['nonEmpty'];
		from<T extends Tp['_UT']>(
			...sources: ArrayNonEmpty<StreamSource.NonEmpty<T>>
		): WithElem<Tp, T>['nonEmpty'];
		from<T extends Tp['_UT']>(
			...sources: ArrayNonEmpty<StreamSource<T>>
		): WithElem<Tp, T>['normal'];
		builder<T extends Tp['_UT']>(): WithElem<Tp, T>['builder'];
		/**
		 * Returns a `Reducer` that appends received items to a List and returns the List as a result. When a `source` is given,
		 * the reducer will first create a List from the source, and then append elements to it.
		 * @param source - (optional) an initial source of elements to append to
		 * @typeparam T - the element type
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 * import { Stream } from '@rimbu/stream';
		 *
		 * const someList = List.of(1, 2, 3);
		 * const result = Stream.range({ start: 20, amount: 5 }).reduce(List.reducer(someList));
		 * console.log(result.toArray()); // => [ 1, 2, 3, 20, 21, 22, 23, 24 ]
		 * ```
		 * @note uses a List builder under the hood. If the given `source` is a List in the same context, it will directly call `.toBuilder()`.
		 */
		reducer<T extends Tp['_UT']>(
			source?: StreamSource<T>,
		): Reducer<T, WithElem<Tp, T>['normal']>;
		/**
		 * Returns, if T is a valid `StreamSource`, the result of concatenating all
		 * streamable elements of the given sources.
		 * @param source - a `StreamSource` containing `StreamSource` instances of values to concatenate
		 * @typeparam T - the element type
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * const nested = List.of([1, 2], [3, 4, 5]);
		 * console.log(List.flatten(nested).toArray()); // => [ 1, 2, 3, 4, 5 ]
		 * ```
		 */
		flatten<T extends StreamSource.NonEmpty<unknown>>(
			source: StreamSource.NonEmpty<T>,
		): T extends StreamSource.NonEmpty<infer S>
			? WithElem<Tp, S>['nonEmpty']
			: never;
		flatten<T extends StreamSource<unknown>>(
			source: StreamSource<T>,
		): T extends StreamSource<infer S> ? WithElem<Tp, S>['normal'] : never;
		/**
		 * Returns an array of Lists, where each list contains the values of the corresponding index of tuple T.
		 * @param source - a `StreamSource` containing tuples of type T to unzip
		 * @param options - an object containing the following properties:<br/>
		 * - length: the length of the tuples in type T
		 * @typeparam T - the StreamSource tuple element type
		 * @typeparam L - the tuple element length
		 * @example
		 * ```ts
		 * import { List } from '@rimbu/list';
		 *
		 * const pairs = List.of<[number, string]>([1, 'a'], [2, 'b']);
		 * const [numbers, letters] = List.unzip(pairs, { length: 2 });
		 * console.log(numbers.toString()); // => List(1, 2)
		 * console.log(letters.toString()); // => List(a, b)
		 * ```
		 */
		unzip<T extends readonly unknown[] & { length: L }, L extends number>(
			source: StreamSource.NonEmpty<T>,
			options: { length: L },
		): { [K in keyof T]: WithElem<Tp, T[K]>['nonEmpty'] };
		unzip<T extends readonly unknown[] & { length: L }, L extends number>(
			source: StreamSource<T>,
			options: { length: L },
		): { [K in keyof T]: WithElem<Tp, T[K]>['normal'] };
	}

	export interface OuterChildrenTag {
		__outerChildrenTag?: true;
	}

	export interface Types extends Elem {
		readonly _UT: unknown;
		readonly normal: ListBase<this['_T']>;
		readonly nonEmpty: ListBase.NonEmpty<this['_T']>;
		readonly builder: this['_UT'] extends unknown
			? unknown
			: ListBase.Builder<this['_T']>;
		readonly context: ListBase.Context;
		readonly outerChildren: OuterChildrenTag;
	}
}
