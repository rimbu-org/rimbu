/**
 * Matches any type of function
 */
export type AnyFunc = (...args: any[]) => any;

/**
 * Gives true if the given type T is a function, false otherwise.
 * @typeparam T - the input type
 */
export type IsAnyFunc<T> = AnyFunc extends T ? true : false;

/**
 * A predicate type for any record that resolves to true if none of the record
 * properties are functions, false otherwise.
 * This is useful to have a coarse discrimination between pure data objects and class instances.
 * @typeparam T - the input type
 */
export type IsObjWithoutFunctions<T> = AnyFunc extends T[keyof T]
	? false
	: true;

/**
 * A predicate type that resolves to true if the given type satisfies:
 * - it is an object type (not a primitive)
 * - it is not a function
 * - it is not iterable
 * - it does not have any properties that are functions
 * Otherwise, it resolves to false
 * @typeparam T - the input type
 */
export type IsPlainObj<T> = T extends
	| null
	| undefined
	| number
	| string
	| boolean
	| bigint
	| symbol
	| AnyFunc
	| Iterable<any>
	| AsyncIterable<any>
	? false
	: IsObjWithoutFunctions<T>;

/**
 * Utility type that will only accept objects that are considered 'plain objects' according
 * to the `IsPlainObj` predicate type.
 * @typeparam T - the value type to test
 */
export type PlainObj<T> = IsPlainObj<T> extends true ? T : never;

/**
 * Utility type that will only return true if the input type T is equal to `any`.
 * @typeparam T - the value type to test
 */
export type IsAny<T> = 0 extends 1 & T ? true : false;

/**
 * Utility type that will only return true if the input type T is a (readonly) array.
 * @typeparam T - the value type to test
 */
export type IsArray<T> = T extends readonly any[] ? true : false;

/**
 * Utility type to exclude any types that are iterable. Useful in cases where
 * plain objects are required as inputs but not arrays.
 */
export type NotIterable = {
	[Symbol.iterator]?: never;
};

/**
 * Companion function to the `IsPlainObj<T>` type that performs a shallow runtime check
 * to determine whether the given value is a plain data object (not an instance of a class,
 * not iterable, and not null).
 * @param obj - the value to check
 * @returns true if the given value appears to be a plain data object
 * @note This runtime check is shallow and does not verify whether object properties are functions;
 * use the type-level helpers (e.g. `IsObjWithoutFunctions`) for compile-time checks.
 */
export function isPlainObj(obj: any): obj is object {
	return (
		typeof obj === 'object' &&
		null !== obj &&
		(obj.constructor === Object || !(obj.constructor instanceof Function)) &&
		!(Symbol.iterator in obj) &&
		!(Symbol.asyncIterator in obj)
	);
}

/**
 * Returns true if the given object is Iterable.
 * @param obj - the object to check
 * @returns true when `obj` implements the synchronous iterable protocol
 */
export function isIterable(obj: any): obj is Iterable<unknown> {
	return obj !== null && typeof obj === 'object' && Symbol.iterator in obj;
}
