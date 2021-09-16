const LITERAL = Symbol('LITERAL');
type LITERAL = typeof LITERAL;

/**
 * Type to represent Literal values for the match and patch functions.
 */
export interface Literal<T> {
  readonly [LITERAL]: T;
}

export namespace Literal {
  /**
   * Returns a Literal value embedding the given `value`.
   * @param value - the value to embed in a Literal type
   */
  export function of<T>(value: T): Literal<T> {
    return { [LITERAL]: value };
  }

  /**
   * Excludes Iterable types
   */
  export interface NoIterable {
    readonly [Symbol.iterator]?: never;
  }

  /**
   * A plain object that is not iterable
   */
  export type Obj = Record<string, unknown> & NoIterable;

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
  export function getValue<T>(obj: Literal<T>): T {
    return obj[LITERAL];
  }

  /**
   * Returns true if the given `obj` is a plain JS object
   * @param obj - the object to check
   */
  export function isPlainObject(obj: any): boolean {
    return obj.constructor === Object && !(Symbol.iterator in obj);
  }
}
