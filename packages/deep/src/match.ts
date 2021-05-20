import { RimbuError } from '@rimbu/base';
import { ArrayNonEmpty } from '@rimbu/common';
import {
  getLiteral,
  Immutable,
  isLiteral,
  isPlainObject,
  NoIterable,
  Obj,
  Value,
} from './internal';

/**
 * Type to determine the allowed input type for the `match` functions.
 * @typeparam T - the input type
 * @typeparam P - the parant type
 * @typeparam R - the root type
 */
export type Match<T, P = T, R = T> = T extends Obj
  ? MatchObj<T, P, R>
  : T extends readonly unknown[]
  ? Match.MatchArray<T, P, R>
  : Match.Compare<T, P, R>;

/**
 * Type to determine the allowed input type for `match` functions given an object type T.
 * @typeparam T - the input type, being an object
 * @typeparam P - the parant type
 * @typeparam R - the root type
 */
export type MatchObj<T, P, R> = (
  | Match.Compare<T, P, R>
  | { [K in keyof T]?: Match<T[K], T, R> }
) &
  NoIterable;

export namespace Match {
  /**
   * Type representing at least one Match object for type T
   * @typeparam T - the target type
   */
  export type Multi<T> = ArrayNonEmpty<Match<T>>;

  /**
   * Type representing matchers for values that are not objects or arrays
   * @typeparam T - the input type
   * @typeparam P - the parant type
   * @typeparam R - the root type
   */
  export type Compare<T, P, R> =
    | Value<T>
    | ((
        value: Immutable<T>,
        parent: Immutable<P>,
        root: Immutable<R>
      ) => boolean);

  /**
   * Type representing allowed matchers for arrays
   * @typeparam T - the array type
   * @typeparam P - the parent type
   * @typeparam R - the root type
   */
  export type MatchArray<T extends readonly unknown[], P, R> = (
    | Match.Compare<T, P, R>
    | {
        [K in { [K2 in keyof T]: K2 }[keyof T]]?: Match<T[K], T, R>;
      }
  ) &
    NoIterable;

  /**
   * Returns true if the given `value` matches all of the given objects in the `matchers` array.
   * @typeparam T - the type of the object to match
   * @param value - the value to match
   * @param matchers - one or more `Match` objects
   * @example
   * matchAll({ g: { h: 'abc' }})({ g: { h: 'a' }}) => false
   * matchAll({ g: { h: 'abc' }})({ g: { h: v => v.length > 1 }}) => true
   */
  export function all<T>(value: T): (...matchers: Match.Multi<T>) => boolean {
    return (...matchers) => {
      for (const matcher of matchers) {
        if (
          !matchSingle(
            value as Immutable<T>,
            matcher,
            value as Immutable<T>,
            value as Immutable<T>
          )
        ) {
          return false;
        }
      }

      return true;
    };
  }

  /**
   * Returns true if the given `value` matches any of the given objects in the `matchers` array.
   * @typeparam T - the type of the object to match
   * @param value - the value to match
   * @param matchers - one or more `Match` objects
   * @example
   * matchAny({ g: { h: 'abc' }})({ g: { h: 'a' }}, { g: { h: v => v.length < 2 }}) => false
   * matchAny({ g: { h: 'abc' }})({ g: { h: 'a' }}, { g: { h: v => v.length > 1 }}) => true
   */
  export function any<T>(value: T): (...matchers: Match.Multi<T>) => boolean {
    return (...matchers) => {
      for (const matcher of matchers) {
        if (
          matchSingle(
            value as Immutable<T>,
            matcher,
            value as Immutable<T>,
            value as Immutable<T>
          )
        ) {
          return true;
        }
      }

      return false;
    };
  }

  /**
   * Returns a function that takes a value of type T, and returns true if the value matches all the
   * given `matches` array of Match instances.
   * @typeparam T - the type of the object to match
   * @typeparam T2 - the type to use for the Match, should be equal to T
   * @param matches - at least one Match instance to perform on a given `value`
   * @example
   * type Person = { name: string, age: number }
   * const m = Match.createAll<Person>({ age: v => v > 20 }, { name: v => v.length > 2 })
   *
   * console.log(m({ name: 'abc', age: 10 }))
   * // => false
   * console.log(m({ name: 'abc', age: 20 }))
   * // => true
   * console.log(m({ name: 'a', age: 20 }))
   * // => false
   */
  export function createAll<T, T2 extends T = T>(
    ...matches: Match.Multi<T2>
  ): (value: T) => boolean {
    return (value) => Match.all(value)(...(matches as Match.Multi<T>));
  }

  /**
   * Returns a function that takes a value of type T, and returns true if the value matches any of the
   * given `matches` array of Match instances.
   * @typeparam T - the type of the object to match
   * @typeparam T2 - the type to use for the Match, should be equal to T
   * @param matches - at least one Match instance to perform on a given `value`
   * @example
   * type Person = { name: string, age: number }
   * const m = Match.createAny<Person>({ age: v => v > 20 }, { name: v => v.length > 2 })
   *
   * console.log(m({ name: 'abc', age: 10 }))
   * // => true
   * console.log(m({ name: 'abc', age: 20 }))
   * // => true
   * console.log(m({ name: 'a', age: 20 }))
   * // => true
   * console.log(m({ name: 'a', age: 10 }))
   * // => false
   */
  export function createAny<T, T2 extends T = T>(
    ...matches: Match.Multi<T2>
  ): (value: T) => boolean {
    return (value) => Match.any(value)(...(matches as Match.Multi<T>));
  }
}

function matchSingle<T, P = T, R = T>(
  value: Immutable<T>,
  matcher: Match<T, P, R>,
  parent: Immutable<P>,
  root: Immutable<R>
): boolean {
  if (typeof matcher === 'function') {
    return matcher(value, parent, root);
  }

  if (null === value || undefined === value || typeof value !== 'object') {
    if (typeof matcher !== 'object' || null === matcher)
      return (matcher as any) === value;
    if (isLiteral<T>(matcher)) return getLiteral(matcher) === value;
    return (matcher as any) === value;
  }

  if (Array.isArray(matcher)) {
    RimbuError.throwInvalidUsageError(
      'Do not use arrays directly in match object, but use Literal(array) instead due to type limittions.'
    );
  }

  if (typeof matcher !== 'object') RimbuError.throwInvalidStateError();

  if (null === matcher) return false;

  if (isLiteral<T>(matcher)) {
    return getLiteral(matcher) === value;
  }

  const valueIsArray = Array.isArray(value);

  // check if plain object
  if (!valueIsArray && !isPlainObject(value)) {
    return (matcher as any) === value;
  }

  for (const key in matcher as T) {
    if (!(key in value)) return false;

    const matchKey = (matcher as T)[key];

    if (undefined === matchKey) {
      RimbuError.throwInvalidUsageError(
        'Do not use undefined directly in match objects, but use Literal(undefined) instead due to type limitations.'
      );
    }

    const result = matchSingle(
      (value as any)[key],
      matchKey as any,
      value,
      root
    );
    if (!result) return false;
  }

  return true;
}
