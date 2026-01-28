import {
  type IsAnyFunc,
  type IsArray,
  type IsPlainObj,
  type NotIterable,
} from '@rimbu/base/plain-object';

import type { Protected } from '@rimbu/deep';
import type { Tuple } from '@rimbu/deep/tuple';

export namespace MatchInternal {
  /**
   * Determines the various allowed match types for given type `T`.
   * @typeparam T - the input value type
   * @typeparam C - utility type
   * @typeparam P - the parent type
   * @typeparam R - the root object type
   */
  export type Entry<T, C, P, R> =
    IsAnyFunc<T> extends true
      ? // function can only be directly matched
        T
      : IsPlainObj<T> extends true
        ? // determine allowed match values for object
          MatchInternal.WithResult<T, P, R, MatchInternal.Obj<T, C, P, R>>
        : IsArray<T> extends true
          ? // determine allowed match values for array or tuple
            | MatchInternal.Arr<T, C, P, R>
              | MatchInternal.Entry<
                  T[number & keyof T],
                  C[number & keyof C],
                  P,
                  R
                >[]
              | MatchInternal.Func<
                  T,
                  P,
                  R,
                  | MatchInternal.Arr<T, C, P, R>
                  | MatchInternal.Entry<
                      T[number & keyof T],
                      C[number & keyof C],
                      P,
                      R
                    >[]
                >
          : // only accept values with same interface
            MatchInternal.WithResult<
              T,
              P,
              R,
              { [K in keyof C]: C[K & keyof T] }
            >;

  /**
   * The type that determines allowed matchers for objects.
   * @typeparam T - the input value type
   * @typeparam C - utility type
   * @typeparam P - the parent type
   * @typeparam R - the root object type
   */
  export type Obj<T, C, P, R> =
    | MatchInternal.ObjProps<T, C, R>
    | MatchInternal.CompoundForObj<T, C, P, R>;

  /**
   * The type to determine allowed matchers for object properties.
   * @typeparam T - the input value type
   * @typeparam C - utility type
   * @typeparam R - the root object type
   */
  export type ObjProps<T, C, R> = {
    [K in keyof C]?: K extends keyof T
      ? MatchInternal.Entry<T[K], C[K], T, R>
      : never;
  };

  /**
   * The type that determines allowed matchers for arrays/tuples.
   * @typeparam T - the input value type
   * @typeparam C - utility type
   * @typeparam P - the parent type
   * @typeparam R - the root object type
   */
  export type Arr<T, C, P, R> =
    | C
    | MatchInternal.CompoundForArr<T, C, P, R>
    | MatchInternal.TraversalForArr<T, C, R>
    | (MatchInternal.TupIndices<T, C, R> & {
        [K in
          | MatchInternal.CompoundType
          | MatchInternal.ArrayTraversalType]?: never;
      });

  /**
   * A type that either directly results in result type `S` or is a function taking the value, parent, and root values, and
   * returns a value of type `S`.
   * @typeparam T - the input value type
   * @typeparam P - the parent type
   * @typeparam R - the root object type
   * @typeparam S - the result type
   */
  export type WithResult<T, P, R, S> = S | MatchInternal.Func<T, P, R, S>;

  /**
   * Type used to determine the allowed function types. Always includes booleans.
   * @typeparam T - the input value type
   * @typeparam P - the parent type
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
    [K in Tuple.KeysOf<C>]?: MatchInternal.Entry<T[K & keyof T], C[K], T, R>;
  } & NotIterable;

  /**
   * Compound keys used to indicate the type of compound.
   */
  export type CompoundType = 'every' | 'some' | 'none' | 'single';

  /**
   * Keys used to indicate an array match traversal.
   */
  export type ArrayTraversalType = `${CompoundType}Item`;

  /**
   * Compound matcher for objects, represented as an array starting with a compound type keyword.
   * @typeparam T - the input value type
   * @typeparam C - utility type
   * @typeparam P - the parent type
   * @typeparam R - the root object type
   */
  export type CompoundForObj<T, C, P, R> = [
    MatchInternal.CompoundType,
    ...MatchInternal.Entry<T, C, P, R>[],
  ];

  /**
   * Defines an object containing exactly one `CompoundType` key, having an array of matchers.
   * @typeparam T - the input value type
   * @typeparam C - utility type
   * @typeparam P - the parent type
   * @typeparam R - the root object type
   */
  export type CompoundForArr<T, C, P, R> = {
    [K in MatchInternal.CompoundType]: {
      [K2 in MatchInternal.CompoundType]?: K2 extends K
        ? MatchInternal.Entry<T, C, P, R>[]
        : never;
    };
  }[MatchInternal.CompoundType];

  /**
   * Defines an object containing exactly one `TraversalType` key, having a matcher for the array element type.
   * @typeparam T - the input value type
   * @typeparam C - utility type
   * @typeparam R - the root object type
   */
  export type TraversalForArr<T, C, R> = {
    [K in MatchInternal.ArrayTraversalType]: {
      [K2 in MatchInternal.ArrayTraversalType]?: K2 extends K
        ? MatchInternal.Entry<T[number & keyof T], C[number & keyof C], T, R>
        : never;
    };
  }[MatchInternal.ArrayTraversalType];
}
