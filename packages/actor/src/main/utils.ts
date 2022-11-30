/**
 * Utility type to retrieve the typed tail of a tuple.
 * @typeparam A - the input tuple type
 */
export type Tail<A extends any[]> = A extends [any, ...infer Rest] ? Rest : [];
