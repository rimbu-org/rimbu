/**
 * Utility type to retrieve the typed tail of a tuple.
 * @typeparam A - the input tuple type
 */
export type Tail<A extends any[]> = A extends [any, ...infer Rest] ? Rest : [];

export type Override<T, O> = {} & {
  [K in keyof T | keyof O]: K extends keyof O
    ? O[K]
    : K extends keyof T
      ? T[K]
      : never;
};

export type Simplify<T> = T extends object ? { [K in keyof T]: T[K] } : T;
