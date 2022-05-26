import {
  RimbuError,
  type AnyFunc,
  isPlainObj,
  type PlainObj,
} from '@rimbu/base';

import type { Protected } from './internal';

/**
 * A type to determine the allowed input type for the `patch` function.
 * @typeparam T - the input type to be patched
 */
export type Patch<T> = Patch.Entry<T, T>;

export namespace Patch {
  /**
   * The entry type for a (nested) patch. Can be either a patch object or a function accepting the nested patch function and returning a patch object.
   * @typeparam T - the input value type
   * @typeparam R - the root object type
   */
  export type Entry<T, R> =
    | Patch.Obj<T, R>
    | ((patchNested: Patch.Nested) => Patch.Obj<T, R>);

  /**
   * The object patch type, allows the user to specify keys in T that should be patched, and each given key contains either a new value or a nested patch, or a function receiving
   * the current value, the parent object, and the root object, and returning a new value or a nested patch.
   * @typeparam T - the input value type
   * @typeparam R - the root object type
   */
  export type Obj<T, R> = {
    [K in keyof T]?:
      | (T[K] extends AnyFunc ? never : ObjItem<T[K], R>)
      | ((
          cur: Protected<T[K]>,
          parent: Protected<T>,
          root: Protected<R>
        ) => ObjItem<T[K], R>);
  };

  /**
   * A patch object can have as update either a new value or a nested patch object
   * @typeparam T - the input value type
   * @typeparam R - the root object type
   */
  export type ObjItem<T, R> = T | NestedObj<T, R>;

  /**
   * The function type to create a nested Patch object.
   */
  export type Nested = typeof patchNested;

  /**
   * Returns a function that patches a given `value` with the given `patchItems`.
   * @typeparam T - the patch value type
   * @typeparam Q - the input value type
   * @param patchItems - a number of `Patch` objects that patch a given value of type T.
   * @example
   * ```ts
   * const items = [{ a: 1, b: 'a' }, { a: 2, b: 'b' }]
   * items.map(Patch.create({ a: v => v + 1 }))
   * // => [{ a: 2, b: 'a' }, { a: 3, b: 'b' }]
   * ```
   */
  export function create<T, Q extends T = T>(
    ...patchItems: Patch<T & Q>[]
  ): (value: Q & PlainObj<Q>) => Q {
    return (value) => patch<Q>(value, ...patchItems);
  }
}

class NestedObj<T, R, Q extends T = T> {
  constructor(readonly patchDataItems: Patch.Obj<Q, R>[]) {}
}

/**
 * Returns a nested patch object based on the given `patchDataItems` that work on a subpart
 * of a larger object to be patched.
 * @typeparam T - the input value type
 * @typeparam R - the root object type
 * @typeparam Q - the patch type
 * @param patchDataItems - a number of `Patch` objects to be applied to the subpart of the object
 * @example
 * ```ts
 * patch({ a: 1, b: { c: true, d: 'a' } }, { b: patchNested({ d: 'b' }) })
 * // => { a: 1, b: { c: true, d: 'b' } }
 * ```
 */
export function patchNested<T, R, Q extends T = T>(
  ...patchDataItems: Patch.Obj<Q, R>[]
): NestedObj<T, R, Q> {
  return new NestedObj(patchDataItems);
}

/**
 * Returns an immutably updated version of the given `value` where the given `patchItems` have been
 * applied to the result.
 * @param value - the input value to patch
 * @param patchItems - the `Patch` objects to apply to the input value
 * @example
 * ```ts
 * const input = { a: 1, b: { c: true, d: 'a' } }
 * patch(input, { a: 2 })  // => { a: 2, b: { c: true, d: 'a' } }
 * patch(input: ($) => ({ b: $({ c: v => !v }) }) )
 * // => { a: 1, b: { c: false, d: 'a' } }
 * patch(input: ($) => ({ a: v => v + 1, b: $({ d: 'q' }) }) )
 * // => { a: 2, b: { c: true, d: 'q' } }
 * ```
 */
export function patch<T>(value: T & PlainObj<T>, ...patchItems: Patch<T>[]): T {
  const newValue = isPlainObj(value) ? { ...value } : value;
  const changedRef = { changed: false };

  const result = processPatch(newValue, newValue, patchItems, changedRef);

  if (changedRef.changed) return result;

  return value;
}

/**
 * Interface providing a shared reference to a `changed` boolean.
 */
interface ChangedRef {
  changed: boolean;
}

function processPatch<T, R>(
  value: T,
  root: R,
  patchDataItems: Patch.Entry<T, R>[],
  changedRef: ChangedRef
): T {
  let i = -1;
  const len = patchDataItems.length;

  while (++i < len) {
    const patchItem = patchDataItems[i];
    if (patchItem instanceof Function) {
      const item = patchItem(patchNested);
      if (item instanceof NestedObj) {
        processPatch(value, root, item.patchDataItems, changedRef);
      } else {
        processPatchObj(value, root, item, changedRef);
      }
    } else {
      processPatchObj(value, root, patchItem, changedRef);
    }
  }

  return value;
}

function processPatchObj<T, R>(
  value: T,
  root: R,
  patchData: Patch.Obj<T, R>,
  changedRef: ChangedRef
): T {
  if (undefined === value || null === value) {
    return value;
  }

  if (!isPlainObj(patchData)) {
    RimbuError.throwInvalidUsageError(
      'patch: received patch object should be a plain object'
    );
  }

  if (!isPlainObj(value)) {
    RimbuError.throwInvalidUsageError(
      'patch: received source object should be a plain object'
    );
  }

  for (const key in patchData) {
    const target = value[key];

    // prevent prototype pollution
    if (
      key === '__proto__' ||
      (key === 'constructor' && target instanceof Function)
    ) {
      RimbuError.throwInvalidUsageError(
        `patch: received patch object key '${key}' which is not allowed to prevent prototype pollution`
      );
    }

    const update = patchData[key];

    if (!(key in value) && update instanceof Function) {
      RimbuError.throwInvalidUsageError(
        `patch: received update function object key ${key} but the key was not present in the source object. Either explicitely set the value in the source to undefined or use a direct value.`
      );
    }

    if (undefined === update) {
      RimbuError.throwInvalidUsageError(
        "patch: received 'undefined' as patch value. Due to type system issues we cannot prevent this through typing, but please use '() => undefined'  or '() => yourVar' instead. This value will be ignored for safety."
      );
    }

    let newValue: typeof target;

    if (update instanceof Function) {
      newValue = processPatchObjItem(
        target,
        root,
        update(target, value, root),
        changedRef
      );
    } else {
      newValue = processPatchObjItem(
        target,
        root,
        update as any,
        changedRef
      ) as any;
    }

    if (!Object.is(newValue, target)) {
      value[key] = newValue;
      changedRef.changed = true;
    }
  }

  return value;
}

function processPatchObjItem<T, R>(
  value: T,
  root: R,
  patchResult: Patch.ObjItem<T, R>,
  superChangedRef: ChangedRef
): T {
  if (patchResult instanceof NestedObj) {
    const newValue = isPlainObj(value) ? { ...value } : value;
    const changedRef = { changed: false };

    const result = processPatch(
      newValue,
      root,
      patchResult.patchDataItems,
      changedRef
    );

    if (changedRef.changed) {
      superChangedRef.changed = true;
      return result;
    }

    return value;
  }

  return patchResult;
}
