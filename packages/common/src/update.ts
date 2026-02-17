/**
 * A value of type T, or a function taking a value of type T and returning a new value of type T.
 * @typeparam T - the value type
 */
export type Update<T> = T | ((value: T) => T);

/**
 * Returns the result of given `update` parameter, where it can either directly give a new value,
 * or it is a function receiving the given `value`, and returns a new value.
 * @typeparam T - the value type
 * @param value - the current value
 * @param update - an `Update` value, either a new value or a function receiving the old value
 * and returning a new one.
 * @example
 * ```ts
 * Update(1, 2)          // => 2
 * Update(1, () => 10)   // => 10
 * Update(1, v => v + 1) // => 2
 * ```
 * @returns the updated value of type `T`
 */
export function Update<T>(value: T, update: Update<T>): T {
	if (typeof update === 'function') {
		return (update as (value: T) => T)(value);
	}
	return update;
}
