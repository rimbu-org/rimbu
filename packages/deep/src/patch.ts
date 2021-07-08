import { RimbuError } from '@rimbu/base';
import type { ArrayNonEmpty } from '@rimbu/common';
import { Literal } from './internal';

/**
 * Type to determine the allowed input type for the `patch` function.
 * @typeparam T - the input type
 * @typeparam P - the parant type
 * @typeparam R - the root type
 */
export type Patch<T, P = T, R = T> = T extends Literal.Obj
  ? Patch.PatchObj<T, P, R>
  : T extends readonly unknown[]
  ? Patch.PatchArray<T, P, R>
  : Patch.Update<T, P, R>;

/**
 * Returns an updated version of given `value`, without modifying the value, where the contents
 * are updated according to the given `patches` Patch array.
 * @typeparam T - the type of the value to patch
 * @param value - the value to update
 * @param patches - one or more `Patch` objects indicating modifications to the value
 * @example
 * patch({ g: { h: 5 }})({ g: { h: 6 }})          // => { g: { h: 6 }}
 * patch({ g: { h: 5 }})({ g: { h: v => v + 1 }}) // => { g: { h: 6 }}
 * patch({ g: { h: 5 }})({ g: { h: 1 }}, { g: { h: v => v + 1 }})
 * // => { g: { h: 2 }}
 * patch({ a: 1, b: 3 })({ a: (v, p) => v * p.b, (v, p) => v + p.a })
 * // => { a: 3, b: 4 }
 */
export function patch<T>(value: T): (...patches: Patch.Multi<T>) => T {
  return function (...patches) {
    let result = value;

    for (const p of patches) {
      result = patchSingle(result, p as Patch<T>, result, result);
    }

    return result;
  };
}

export namespace Patch {
  export const MAP = Symbol('Patch.ALL');

  /**
   * Type to determine the allowed input type for the `patch` function given an object type T.
   * @typeparam T - the input type, being an object
   * @typeparam P - the parant type
   * @typeparam R - the root type
   */
  export type PatchObj<T extends Literal.Obj, P = T, R = T> =
    | Patch.Update<T, P, R>
    | { [K in keyof T]?: Patch<T[K], T, R> };

  /**
   * Type representing at least one Patch object for type T
   * @typeparam T - the target type
   */
  export type Multi<T> = ArrayNonEmpty<Patch<T>>;

  /**
   * Type representing patches for values that are not objects or arrays
   * @typeparam T - the input type
   * @typeparam P - the parant type
   * @typeparam R - the root type
   */
  export type Update<T, P, R> =
    | Literal.Value<T>
    | ((value: T, parent: P, root: R) => T extends boolean ? boolean : T);

  /**
   * Type representing allowed patches for arrays
   * @typeparam T - the array type
   * @typeparam P - the parent type
   * @typeparam R - the root type
   */
  export type PatchArray<T extends readonly unknown[], P, R> = (
    | Patch.Update<T, P, R>
    | (T extends readonly (infer E)[] ? { [Patch.MAP]: Patch<E, T, R> } : never)
    | {
        [K in { [K2 in keyof T]: K2 }[keyof T]]?: Patch<T[K], T, R>;
      }
  ) &
    Literal.NoIterable;

  /**
   * Returns a function that patches a given object of type `T` with the given `patches`
   * Patch array.
   * @typeparam T - the value type to operate on
   * @typeparam T2 - the type the Patch is done for, should be equal to T
   * @param patches - the patches to apply to a given object
   * @example
   * const r = Patch.create<{ a: number, b: number }>({ b: v => v + 1 })({ a: 1, b: 2})
   * console.log(r)
   * // => { a: 1, b: 3 }
   */
  export function create<T, T2 extends T = T>(
    ...patches: Patch.Multi<T2>
  ): (value: T) => T {
    return (value) =>
      patch<T>(value)(...(patches as unknown as Patch.Multi<T>));
  }
}

function patchSingle<T, P = T, R = T>(
  value: T,
  patcher: Patch<T, P, R>,
  parent: P,
  root: R
): T {
  if (typeof patcher === 'function') {
    return patcher(value, parent, root) as any;
  }

  if (null === value || undefined === value || typeof value !== 'object') {
    if (typeof patcher !== 'object' || null === patcher) return patcher as any;
    if (Literal.isLiteral<T>(patcher)) {
      return Literal.getValue(patcher);
    }
    return value;
  }

  if (Array.isArray(patcher)) {
    RimbuError.throwInvalidStateError();
  }

  if (typeof patcher !== 'object') return patcher as any;

  if (null === patcher) return null as any;

  if (Literal.isLiteral<T>(patcher)) {
    return Literal.getValue(patcher);
  }

  const valueIsArray = Array.isArray(value);

  if (!valueIsArray && !Literal.isPlainObject(value)) return patcher as any;

  if (valueIsArray && Patch.MAP in patcher) {
    const arr = value as unknown as any[];
    const itemPatch = (patcher as any)[Patch.MAP];

    let result: any[] | undefined = undefined;

    for (let i = 0; i < arr.length; i++) {
      const currentItem = arr[i];
      const newItem = patchSingle(currentItem, itemPatch, value, root);
      if (!Object.is(newItem, currentItem)) {
        if (undefined === result) {
          result = arr.slice();
        }
        result[i] = newItem;
      }
    }

    return (result ?? arr) as any;
  }

  const clone: any = valueIsArray ? ([...(value as any)] as any) : { ...value };
  let changed = false;

  for (const key in patcher as T) {
    if (!(key in clone)) continue;

    const oldValue = clone[key];
    const patchKey = (patcher as T)[key];

    if (undefined === patchKey) {
      RimbuError.throwInvalidUsageError(
        'Do not use undefined directly in patch objects, but use Literal.of(undefined) instead due to type limitations.'
      );
    }

    const newValue = patchSingle(oldValue, patchKey as any, value, root);

    if (oldValue !== newValue) {
      changed = true;
      clone[key] = newValue;
    }
  }

  if (changed) return clone;

  return value;
}
