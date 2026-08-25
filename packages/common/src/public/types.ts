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

/**
 * Utility type to represent the result of an operation that may or may not have a value.
 *
 * The third element (`hasValue`) is a discriminant that indicates whether the operation
 * had a value to return because the relevant key/value was **present**. It does **not**
 * indicate whether the collection changed: when an operation is a no-op (e.g. an
 * `update` that yields the same value, or re-setting an already-present identical entry),
 * `hasValue` is still `true` and the value is returned, while the result (first element)
 * is the unchanged collection (`this`). To detect whether the collection actually changed,
 * compare the result with the original collection via `result[0] === this`.
 * @typeparam R - the result type when a value is present
 * @typeparam V - the value type when a value is present
 * @typeparam RNoValue - the result type when no value is present (default: `R`)
 * @typeparam VNoValue - the value type when no value is present (default: `undefined`)
 * @docExpand
 */
export type WithValueResult<R, V, RNoValue = R, VNoValue = undefined> =
	| [result: R, value: V, hasValue: true]
	| [result: RNoValue, value: VNoValue, hasValue: false];

export type IfAnyExtends<T extends readonly unknown[], M, A, B> =
	Extract<T[number], M> extends never ? B : A;

export type IfAllExtend<
	T extends readonly unknown[],
	M,
	A,
	B,
> = T extends readonly M[] ? A : B;
