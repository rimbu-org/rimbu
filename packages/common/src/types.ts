/**
 * Accepts all types of T and U where T extends U,
 * and result in the upper bound U.
 */
export type SuperOf<U, T> = T extends U ? U : never;

/**
 * Accepts all types of T and S where S extends T,
 * and results in the lower bound S.
 */
export type SubOf<S, T> = S extends T ? S : never;

/**
 * Accepts all types of T and U where T extends U or U extends T.
 */
export type RelatedTo<T, U> = T | SuperOf<U, T>;

/**
 * Accepts all arrays with at least one element.
 */
export type ArrayNonEmpty<T> = [T, ...T[]];

/**
 * Accepts all strings with at least one character.
 */
export type StringNonEmpty<T> = T extends string
  ? '' extends T
    ? never
    : T
  : never;

/**
 * A stronger version of `Omit`, which only accepts keys that are in type T.
 */
export type OmitStrong<T, K extends keyof T> = Omit<T, K>;

/**
 * A type that returns, for a given array type, the array type without the first element.
 */
export type Tail<Args extends readonly unknown[]> = Args extends readonly [
  unknown,
  ...infer TailArgs
]
  ? TailArgs
  : never;
