/**
 * A higher-kind utility type providing access to the element type T.
 * @typeparam T - the element type
 */
export interface Elem<T = unknown> {
	/**
	 * The element type.
	 */
	readonly _T: T;
}

/**
 * A utility type to set the element type on a target type.
 * @typeparam Tp - the target type to augment with an element type
 * @typeparam T - the element type to set on `Tp`
 */
export type WithElem<Tp, T> = Elem<T> & Tp;

/**
 * A higher-kind utility type providing access to a key type K and value type V.
 * @typeparam K - the key type
 * @typeparam V - the value type
 */
export interface KeyValue<K = unknown, V = unknown> {
	/**
	 * The key type.
	 */
	readonly _K: K;
	/**
	 * The value type.
	 */
	readonly _V: V;
}

/**
 * A utility type to set the key and value types on a target type.
 * @typeparam Tp - the target type to augment with key/value types
 * @typeparam K - the key type to set on `Tp`
 * @typeparam V - the value type to set on `Tp`
 */
export type WithKeyValue<Tp, K, V> = Tp & KeyValue<K, V>;

/**
 * A higher-kind utility type providing access to a row type R, a column type C, and a value type V.
 * @typeparam R - the row key type
 * @typeparam C - the column key type
 * @typeparam V - the value type
 */
export interface Row<R = unknown, C = unknown, V = unknown> {
	/**
	 * The row key type.
	 */
	readonly _R: R;
	/**
	 * The column key type.
	 */
	readonly _C: C;
	/**
	 * The value type.
	 */
	readonly _V: V;
}

/**
 * A utility type to set row/column/value types on a target type.
 * @typeparam Tp - the target type to augment with row/column/value types
 * @typeparam R - the row key type to set on `Tp`
 * @typeparam C - the column key type to set on `Tp`
 * @typeparam V - the value type to set on `Tp`
 */
export type WithRow<Tp, R, C, V> = Tp & Row<R, C, V>;
