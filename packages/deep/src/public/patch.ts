import type { Protected } from '@rimbu/deep';
import type { Path } from '@rimbu/deep/path';
import type { Tuple } from '@rimbu/deep/tuple';

import {
	type IsAnyFunc,
	type IsArray,
	type IsPlainObj,
	isPlainObj,
} from '@rimbu/base/plain-object';

import { stringSplit } from '#private/string-split';

/**
 * A type to determine the allowed input type for the `patch` function.
 * @typeparam T - the input type to be patched
 */
export type Patch<T, C = T> = Patch.Entry<T, C, T, T>;

export namespace Patch {
	/**
	 * The entry type for a (nested) patch. Can be either a patch object or a function accepting the nested patch function and returning a patch object.
	 * @typeparam T - the input value type
	 * @typeparam C - a utility type
	 * @typeparam P - the parent type
	 * @typeparam R - the root object type
	 */
	export type Entry<T, C, P, R> =
		IsAnyFunc<T> extends true
			? T
			: IsPlainObj<T> extends true
				? Patch.WithResult<T, P, R, Patch.Obj<T, C, R>>
				: Tuple.IsTuple<T> extends true
					? Patch.WithResult<T, P, R, T | Patch.Tup<T, C, R>>
					: IsArray<T> extends true
						? Patch.WithResult<T, P, R, T>
						: Patch.WithResult<T, P, R, T>;

	/**
	 * Either result type S, or a patch function with the value type, the parent type, and the root type.
	 * @typeparam T - the value type
	 * @typeparam P - the parent type
	 * @typeparam R - the root type
	 * @typeparam S - the result type
	 */
	export type WithResult<T, P, R, S> = S | Patch.Func<T, P, R, S>;

	/**
	 * A function patch type that is a function taking the current value, the parent and root values,
	 * and returns a return value.
	 * @typeparam T - the value type
	 * @typeparam P - the parent type
	 * @typeparam R - the root type
	 * @typeparam S - the result type
	 */
	export type Func<T, P, R, S> = (
		current: Protected<T>,
		parent: Protected<P>,
		root: Protected<R>,
	) => Protected<S>;

	/**
	 * A type defining the allowed patch values for tuples.
	 * @typeparam T - the input tuple type
	 * @typeparam C - a utility type
	 * @typeparam R - the root type
	 */
	export type Tup<T, C, R> = {
		[K in Tuple.KeysOf<T>]?: Patch.Entry<T[K & keyof T], C[K & keyof C], T, R>;
	} & NotIterable;

	/**
	 * Utility type to exclude Iterable types.
	 */
	export type NotIterable = {
		[Symbol.iterator]?: never;
	};

	/**
	 * A type defining the allowed patch values for objects.
	 * @typeparam T - the input value type
	 * @typeparam C - a utility type
	 * @typeparam R - the root object type
	 */
	export type Obj<T, C, R> = T | Patch.ObjProps<T, C, R>[];

	/**
	 * A type defining the allowed patch values for object properties.
	 * @typeparam T - the input value type
	 * @typeparam C - a utility type
	 * @typeparam R - the root object type
	 */
	export type ObjProps<T, C, R> = {
		[K in keyof C]?: K extends keyof T ? Patch.Entry<T[K], C[K], T, R> : never;
	};
}

/**
 * Returns an immutably updated version of the given `value` where the given `patchItems` have been
 * applied to the result.
 * The Rimbu patch notation is as follows:
 * - if the target is a simple value or array, the patch can be the same type or a function returning the same type
 * - if the target is a tuple (array of fixed length), the patch be the same type or an object containing numeric keys with patches indicating the tuple index to patch
 * - if the target is an object, the patch can be the same type, or an array containing partial keys with their patches for the object
 * @typeparam T - the type of the value to patch
 * @typeparam TE - a utility type
 * @typeparam TT - a utility type
 * @param value - the input value to patch
 * @param patchItem - the `Patch` value to apply to the input value
 * @example
 * ```ts
 * const input = { a: 1, b: { c: true, d: 'a' } }
 * patch(input, [{ a: 2 }])  // => { a: 2, b: { c: true, d: 'a' } }
 * patch(input, [{ b: [{ c: (v) => !v }] }] )
 * // => { a: 1, b: { c: false, d: 'a' } }
 * patch(input, [{ a: (v) => v + 1, b: [{ d: 'q' }] }] )
 * // => { a: 2, b: { c: true, d: 'q' } }
 * ```
 */
export function patch<T, TE extends T = T, TT = T>(
	value: T,
	patchItem: Patch<TE, T & TT>,
): T {
	return patchEntry(value, value, value, patchItem as Patch<T>);
}

function patchEntry<T, C, P, R>(
	value: T,
	parent: P,
	root: R,
	patchItem: Patch.Entry<T, C, P, R>,
): T {
	if (Object.is(value, patchItem)) {
		// patching a value with itself never changes the value
		return value;
	}

	if (typeof value === 'function') {
		// function input, directly return patch
		return patchItem as T;
	}

	if (typeof patchItem === 'function') {
		// function patch always needs to be resolved first
		const item = patchItem(value, parent, root);

		return patchEntry(value, parent, root, item);
	}

	if (isPlainObj(value)) {
		// value is plain object
		return patchPlainObj(value, root, patchItem as any);
	}

	if (Array.isArray(value)) {
		// value is tuple or array
		return patchArr(value, root, patchItem as any);
	}

	// value is primitive type or complex object

	return patchItem as T;
}

function patchPlainObj<T, C, R>(
	value: T,
	root: R,
	patchItem: T | Patch.Obj<T, C, R>,
): T {
	if (!Array.isArray(patchItem)) {
		// the patch is a complete replacement of the current value

		return patchItem as T;
	}

	// patch is an array of partial updates

	// copy the input value
	const result = { ...value };

	let anyChange = false;

	// loop over patches in array
	for (const entry of patchItem) {
		// update root if needed
		const currentRoot = (value as any) === root ? { ...result } : root;

		// keep current updated result as parent
		const parent = { ...result };

		// loop over all the patch keys
		for (const key in entry as T) {
			// patch the value at the given key with the patch at that key
			const currentValue = result[key];
			const newValue = patchEntry(
				currentValue,
				parent,
				currentRoot,
				(entry as any)[key],
			);

			if (!Object.is(currentValue, newValue)) {
				// if value changed, set it in result and mark change
				anyChange = true;
				result[key] = newValue;
			}
		}
	}

	if (anyChange) {
		// something changed, return new value
		return result;
	}

	// nothing changed, return old value
	return value;
}

function patchArr<T extends any[], C, R>(
	value: T,
	root: R,
	patchItem: T | Patch.Tup<T, C, R>,
): T {
	if (Array.isArray(patchItem)) {
		// value is a normal array
		// patch is a complete replacement of current array

		return patchItem;
	}

	// value is a tuple
	// patch is an object containing numeric keys with function values
	// that update the tuple at the given indices

	// copy the tuple
	const result = [...value] as T;
	let anyChange = false;

	// loop over all index keys in object
	for (const index in patchItem) {
		const numIndex = index as any as number;

		// patch the tuple at the given index
		const currentValue = result[numIndex];
		const newValue = patchEntry(
			currentValue,
			value,
			root,
			(patchItem as any)[index],
		);

		if (!Object.is(newValue, currentValue)) {
			// if value changed, set it in result and mark change
			anyChange = true;
			result[numIndex] = newValue;
		}
	}

	if (anyChange) {
		// something changed, return new value
		return result;
	}

	// nothing changed, return old value
	return value;
}

/**
 * Returns a function that patches a given `source` with the given `patchItems`.
 * @typeparam T - the patch value type
 * @typeparam TE - utility type
 * @typeparam TT - utility type
 * @param patchItem - the `Patch` definition to update the given value of type `T` with.
 * @param source - the value to use the given `patchItem` on.
 * @example
 * ```ts
 * const items = [{ a: 1, b: 'a' }, { a: 2, b: 'b' }];
 * items.map(patchWith([{ a: v => v + 1 }]));
 * // => [{ a: 2, b: 'a' }, { a: 3, b: 'b' }]
 * ```
 */
export function patchWith<T, TE extends T = T, TT = T>(
	patchItem: Patch<TT, TE>,
): (source: TE) => T {
	return (source) => patch(source, patchItem as any);
}

/**
 * Patches the value at the given path in the source to the given value.
 * Because the path to update must exist in the `source` object, optional
 * chaining and array indexing is not allowed.
 * @param source - the object to update
 * @param path - the path in the object to update
 * @param patchItem - the patch for the value at the given path
 * @example
 * ```ts
 * const value = { a: { b: { c: 5 } } };
 * patchAt(value, 'a.b.c', v => v + 5);
 * // => { a: { b: { c: 6 } } }
 * ```
 */
export function patchAt<T, P extends Path.Set<T>, C = Path.Result<T, P>>(
	source: T,
	path: P,
	patchItem: Patch<Path.Result<T, P>, Path.Result<T, P> & C>,
): T {
	if (path === '') {
		return patch(source, patchItem as any);
	}

	const items = stringSplit(path);

	// creates a patch object based on the current path
	function createPatchPart(index: number, target: any): any {
		if (index === items.length) {
			// processed all items, return the input `patchItem`
			return patchItem;
		}

		const item = items[index];

		if (undefined === item || item === '') {
			// empty items can be ignored
			return createPatchPart(index + 1, target);
		}

		if (item === '[') {
			// next item is array index, set arrayMode to true
			return createPatchPart(index + 1, target);
		}

		// create object with subPart as property key, and the restuls of processing next parts as value
		const result = {
			[item]: createPatchPart(index + 1, target[item]),
		};

		if (Array.isArray(target)) {
			// target in source object is array/tuple, so the patch should be object
			return result;
		}

		// target in source is not an array, so it patch should be an array
		return [result];
	}

	return patch(source, createPatchPart(0, source));
}

/**
 * Returns a function that patches a given `value` with the given `patchItems` at the given `path`.
 * @typeparam T - the patch value type
 * @typeparam P - the string literal path type in the object
 * @typeparam TE - utility type
 * @typeparam TT - utility type
 * @param path - the string path in the object
 * @param patchItem - the `Patch` definition to update the value at the given `path` in `T` with.
 * @param source - the value to use the given `patchItem` on at the given `path`.
 * @example
 * ```ts
 * const items = [{ a: { b:  1, c: 'a' } }, { a: { b: 2, c: 'b' } }];
 * items.map(patchAtWith('a', [{ b: (v) => v + 1 }]));
 * // => [{ a: { b: 2, c: 'a' } }, { a: { b: 3, c: 'b' } }]
 * ```
 */
export function patchAtWith<T, P extends Path.Set<T>, TE extends T = T, TT = T>(
	path: P,
	patchItem: Patch<Path.Result<TE, P>, Path.Result<TT, P>>,
): (source: T) => T {
	return (source) => patchAt(source, path, patchItem as any);
}
