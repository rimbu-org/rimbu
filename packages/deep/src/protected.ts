import type { IsAny, IsPlainObj } from '@rimbu/base/plain-object';

/**
 * A deep readonly typed version of the given type `T`.
 * Makes all applicable properties and elements `readonly` and recursively wraps nested values in `Protected`.
 *
 * Mapping rules:
 * - arrays and tuples become `readonly` counterparts and all element types are wrapped in `Protected` when applicable
 * - `Map<K, V>` and `ReadonlyMap<K, V>` become `ReadonlyMap<Protected<K>, Protected<V>>`
 * - `Set<E>` and `ReadonlySet<E>` become `ReadonlySet<Protected<E>>`
 * - `Promise<E>` becomes `Promise<Protected<E>>`
 * - Plain objects with only simple properties (no functions or iterators) will have all properties made `readonly` and their values wrapped in `Protected`
 * - Any other type is left unchanged
 * @typeparam T - the input type
 * @example
 * ```ts
 * type Input = { a: number; b: { c: string } };
 * type P = Protected<Input>;
 * // P is { readonly a: number; readonly b: { readonly c: string } }
 * ```
 */
export type Protected<T> =
	IsAny<T> extends true
		? // to prevent infinite recursion, any will be any
			T
		: T extends readonly any[] & infer A
			? // convert all keys to readonly and all values to `Protected`
				{ readonly [K in keyof A]: Protected<A[K]> }
			: T extends ReadonlyMap<infer K, infer V>
				? ReadonlyMap<Protected<K>, Protected<V>>
				: T extends ReadonlySet<infer E>
					? ReadonlySet<Protected<E>>
					: T extends Promise<infer E>
						? Promise<Protected<E>>
						: IsPlainObj<T> extends true
							? // convert all keys to readonly and all values to `Protected`
								{ readonly [K in keyof T]: Protected<T[K]> }
							: // nothing to do, just return `T`
								T;
