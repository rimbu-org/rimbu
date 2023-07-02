/**
 * A higher-kind utility type providing access to the element type T.
 */
export interface Elem<T = unknown> {
  /**
   * The element type.
   */
  readonly _T: T;
}

/**
 * A utility type to set the element type to given type T.
 */
export type WithElem<Tp, T> = Elem<T> & Tp;

/**
 * A higher-kind utility type providing access to a key type K and value type V.
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
 * A utility type to set the key type to given type K, and the value type to given type V.
 */
export type WithKeyValue<Tp, K, V> = Tp & KeyValue<K, V>;

/**
 * A higher-kind utility type providing access to a row type R, a column type C, and a value type V.
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
 * A utility type to set the row type to given type R, the column type to given type C,
 * and the value type to given type V.
 */
export type WithRow<Tp, R, C, V> = Tp & Row<R, C, V>;
