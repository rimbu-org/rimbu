import {
  IsAnyFunc,
  IsArray,
  isPlainObj,
  IsPlainObj,
  NotIterable,
} from '../base/mod.ts';
import type { Protected } from './internal.ts';
import type { Tuple } from './tuple.ts';

/**
 * The type to determine the allowed input values for the `match` function.
 * @typeparam T - the type of value to match
 * @typeparam C - utility type
 */
export type Match<T, C extends Partial<T> = Partial<T>> = Match.Entry<
  T,
  C,
  T,
  T
>;

export namespace Match {
  /**
   * Determines the various allowed match types for given type `T`.
   * @typeparam T - the input value type
   * @typeparam C - utility type
   * @typeparam P - the parant type
   * @typeparam R - the root object type
   */
  export type Entry<T, C, P, R> = IsAnyFunc<T> extends true
    ? // function can only be directly matched
      T
    : IsPlainObj<T> extends true
    ? // determine allowed match values for object
      Match.WithResult<T, P, R, Match.Obj<T, C, P, R>>
    : IsArray<T> extends true
    ? // determine allowed match values for array or tuple
      Match.Arr<T, C, P, R> | Match.Func<T, P, R, Match.Arr<T, C, P, R>>
    : // only accept values with same interface
      Match.WithResult<T, P, R, { [K in keyof C]: C[K & keyof T] }>;

  /**
   * The type that determines allowed matchers for objects.
   * @typeparam T - the input value type
   * @typeparam C - utility type
   * @typeparam P - the parant type
   * @typeparam R - the root object type
   */
  export type Obj<T, C, P, R> =
    | Match.ObjProps<T, C, R>
    | Match.CompoundForObj<T, C, P, R>;

  /**
   * The type to determine allowed matchers for object properties.
   * @typeparam T - the input value type
   * @typeparam C - utility type
   * @typeparam R - the root object type
   */
  export type ObjProps<T, C, R> = {
    [K in keyof C]?: K extends keyof T ? Match.Entry<T[K], C[K], T, R> : never;
  };

  /**
   * The type that determines allowed matchers for arrays/tuples.
   * @typeparam T - the input value type
   * @typeparam C - utility type
   * @typeparam P - the parant type
   * @typeparam R - the root object type
   */
  export type Arr<T, C, P, R> =
    | C
    | Match.CompoundForArr<T, C, P, R>
    | (Match.TupIndices<T, C, R> & { [K in Match.CompoundType]?: never });

  export type WithResult<T, P, R, S> = S | Match.Func<T, P, R, S>;

  /**
   * Type used to determine the allowed function types. Always includes booleans.
   * @typeparam T - the input value type
   * @typeparam P - the parant type
   * @typeparam R - the root object type
   * @typeparam S - the allowed return value type
   */
  export type Func<T, P, R, S> = (
    current: Protected<T>,
    parent: Protected<P>,
    root: Protected<R>
  ) => boolean | S;

  /**
   * Type used to indicate an object containing matches for tuple indices.
   * @typeparam T - the input value type
   * @typeparam C - utility type
   * @typeparam R - the root object type
   */
  export type TupIndices<T, C, R> = {
    [K in Tuple.KeysOf<C>]?: Match.Entry<T[K & keyof T], C[K], T, R>;
  } & NotIterable;

  /**
   * Compound keys used to indicate the type of compound.
   */
  export type CompoundType = 'every' | 'some' | 'none' | 'single';

  /**
   * Compount matcher for objects, can only be an array staring with a compound type keyword.
   * @typeparam T - the input value type
   * @typeparam C - utility type
   * @typeparam P - the parent type
   * @typeparam R - the root object type
   */
  export type CompoundForObj<T, C, P, R> = [
    Match.CompoundType,
    ...Match.Entry<T, C, P, R>[]
  ];

  /**
   * Defines an object containing exactly one `CompoundType` key, having an array of matchers.
   * @typeparam T - the input value type
   * @typeparam C - utility type
   * @typeparam P - the parent type
   * @typeparam R - the root object type
   */
  export type CompoundForArr<T, C, P, R> = {
    [K in CompoundType]: {
      [K2 in CompoundType]?: K2 extends K ? Match.Entry<T, C, P, R>[] : never;
    };
  }[CompoundType];

  /**
   * Utility type for collecting errors
   */
  export type ErrorCollector = string[] | undefined;
}

/**
 * Returns true if the given `value` object matches the given `matcher`, false otherwise.
 * @typeparam T - the input value type
 * @typeparam C - utility type
 * @param source - the value to match (should be a plain object)
 * @param matcher - a matcher object or a function taking the matcher API and returning a match object
 * @param errorCollector - (optional) a string array that can be passed to collect reasons why the match failed
 * @example
 * ```ts
 * const input = { a: 1, b: { c: true, d: 'a' } }
 * match(input, { a: 1 }) // => true
 * match(input, { a: 2 }) // => false
 * match(input, { a: (v) => v > 10 }) // => false
 * match(input, { b: { c: true }}) // => true
 * match(input, (['every', { a: (v) => v > 0 }, { b: { c: true } }]) // => true
 * match(input, { b: { c: (v, parent, root) => v && parent.d.length > 0 && root.a > 0 } })
 *  // => true
 * ```
 */
export function match<T, C extends Partial<T> = Partial<T>>(
  source: T,
  matcher: Match<T, C>,
  errorCollector: Match.ErrorCollector = undefined
): boolean {
  return matchEntry(source, source, source, matcher as any, errorCollector);
}

/**
 * Match a generic match entry against the given source.
 */
function matchEntry<T, C, P, R>(
  source: T,
  parent: P,
  root: R,
  matcher: Match.Entry<T, C, P, R>,
  errorCollector: Match.ErrorCollector
): boolean {
  if (Object.is(source, matcher)) {
    // value and target are exactly the same, always will be true
    return true;
  }

  if (matcher === null || matcher === undefined) {
    // these matchers can only be direct matches, and previously it was determined that
    // they are not equal
    errorCollector?.push(
      `value ${JSON.stringify(source)} did not match matcher ${matcher}`
    );

    return false;
  }

  if (typeof source === 'function') {
    // function source values can only be directly matched
    const result = Object.is(source, matcher);

    if (!result) {
      errorCollector?.push(
        `both value and matcher are functions, but they do not have the same reference`
      );
    }

    return result;
  }

  if (typeof matcher === 'function') {
    // resolve match function first
    const matcherResult = matcher(source, parent, root);

    if (typeof matcherResult === 'boolean') {
      // function resulted in a direct match result

      if (!matcherResult) {
        errorCollector?.push(
          `function matcher returned false for value ${JSON.stringify(source)}`
        );
      }

      return matcherResult;
    }

    // function resulted in a value that needs to be further matched
    return matchEntry(source, parent, root, matcherResult, errorCollector);
  }

  if (isPlainObj(source)) {
    // source ia a plain object, can be partially matched
    return matchPlainObj(source, parent, root, matcher as any, errorCollector);
  }

  if (Array.isArray(source)) {
    // source is an array
    return matchArr(source, root, matcher as any, errorCollector);
  }

  // already determined above that the source and matcher are not equal

  errorCollector?.push(
    `value ${JSON.stringify(
      source
    )} does not match given matcher ${JSON.stringify(matcher)}`
  );

  return false;
}

/**
 * Match an array matcher against the given source.
 */
function matchArr<T extends any[], C, P, R>(
  source: T,
  root: R,
  matcher: Match.Arr<T, C, P, R>,
  errorCollector: Match.ErrorCollector
): boolean {
  if (Array.isArray(matcher)) {
    // directly compare array contents
    const length = source.length;

    if (length !== matcher.length) {
      // if lengths not equal, arrays are not equal

      errorCollector?.push(
        `array lengths are not equal: value length ${source.length} !== matcher length ${matcher.length}`
      );

      return false;
    }

    // loop over arrays, matching every value
    let index = -1;
    while (++index < length) {
      if (!Object.is(source[index], matcher[index])) {
        // item did not match, return false

        errorCollector?.push(
          `index ${index} does not match with value ${JSON.stringify(
            source[index]
          )} and matcher ${matcher[index]}`
        );

        return false;
      }
    }

    // all items are equal
    return true;
  }

  // matcher is plain object with index keys

  for (const index in matcher as any) {
    const matcherAtIndex = (matcher as any)[index];

    if (!(index in source)) {
      // source does not have item at given index

      errorCollector?.push(
        `index ${index} does not exist in source ${JSON.stringify(
          source
        )} but should match matcher ${JSON.stringify(matcherAtIndex)}`
      );

      return false;
    }

    // match the source item at the given index
    const result = matchEntry(
      (source as any)[index],
      source,
      root,
      matcherAtIndex,
      errorCollector
    );

    if (!result) {
      // item did not match

      errorCollector?.push(
        `index ${index} does not match with value ${JSON.stringify(
          (source as any)[index]
        )} and matcher ${JSON.stringify(matcherAtIndex)}`
      );

      return false;
    }
  }

  // all items match

  return true;
}

/**
 * Match an object matcher against the given source.
 */
function matchPlainObj<T, C, P, R>(
  source: T,
  parent: P,
  root: R,
  matcher: Match.Obj<T, C, P, R>,
  errorCollector: Match.ErrorCollector
): boolean {
  if (Array.isArray(matcher)) {
    // the matcher is of compound type
    return matchCompound(source, parent, root, matcher as any, errorCollector);
  }

  // partial object props matcher

  for (const key in matcher) {
    if (!(key in source)) {
      // the source does not have the given key

      errorCollector?.push(
        `key ${key} is specified in matcher but not present in value ${JSON.stringify(
          source
        )}`
      );

      return false;
    }

    // match the source value at the given key with the matcher at given key
    const result = matchEntry(
      (source as any)[key],
      source,
      root,
      matcher[key],
      errorCollector
    );

    if (!result) {
      errorCollector?.push(
        `key ${key} does not match in value ${JSON.stringify(
          (source as any)[key]
        )} with matcher ${JSON.stringify(matcher[key])}`
      );
      return false;
    }
  }

  // all properties match

  return true;
}

/**
 * Match a compound matcher against the given source.
 */
function matchCompound<T, C, P, R>(
  source: T,
  parent: P,
  root: R,
  compound: [Match.CompoundType, ...Match.Entry<T, C, P, R>[]],
  errorCollector: string[] | undefined
): boolean {
  // first item indicates compound match type
  const matchType = compound[0];

  const length = compound.length;

  // start at index 1
  let index = 0;

  type Entry = Match.Entry<T, C, P, R>;

  switch (matchType) {
    case 'every': {
      while (++index < length) {
        // if any item does not match, return false
        const result = matchEntry(
          source,
          parent,
          root,
          compound[index] as Entry,
          errorCollector
        );

        if (!result) {
          errorCollector?.push(
            `in compound "every": match at index ${index} failed`
          );

          return false;
        }
      }

      return true;
    }
    case 'none': {
      // if any item matches, return false
      while (++index < length) {
        const result = matchEntry(
          source,
          parent,
          root,
          compound[index] as Entry,
          errorCollector
        );

        if (result) {
          errorCollector?.push(
            `in compound "none": match at index ${index} succeeded`
          );

          return false;
        }
      }

      return true;
    }
    case 'single': {
      // if not exactly one item matches, return false
      let onePassed = false;

      while (++index < length) {
        const result = matchEntry(
          source,
          parent,
          root,
          compound[index] as Entry,
          errorCollector
        );

        if (result) {
          if (onePassed) {
            errorCollector?.push(
              `in compound "single": multiple matches succeeded`
            );

            return false;
          }

          onePassed = true;
        }
      }

      if (!onePassed) {
        errorCollector?.push(`in compound "single": no matches succeeded`);
      }

      return onePassed;
    }
    case 'some': {
      // if any item matches, return true
      while (++index < length) {
        const result = matchEntry(
          source,
          parent,
          root,
          compound[index] as Entry,
          errorCollector
        );

        if (result) {
          return true;
        }
      }

      errorCollector?.push(`in compound "some": no matches succeeded`);

      return false;
    }
  }
}
