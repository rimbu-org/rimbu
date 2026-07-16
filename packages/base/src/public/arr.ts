import type { ArrayNonEmpty } from '@rimbu/common/types';

import { TraverseState } from '@rimbu/common/traverse-state';

/**
 * Returns a copy of the array with the given value appended.
 * Chooses an implementation depending on environment capabilities.
 * @typeparam T - the array element type
 * @param array - the source array (not mutated)
 * @param value - the value to append
 * @returns a new array with the value at the end
 */
export function append<T>(array: readonly T[], value: T): ArrayNonEmpty<T> {
	return array.toSpliced(array.length, 0, value) as ArrayNonEmpty<T>;
}

/**
 * Returns the concatenation of two arrays, reusing an input array when the other is empty.
 * @typeparam T - the array element type
 * @param first - the first array
 * @param second - the second array
 * @returns a new array containing all elements of both arrays (or one of the originals if the other is empty)
 */
export function concat<T>(
	first: readonly T[],
	second: readonly T[],
): readonly T[] {
	if (first.length === 0) return second;
	if (second.length === 0) return first;
	return first.concat(second);
}

/**
 * Returns a copy of the array (or a slice) with elements in reversed order.
 * @typeparam T - array element type
 * @param array - the source array
 * @param start - optional start index (inclusive)
 * @param end - optional end index (inclusive)
 * @returns a new array containing the selected range with elements in reversed order
 */
export function reverse<T>(
	array: readonly T[],
	start?: number,
	end?: number,
): T[] {
	const source =
		undefined !== start || undefined !== end
			? array.slice(start ?? 0, (end ?? array.length - 1) + 1)
			: array;

	return source.toReversed();
}

/**
 * Performs the given function for each element of the array, optionally in reverse order.
 * Halting is supported through the provided `TraverseState`.
 * @typeparam T - element type
 * @param array - the source array
 * @param f - callback receiving `(value, sequentialIndex, halt)` where `sequentialIndex` is
 * the traversal index produced by the supplied `TraverseState` (not the raw array index)
 * @param state - traversal state (created if omitted)
 * @param reversed - whether to traverse in reverse order
 * @returns void
 */
export function forEach<T>(
	array: readonly T[],
	f: (value: T, index: number, halt: () => void) => void,
	state: TraverseState = TraverseState(),
	reversed = false,
): void {
	if (state.halted) return;

	const { halt } = state;

	if (reversed) {
		let i = array.length;

		while (!state.halted && --i >= 0) {
			f(array[i], state.nextIndex(), halt);
		}
	} else {
		const length = array.length;
		let i = -1;

		while (!state.halted && ++i < length) {
			f(array[i], state.nextIndex(), halt);
		}
	}
}

/**
 * Returns a copy of the array where the given function is applied to each element.
 * Supports an index offset useful for composed traversals.
 * @typeparam T - source element type
 * @typeparam R - result element type
 * @param array - the source array
 * @param f - the mapping function
 * @param indexOffset - optional start index value passed to `f`
 */
export function map<T, R>(
	array: readonly T[],
	f: (value: T, index: number) => R,
	indexOffset = 0,
): R[] {
	if (indexOffset === 0) {
		// without offset, can use standard array map
		return array.map(f);
	}

	const result: R[] = [];

	let index = indexOffset;
	let i = -1;
	const length = array.length;
	while (++i < length) {
		result[i] = f(array[i], index++);
	}
	return result;
}

/**
 * Returns a copy of the array where the given function is applied to each element in reverse order.
 * @typeparam T - source element type
 * @typeparam R - result element type
 * @param array - the source array
 * @param f - the mapping function
 * @param indexOffset - optional index offset passed to `f`
 */
export function reverseMap<T, R>(
	array: readonly T[],
	f: (value: T, index: number) => R,
	indexOffset = 0,
): R[] {
	const result: R[] = [];

	let index = indexOffset;
	let arrayIndex = array.length;
	let resultIndex = 0;
	while (--arrayIndex >= 0)
		result[resultIndex++] = f(array[arrayIndex], index++);

	return result;
}

/**
 * Returns a copy of the array with the given value inserted at the start.
 * @typeparam T - element type
 * @param array - the source array
 * @param value - value to insert at index 0
 */
export function prepend<T>(array: readonly T[], value: T): ArrayNonEmpty<T> {
	return array.toSpliced(0, 0, value) as ArrayNonEmpty<T>;
}

/**
 * Returns a copy of the array where the element at the given index is replaced using the provided updater.
 * If the result value is identical (by `Object.is`) the original array is returned.
 * @typeparam T - element type
 * @param arr - the source array
 * @param index - the index to update
 * @param updater - function receiving the current value and returning the new value; if it
 * returns the same value (by `Object.is`) the original array is returned
 */
export function update<T>(
	arr: readonly T[],
	index: number,
	updater: (value: T) => T,
): readonly T[] {
	if (index < 0 || index >= arr.length) {
		return arr;
	}
	const curValue = arr[index];

	const newValue = updater(curValue);
	if (Object.is(newValue, curValue)) {
		return arr;
	}

	return arr.with(index, newValue);
}

/**
 * Returns a copy of the array where at the given index the provided value is set.
 * If the new value is identical (by `Object.is`) to the current value, or the index is
 * out of range, the original array is returned.
 * @typeparam T - element type
 * @param arr - the source array (not mutated)
 * @param index - the index at which to set the new value
 * @param newValue - the value to set at the given index
 * @returns a new array with the value set, or the original array if unchanged or out of range
 */
export function set<T>(
	arr: readonly T[],
	index: number,
	newValue: T,
): readonly T[] {
	if (index < 0 || index >= arr.length) {
		return arr;
	}
	const curValue = arr[index];

	if (Object.is(newValue, curValue)) {
		return arr;
	}

	return arr.with(index, newValue);
}

/**
 * Returns a copy of the array where at the given index the provided value is inserted.
 * @typeparam T - element type
 * @param arr - the source array
 * @param index - insertion index
 * @param value - value to insert
 */
export function insert<T>(arr: readonly T[], index: number, value: T): T[] {
	return arr.toSpliced(index, 0, value);
}

/**
 * Returns a copy of the array without its first element.
 * @typeparam T - element type
 * @param arr - the source array
 */
export function tail<T>(arr: readonly T[]): T[] {
	return arr.slice(1);
}

/**
 * Returns a copy of the array without its last element.
 * @typeparam T - element type
 * @param arr - the source array
 */
export function init<T>(arr: readonly T[]): T[] {
	return arr.slice(0, arr.length - 1);
}

/**
 * Returns a copy of a (potentially) sparse array preserving sparsity (skips holes).
 * @typeparam T - element type
 * @param arr - the source sparse array
 * @returns a new array with the same length where present elements are copied and holes are preserved
 */
export function copySparse<T>(arr: readonly T[]): T[] {
	const clone: T[] = [];
	for (const key in arr) {
		clone[key] = arr[key];
	}
	return clone;
}

/**
 * Returns a copy of a sparse array applying the given function to each present element, preserving holes.
 * @typeparam T - source element type
 * @typeparam T2 - result element type
 * @param arr - the source sparse array
 * @param f - mapping function receiving `(value, index)` where `index` is the element key
 * (the numeric index in string form) for present elements; holes are preserved
 * @returns a new sparse array with mapped values for present indices
 */
export function mapSparse<T, T2>(
	arr: readonly T[],
	f: (value: T, index: number) => T2,
): T2[] {
	const result: T2[] = Array(arr.length);

	for (const key in arr) {
		result[key] = f(arr[key], key as any);
	}

	return result;
}
