import type { IsAnyFunc, IsArray } from '@rimbu/base/plain-object';
import type { Path } from '@rimbu/deep/path';

import { getAt, type Protected } from '@rimbu/deep';

/**
 * Type defining the allowed selectors on an object of type `T`.
 * Selectors can be:
 * - a path string into type `T`.
 * - a function receiving a `Protected` version of type `T`, and returning an arbitrary value.
 * - a tuple of `Selectors` for type `T`
 * - an object where the property values are `Selectors` for type `T`.
 * @typeparam T - the source value type.
 */
export type Select<T> =
	| Path.Get<T>
	| ((value: Protected<T>) => any)
	| readonly Select<T>[]
	| { readonly [key: string]: Select<T> };

export namespace Select {
	/**
	 * Type defining the shape of allowed selectors, used to improve compiler checking.
	 * @typeparam SL - the selector type
	 */
	export type Shape<SL> =
		IsAnyFunc<SL> extends true
			? // functions are allowed, type provided by `Selector`
				SL
			: IsArray<SL> extends true
				? // ensure tuple type is preserved
					readonly [...(SL extends readonly unknown[] ? SL : never)]
				: SL extends { readonly [key: string]: unknown }
					? // ensure all object properties satisfy `Shape`
						{ readonly [K in keyof SL]: Select.Shape<SL[K]> }
					: // nothing to check
						SL;

	/**
	 * Type defining the result type of applying the SL selector type to the T value type.
	 * @typeparam T - the source value type
	 * @typeparam SL - the selector type
	 */
	export type Result<T, SL> =
		Select<T> extends SL
			? never
			: SL extends (...args: any[]) => infer R
				? R
				: SL extends string
					? Path.Result<T, SL>
					: SL extends readonly unknown[]
						? readonly [...{ readonly [K in keyof SL]: Select.Result<T, SL[K]> }]
						: {
								readonly [K in keyof SL]: Select.Result<T, SL[K]>;
							};
}
/**
 * Returns the result of applying the given `selector` shape to the given `source` value.
 * @typeparam T - the source value type
 * @typeparam SL - the selector shape type
 * @param source - the source value to select from
 * @param selector - a shape indicating the selection from the source values
 * @returns the selected value of type `Select.Result<T, SL>`
 * @example
 * ```ts
 * const item = { a: { b:  1, c: 'a' } };
 * select(item, { q: 'a.c', y: ['a.b', 'a.c'], z: (v) => v.a.b + 1 });
 * // => { q: 'a', y: [1, 'a'], z: 2 }
 * ```
 */
export function select<T, const SL extends Select<T>>(
	source: T,
	selector: Select.Shape<SL>,
): Select.Result<T, SL> {
	if (typeof selector === 'function') {
		// selector is function, resolve selector function
		return (selector as any)(source as Protected<T>);
	} else if (typeof selector === 'string') {
		// selector is string path, get the value at the given path
		return getAt(source, selector as Path.Get<T>) as any;
	} else if (Array.isArray(selector)) {
		// selector is tuple, get each tuple item value
		return selector.map((s) => select(source, s)) as any;
	}

	// selector is object

	const result: any = {};

	for (const key of Object.keys(selector as any)) {
		// set each selected object key to the selector value
		result[key] = select(source, (selector as any)[key]);
	}

	return result;
}

/**
 * Returns a function that selects a certain shape from a given `value` with the given `selector`.
 * @typeparam T - the input value type
 * @typeparam SL - the selector shape type
 * @param selector - a shape indicating the selection from the source values
 * @param source - the value to use the given `selector` on.
 * @returns a function that accepts a `source` value and returns `Select.Result<T, SL>`
 * @example
 * ```ts
 * const items = [{ a: { b:  1, c: 'a' } }, { a: { b: 2, c: 'b' } }];
 * items.map(selectWith({ q: 'a.c', z: ['a.b', v => v.a.b + 1] as const }));
 * // => [{ q: 'a', z: [1, 2] }, { q: 'b', z: [2, 3] }]
 * ```
 */
export function selectWith<T, const SL extends Select<T>>(
	selector: Select.Shape<SL>,
): (source: T) => Select.Result<T, SL> {
	return (source) => select(source, selector);
}

/**
 * Returns the result of applying the given `selector` shape to the given `source` value.
 * @typeparam T - the input value type
 * @typeparam P - the string literal path type in the object
 * @typeparam SL - the selector shape type
 * @param source - the source value to select from
 * @param path - the string path in the object
 * @param selector - a shape indicating the selection from the source value at the given path
 * @returns the selected value at `path` of type `Select.Result<Path.Result<T, P>, SL>`
 * @example
 * ```ts
 * const item = { a: { b:  1, c: 'a' } };
 * selectAt(item, 'a', { q: 'c', z: ['b', v => v.b + 1] as const });
 * // => { q: 'a', z: [1, 2] }
 * ```
 */
export function selectAt<
	T,
	P extends Path.Get<T>,
	const SL extends Select<Path.Result<T, P>>,
>(
	source: T,
	path: P,
	selector: Select.Shape<SL>,
): Select.Result<Path.Result<T, P>, SL> {
	return select(getAt(source, path), selector);
}

/**
 * Returns a function that selects a certain shape from a given `value` with the given `selector` at the given string `path`.
 * @typeparam T - the input value type
 * @typeparam P - the string literal path type in the object
 * @typeparam SL - the selector shape type
 * @param path - the string path in the object
 * @param selector - a shape indicating the selection from the source values
 * @returns a function that accepts a `source` value and returns `Select.Result<Path.Result<T, P>, SL>`
 * @example
 * ```ts
 * const items = [{ a: { b:  1, c: 'a' } }, { a: { b: 2, c: 'b' } }];
 * items.map(selectAtWith('a', { q: 'c', z: ['b', v => v.b + 1] as const }));
 * // => [{ q: 'a', z: [1, 2] }, { q: 'b', z: [2, 3] }]
 * ```
 */
export function selectAtWith<
	T,
	P extends Path.Get<T>,
	const SL extends Select<Path.Result<T, P>>,
>(
	path: P,
	selector: Select.Shape<SL>,
): (source: T) => Select.Result<Path.Result<T, P>, SL> {
	return (source) => selectAt(source, path, selector);
}
