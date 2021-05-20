const LITERAL = Symbol('LITERAL');
type LITERAL = typeof LITERAL;

/**
 * Type to represent Literal values for the match and patch functions.
 */
export type Literal<T> = {
  readonly [LITERAL]: T;
};

/**
 * Returns a Literal value embedding the given `value`.
 * @param value - the value to embed in a Literal type
 */
export function Literal<T>(value: T): Literal<T> {
  return { [LITERAL]: value };
}

/**
 * Returns true if the given `obj` value is a Literal instance.
 * @param obj - the object to check
 */
export function isLiteral<T>(obj: any): obj is Literal<T> {
  return LITERAL in obj;
}

/**
 * Returns the value embedded in a Literal instance
 * @param obj - the Literal instance
 */
export function getLiteral<T>(obj: Literal<T>): T {
  return obj[LITERAL];
}

/**
 * Returns true if the given `obj` is a plain JS object
 * @param obj - the object to check
 */
export function isPlainObject(obj: any): boolean {
  return obj.constructor === Object && !(Symbol.iterator in obj);
}

/**
 * Type to determine whether a value needs to be a Literal instance or may be a Literal instance.
 * @typeparam T - the value type
 */
export type Value<T> = T extends
  | { readonly [Symbol.iterator]: any }
  | Obj
  | readonly any[]
  | undefined
  | (() => any)
  ? T extends string
    ? T | Literal<T>
    : Literal<T>
  : T | Literal<T>;

/**
 * A plain object that is not iterable
 */
export type Obj = Record<string, unknown> & NoIterable;

/**
 * An immutably typed version of given type T. Makes all properties or elements read only.
 * @typeparam T - the input type
 */
export type Immutable<T> = T extends (infer E)[]
  ? readonly Immutable<E>[]
  : T extends Obj
  ? { readonly [K in keyof T]: Immutable<T[K]> }
  : T extends boolean
  ? boolean
  : T;

/**
 * Returns the same value wrapped in the Immutable type
 * @param value - the value to wrap
 */
export function Immutable<T>(value: T): Immutable<T> {
  return value as any;
}

/**
 * Excludes Iterable types
 */
export type NoIterable = { [Symbol.iterator]?: never };
