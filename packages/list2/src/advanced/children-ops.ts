import type { Op } from '@rimbu/collection-types/types';
import type { ArrayNonEmpty, IndexRange } from '@rimbu/common';
import type { Stream } from '@rimbu/stream';

/**
 * Pluggable leaf-storage abstraction. Each tree node delegates its element
 * access to a ChildrenOps instance, making the backing store swappable
 * (plain arrays, typed arrays, bit arrays, string slices, etc.) without
 * changing any tree structure logic.
 *
 * The {@link Tp} type parameter carries the concrete children type through
 * the HKT pattern: each method resolves `(Tp & { _T: T })['_C']` to the
 * implementation-specific children type for element type `T`.
 *
 * Methods are split into two families:
 * - **Immutable** — return a new collection (or the same one when unchanged).
 * - **Mutable** (`mutate*` prefix) — mutate in place and return the same
 *   reference. Only used inside builders; callers must ensure exclusive
 *   ownership.
 */
export interface ChildrenOps<Tp extends ChildrenOps.Types = ChildrenOps.Types> {
	// -- construction -------------------------------------------------------
	/** Create a children collection from an array of values. */
	of<T extends Tp['_T']>(values: T[]): (Tp & { _T: T })['_C'];

	// -- immutable reads ----------------------------------------------------
	/** Number of elements in the children collection. */
	size(children: Tp['_C']): number;
	/** Element at `index`. No bounds checking — caller must validate. */
	at<T extends Tp['_T']>(children: (Tp & { _T: T })['_C'], index: number): T;
	/**
	 * Iterate each element. If `reversed` is true, iterate in reverse order.
	 * Iteration order is unspecified for non-indexed backends.
	 */
	forEach<T extends Tp['_T']>(
		children: (Tp & { _T: T })['_C'],
		f: (value: T) => void,
		options?: { reversed?: boolean | undefined } | undefined,
	): void;
	/** Full array of all elements. */
	toArray<T extends Tp['_T']>(
		children: (Tp & { _T: T })['_C'],
		reversed?: boolean,
	): ArrayNonEmpty<T>;
	/**
	 * Slice of elements from `start` (inclusive) to `end` (exclusive),
	 * optionally reversed. Returns `T[]` (may be empty).
	 */
	sliceArray<T extends Tp['_T']>(
		children: (Tp & { _T: T })['_C'],
		start: number,
		end: number,
		reversed?: boolean | undefined,
	): T[];
	/** Elements joined with `separator`. */
	join(children: Tp['_C'], separator: string, reversed?: boolean): string;

	// -- immutable streams --------------------------------------------------
	/** Stream all elements, optionally reversed. */
	stream<T extends Tp['_T']>(
		children: (Tp & { _T: T })['_C'],
		options?: { reversed?: boolean | undefined } | undefined,
	): Stream.NonEmpty<T>;
	/** Stream elements within `range`, optionally reversed. */
	streamRange<T extends Tp['_T']>(
		children: (Tp & { _T: T })['_C'],
		range: IndexRange,
		options?: { reversed?: boolean | undefined } | undefined,
	): Stream<T>;

	// -- immutable single-element updates -----------------------------------
	/**
	 * New children collection with `value` at `index`. Returns the original
	 * collection if the value is unchanged (structural sharing).
	 */
	setAt<T extends Tp['_T']>(
		children: (Tp & { _T: T })['_C'],
		index: number,
		value: T,
	): (Tp & { _T: T })['_C'];
	/**
	 * New children collection with the result of `update(current)` at
	 * `index`. Returns the original if the updated value is unchanged.
	 */
	updateAt<T extends Tp['_T']>(
		children: (Tp & { _T: T })['_C'],
		index: number,
		update: (current: T) => T,
	): Op.WithResult<(Tp & { _T: T })['_C'], [previous: T, current: T], true>;

	// -- immutable bulk transformations -------------------------------------
	/** New collection with `value` prepended. */
	prepend<T extends Tp['_T']>(
		children: (Tp & { _T: T })['_C'],
		value: T,
	): (Tp & { _T: T })['_C'];
	/** New collection with `value` appended. */
	append<T extends Tp['_T']>(
		children: (Tp & { _T: T })['_C'],
		value: T,
	): (Tp & { _T: T })['_C'];
	/**
	 * New collection concatenating `children1 + children2`. Returns the
	 * non-empty operand if the other is empty (structural sharing).
	 */
	concat<T extends Tp['_T']>(
		children1: (Tp & { _T: T })['_C'],
		children2: (Tp & { _T: T })['_C'],
	): (Tp & { _T: T })['_C'];
	/**
	 * New collection with `deleteCount` elements removed starting at `start`,
	 * optionally inserting `items` in their place.
	 */
	toSpliced<T extends Tp['_T']>(
		children: (Tp & { _T: T })['_C'],
		start: number,
		deleteCount: number,
		items?: (Tp & { _T: T })['_C'] | undefined,
	): (Tp & { _T: T })['_C'];
	/**
	 * New collection with element order reversed. Returns the original if
	 * there are 0 or 1 elements.
	 */
	toReversed<T extends Tp['_T']>(
		children: (Tp & { _T: T })['_C'],
	): (Tp & { _T: T })['_C'];
	/**
	 * New collection with only elements satisfying `f`. Returns the original
	 * if all elements pass.
	 */
	filter<T extends Tp['_T']>(
		children: (Tp & { _T: T })['_C'],
		f: (value: T) => boolean,
		options?: { negate?: boolean | undefined } | undefined,
	): (Tp & { _T: T })['_C'] | undefined;
	reverseFilter<T extends Tp['_T']>(
		children: (Tp & { _T: T })['_C'],
		f: (value: T) => boolean,
		options?: { negate?: boolean | undefined } | undefined,
	): (Tp & { _T: T })['_C'] | undefined;
	/** New collection with each element transformed by `f`. */
	map<T extends Tp['_T'], T2 extends Tp['_T']>(
		children: (Tp & { _T: T })['_C'],
		f: (value: T) => T2,
	): (Tp & { _T: T2 })['_C'];
	/**
	 * Like {@link map}, but applies `f` in reverse order. Useful for
	 * building a reversed copy in a single pass.
	 */
	reverseMap<T extends Tp['_T'], T2 extends Tp['_T']>(
		children: (Tp & { _T: T })['_C'],
		f: (value: T) => T2,
	): (Tp & { _T: T2 })['_C'];

	// -- mutable operations (builder-only, requires exclusive ownership) ----
	/** Set `value` at `index` in place. Returns the same reference. */
	mutateUpdate<T extends Tp['_T']>(
		children: (Tp & { _T: T })['_C'],
		index: number,
		f: (value: T) => T,
	): [result: (Tp & { _T: T })['_C'], previous: T, current: T];
	/** Prepend `value` in place. Returns the same reference. */
	mutatePrepend<T extends Tp['_T']>(
		children: (Tp & { _T: T })['_C'],
		value: T,
	): (Tp & { _T: T })['_C'];
	/** Append `value` in place. Returns the same reference. */
	mutateAppend<T extends Tp['_T']>(
		children: (Tp & { _T: T })['_C'],
		value: T,
	): (Tp & { _T: T })['_C'];
	/**
	 * Remove `deleteCount` elements starting at `start` in place, optionally
	 * inserting `items`. Returns `[result, deleted]` — both are the original
	 * reference (mutated) and a new array containing removed elements.
	 */
	mutateSplice<T extends Tp['_T']>(
		children: (Tp & { _T: T })['_C'],
		start: number,
		deleteCount?: number | undefined,
		items?: (Tp & { _T: T })['_C'] | undefined,
	): [result: (Tp & { _T: T })['_C'], deleted: (Tp & { _T: T })['_C']];
	/**
	 * Drop the first element in place. Returns `[result, dropped]` — the
	 * mutated reference and the removed value.
	 */
	mutateDropFirst<T extends Tp['_T']>(
		children: (Tp & { _T: T })['_C'],
	): [result: (Tp & { _T: T })['_C'], dropped: T];
	/**
	 * Drop the last element in place. Returns `[result, dropped]` — the
	 * mutated reference and the removed value.
	 */
	mutateDropLast<T extends Tp['_T']>(
		children: (Tp & { _T: T })['_C'],
	): [result: (Tp & { _T: T })['_C'], dropped: T];

	// -- ownership helpers --------------------------------------------------
	/** Make the children collection immutable (e.g. `Object.freeze`). */
	guard<T extends Tp['_T']>(
		children: (Tp & { _T: T })['_C'],
	): (Tp & { _T: T })['_C'];
	/** Return a mutable copy safe for builder operations. */
	safeCopy<T extends Tp['_T']>(
		children: (Tp & { _T: T })['_C'],
	): (Tp & { _T: T })['_C'];
}

/**
 * Phantom-type marker for children collections. Concrete backends intersect
 * this with their actual storage type so the type-system can distinguish
 * children from plain values while the runtime representation stays zero-cost.
 */
export interface OuterChildren<T> {
	__outerChildrenTag?: T;
}

export declare namespace ChildrenOps {
	/** HKT slots: `_T` = element type, `_C` = concrete children type. */
	export interface Types {
		_T: unknown;
		_C: OuterChildren<this['_T']>;
	}
}
