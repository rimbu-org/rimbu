/**
 * Matches any type of function
 */
export type AnyFunc = (...args: any[]) => any;

/**
 * A predicate type for any record that resolves to true if any of the record
 * properties is a function, false otherwise.
 * This is useful to have a coarse discrimination between pure data objects and class instances.
 */
export type IsObjWithoutFunctions<T extends Record<any, any>> =
  AnyFunc extends T[keyof T] ? false : true;

/**
 * A predicate type that resolves to true if the given type satisfies:
 * - it is an object type (not a primitive)
 * - it is not a function
 * - it is not iterable
 * - it does not have any properties that are functions
 * Otherwise, it resolves to false
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
  | Iterable<unknown>
  | AsyncIterable<unknown>
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
 * Companion function to the `IsRecord<T>` type that checks whether the given object is a pure
 * data object.
 * @param obj - the object to check
 * @returns true if the given object is a pure data object
 * @note does not check whether a record's properties are not functions
 */
export function isPlainObj(obj: any): boolean {
  return (
    typeof obj === 'object' &&
    null !== obj &&
    (obj.constructor === Object || !(obj.constructor instanceof Function)) &&
    !(Symbol.iterator in obj) &&
    !(Symbol.asyncIterator in obj)
  );
}

/**
 * Returns true if the given object is Iterable
 * @param obj - the object to check
 */
export function isIterable(obj: any): obj is Iterable<unknown> {
  return obj !== null && typeof obj === 'object' && Symbol.iterator in obj;
}
