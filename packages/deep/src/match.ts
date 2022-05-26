import {
  RimbuError,
  type IsPlainObj,
  type PlainObj,
  isPlainObj,
  isIterable,
} from '@rimbu/base';

import type { Protected } from './internal';

/**
 * The type to determine the allowed input values for the `match` functions.
 * @typeparam T - the type of value to match
 */
export type Match<T> = Match.Options<T, T>;

export namespace Match {
  /**
   * The types of supported match input.
   * @typeparam T - the type of value to match
   * @typeparam R - the root object type
   */
  export type Options<T, R> =
    | Every<T, R>
    | Some<T, R>
    | None<T, R>
    | Single<T, R>
    | Match.Obj<T, R>;

  /**
   * The type to determine allowed matchers for objects.
   * @typeparam T - the type of value to match
   * @typeparam R - the root object type
   */
  export type Obj<T, R> = {
    [K in keyof T]?:
      | Match.ObjItem<T[K], R>
      | ((
          current: Protected<T[K]>,
          parent: Protected<T>,
          root: Protected<R>
        ) => boolean | Match.ObjItem<T[K], R>);
  };

  /**
   * The type to determine allowed matchers for object properties.
   * @typeparam T - the type of value to match
   * @typeparam R - the root object type
   */
  export type ObjItem<T, R> = IsPlainObj<T> extends true
    ? Match.Options<T, R>
    : T extends Iterable<infer U>
    ? T | Iterable<U>
    : T;

  /**
   * Returns a matcher that returns true if every given `matchItem` matches the given value.
   * @typeparam T - the type of value to match
   * @typeparam R - the root object type
   * @typeparam Q - a utility type for the matcher
   * @param matchItems - the match specifications to test
   * @example
   * ```ts
   * const input = { a: 1, b: { c: true, d: 'a' } }
   * match(input, Match.every({ a: 1, { c: true } } )) // => true
   * match(input, Match.every({ a: 1, { c: false } } )) // => false
   * ```
   */
  export function every<T, R, Q extends T = T>(
    ...matchItems: Match.Options<Q, R>[]
  ): Every<T, R, Q> {
    return new Every(matchItems);
  }
  /**
   * Returns a matcher that returns true if at least one of given `matchItem` matches the given value.
   * @typeparam T - the type of value to match
   * @typeparam R - the root object type
   * @typeparam Q - a utility type for the matcher
   * @param matchItems - the match specifications to test
   * @example
   * ```ts
   * const input = { a: 1, b: { c: true, d: 'a' } }
   * match(input, Match.some({ a: 5, { c: true } } )) // => true
   * match(input, Match.some({ a: 5, { c: false } } )) // => false
   * ```
   */
  export function some<T, R, Q extends T = T>(
    ...matchItems: Match.Options<Q, R>[]
  ): Some<T, R, Q> {
    return new Some(matchItems);
  }
  /**
   * Returns a matcher that returns true if none of given `matchItem` matches the given value.
   * @typeparam T - the type of value to match
   * @typeparam R - the root object type
   * @typeparam Q - a utility type for the matcher
   * @param matchItems - the match specifications to test
   * @example
   * ```ts
   * const input = { a: 1, b: { c: true, d: 'a' } }
   * match(input, Match.none({ a: 5, { c: true } } )) // => false
   * match(input, Match.none({ a: 5, { c: false } } )) // => true
   * ```
   */
  export function none<T, R, Q extends T = T>(
    ...matchItems: Match.Options<Q, R>[]
  ): None<T, R, Q> {
    return new None(matchItems);
  }
  /**
   * Returns a matcher that returns true if exactly one of given `matchItem` matches the given value.
   * @typeparam T - the type of value to match
   * @typeparam R - the root object type
   * @typeparam Q - a utility type for the matcher
   * @param matchItems - the match specifications to test
   * @example
   * ```ts
   * const input = { a: 1, b: { c: true, d: 'a' } }
   * match(input, Match.single({ a: 1, { c: true } } )) // => false
   * match(input, Match.single({ a: 1, { c: false } } )) // => true
   * ```
   */
  export function single<T, R, Q extends T = T>(
    ...matchItems: Match.Options<Q, R>[]
  ): Single<T, R, Q> {
    return new Single(matchItems);
  }

  /**
   * The functions that are optionally provided to a match function.
   */
  export type Api = typeof Match;
}

class Every<T, R, Q extends T = T> {
  constructor(readonly matchItems: Match.Options<Q, R>[]) {}
}

class Some<T, R, Q extends T = T> {
  constructor(readonly matchItems: Match.Options<Q, R>[]) {}
}

class None<T, R, Q extends T = T> {
  constructor(readonly matchItems: Match.Options<Q, R>[]) {}
}

class Single<T, R, Q extends T = T> {
  constructor(readonly matchItems: Match.Options<Q, R>[]) {}
}

/**
 * Returns true if the given `value` object matches the given `matcher`, false otherwise.
 * @typeparam T - the input value type
 * @param value - the value to match (should be a plain object)
 * @param matcher - a matcher object or a function taking the matcher API and returning a match object
 * @example
 * ```ts
 * const input = { a: 1, b: { c: true, d: 'a' } }
 * match(input, { a: 1 }) // => true
 * match(input, { a: 2 }) // => false
 * match(input, { a: v => v > 10 }) // => false
 * match(input, { b: { c: true }}) // => true
 * match(input, ({ every }) => every({ a: v => v > 0 }, { b: { c: true } } )) // => true
 * match(input, { b: { c: (v, parent, root) => v && parent.d.length > 0 && root.a > 0 } })
 *  // => true
 * ```
 */
export function match<T>(
  value: T & PlainObj<T>,
  matcher: Match<T> | ((matchApi: Match.Api) => Match<T>)
): boolean {
  if (matcher instanceof Function) {
    return matchOptions(value, value, matcher(Match));
  }

  return matchOptions(value, value, matcher);
}

function matchOptions<T, R>(
  value: T,
  root: R,
  matcher: Match.Options<T, R>
): boolean {
  if (matcher instanceof Every) {
    let i = -1;
    const { matchItems } = matcher;
    const len = matchItems.length;

    while (++i < len) {
      if (!matchOptions(value, root, matchItems[i])) {
        return false;
      }
    }

    return true;
  }
  if (matcher instanceof Some) {
    let i = -1;
    const { matchItems } = matcher;
    const len = matchItems.length;
    while (++i < len) {
      if (matchOptions(value, root, matchItems[i])) {
        return true;
      }
    }

    return false;
  }
  if (matcher instanceof None) {
    let i = -1;
    const { matchItems } = matcher;
    const len = matchItems.length;
    while (++i < len) {
      if (matchOptions(value, root, matchItems[i])) {
        return false;
      }
    }

    return true;
  }
  if (matcher instanceof Single) {
    let i = -1;
    const { matchItems } = matcher;
    const len = matchItems.length;
    let matched = false;

    while (++i < len) {
      if (matchOptions(value, root, matchItems[i])) {
        if (matched) {
          return false;
        }

        matched = true;
      }
    }

    return matched;
  }

  if (isPlainObj(matcher)) {
    return matchRecord(value, root, matcher);
  }

  return Object.is(value, matcher);
}

function matchRecord<T, R>(
  value: T,
  root: R,
  matcher: Match.Obj<T, R>
): boolean {
  if (!isPlainObj(matcher)) {
    RimbuError.throwInvalidUsageError(
      'match: to prevent accidental errors, match only supports plain objects as input.'
    );
  }

  for (const key in matcher) {
    if (!(key in value)) return false;

    const matchValue = matcher[key];
    const target = value[key];

    if (matchValue instanceof Function) {
      if (target instanceof Function && Object.is(target, matchValue)) {
        return true;
      }

      const result = matchValue(target, value, root);

      if (typeof result === 'boolean') {
        if (result) {
          continue;
        }

        return false;
      }

      if (!matchRecordItem(target, root, result)) {
        return false;
      }
    } else {
      if (!matchRecordItem(target, root, matchValue as any)) {
        return false;
      }
    }
  }

  return true;
}

function matchRecordItem<T, R>(
  value: T,
  root: R,
  matcher: Match.ObjItem<T, R>
): boolean {
  if (isIterable(matcher) && isIterable(value)) {
    const it1 = (value as any)[Symbol.iterator]() as Iterator<unknown>;
    const it2 = (matcher as any)[Symbol.iterator]() as Iterator<unknown>;

    while (true) {
      const v1 = it1.next();
      const v2 = it2.next();

      if (v1.done !== v2.done || v1.value !== v2.value) {
        return false;
      }
      if (v1.done) {
        return true;
      }
    }
  }
  if (isPlainObj(value)) {
    return matchOptions(value, root, matcher as any);
  }

  return Object.is(value, matcher);
}
