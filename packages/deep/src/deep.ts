import type { Path } from '@rimbu/deep/path';
import type { Protected } from '@rimbu/deep/protected';

import { stringSplit } from '#deep/string-split';

export type * from '@rimbu/deep/protected';
export type { WithType } from '@rimbu/deep/with-type';

export * from '@rimbu/deep/match';
export * from '@rimbu/deep/patch';
export * from '@rimbu/deep/path';
export * from '@rimbu/deep/select';
export * from '@rimbu/deep/tuple';
export { withType } from '@rimbu/deep/with-type';

/**
 * Returns the same value wrapped in the `Protected` type.
 * @typeparam T - the source value type
 * @param source - the value to wrap
 * @note does not perform any runtime protection, it is only a utility to easily add the `Protected`
 * type to a value
 * @example
 * ```ts
 * import { protect, getAt, getAtWith } from '@rimbu/deep';
 * const obj = protect({ a: 1, b: { c: true, d: [1] } })
 * // obj is deeply readonly: reassigning any property (e.g. obj.a = 2) is a compiler error
 * ```
 * @returns the same value with the `Protected<T>` type applied (compile-time only)
 */
export function protect<T>(source: T): Protected<T> {
	return source as Protected<T>;
}

/**
 * Returns the value resulting from selecting the given `path` in the given `source` object.
 * It supports optional chaining for nullable values or values that may be undefined, and also
 * for accessing objects inside an array.
 * There is currently no support for forcing non-null (the `!` operator).
 * @typeparam T - the object type to select in
 * @typeparam P - a Path in object type T
 * @param source - the object to select in
 * @param path - the path into the object
 * @example
 * ```ts
 * import { protect, getAt, getAtWith } from '@rimbu/deep';
 * const value = { a: { b: [{ c: 5 }] } } as const
 * getAt(value, 'a.b[0].c')   // => 5
 * getAt(value, 'a.b[0]')     // => { c: 5 }
 * ```
 * @returns the selected value (type `Path.Result<T, P>`) or `undefined` if the path does not exist
 */
export function getAt<T, P extends Path.Get<T>>(
	source: T,
	path: P,
): Path.Result<T, P> {
	if (path === '') {
		// empty path always directly returns source value
		// cast needed: TS cannot evaluate PathResultInternal.For<T, [], false> = T at compile time
		return source as any;
	}

	const items = stringSplit(path);

	// cast needed: dynamic property access by string key cannot be typed incrementally;
	// the return statement at the end carries the correct Path.Result<T, P> type
	let result = source as any;

	for (const item of items) {
		if (undefined === item || item === '') {
			// stringSplit splits on '[' and ']', so '[' is consumed as a delimiter
			// and never appears as a token; empty strings come from ']' and '?.' delimiters
			continue;
		}

		if (undefined === result || null === result) {
			// optional chaining assumed and no value available, skip rest of path and return undefined
			// cast needed: Path.Result<T, P> includes | undefined for optional-chain paths,
			// but TS cannot verify that the specific P in scope guarantees undefined is assignable
			return undefined as any;
		}

		// set current result to subpath value
		result = result[item];
	}

	return result;
}

/**
 * Returns a function that gets the value at the given string `path` inside an object.
 * @typeparam T - the input value type
 * @typeparam P - the string literal path type in the object
 * @param path - the string path in the object
 * @returns a function that receives `source: T` and returns `Path.Result<T, P>` for that `path`
 * @example
 * ```ts
 * import { protect, getAt, getAtWith } from '@rimbu/deep';
 * const items = [{ a: { b:  1, c: 'a' } }, { a: { b: 2, c: 'b' } }];
 * items.map(getAtWith('a.c'));
 * // => ['a', 'b']
 * ```
 */
export function getAtWith<T, P extends Path.Get<T>>(
	path: P,
): (source: T) => Path.Result<T, P> {
	return (source) => getAt(source, path);
}
