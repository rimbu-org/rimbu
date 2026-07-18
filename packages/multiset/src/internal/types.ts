import type { RMap, VariantMap } from '@rimbu/collection-types';
import type { Elem, WithElem } from '@rimbu/collection-types/advanced/common';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type { ArrayNonEmpty, RelatedTo, ToJSON } from '@rimbu/common/types';
import type { MultiSet } from '@rimbu/multiset';
import type {
	FastIterable,
	Stream,
	Streamable,
	StreamSource,
} from '@rimbu/stream';
import type { Reducer } from '@rimbu/stream/reducer';

export interface VariantMultiSetBase<
	T,
	Tp extends VariantMultiSetBase.Types = VariantMultiSetBase.Types,
> extends FastIterable<T> {
	/**
	 * Returns true if the collection is empty.
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * console.log(HashMultiSet.empty<number>().isEmpty); // => true
	 * console.log(HashMultiSet.of(1, 2, 2).isEmpty); // => false
	 * ```
	 */
	readonly isEmpty: boolean;
	/**
	 * Returns the number of values in the collection.
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * console.log(HashMultiSet.of(1, 2).size); // => 2
	 * console.log(HashMultiSet.of(1, 2, 2).size); // => 3
	 * ```
	 */
	readonly size: number;
	/**
	 * Returns the number of distinct values in the collection.
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * console.log(HashMultiSet.of(1, 2).sizeDistinct); // => 2
	 * console.log(HashMultiSet.of(1, 2, 2).sizeDistinct); // => 2
	 * ```
	 */
	readonly sizeDistinct: number;
	/**
	 * Returns the Map representation of this collection.
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * import type { HashMap } from '@rimbu/hashed/map';
	 * const m = HashMultiSet.of(1, 2, 2)
	 * console.log(m.countMap.toArray()); // => [ [ 1, 1 ], [ 2, 2 ] ]
	 * ```
	 */
	readonly countMap: WithElem<Tp, T>['countMap'];
	/**
	 * Returns true if there is at least one entry in the collection, and instructs the compiler to treat the collection
	 * as a .NonEmpty type.
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * import { Stream } from '@rimbu/stream';
	 *
	 * const m = HashMultiSet.of(1, 2, 2)
	 * console.log(m.nonEmpty()); // => true
	 * console.log(m.stream().first()); // => 1
	 * ```
	 */
	nonEmpty(): this is WithElem<Tp, T>['nonEmpty'];
	/**
	 * Returns the collection as a .NonEmpty type
	 * @throws RimbuError.EmptyCollectionAssumedNonEmptyError if the collection is empty
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 *
	 * const m = HashMultiSet.of(1, 2)
	 * const m2 = m.assumeNonEmpty()
	 * console.log(m2.size);
	 * // => 2
	 * ```
	 * @note returns reference to this collection
	 */
	assumeNonEmpty(): WithElem<Tp, T>['nonEmpty'];
	/**
	 * Returns a Stream containing all values of this collection.
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * console.log(HashMultiSet.of(1, 2, 2).stream().toArray()); // => [ 1, 2, 2 ]
	 * ```
	 */
	stream(): Stream<T>;
	/**
	 * Returns a Stream containing all distinct values of this collection.
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * console.log(HashMultiSet.of(1, 2, 2).streamDistinct().toArray()); // => [ 1, 2 ]
	 * ```
	 */
	streamDistinct(): Stream<T>;
	/**
	 * Returns a Stream of tuples containing each distinct value and its count.
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * console.log(HashMultiSet.of(1, 2, 2).streamWithCounts().toArray()); // => [ [ 1, 1 ], [ 2, 2 ] ]
	 * ```
	 */
	streamWithCounts(): Stream<readonly [T, number]>;
	/**
	 * Returns the collection where the given `amount` (default: 'ALL') of the given `value`
	 * are removed.
	 * @param value - the value to remove
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - amount: (default: 'ALL') the amount of values to remove, or 'ALL' to remove all values.
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * const m = HashMultiSet.of(1, 2, 2)
	 * console.log(m.remove(5).toArray()); // => [ 1, 2, 2 ]
	 * console.log(m.remove(2).toArray()); // => [ 1, 2 ]
	 * console.log(m.remove(2, { amount: 1 }).toArray()); // => [ 1, 2 ]
	 * ```
	 */
	remove<U = T>(
		value: RelatedTo<T, U>,
		options?: { amount?: number | 'ALL' },
	): WithElem<Tp, T>['normal'];
	/**
	 * Returns the collection where, for every value from given `values` `StreamSource`,
	 * the given `amount` (default: 'ALL') of occurrences are removed.
	 * @param values - a `StreamSource` containing values to remove.
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - amount: (default: 'ALL') the amount of occurrences to remove per value, or 'ALL' to remove all occurrences.
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * const m = HashMultiSet.of(1, 2, 2)
	 * console.log(m.removeAll([5, 6]).toArray()); // => [ 1, 2, 2 ]
	 * console.log(m.removeAll([2, 3]).toArray()); // => [ 1 ]
	 * console.log(m.removeAll([2], { amount: 1 }).toArray()); // => [ 1, 2 ]
	 * ```
	 */
	removeAll<U = T>(
		values: StreamSource<RelatedTo<T, U>>,
		options?: { amount?: number | 'ALL' },
	): WithElem<Tp, T>['normal'];
	/**
	 * Returns true if the given `value` exists in the collection.
	 * @param value - the value to look for
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * const m = HashMultiSet.of(1, 2, 2)
	 * console.log(m.has(5)); // => false
	 * console.log(m.has(2)); // => true
	 * ```
	 */
	has<U = T>(value: RelatedTo<T, U>): boolean;
	/**
	 * Returns the amount of occurrances of the given `value` in the collection.
	 * @param value - the value to look for
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * const m = HashMultiSet.of(1, 2, 2)
	 * console.log(m.count(5)); // => 0
	 * console.log(m.count(2)); // => 2
	 * ```
	 */
	count<U = T>(value: RelatedTo<T, U>): number;
	/**
	 * Performs given function `f` for each value of the collection, using given `state` as initial traversal state.
	 * @param f - the function to perform for each value, receiving:<br/>
	 * - `value`: the next value<br/>
	 * - `index`: the index of the value<br/>
	 * - `halt`: a function that, if called, ensures that no new values are passed
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - state: (optional) the traversal state
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * const result: number[] = [];
	 * HashMultiSet.of(1, 2, 2, 3).forEach((value, i, halt) => {
	 *   result.push(value);
	 *   if (i >= 1) halt();
	 * });
	 * console.log(result);
	 * // => [ 1, 2 ]
	 * ```
	 */
	forEach(
		f: (value: T, index: number, halt: () => void) => void,
		options?: { state?: TraverseState },
	): void;
	/**
	 * Returns the collection containing only those values for which the given `pred` function returns true.
	 * @param pred - a predicate function receiving:<br/>
	 * - `valueCount`: a tuple of the value and its count<br/>
	 * - `index`: the value-count index<br/>
	 * - `halt`: a function that, when called, ensures no next values are passed
	 * @param options - (optional) an object containing the following properties:<br/>
	 * - negate: (default: false) when true will negate the predicate
	 * @note if the predicate is a type guard, the return type is automatically inferred
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * HashMultiSet.of(1, 2, 2, 3)
	 *   .filterWithCounts(([_, count]) => count > 1)
	 *   .toArray()
	 * // => [2, 2]
	 * ```
	 */
	filterWithCounts<TF extends T>(
		pred: (
			valueCount: readonly [T, number],
			index: number,
		) => valueCount is [TF, number],
		options?: { negate?: false | undefined },
	): WithElem<Tp, TF>['normal'];
	filterWithCounts<TF extends T>(
		pred: (
			valueCount: readonly [T, number],
			index: number,
		) => valueCount is [TF, number],
		options: { negate: true },
	): WithElem<Tp, Exclude<T, TF>>['normal'];
	filterWithCounts(
		pred: (valueCount: readonly [T, number], index: number) => boolean,
		options?: { negate?: boolean },
	): WithElem<Tp, T>['normal'];
	/**
	 * Returns an array containing all values in this collection.
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * console.log(HashMultiSet.of(1, 2, 2).toArray()); // => [ 1, 2, 2 ]
	 * ```
	 * @note O(N)
	 * @note it is safe to mutate the returned array, however, the array elements are not copied, thus should be treated as read-only
	 */
	toArray(): T[];
	/**
	 * Returns a string representation of this collection.
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * console.log(HashMultiSet.of(1, 2, 2).toString()); // => HashMultiSet(1, 2, 2)
	 * ```
	 */
	toString(): string;
	/**
	 * Returns a JSON representation of this collection.
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * console.log(HashMultiSet.of(1, 2, 2).toJSON()); // => { dataType: "HashMultiSet", value: [ [ 1, 1 ], [ 2, 2 ] ] }
	 * ```
	 */
	toJSON(): ToJSON<(readonly [T, number])[]>;
}

export namespace VariantMultiSetBase {
	export interface NonEmpty<
		T,
		Tp extends VariantMultiSetBase.Types = VariantMultiSetBase.Types,
	> extends VariantMultiSetBase<T, Tp>,
			Streamable.NonEmpty<T> {
		/**
		 * Returns false since this collection is known to be non-empty
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * console.log(HashMultiSet.of(1, 2, 2).isEmpty); // => false
		 * ```
		 */
		readonly isEmpty: false;
		/**
		 * Returns the Map representation of this collection.
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * import type { HashMap } from '@rimbu/hashed/map';
		 * const m = HashMultiSet.of(1, 2, 2)
		 * console.log(m.countMap.toArray()); // => [ [ 1, 1 ], [ 2, 2 ] ]
		 * ```
		 */
		readonly countMap: WithElem<Tp, T>['countMapNonEmpty'];
		/**
		 * Returns true since this collection is known to be non-empty
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * console.log(HashMultiSet.of(1, 2, 2).nonEmpty()); // => true
		 * ```
		 */
		nonEmpty(): this is WithElem<Tp, T>['nonEmpty'];
		/**
		 * Returns this collection typed as a 'possibly empty' collection.
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * console.log(HashMultiSet.of(1, 2).asNormal().toArray()); // => [ 1, 2 ]
		 * ```
		 */
		asNormal(): WithElem<Tp, T>['normal'];
		/**
		 * Returns a non-empty Stream containing all values of this collection.
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * console.log(HashMultiSet.of(1, 2, 2).stream().toArray()); // => [ 1, 2, 2 ]
		 * ```
		 */
		stream(): Stream.NonEmpty<T>;
		/**
		 * Returns a non-empty Stream containing all distinct values of this collection.
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * console.log(HashMultiSet.of(1, 2, 2).streamDistinct().toArray()); // => [ 1, 2 ]
		 * ```
		 */
		streamDistinct(): Stream.NonEmpty<T>;
		/**
		 * Returns a non-empty Stream of tuples containing each distinct value and its count.
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * console.log(HashMultiSet.of(1, 2, 2).streamWithCounts().toArray()); // => [ [ 1, 1 ], [ 2, 2 ] ]
		 * ```
		 */
		streamWithCounts(): Stream.NonEmpty<readonly [T, number]>;
		/**
		 * Returns a non-empty array containing all values in this collection.
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * console.log(HashMultiSet.of(1, 2, 2).toArray()); // => [ 1, 2, 2 ]
		 * ```
		 * @note O(N)
		 * @note it is safe to mutate the returned array, however, the array elements are not copied, thus should be treated as read-only
		 */
		toArray(): ArrayNonEmpty<T>;
	}

	/**
	 * Utility interface that provides higher-kinded types for this collection.
	 */
	export interface Types extends Elem {
		readonly normal: VariantMultiSetBase<this['_T']>;
		readonly nonEmpty: VariantMultiSetBase.NonEmpty<this['_T']>;
		readonly countMap: VariantMap<this['_T'], number>;
		readonly countMapNonEmpty: VariantMap.NonEmpty<this['_T'], number>;
	}
}

export interface MultiSetBase<
	T,
	Tp extends MultiSetBase.Types = MultiSetBase.Types,
> extends VariantMultiSetBase<T, Tp> {
	/**
	 * Returns the `context` associated to this collection instance.
	 */
	readonly context: WithElem<Tp, T>['context'];
	/**
	 * Returns the collection with the given `value` added `amount` times.
	 * @param value - the value to add
	 * @param amount - (default: 1) the amount of values to add
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * console.log(HashMultiSet.of(1, 2).add(2).toArray()); // => [ 1, 2, 2 ]
	 * console.log(HashMultiSet.of(1, 2).add(3, 2).toArray()); // => [ 1, 2, 3, 3 ]
	 * ```
	 * @note amount < 0 will be normalized to 0
	 */
	add(value: T): WithElem<Tp, T>['nonEmpty'];
	add(value: T, amount: number): WithElem<Tp, T>['normal'];
	/**
	 * Returns the collection with the values in `values` added.
	 * @param values - a `StreamSource` containing values to add
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * console.log(HashMultiSet.of(1, 2).addAll([2, 3]).toArray()); // => [ 1, 2, 2, 3 ]
	 * ```
	 */
	addAll(values: StreamSource.NonEmpty<T>): WithElem<Tp, T>['nonEmpty'];
	addAll(values: StreamSource<T>): WithElem<Tp, T>['normal'];
	/**
	 * Returns the collection where for every entry in `entries` consisting of a tuple
	 * of a value and an amount, that value is added `amount` times.
	 * @param entries - a `StreamSource` containing tuples that contain a value and an amount
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * HashMultiSet.of(1, 2).addAllWithCounts([[2, 2], [3, 2]]).toArray()
	 * // => [1, 2, 2, 2, 3, 3]
	 * ```
	 */
	addAllWithCounts(
		valueCounts: StreamSource<readonly [T, number]>,
	): WithElem<Tp, T>['normal'];
	/**
	 * Returns the collection where the amount of values of `value` if set to `amount`.
	 * @param value - the value of which to set the amount
	 * @param amount - the new amount of values
	 *
	 * @note if amount <= 0, the value will be removed
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * const m = HashMultiSet.of(1, 2, 2)
	 * console.log(m.setCount(1, 2).toArray()); // => [ 1, 1, 2, 2 ]
	 * console.log(m.setCount(2, 0).toArray()); // => [ 1, 2 ]
	 * ```
	 */
	setCount(value: T, amount: number): WithElem<Tp, T>['normal'];
	/**
	 * Returns the collection where the count of the given `value` is modified according to
	 * the given `update` function.
	 * @param value - the value of which to modify the count
	 * @param update - a function taking the current count and returning a new count.
	 *
	 * @note if the given `value` does not exists, the `update` function is called with 0.
	 * @note if the result of `update` is <= 0, the value will be removed (or not added)
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * const m = HashMultiSet.of(1, 2, 2)
	 * console.log(m.modifyCount(1, v => v + 1).toArray()); // => [ 1, 1, 2, 2 ]
	 * console.log(m.modifyCount(3, v => v + 1).toArray()); // => [ 1, 2, 2, 3 ]
	 * ```
	 */
	modifyCount(
		value: T,
		update: (currentCount: number) => number,
	): WithElem<Tp, T>['normal'];
	/**
	 * Returns a `MultiSet` that is the union of this and given `other` `MultiSet`,
	 * where the count of each value is the maximum of its counts in both collections.
	 * @param other - a `MultiSet` to combine with
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * HashMultiSet.of(1, 2, 2).union(HashMultiSet.of(2, 3)).toArray()
	 * // => [ 1, 2, 2, 3 ]
	 * ```
	 */
	union<U extends T>(other: MultiSet.NonEmpty<U>): WithElem<Tp, T>['nonEmpty'];
	union<U extends T>(other: MultiSet<U>): WithElem<Tp, T>['normal'];
	/**
	 * Returns a `MultiSet` that is the intersection of this and given `other` `MultiSet`,
	 * where the count of each value is the minimum of its counts in both collections.
	 * @param other - a `MultiSet` to combine with
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * HashMultiSet.of(1, 2, 2).intersect(HashMultiSet.of(2, 3)).toArray()
	 * // => [2]
	 * ```
	 */
	intersect<U extends T>(other: MultiSet<U>): WithElem<Tp, T>['normal'];
	/**
	 * Returns a `MultiSet` that is the difference of this and given `other` `MultiSet`,
	 * where the count of each value is the maximum of 0 and (this count - other count).
	 * @param other - a `MultiSet` to subtract
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * HashMultiSet.of(1, 2, 2).difference(HashMultiSet.of(2, 3)).toArray()
	 * // => [ 1, 2 ]
	 * ```
	 */
	difference<U extends T>(other: MultiSet<U>): WithElem<Tp, T>['normal'];
	/**
	 * Returns a `MultiSet` that is the symmetric difference of this and given `other` `MultiSet`,
	 * where the count of each value is the absolute difference of its counts in both collections.
	 * @param other - a `MultiSet` to combine with
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * HashMultiSet.of(1, 2, 2).symDifference(HashMultiSet.of(2, 3)).toArray()
	 * // => [1, 2, 3]
	 * ```
	 */
	symDifference<U extends T>(other: MultiSet<U>): WithElem<Tp, T>['normal'];
	/**
	 * Returns a builder object containing the entries of this collection.
	 * @example
	 * ```ts
	 * import { HashMultiSet } from '@rimbu/multiset/hashed';
	 * const builder = HashMultiSet.of(1, 2, 2).toBuilder()
	 * console.log(builder.size); // => 3
	 * ```
	 */
	toBuilder(): WithElem<Tp, T>['builder'];
}

export namespace MultiSetBase {
	export interface NonEmpty<
		T,
		Tp extends MultiSetBase.Types = MultiSetBase.Types,
	> extends VariantMultiSetBase.NonEmpty<T, Tp>,
			Omit<MultiSetBase<T, Tp>, keyof VariantMultiSetBase.NonEmpty<any, any>>,
			Streamable.NonEmpty<T> {
		/**
		 * Returns a non-empty Stream containing all values of this collection.
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * console.log(HashMultiSet.of(1, 2, 2).stream().toArray()); // => [ 1, 2, 2 ]
		 * ```
		 */
		stream(): Stream.NonEmpty<T>;
		/**
		 * Returns the collection with the given `value` added `amount` times.
		 * @param value - the value to add
		 * @param amount - (default: 1) the amount of values to add
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * console.log(HashMultiSet.of(1, 2).add(2).toArray()); // => [ 1, 2, 2 ]
		 * console.log(HashMultiSet.of(1, 2).add(3, 2).toArray()); // => [ 1, 2, 3, 3 ]
		 * ```
		 * @note amount < 0 will be normalized to 0
		 */
		add(value: T, amount?: number): WithElem<Tp, T>['nonEmpty'];
		/**
		 * Returns the collection with the values in `values` added.
		 * @param values - a `StreamSource` containing values to add
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * console.log(HashMultiSet.of(1, 2).addAll([2, 3]).toArray()); // => [ 1, 2, 2, 3 ]
		 * ```
		 */
		addAll(values: StreamSource<T>): WithElem<Tp, T>['nonEmpty'];
		/**
		 * Returns the collection where for every tuple in `valueCounts` consisting of a value
		 * and an amount, that value is added `amount` times.
		 * @param valueCounts - a `StreamSource` containing tuples of a value and an amount
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * HashMultiSet.of(1, 2).addAllWithCounts([[2, 2], [3, 2]]).toArray()
		 * // => [1, 2, 2, 2, 3, 3]
		 * ```
		 */
		addAllWithCounts(
			valueCounts: StreamSource<readonly [T, number]>,
		): WithElem<Tp, T>['nonEmpty'];
		/**
		 * Returns a non-empty `MultiSet` that is the union of this and given `other` `MultiSet`,
		 * where the count of each value is the maximum of its counts in both collections.
		 * @param other - a `MultiSet` to combine with
		 */
		union(other: MultiSet<T>): WithElem<Tp, T>['nonEmpty'];
	}

	export interface Factory<Tp extends MultiSetBase.Types, UT = unknown> {
		/**
		 * Returns the (singleton) empty instance of this type and context with given key and value types.
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * console.log(HashMultiSet.empty<number>().toArray()); // => []
		 * console.log(HashMultiSet.empty<string>().toArray()); // => []
		 * ```
		 */
		empty<T extends UT>(): WithElem<Tp, T>['normal'];
		/**
		 * Returns an immutable multiset of this collection type and context, containing the given `values`.
		 * @param values - a non-empty array of values
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * console.log(HashMultiSet.of(1, 2, 2).toArray()); // => [ 1, 2, 2 ]
		 * ```
		 */
		of<T extends UT>(...values: ArrayNonEmpty<T>): WithElem<Tp, T>['nonEmpty'];
		/**
		 * Returns an immutable multiset of this type and context, containing the values in the given `sources`
		 * `StreamSource`.
		 * @param sources - a non-empty array of `StreamSource` instances containing values to add
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * console.log(HashMultiSet.from([1, 2], [2, 3, 4]).toArray()); // => [ 1, 2, 2, 3, 4 ]
		 * ```
		 */
		from<T extends UT>(
			...sources: ArrayNonEmpty<StreamSource.NonEmpty<T>>
		): WithElem<Tp, T>['nonEmpty'];
		from<T extends UT>(
			...sources: ArrayNonEmpty<StreamSource<T>>
		): WithElem<Tp, T>['normal'];
		/**
		 * Returns an empty builder instance for this type of collection and context.
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * console.log(HashMultiSet.builder<number>().isEmpty); // => true
		 * ```
		 */
		builder<T extends UT>(): WithElem<Tp, T>['builder'];
		/**
		 * Returns a `Reducer` that appends received items to a MultiSet and returns the MultiSet as a result. When a `source` is given,
		 * the reducer will first create a MultiSet from the source, and then add elements to it.
		 * @param source - (optional) an initial source of elements to add to
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * import { Stream } from '@rimbu/stream';
		 * const someSource = [1, 2, 3];
		 * const result = Stream.range({ start: 20, amount: 5 }).reduce(HashMultiSet.reducer(someSource))
		 * console.log(result.toArray()); // => [ 1, 2, 3, 20, 21, 22, 23, 24 ]
		 * ```
		 * @note uses a MultiSet builder under the hood. If the given `source` is a MultiSet in the same context, it will directly call `.toBuilder()`.
		 */
		reducer<T extends UT>(
			source?: StreamSource<T>,
		): Reducer<T, WithElem<Tp, T>['normal']>;
	}

	export interface Context<
		UT,
		Tp extends MultiSetBase.Types = MultiSetBase.Types,
	> extends MultiSetBase.Factory<Tp, UT> {
		/**
		 * A string tag defining the specific collection type
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * console.log(HashMultiSet.defaultContext().typeTag); // => HashMultiSet
		 * ```
		 */
		readonly typeTag: string;

		readonly _types: Tp;
		/**
		 * The context used for the internal countMap instances.
		 */
		readonly countMapContext: WithElem<Tp, UT>['countMapContext'];

		/**
		 * Returns true if given `obj` could be a valid key in this Context.
		 * @param obj - the object to check
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * console.log(HashMultiSet.defaultContext().isValidElem(1)); // => true
		 * ```
		 */
		isValidElem(key: any): key is UT;
	}

	export interface Builder<
		T,
		Tp extends MultiSetBase.Types = MultiSetBase.Types,
	> {
		/**
		 * Returns the amount of values in the builder.
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * HashMultiSet.of(1, 2, 2).toBuilder().size
		 * // => 3
		 * ```
		 */
		readonly size: number;
		/**
		 * Returns the amount of distinct values in the builder.
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * HashMultiSet.of(1, 2, 2).toBuilder().sizeDistinct
		 * // => 2
		 * ```
		 */
		readonly sizeDistinct: number;
		/**
		 * Returns true if there are no values in the builder.
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * HashMultiSet.of(1, 2, 2).toBuilder().isEmpty
		 * // => false
		 * ```
		 */
		readonly isEmpty: boolean;
		/**
		 * Returns true if the given `value` is present in the builder.
		 * @param value - the value to look for
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * const s = HashMultiSet.of(1, 2, 2).toBuilder()
		 * console.log(s.has(2)); // => true
		 * console.log(s.has(10)); // => false
		 * ```
		 */
		has<U = T>(value: RelatedTo<T, U>): boolean;
		/**
		 * Adds given `value` to the builder.
		 * @param value - the value to add
		 * @returns true if the data in the builder has changed
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * const s = HashMultiSet.of(1, 2, 2).toBuilder()
		 * console.log(s.add(2)); // => true
		 * console.log(s.add(3, 5)); // => true
		 * console.log(s.add(3, 0)); // => false
		 * ```
		 */
		add(value: T, amount?: number): boolean;
		/**
		 * Adds the values in given `values` `StreamSource` to the builder.
		 * @param values - the values to add
		 * @returns true if the data in the builder has changed
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * const s = HashMultiSet.of(1, 2, 2).toBuilder()
		 * console.log(s.addAll([1, 3]));   // => true
		 * console.log(s.addAll([2, 10]));  // => true
		 * ```
		 */
		addAll(values: StreamSource<T>): boolean;
		/**
		 * Adds for each tuple of a value and amount in the given `valueCounts`, the amount of values
		 * to the builder.
		 * @param valueCounts - a `StreamSource` containing tuples of a value and amount
		 * @returns true if the data in the builder has changed
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * const s = HashMultiSet.of(1, 2, 2).toBuilder()
		 * console.log(s.addAllWithCounts([[1, 2], [2, 3]])); // => true
		 * console.log(s.addAllWithCounts([[1, 0], [3, 0]])); // => false
		 * ```
		 */
		addAllWithCounts(valueCounts: StreamSource<readonly [T, number]>): boolean;
		/**
		 * Removes given `amount` or all of given `value` from the builder.
		 * @param value - the value to remove
		 * @param amount - (default: 'ALL') the amount of values to remove
		 * @returns the amount of elements that are removed
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * const s = HashMultiSet.of(1, 2, 2).toBuilder()
		 * console.log(s.remove(10)); // => 0
		 * console.log(s.remove(1, 2)); // => 1
		 * console.log(s.remove(2, 2)); // => 2
		 * ```
		 */
		remove<U = T>(value: RelatedTo<T, U>, amount?: number | 'ALL'): number;
		/**
		 * Removes the given `amount` (default: 'ALL') of occurrences of every value in given
		 * `values` from the builder.
		 * @param values - a `StreamSource` of values to remove.
		 * @param options - (optional) an object containing the following properties:<br/>
		 * - amount: (default: 'ALL') the amount of occurrences to remove per value, or 'ALL' to remove all occurrences.
		 * @returns true if the data in the builder has changed
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * const s = HashMultiSet.of(1, 2, 2).toBuilder()
		 * console.log(s.removeAll([10, 11])); // => false
		 * console.log(s.removeAll([1, 11])); // => true
		 * console.log(s.removeAll([2], { amount: 1 })); // => true
		 * ```
		 */
		removeAll<U = T>(
			values: StreamSource<RelatedTo<T, U>>,
			options?: { amount?: number | 'ALL' },
		): boolean;
		/**
		 * Sets the amount of given `value` in the collection to `amount`.
		 * @param value - the value for which to set the amount
		 * @param amount - the amount of values
		 * @returns true if the data in the builder has changed
		 * @note if amount <= 0, the value will be removed
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * const s = HashMultiSet.of(1, 2, 2).toBuilder()
		 * console.log(s.setCount(1, 1)); // => false
		 * console.log(s.setCount(1, 3)); // => true
		 * ```
		 */
		setCount(value: T, amount: number): boolean;
		/**
		 * Changes the amount of given `value` in the builder according to the result of given `update`
		 * function.
		 * @param value - the value of which to update the amount
		 * @param update - a function taking the current count and returning a new count.
		 * @returns true if the data in the builder has changed
		 *
		 * @note if the given `value` does not exists, the `update` function is called with 0.
		 * @note if the result of `update` is <= 0, the value will be removed (or not added)
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * const s = HashMultiSet.of(1, 2, 2).toBuilder()
		 * console.log(s.modifyCount(3, v => v)); // => false
		 * console.log(s.modifyCount(3, v => v + 1)); // => true
		 * console.log(s.modifyCount(2, v => v + 1)); // => true
		 * ```
		 */
		modifyCount(value: T, update: (currentCount: number) => number): boolean;
		/**
		 * Returns the amount of given `value` in the builder.
		 * @param value - the value to look for
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * const s = HashMultiSet.of(1, 2, 2).toBuilder()
		 * console.log(s.count(10)); // => 0
		 * console.log(s.count(2)); // => 2
		 * ```
		 */
		count<U = T>(value: RelatedTo<T, U>): number;
		/**
		 * Performs given function `f` for each value of the collection, using given `state` as initial traversal state.
		 * @param f - the function to perform for each value, receiving:<br/>
		 * - `value`: the next value<br/>
		 * - `index`: the index of the value<br/>
		 * - `halt`: a function that, if called, ensures that no new values are passed
		 * @param options - (optional) an object containing the following properties:<br/>
		 * - state: (optional) the traversal state
		 * @throws RimbuError.ModifiedBuilderWhileLoopingOverItError if the builder is modified while
		 * looping over it
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * const result: number[] = [];
		 * HashMultiSet.of(1, 2, 2, 3).toBuilder().forEach((value, i, halt) => {
		 *   result.push(value);
		 *   if (i >= 1) halt();
		 * });
		 * console.log(result);
		 * // => [ 1, 2 ]
		 * ```
		 */
		forEach(
			f: (value: T, index: number, halt: () => void) => void,
			options?: { state?: TraverseState },
		): void;
		/**
		 * Returns an immutable instance containing the values in this builder.
		 * @example
		 * ```ts
		 * import { HashMultiSet } from '@rimbu/multiset/hashed';
		 * const s = HashMultiSet.of(1, 2, 2).toBuilder()
		 * const s2 = s.build()
		 * console.log(s2.toArray()); // => [ 1, 2, 2 ]
		 * ```
		 */
		build(): WithElem<Tp, T>['normal'];
	}

	/**
	 * Utility interface that provides higher-kinded types for this collection.
	 */
	export interface Types extends VariantMultiSetBase.Types {
		readonly normal: MultiSetBase<this['_T']>;
		readonly nonEmpty: MultiSetBase.NonEmpty<this['_T']>;
		readonly context: MultiSetBase.Context<this['_T']>;
		readonly builder: MultiSetBase.Builder<this['_T']>;
		readonly countMap: RMap<this['_T'], number>;
		readonly countMapNonEmpty: RMap.NonEmpty<this['_T'], number>;
		readonly countMapContext: RMap.Context<this['_T']>;
	}
}
