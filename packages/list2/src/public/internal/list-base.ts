import type { Elem, WithElem } from '@rimbu/collection-types/common';
import type { IndexRange } from '@rimbu/common/index-range';
import type { OptLazy } from '@rimbu/common/opt-lazy';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { Update } from '@rimbu/common/update';
import type {
	FastIterable,
	Stream,
	Streamable,
	StreamSource,
} from '@rimbu/stream';

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
	 * List.empty().length      // => 0
	 * List.of(0, 1, 2).length  // => 3
	 * ```
	 */
	readonly length: number;
	/**
	 * Returns true if the collection is empty
	 * @example
	 * ```ts
	 * List.empty().isEmpty      // => true
	 * List.of(0, 1, 2).isEmpty  // => false
	 * ```
	 */
	readonly isEmpty: boolean;
	/**
	 * Returns true if there is at least one value in the collection, and instructs the compiler to treat the collection
	 * as a .NonEmpty type.
	 * @example
	 * ```ts
	 * const m: List<number> = List.of(1, 2, 2)
	 * m.stream().first(0)     // compiler allows fallback value since the Stream may be empty
	 * if (m.nonEmpty()) {
	 *   m.stream().first(0)   // compiler error: fallback value not allowed since Stream is not empty
	 * }
	 * ```
	 */
	nonEmpty(): this is WithElem<Tp, T>['nonEmpty'];
	/**
	 * Returns the same collection typed as non-empty.
	 * @throws `RimbuError.EmptyCollectionAssumedNonEmptyError` if the collection is empty
	 * @example
	 * ```ts
	 * List.empty().assumeNonEmpty()           // => throws RimbuError.EmptyCollectionAssumedNonEmptyError
	 * List.from([0, 1, 2]).assumeNonEmpty()   // => List.NonEmpty(0, 1, 2)
	 * ```
	 */
	assumeNonEmpty(): WithElem<Tp, T>['nonEmpty'];
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
	 * List.of(0, 1, 2).get(5)             // => undefined
	 * List.of(0, 1, 2).get(5, 'other')    // => 'other'
	 * List.of(0, 1, 2).get(1, 'other')    // => 1
	 * List.of(0, 1, 2).get(-1)            // => 2
	 * ```
	 * @note O(logB(N)) for block size B
	 */
	get(index: number): T | undefined;
	get<O>(index: number, otherwise: OptLazy<O>): T | O;
	/**
	 * Returns the List with the given `value` added to the start.
	 * @param value - the value to prepend
	 * @example
	 * ```ts
	 * List.of(0, 1, 2).prepend(-10)  // => List(-10, 0, 1, 2)
	 * ```
	 * @note O(logB(N)) for block size B - mostly o(1)
	 */
	prepend(value: T): WithElem<Tp, T>['nonEmpty'];
	/**
	 * Returns the List with the given `value` added to the end.
	 * @param value - the value to append.
	 * @example
	 * ```ts
	 * List.of(0, 1, 2).append(-10)  // => List(0, 1, 2, -10)
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
	 * List.of(0, 1, 2, 3).take(2)    // => List(0, 1)
	 * List.of(0, 1, 2, 3).take(10)   // => List(0, 1, 2, 3)
	 * List.of(0, 1, 2, 3).take(-2)   // => List(2, 3)
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
	 * List.of(0, 1, 2, 3).drop(2)    // => List(2, 3)
	 * List.of(0, 1, 2, 3).drop(10)   // => List()
	 * List.of(0, 1, 2, 3).drop(-2)   // => List(0, 1)
	 * ```
	 * @note O(logB(N)) for block size B
	 */
	drop(amount: number): WithElem<Tp, T>['normal'];
	/**
	 * Returns the List in reversed order.
	 * @example
	 * ```ts
	 * List.of(0, 1, 2).reversed()  // -> List(2, 1, 0)
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
	 * List.of(0, 1, 2).concat([10, 11])                      // -> List(0, 1, 2, 10, 11)
	 * List.of(0, 1, 2).concat([10, 11], new Set([12, 13]))   // -> List(0, 1, 2, 10, 11, 12, 13)
	 * ```
	 * @note O(logB(N)) for block size B
	 */
	concat(
		...sources: ArrayNonEmpty<StreamSource.NonEmpty<T>>
	): WithElem<Tp, T>['nonEmpty'];
	concat(...sources: ArrayNonEmpty<StreamSource<T>>): WithElem<Tp, T>['normal'];
	/**
	 * Returns an array containing the values within given `range` (default: all) in this collection.
	 * If `reversed` is true, reverses the order of the values.
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - range: (optional) the range of the list to include in the filtering process<br/>
	 * - reversed: (default: false) if true reverses the elements within the given range
	 * @example
	 * ```ts
	 * List.of(0, 1, 2, 3).toArray()                      // => [0, 1, 2, 3]
	 * List.of(0, 1, 2, 3).toArray({ range: { amount: 2 } })                 // => [0, 1]
	 * List.of(0, 1, 2, 3).toArray({ range: { amount: 2 }, reversed: true }) // => [1, 0]
	 * ```
	 * @note O(logB(N)) for block size B
	 * @note it is safe to mutate the returned array, however, the array elements are not copied, thus should be treated as read-only
	 */
	toArray(options?: { range?: IndexRange; reversed?: boolean }): T[];
	/**
	 * Returns a builder object containing the values of this collection.
	 * @example
	 * ```ts
	 * const builder: List.Builder<number> = List.of(0, 1, 2, 3).toBuilder()
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
		 * List(0, 1, 2).isEmpty   // => false
		 * ```
		 */
		readonly isEmpty: false;
		/**
		 * Returns true since this collection is known to be non-empty
		 * @example
		 * ```ts
		 * List.of(0, 1, 2).nonEmpty()   // => true
		 * ```
		 */
		nonEmpty(): this is WithElem<Tp, T>['nonEmpty'];
		/**
		 * Returns a non-empty Stream containing the values in order of the List, or in reverse order if `reversed` is true.
		 * @param options - (optional) an object containing the following properties:<br/>
		 * - reversed: (default: false) if true reverses the order of the elements
		 * @example
		 * ```ts
		 * List.of(0, 1, 2).stream().toArray()                       // => [0, 1, 2]
		 * List.of(0, 1, 2).stream({ reversed: true }).toArray()     // => [2, 1, 0]
		 * ```
		 * @returns A non-empty `Stream` containing the values in order (or reversed when `options.reversed` is true).
		 */
		stream(options?: { reversed?: boolean }): Stream.NonEmpty<T>;
		/**
		 * Returns the non-empty List in reversed order.
		 * @example
		 * ```ts
		 * List.of(0, 1, 2).reversed()  // -> List(2, 1, 0)
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
		 * List.of(0, 1, 2, 3).toArray()                      // => [0, 1, 2, 3]
		 * List.of(0, 1, 2, 3).toArray({ range: { amount: 2 } })                 // => [0, 1]
		 * List.of(0, 1, 2, 3).toArray({ range: { amount: 2 }, reversed: true }) // => [1, 0]
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
		 * const m = List.of(0, 1, 2).toBuilder()
		 * m.get(5)             // => undefined
		 * m.get(5, 'other')    // => 'other'
		 * m.get(1, 'other')    // => 1
		 * m.get(-1)            // => 2
		 * ```
		 * @note O(logB(N)) for block size B
		 */
		get(index: number): T | undefined;
		get<O>(index: number, otherwise: OptLazy<O>): T | O;
		/**
		 * Adds the given `value` to the start of the builder values.
		 * @param value - the value to prepend
		 * @example
		 * ```ts
		 * const m = List.of(1, 2, 3).toBuilder()
		 * m.prepend(10)
		 * m.build().toArray()
		 * // => [10, 1, 2, 3]
		 * ```
		 * @note O(logB(N)) for block size B - mostly o(1)
		 */
		prepend(value: T): void;
		/**
		 * Adds the given `value` to the end of the builder values.
		 * @param value - the value to append
		 * @example
		 * ```ts
		 * const m = List.of(1, 2, 3).toBuilder()
		 * m.append(10)
		 * m.build().toArray()
		 * // => [1, 2, 3, 10]
		 * ```
		 * @note O(logB(N)) for block size B - mostly o(1)
		 */
		append(value: T): void;
		/**
		 * Updates the element at the given `index` with the given `update` value or function.
		 * @param index - the index of the element to update
		 * @param update - the new value or function taking the current value and returning a new value
		 * @param otherwise - (default: undefined) the `OptLazy` value to return if there is no element at given index
		 * @typeparam O - the type of the `otherwise` value
		 * @returns the old value at the given index, or the `otherwise` value if the index is out of bounds
		 * @note a negative `index` will be treated as follows:<br/>
		 * - -1: the last element in the list<br/>
		 * - -2: the second-last element in the list<br/>
		 * - ...etc
		 * @example
		 * ```ts
		 * const m = List.of(1, 2, 3).toBuilder()
		 * m.updateAt(0, 10)       // => 1
		 * m.updateAt(1, 10, 'a')  // => 2
		 * m.updateAt(10, 0)       // => undefined
		 * m.updateAt(10, 0, 'a')  // => 'a'
		 * ```
		 * @note O(logB(N)) for block size B
		 */
		updateAt(index: number, update: Update<T>): T | undefined;
		updateAt<O>(index: number, update: Update<T>, otherwise: OptLazy<O>): T | O;
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
		 * List.of(0, 1, 2, 3).toBuilder().forEach((value, i, halt) => {
		 *  console.log(value * 2);
		 *  if (i >= 1) halt();
		 * })
		 * // => logs 0  2
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
		 * const m = List.of(1, 2, 3).toBuilder()
		 * const m2: List<number> = m.build()
		 * m.toArray()
		 * // => [1, 2, 3]
		 * ```
		 */
		build(): WithElem<Tp, T>['normal'];
	}

	export interface Context<Tp extends ListBase.Types = ListBase.Types>
		extends ListBase.Factory<Tp> {
		readonly minBlockSize: number;
		readonly maxBlockSize: number;
	}

	export interface Factory<Tp extends ListBase.Types = ListBase.Types> {
		createContext(
			options?:
				| {
						blockSizeBits?: number | undefined;
				  }
				| undefined,
		): Tp['context'];
		empty<T extends Tp['_UT']>(): WithElem<Tp, T>['normal'];
		of<T extends Tp['_UT']>(
			...values: ArrayNonEmpty<T>
		): WithElem<Tp, T>['nonEmpty'];
		from<T extends Tp['_UT']>(
			...sources: ArrayNonEmpty<StreamSource<T>>
		): WithElem<Tp, T>['normal'];
		builder<T extends Tp['_UT']>(): WithElem<Tp, T>['builder'];
	}

	export interface LeafChildrenTag {
		__leafChildrenTag?: true;
	}

	export interface Types extends Elem {
		readonly _UT: unknown;
		readonly normal: ListBase<this['_T']>;
		readonly nonEmpty: ListBase.NonEmpty<this['_T']>;
		readonly builder: this['_UT'] extends unknown
			? unknown
			: ListBase.Builder<this['_T']>;
		readonly context: ListBase.Context;
		readonly leafChildren: LeafChildrenTag;
	}
}
