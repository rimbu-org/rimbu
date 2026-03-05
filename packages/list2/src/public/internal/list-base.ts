import type { Elem, WithElem } from '@rimbu/collection-types/common';
import type { OptLazy } from '@rimbu/common/opt-lazy';

export interface ListBase<T, Tp extends ListBase.Types = ListBase.Types> {
	/**
	 * The list context that acts as a factory for all related list instances.
	 */
	readonly context: Tp['context'];
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
}

export namespace ListBase {
	export interface NonEmpty<T, Tp extends ListBase.Types = ListBase.Types>
		extends ListBase<T, Tp> {
		reversed(): WithElem<Tp, T>['nonEmpty'];
	}

	export interface Builder<T, Tp extends ListBase.Types = ListBase.Types> {
		get length(): number;
		get(index: number): T;
		prepend(value: T): void;
		append(value: T): void;
		build(): WithElem<Tp, T>['normal'];
	}

	export interface Context<Tp extends ListBase.Types = ListBase.Types>
		extends ListBase.Factory<Tp> {
		readonly minBlockSize: number;
		readonly maxBlockSize: number;
	}

	export interface Factory<Tp extends ListBase.Types = ListBase.Types> {
		createContext(): Tp['context'];
		empty<T extends Tp['_UT']>(): WithElem<Tp, T>['normal'];
		builder<T extends Tp['_UT']>(): WithElem<Tp, T>['builder'];
	}

	export interface LeafChildrenTag {
		__leafChildrenTag?: true;
	}

	export interface Types extends Elem {
		readonly _UT: unknown;
		readonly normal: ListBase<this['_T']>;
		readonly nonEmpty: ListBase.NonEmpty<this['_T']>;
		readonly builder: ListBase.Builder<this['_T']>;
		readonly context: ListBase.Context;
		readonly leafChildren: LeafChildrenTag;
	}
}
