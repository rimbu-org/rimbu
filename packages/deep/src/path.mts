import type { IsAnyFunc, IsArray, IsPlainObj } from '@rimbu/base';
import { Deep, type Patch } from './internal.mjs';
import type { Tuple } from './tuple.mjs';

export namespace Path {
  /**
   * A string representing a path into an (nested) object of type T.
   * @typeparam T - the object type to select in
   * @example
   * ```ts
   * const p: Path.Get<{ a: { b: { c : 5 } } }> = 'a.b'
   * ```
   */
  export type Get<T> = Path.Internal.Generic<T, false, false, true>;

  /**
   * A string representing a path into an (nested) object of type T.
   * @typeparam T - the object type to select in
   * @example
   * ```ts
   * const p: Path.Set<{ a: { b: { c : 5 } } }> = 'a.b'
   * ```
   */
  export type Set<T> = Path.Internal.Generic<T, true, false, true>;

  export namespace Internal {
    /**
     * Determines the allowed paths into a value of type `T`.
     * @typeparam T - the source type
     * @typeparam Write - if true the path should be writable (no optional chaining)
     * @typeparam Maybe - if true the value at the current path is optional
     * @typeparam First - if true this is the root call
     * @note type is mapped as template literal to prevent non-string types to leak through
     */
    export type Generic<
      T,
      Write extends boolean,
      Maybe extends boolean,
      First extends boolean = false
    > = `${IsAnyFunc<T> extends true
      ? // functions can not be further decomposed
        ''
      : // empty string is always an option
        '' | Path.Internal.NonEmpty<T, Write, Maybe, First>}`;

    /**
     * Determines the allowed non-empty paths into a value of type `T`.
     * @typeparam T - the source type
     * @typeparam Write - if true the path should be writable (no optional chaining)
     * @typeparam Maybe - if true the value at the current path is optional
     * @typeparam First - if true this is the root call
     */
    export type NonEmpty<
      T,
      Write extends boolean,
      Maybe extends boolean,
      First extends boolean
    > = Path.Internal.IsOptional<T> extends true
      ? // the value T may be null or undefined, check whether further chaining is allowed
        Write extends false
        ? // path is not used to write to, so optional chaining is allowed
          Path.Internal.Generic<Exclude<T, undefined | null>, Write, true>
        : // path can be written to, no optional chaining allowed
          never
      : // determine separator, and continue with non-optional value
        `${Path.Internal.Separator<
          First,
          Maybe,
          IsArray<T>
        >}${Path.Internal.NonOptional<T, Write, Maybe>}`;

    /**
     * Determines the allowed paths into a non-optional value of type `T`.
     * @typeparam T - the source type
     * @typeparam Write - if true the path should be writable (no optional chaining)
     * @typeparam Maybe - if true the value at the current path is optional
     * @typeparam First - if true this is the root call
     */
    export type NonOptional<
      T,
      Write extends boolean,
      Maybe extends boolean
    > = Tuple.IsTuple<T> extends true
      ? // determine allowed paths for tuple
        Path.Internal.Tup<T, Write, Maybe>
      : T extends readonly any[]
      ? // determine allowed paths for array
        Write extends false
        ? // path is not writable so arrays are allowed
          Path.Internal.Arr<T>
        : // path is writable, no arrays allowed
          never
      : IsPlainObj<T> extends true
      ? // determine allowed paths for object
        Path.Internal.Obj<T, Write, Maybe>
      : // no match
        never;

    /**
     * Determines the allowed paths for a tuple. Since tuples have fixed types, they do not
     * need to be optional, in contrast to arrays.
     * @typeparam T - the input tuple type
     * @typeparam Write - if true the path should be writable (no optional chaining)
     * @typeparam Maybe - if true the value at the current path is optional
     */
    export type Tup<T, Write extends boolean, Maybe extends boolean> = {
      [K in Tuple.KeysOf<T>]: `[${K}]${Path.Internal.Generic<
        T[K],
        Write,
        Maybe
      >}`;
    }[Tuple.KeysOf<T>];

    /**
     * Determines the allowed paths for an array.
     * @typeparam T - the input array type
     */
    export type Arr<T extends readonly any[]> =
      // first `[index]` and then the rest of the path, which cannot be Write (since optional) and must be Maybe
      `[${number}]${Path.Internal.Generic<T[number], false, true>}`;

    /**
     * Determines the allowed paths for an object.
     * @typeparam T - the input object type
     * @typeparam Write - if true the path should be writable (no optional chaining)
     * @typeparam Maybe - if true the value at the current path is optional
     */
    export type Obj<T, Write extends boolean, Maybe extends boolean> = {
      [K in keyof T]: `${K & string}${Path.Internal.Generic<
        T[K],
        Write,
        // If writable (not optional), Maybe is false. If value is optional, Maybe is true. Otherwise, forward current Maybe.
        Write extends true ? false : Path.Internal.IsOptional<T[K], true, Maybe>
      >}`;
    }[keyof T];

    /**
     * Determines the allowed path part seperator based on the input types.
     * @typeparam First - if true, this is the first call
     * @typeparam Maybe - if true, the value is optional
     * @typeparam IsArray - if true, the value is an array
     */
    export type Separator<
      First extends boolean,
      Maybe extends boolean,
      IsArray extends boolean
    > = Maybe extends true
      ? First extends true
        ? // first optional value cannot have separator
          never
        : // non-first optional value must have separator
          '?.'
      : First extends true
      ? // first non-optional value has empty separator
        ''
      : IsArray extends true
      ? // array selectors do not have separator
        ''
      : // normal separator
        '.';

    /**
     * Determines whether the given type `T` is optional, that is, whether it can be null or undefined.
     * @typeparam T - the input type
     * @typeparam True - the value to return if `T` is optional
     * @typeparam False - the value to return if `T` is mandatory
     */
    export type IsOptional<T, True = true, False = false> = undefined extends T
      ? // is optional
        True
      : null extends T
      ? // is optional
        True
      : // not optional
        False;

    /**
     * Returns type `T` if `Maybe` is false, `T | undefined` otherwise.
     * @typeparam T - the input type
     * @typeparam Maybe - if true, the return type value should be optional
     */
    export type MaybeValue<T, Maybe extends boolean> = Maybe extends true
      ? T | undefined
      : T;

    /**
     * Utility type to only add non-empty string types to a string array.
     * @typeparma A - the input string array
     * @typeparam T - the string value to optionally add
     */
    export type AppendIfNotEmpty<
      A extends string[],
      T extends string
    > = T extends ''
      ? // empty string, do not add
        A
      : // non-empty string, add to array
        [...A, T];
  }

  /**
   * The result type when selecting from object type T a path with type P.
   * @typeparam T - the object type to select in
   * @typeparam P - a Path in object type T
   * @example
   * ```ts
   * let r!: Path.Result<{ a: { b: { c: number } } }, 'a.b'>;
   * // => type of r: { c: number }
   * ```
   */
  export type Result<T, P extends string> = Path.Result.For<
    T,
    Path.Result.Tokenize<P>,
    false
  >;

  export namespace Result {
    /**
     * Determines the result type for an array of tokens representing subpaths in type `T`.
     * @typeparam T - the current source type
     * @typeparam Tokens - an array of elements indicating a path into the source type
     * @typeparam Maybe - if true indicates that the path may be undefined
     */
    export type For<
      T,
      Tokens,
      Maybe extends boolean = Path.Internal.IsOptional<T>
    > = Tokens extends []
      ? // no more token
        Path.Internal.MaybeValue<T, Maybe>
      : Path.Internal.IsOptional<T> extends true
      ? // T can be null or undefined, so continue with Maybe set to true
        Path.Result.For<Exclude<T, undefined | null>, Tokens, Maybe>
      : Tokens extends ['?.', infer Key, ...infer Rest]
      ? // optional chaining, process first part and set Maybe to true
        Path.Result.For<Path.Result.Part<T, Key, Maybe>, Rest, true>
      : Tokens extends ['.', infer Key, ...infer Rest]
      ? // normal chaining, process first part and continue
        Path.Result.For<Path.Result.Part<T, Key, false>, Rest, Maybe>
      : Tokens extends [infer Key, ...infer Rest]
      ? // process first part, and continue
        Path.Result.For<Path.Result.Part<T, Key, false>, Rest, Maybe>
      : never;

    /**
     * Determines the result of getting the property/index `K` from type `T`, taking into
     * account that the value may be optional.
     * @typeparam T - the current source type
     * @typeparam K - the key to get from the source type
     * @typeparam Maybe - if true indicates that the path may be undefined
     */
    export type Part<T, K, Maybe extends boolean> = IsArray<T> extends true
      ? // for arrays, Maybe needs to be set to true to force optional chaining
        // for tuples, Maybe should be false
        Path.Internal.MaybeValue<
          T[K & keyof T],
          Tuple.IsTuple<T> extends true ? Maybe : true
        >
      : // Return the type at the given key, and take `Maybe` into account
        Path.Internal.MaybeValue<T[K & keyof T], Maybe>;

    /**
     * Converts a path string into separate tokens in a string array.
     * @typeparam P - the literal string path type
     * @typeparam Token - the token currently being produced
     * @typeparam Res - the resulting literal string token array
     */
    export type Tokenize<
      P extends string,
      Token extends string = '',
      Res extends string[] = []
    > = P extends ''
      ? // no more input to process, return result
        Path.Internal.AppendIfNotEmpty<Res, Token>
      : P extends `[${infer Index}]${infer Rest}`
      ? // input is an array selector, append index to tokens. Continue with new token
        Tokenize<
          Rest,
          '',
          [...Path.Internal.AppendIfNotEmpty<Res, Token>, Index]
        >
      : P extends `?.${infer Rest}`
      ? // optional chaining, append to tokens. Continue with new token
        Tokenize<
          Rest,
          '',
          [...Path.Internal.AppendIfNotEmpty<Res, Token>, '?.']
        >
      : P extends `.${infer Rest}`
      ? // normal chaining, append to tokens. Continue with new token
        Tokenize<Rest, '', [...Path.Internal.AppendIfNotEmpty<Res, Token>, '.']>
      : P extends `${infer First}${infer Rest}`
      ? // process next character
        Tokenize<Rest, `${Token}${First}`, Res>
      : never;
  }

  /**
   * Regular expression used to split a path string into tokens.
   */
  export const stringSplitRegex = /\?\.|\.|\[|\]/g;

  /**
   * The allowed values of a split path.
   */
  export type StringSplit = (string | number | undefined)[];

  /**
   * Return the given `path` string split into an array of subpaths.
   * @param path - the input string path
   */
  export function stringSplit(path: string): Path.StringSplit {
    return path.split(Path.stringSplitRegex);
  }
}

/**
 * Returns the value resulting from selecting the given `path` in the given `source` object.
 * It supports optional chaining for nullable values or values that may be undefined, and also
 * for accessing objects inside an array.
 * There is currently no support for forcing non-null (the `!` operator).
 * @typeparam T - the object type to select in
 * @typeparam P - a Path in object type T
 * @param source - the object to select in
 * @param path - the path into the object
 * @example
 * ```ts
 * const value = { a: { b: { c: [{ d: 5 }, { d: 6 }] } } }
 * Deep.getAt(value, 'a.b');
 * // => { c: 5 }
 * Deep.getAt(value, 'a.b.c');
 * // => [{ d: 5 }, { d: 5 }]
 * Deep.getAt(value, 'a.b.c[1]');
 * // => { d: 6 }
 * Deep.getAt(value, 'a.b.c[1]?.d');
 * // => 6
 * ```
 */
export function getAt<T, P extends Path.Get<T>>(
  source: T,
  path: P
): Path.Result<T, P> {
  if (path === '') {
    // empty path always directly returns source value
    return source as any;
  }

  const items = Path.stringSplit(path);

  // start with `source` as result value
  let result = source as any;

  for (const item of items) {
    if (undefined === item || item === '' || item === '[') {
      // ignore irrelevant items
      continue;
    }

    if (undefined === result || null === result) {
      // optional chaining assumed and no value available, skip rest of path and return undefined
      return undefined as any;
    }

    // set current result to subpath value
    result = result[item];
  }

  return result;
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
 * Deep.patchAt(value, 'a.b.c', v => v + 5);
 * // => { a: { b: { c: 6 } } }
 * ```
 */
export function patchAt<T, P extends Path.Set<T>, C = Path.Result<T, P>>(
  source: T,
  path: P,
  patchItem: Patch<Path.Result<T, P>, Path.Result<T, P> & C>
): T {
  if (path === '') {
    return Deep.patch(source, patchItem as any);
  }

  const items = Path.stringSplit(path);

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

  return Deep.patch(source, createPatchPart(0, source));
}
