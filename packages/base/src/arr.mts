import { Update, TraverseState, ArrayNonEmpty } from '@rimbu/common';

// Returns a copy of the array with the given value appended
export function append<T>(array: readonly T[], value: T): ArrayNonEmpty<T> {
  const clone = array.slice();
  clone.push(value);
  return clone as ArrayNonEmpty<T>;
}

// Returns the concatenation of the two arrays, potentially reusing the input array if one of the arrays is empty
export function concat<T>(
  first: readonly T[],
  second: readonly T[]
): readonly T[] {
  if (first.length === 0) return second;
  if (second.length === 0) return first;
  return first.concat(second);
}

// Returns an copy of the array between the start and end indices, with the elements in reversed order.
export function reverse<T>(
  array: readonly T[],
  start = 0,
  end = array.length - 1
): T[] {
  const length = end - start + 1;
  const res = [] as T[];

  let arrayIndex = start - 1;
  let resIndex = length - 1;

  while (++arrayIndex <= end) res[resIndex--] = array[arrayIndex];

  return res;
}

// Performs given function on each element of the array, in reverse order if 'reversed' is true.
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

// Returns a copy of the array where given function is applied to each element
export function map<T, R>(
  array: readonly T[],
  f: (value: T, index: number) => R,
  indexOffset = 0
): R[] {
  const result: R[] = [];

  let index = indexOffset;
  let i = -1;
  const length = array.length;
  while (++i < length) {
    result[i] = f(array[i], index++);
  }
  return result;
}

// Returns a copy of the array where given functio is applied to each element in reverse order
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

// Returns a copy of the given array with the given value added at the start
export function prepend<T>(array: readonly T[], value: T): ArrayNonEmpty<T> {
  const clone = array.slice();
  clone.unshift(value);
  return clone as ArrayNonEmpty<T>;
}

// Returns the last element of the array
export function last<T>(arr: readonly T[]): T {
  return arr[arr.length - 1];
}

// Returns a copy of the array where the element at given index is replaced by the given updater.
// If the new element is the same as the old element, the original array is returned
export function update<T>(
  arr: readonly T[],
  index: number,
  updater: Update<T>
): readonly T[] {
  if (index < 0 || index >= arr.length) return arr;
  const curValue = arr[index];

  const newValue = Update(curValue, updater);
  if (Object.is(newValue, curValue)) return arr;
  const newArr = arr.slice();
  newArr[index] = newValue;
  return newArr;
}

// Returns a copy of the array where the element at given index is replaced by applying given function.
// If the new element is the same as the old element, the original array is returned
export function mod<T>(
  arr: readonly T[],
  index: number,
  f: (value: T) => T
): readonly T[] {
  if (index < 0 || index >= arr.length) return arr;

  const curValue = arr[index];
  const newValue = f(curValue);
  if (Object.is(newValue, curValue)) return arr;
  const newArr = arr.slice();
  newArr[index] = newValue;
  return newArr;
}

// Returns a copy of the array where at given index the given value is inserted
export function insert<T>(arr: readonly T[], index: number, value: T): T[] {
  const clone = arr.slice();
  clone.splice(index, 0, value);
  return clone;
}

// Returns a copy of the array, without its first element
export function tail<T>(arr: readonly T[]): T[] {
  return arr.slice(1);
}

// Returns a copy of the array, without its last element
export function init<T>(arr: readonly T[]): T[] {
  return arr.slice(0, arr.length - 1);
}

// Immutable version of the array .splice command, always returns a new array
export function splice<T>(
  arr: readonly T[],
  start: number,
  deleteCount: number,
  ...items: T[]
): T[] {
  const clone = arr.slice();
  clone.splice(start, deleteCount, ...items);
  return clone;
}

// Returns a copy of the array, where its 'sparse' property is kept (sparse = not all indices have a value)
export function copySparse<T>(arr: readonly T[]): T[] {
  const clone: T[] = [];
  for (const key in arr) {
    clone[key] = arr[key];
  }
  return clone;
}

// Returns a copy of the array with given function applied to each element, where its 'sparse' property is kept
// (sparse = not all indices have a value)
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
