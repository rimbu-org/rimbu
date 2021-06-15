import { Literal, Patch } from './internal';

/**
 * A string representing a path into an (nested) object of type T.
 * @typeparam T - the object type to select in
 * @example
 * const p: Path<{ a: { b: { c : 5 }}}> = 'a.b'
 */
export type Path<T> = T extends Literal.Obj
  ? { [K in string & keyof T]: `${K}` | `${K}.${Path<T[K]>}` }[string & keyof T]
  : never;

export namespace Path {
  /**
   * The result type when selecting from object type T a path with type P.
   * @typeparam T - the object type to select in
   * @typeparam P - a Path in object type T
   * @example
   * let r!: Path.Result<{ a: { b: { c: number } } }, 'a.b'>;
   * // => type of r: { c: number }
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
   * console.log(Path.getValue({ a: { b: { c: 5 } } }), 'a.b')
   * // => { c: 5 }
   * console.log(Path.getValue({ a: { b: { c: 5 } } }), 'a.b.c')
   * // => 5
   */
  export function getValue<T, P extends Path<T> = Path<T>>(
    source: T,
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
   * console.log(Path.setValue({ a: { b: { c: 5  } } }))
   */
  export function setValue<T, P extends Path<T> = Path<T>>(
    source: T,
    path: P,
    value: Path.Result<T, P>
  ): T {
    const items = path.split('.');
    const last = items.pop()!;

    const result = { ...source };

    let current: any = result;

    for (const item of items) {
      current[item] = { ...current[item] };
      current = current[item];
    }

    const oldValue = current[last];

    if (Object.is(oldValue, value)) return source;

    current[last] = value;

    return result;
  }

  /**
   * Patches the value at the given path in the source to the given value using the given
   * `patches`.
   * @param source - the object to update
   * @param path - the path in the object to update
   * @param patches - one or more patches to update the value at the given path
   * @example
   * console.log(Path.setValue({ a: { b: { c: 5 } } }, 'a.b.c', 8)
   * // => { a: { b: { c: 8 } } }
   */
  export function patchValue<T, P extends Path<T> = Path<T>>(
    source: T,
    path: P,
    ...patches: Patch.Multi<Path.Result<T, P>>
  ): T {
    const value = Path.getValue(source, path);
    const newValue = Patch(value)(...patches);

    if (Object.is(value, newValue)) return source;

    return Path.setValue<any, any>(source, path, newValue);
  }
}
