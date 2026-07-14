import type { PathInternal, PathResultInternal } from '#deep/path-internal';

/**
 * Utilities and types for typed object path strings.
 */
export namespace Path {
	/**
	 * A string representing a path into an (nested) object of type T.
	 * @typeparam T - the object type to select in
	 * @example
	 * ```ts
	 * const p: Path.Get<{ a: { b: { c : 5 } } }> = 'a.b'
	 * ```
	 */
	export type Get<T> = PathInternal.Generic<T, false, false, true>;

	/**
	 * A string representing a path into an (nested) object of type T.
	 * @typeparam T - the object type to select in
	 * @example
	 * ```ts
	 * const p: Path.Set<{ a: { b: { c : 5 } } }> = 'a.b'
	 * ```
	 */
	export type Set<T> = PathInternal.Generic<T, true, false, true>;

	/**
	 * The result type when selecting from object type T a path with type P.
	 * @typeparam T - the object type to select in
	 * @typeparam P - a path in object type T
	 * @example
	 * ```ts
	 * let r!: Path.Result<{ a: { b: { c: number } } }, 'a.b'>;
	 * // => type of r: { c: number }
	 * ```
	 */
	export type Result<T, P extends string> = PathResultInternal.For<
		T,
		PathResultInternal.Tokenize<P>,
		false
	>;
}
