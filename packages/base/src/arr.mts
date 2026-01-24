import { TraverseState, Update, type ArrayNonEmpty } from '@rimbu/common';

/**
 * Internal helper that appends a value using the modern immutable `toSpliced` API.
 * @internal
 * @typeparam T - the array element type
 * @param array - the source array (not mutated)
 * @param value - the value to append
 * @returns a new non-empty array with the value at the end
 */
export function _appendNew<T>(array: readonly T[], value: T): ArrayNonEmpty<T> {
  return (array as any).toSpliced(array.length, 0, value) as ArrayNonEmpty<T>;
}

/**
 * Internal helper that appends a value by cloning and pushing (legacy fallback).
 * @internal
 * @typeparam T - the array element type
 * @param array - the source array (not mutated)
 * @param value - the value to append
 * @returns a new non-empty array with the value at the end
 */
export function _appendOld<T>(array: readonly T[], value: T): ArrayNonEmpty<T> {
  const clone = array.slice();
  clone.push(value);
  return clone as ArrayNonEmpty<T>;
}

/**
 * Returns a copy of the array with the given value appended.
 * Chooses an implementation depending on environment capabilities.
 * @typeparam T - the array element type
 * @param array - the source array (not mutated)
 * @param value - the value to append
 * @returns a new array with the value at the end
 */
export const append = `toSpliced` in Array.prototype ? _appendNew : _appendOld;

/**
 * Returns the concatenation of two arrays, reusing an input array when the other is empty.
 * @typeparam T - the array element type
 * @param first - the first array
 * @param second - the second array
 * @returns a new array containing all elements of both arrays (or one of the originals if the other is empty)
 */
export function concat<T>(
  first: readonly T[],
  second: readonly T[]
): readonly T[] {
  if (first.length === 0) return second;
  if (second.length === 0) return first;
  return first.concat(second);
}

/**
 * Internal helper to create a reversed copy using modern `toReversed` with optional slicing.
 * @internal
 */
export function _reverseNew<T>(
  array: readonly T[],
  start?: number,
  end?: number
): T[] {
  const source =
    undefined !== start || undefined !== end
      ? array.slice(start ?? 0, (end ?? array.length - 1) + 1)
      : array;

  return (source as any).toReversed();
}

/**
 * Internal helper to create a reversed copy using manual iteration (legacy fallback).
 * @internal
 */
export function _reverseOld<T>(
  array: readonly T[],
  start?: number,
  end?: number
): T[] {
  const _start = start ?? 0;
  const _end = end ?? array.length - 1;
  const length = _end - _start + 1;
  const res = [] as T[];

  let arrayIndex = _start - 1;
  let resIndex = length - 1;

  while (++arrayIndex <= _end) res[resIndex--] = array[arrayIndex];

  return res;
}

/**
 * Returns a copy of the array (or a slice) with elements in reversed order.
 * @typeparam T - array element type
 * @param array - the source array
 * @param start - optional start index (inclusive)
 * @param end - optional end index (inclusive)
 */
export const reverse =
  'toReversed' in Array.prototype ? _reverseNew : _reverseOld;

/**
 * Performs the given function for each element of the array, optionally in reverse order.
 * Halting is supported through the provided `TraverseState`.
 * @typeparam T - element type
 * @param array - the source array
 * @param f - callback receiving (value, sequential index, halt)
 * @param state - traversal state (created if omitted)
 * @param reversed - whether to traverse in reverse order
 */
export function forEach<T>(
  array: readonly T[],
  f: (value: T, index: number, halt: () => void) => void,
  state: TraverseState = TraverseState(),
  reversed = false
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
  indexOffset = 0
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
  indexOffset = 0
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
 * Internal helper to prepend a value using `toSpliced`.
 * @internal
 */
export function _prependNew<T>(
  array: readonly T[],
  value: T
): ArrayNonEmpty<T> {
  return (array as any).toSpliced(0, 0, value) as ArrayNonEmpty<T>;
}

/**
 * Internal helper to prepend a value using legacy cloning.
 * @internal
 */
export function _prependOld<T>(
  array: readonly T[],
  value: T
): ArrayNonEmpty<T> {
  const clone = array.slice();
  clone.unshift(value);
  return clone as ArrayNonEmpty<T>;
}

/**
 * Returns a copy of the array with the given value inserted at the start.
 * @typeparam T - element type
 * @param array - the source array
 * @param value - value to insert at index 0
 */
export const prepend =
  `toSpliced` in Array.prototype ? _prependNew : _prependOld;

/**
 * Internal helper to obtain the last element using modern `at`.
 * @internal
 */
export function _lastNew<T>(arr: readonly T[]): T {
  return arr.at(-1)!;
}

/**
 * Internal helper to obtain the last element using index arithmetic.
 * @internal
 */
export function _lastOld<T>(arr: readonly T[]): T {
  return arr[arr.length - 1];
}

/**
 * Returns the last element of the array.
 * @typeparam T - element type
 * @param arr - the array
 */
export const last = `at` in Array.prototype ? _lastNew : _lastOld;

/**
 * Internal helper implementing an immutable index update via `with`.
 * @internal
 */
export function _updateNew<T>(
  arr: readonly T[],
  index: number,
  updater: Update<T>
): readonly T[] {
  if (index < 0 || index >= arr.length) {
    return arr;
  }
  const curValue = arr[index];

  const newValue = Update(curValue, updater);
  if (Object.is(newValue, curValue)) {
    return arr;
  }

  return (arr as any).with(index, newValue);
}

/**
 * Internal helper implementing an immutable index update via cloning.
 * @internal
 */
export function _updateOld<T>(
  arr: readonly T[],
  index: number,
  updater: Update<T>
): readonly T[] {
  if (index < 0 || index >= arr.length) {
    return arr;
  }
  const curValue = arr[index];

  const newValue = Update(curValue, updater);
  if (Object.is(newValue, curValue)) {
    return arr;
  }

  const newArr = arr.slice();
  newArr[index] = newValue;
  return newArr;
}

/**
 * Returns a copy of the array where the element at the given index is replaced using the provided updater.
 * If the result value is identical (by `Object.is`) the original array is returned.
 * @typeparam T - element type
 * @param arr - the source array
 * @param index - the index to update
 * @param updater - value or function update description
 */
export const update = `with` in Array.prototype ? _updateNew : _updateOld;

/**
 * Internal helper applying a modifier function via `with`.
 * @internal
 */
export function _modNew<T>(
  arr: readonly T[],
  index: number,
  f: (value: T) => T
): readonly T[] {
  if (index < 0 || index >= arr.length) {
    return arr;
  }

  const curValue = arr[index];
  const newValue = f(curValue);

  if (Object.is(newValue, curValue)) {
    return arr;
  }

  return (arr as any).with(index, newValue);
}

/**
 * Internal helper applying a modifier function via cloning.
 * @internal
 */
export function _modOld<T>(
  arr: readonly T[],
  index: number,
  f: (value: T) => T
): readonly T[] {
  if (index < 0 || index >= arr.length) {
    return arr;
  }

  const curValue = arr[index];
  const newValue = f(curValue);

  if (Object.is(newValue, curValue)) {
    return arr;
  }

  const newArr = arr.slice();
  newArr[index] = newValue;
  return newArr;
}

/**
 * Returns a copy of the array where the element at the given index is transformed by a modifier function.
 * If the result value is identical (by `Object.is`) the original array is returned.
 * @typeparam T - element type
 * @param arr - the source array
 * @param index - the index to modify
 * @param f - modifier function receiving the current value
 */
export const mod = `with` in Array.prototype ? _modNew : _modOld;

/**
 * Internal helper for inserting a value using `toSpliced`.
 * @internal
 */
export function _insertNew<T>(arr: readonly T[], index: number, value: T): T[] {
  return (arr as any).toSpliced(index, 0, value);
}

/**
 * Internal helper for inserting a value using legacy `splice` on a clone.
 * @internal
 */
export function _insertOld<T>(arr: readonly T[], index: number, value: T): T[] {
  const clone = arr.slice();
  clone.splice(index, 0, value);
  return clone;
}

/**
 * Returns a copy of the array where at the given index the provided value is inserted.
 * @typeparam T - element type
 * @param arr - the source array
 * @param index - insertion index
 * @param value - value to insert
 */
export const insert = `toSpliced` in Array.prototype ? _insertNew : _insertOld;

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
 * Internal helper providing an immutable `splice` using `toSpliced`.
 * @internal
 */
export function _spliceNew<T>(
  arr: readonly T[],
  start: number,
  deleteCount: number,
  ...items: T[]
): T[] {
  return (arr as any).toSpliced(start, deleteCount, ...items);
}

/**
 * Internal helper providing an immutable `splice` via cloning.
 * @internal
 */
export function _spliceOld<T>(
  arr: readonly T[],
  start: number,
  deleteCount: number,
  ...items: T[]
): T[] {
  const clone = arr.slice();
  clone.splice(start, deleteCount, ...items);
  return clone;
}

/**
 * Immutable version of the array `.splice` command, always returning a new array.
 * @typeparam T - element type
 * @param arr - the source array
 * @param start - start index
 * @param deleteCount - number of elements to delete
 * @param items - optional items to insert
 */
export const splice = `toSpliced` in Array.prototype ? _spliceNew : _spliceOld;

/**
 * Returns a copy of a (potentially) sparse array preserving sparsity (skips holes).
 * @typeparam T - element type
 * @param arr - the source sparse array
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
 * @param f - mapping function
 */
export function mapSparse<T, T2>(
  arr: readonly T[],
  f: (value: T, index: number) => T2
): T2[] {
  const result: T2[] = Array(arr.length);

  for (const key in arr) {
    result[key] = f(arr[key], key as any);
  }

  return result;
}
