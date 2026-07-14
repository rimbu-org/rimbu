/**
 * Accepts types `T` and `U` where `T` extends `U`, and results in the upper bound `U`.
 * @typeparam U - the upper bound type
 * @typeparam T - the input type to test against `U`
 */
export type SuperOf<U, T> = T extends U ? U : never;

/**
 * Accepts types `S` and `T` where `S` extends `T`, and results in the lower bound `S`.
 * @typeparam S - the subtype (lower bound)
 * @typeparam T - the supertype to test against
 */
export type SubOf<S, T> = S extends T ? S : never;

/**
 * Accepts types `T` and `U` where either `T` extends `U` or `U` extends `T`.
 * @typeparam T - one of the related types
 * @typeparam U - the other related type
 */
export type RelatedTo<T, U> = T | SuperOf<U, T>;

/**
 * Accepts arrays with at least one element.
 * @typeparam T - the element type
 */
export type ArrayNonEmpty<T> = [T, ...T[]];

/**
 * Accepts strings with at least one character.
 * @typeparam T - the string type to check
 */
export type StringNonEmpty<T> = T extends string
	? '' extends T
		? never
		: T
	: never;

/**
 * Utility type to convert some object to a JSON serializable format.
 * @typeparam V - the `value` type
 * @typeparam D - the `dataType` tag string type
 */
export interface ToJSON<V, D extends string = string> {
	readonly dataType: D;
	readonly value: V;
}
