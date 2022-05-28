import type { Update } from '@rimbu/common';
import type { IsPlainObj, PlainObj } from '@rimbu/base';

import { patch, patchNested } from './internal';

/**
 * A string representing a path into an (nested) object of type T.
 * @typeparam T - the object type to select in
 * @example
 * ```ts
 * const p: Path<{ a: { b: { c : 5 }}}> = 'a.b'
 * ```
 */
export type Path<T> = IsPlainObj<T> extends true
  ? { [K in string & keyof T]: `${K}` | `${K}.${Path<T[K]>}` }[string & keyof T]
  : never;

export namespace Path {
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
  export type Result<T, P extends Path<T> = Path<T>> = T extends Record<
    string,
    unknown
  >
    ? P extends `${infer Head}.${infer Rest}`
      ? Head extends keyof T
        ? Path.Result<T[Head], Rest & Path<T[Head]>>
        : never
      : P extends `${infer K}`
      ? T[K]
      : never
    : never;

  /**
   * Returns the value resulting from selecting the given `path` in the given `source` object.
   * @typeparam T - the object type to select in
   * @typeparam P - a Path in object type T
   * @param source - the object to select in
   * @param path - the path into the object
   * @example
   * ```ts
   * console.log(Path.get({ a: { b: { c: 5 } } }), 'a.b')
   * // => { c: 5 }
   * console.log(Path.get({ a: { b: { c: 5 } } }), 'a.b.c')
   * // => 5
   * ```
   */
  export function get<T, P extends Path<T> = Path<T>>(
    source: T & PlainObj<T>,
    path: P
  ): Path.Result<T, P> {
    const items = path.split('.');

    let result: any = source;

    for (const item of items) {
      result = result[item];
    }

    return result;
  }

  /**
   * Sets the value at the given path in the source to the given value.
   * @param source - the object to update
   * @param path - the path in the object to update
   * @param value - the new value to set at the given position
   * @example
   * ```ts
   * console.log(Path.update({ a: { b: { c: 5 } } }, 'a.b.c', v => v + 5)
   * // => { a: { b: { c: 6 } } }
   * ```
   */
  export function update<T, P extends Path<T> = Path<T>>(
    source: T & PlainObj<T>,
    path: P,
    value: Update<Path.Result<T, P>>
  ): T {
    const items = path.split('.');
    const last = items.pop()!;

    const root: Record<string, any> = {};

    let current = root;

    for (const item of items) {
      const next = {};
      current[item] = patchNested(next);
      current = next;
    }

    current[last] = value;

    return patch<T>(source, root);
  }
}
