import type { IsAnyFunc, IsArray } from '@rimbu/base';

import { Deep, type Path, type Protected } from './internal.mjs';

/**
 * Type defining the allowed selectors on an object of type `T`.
 * Selectors can be:
 * - a path string into type `T`.
 * - a function receiving a `Protected` version of type `T`, and returning an arbitrary value.
 * - a tuple of `Selectors` for type `T`
 * - an object where the property values are `Selectors` for type `T`.
 * @typeparam T - the source value type.
 */
export type Selector<T> =
  | Path.Get<T>
  | ((value: Protected<T>) => any)
  | readonly Selector<T>[]
  | { readonly [key: string | symbol]: Selector<T> };

export namespace Selector {
  /**
   * Type defining the shape of allowed selectors, used to improve compiler checking.
   * @typeparam SL - the selector type
   */
  export type Shape<SL> =
    IsAnyFunc<SL> extends true
      ? // functions are allowed, type provided by `Selector`
        SL
      : IsArray<SL> extends true
        ? // ensure tuple type is preserved
          readonly [...(SL extends readonly unknown[] ? SL : never)]
        : SL extends { readonly [key: string | number | symbol]: unknown }
          ? // ensure all object properties satisfy `Shape`
            { readonly [K in keyof SL]: Selector.Shape<SL[K]> }
          : // nothing to check
            SL;

  /**
   * Type defining the result type of applying the SL selector type to the T value type.
   * @typeparam T - the source value type
   * @typeparam SL - the selector type
   */
  export type Result<T, SL> =
    Selector<T> extends SL
      ? never
      : SL extends (...args: any[]) => infer R
        ? R
        : SL extends string
          ? Path.Result<T, SL>
          : {
              readonly [K in keyof SL]: Selector.Result<T, SL[K]>;
            };
}

/**
 * Returns the result of applying the given `selector` shape to the given `source` value.
 * @typeparam T - the patch value type
 * @typeparam SL - the selector shape type
 * @param source - the source value to select from
 * @param selector - a shape indicating the selection from the source values
 * @param previousSelection - (optional) the previous selection result, reused to give the same reference if the selection did not change.
 * @example
 * ```ts
 * const item = { a: { b:  1, c: 'a' } };
 * Deep.select(item, { q: 'a.c', y: ['a.b', 'a.c'], z: (v) => v.a.b + 1 });
 * // => { q: 'a', y: [1, 'a'], z: 2 }
 * ```
 */
export function select<T, SL extends Selector<T>>(
  source: T,
  selector: Selector.Shape<SL>,
  previousSelection?: any
): Selector.Result<T, SL> {
  if (typeof selector === 'function') {
    // selector is function, resolve selector function
    return (selector as any)(source as Protected<T>);
  } else if (typeof selector === 'string') {
    // selector is string path, get the value at the given path
    return Deep.getAt(source, selector as Path.Get<T>) as any;
  } else if (Array.isArray(selector)) {
    // selector is tuple, get each tuple item value

    let changed =
      !Array.isArray(previousSelection) ||
      previousSelection.length !== selector.length;

    const newSelection = selector.map((selectorItem, index) => {
      if (changed) {
        return select(source, selectorItem);
      }
      const prevItem = previousSelection?.[index];

      const itemResult = select(source, selectorItem, prevItem);

      if (!Object.is(itemResult, prevItem)) {
        changed = true;
        return itemResult;
      }
      return prevItem;
    });

    if (
      previousSelection &&
      Array.isArray(previousSelection) &&
      previousSelection.length === newSelection.length &&
      newSelection.every((item, index) =>
        Object.is(item, previousSelection[index])
      )
    ) {
      return previousSelection as any;
    }

    return newSelection as any;
  }

  // selector is object
  const newSelection: any = {};

  let changed =
    typeof previousSelection !== 'object' || previousSelection === null;

  for (const key in selector as any) {
    // set each selected object key to the selector value
    if (changed) {
      newSelection[key] = select(source, (selector as any)[key]);
    } else {
      const prevValue = previousSelection?.[key];
      const newValue = select(source, (selector as any)[key], prevValue);
      newSelection[key] = newValue;

      if (!changed && previousSelection) {
        if (
          !(key in previousSelection) ||
          !Object.is(newSelection[key], previousSelection[key])
        ) {
          changed = true;
        }
      }
    }
  }

  if (changed) {
    return newSelection;
  }

  return previousSelection as any;
}
