import { Tail } from './internal';

/**
 * A function returning true if given `v1` and `v2` should be considered equal.
 */
export type Eq<T> = (v1: T, v2: T) => boolean;

export namespace Eq {
  const _anyFlatEq: Eq<any> = createAnyEq('FLAT');
  const _anyShallowEq: Eq<any> = createAnyEq('SHALLOW');
  const _anyDeepEq: Eq<any> = createAnyEq('DEEP');

  /**
   * An Eq instance that uses `Object.is` to determine if two objects are equal.
   * @example
   * const eq = Eq.objectIs
   * console.log(eq(5, 5))
   * // => true
   * console.log(eq(5, 'a'))
   * // => false
   */
  export const objectIs: Eq<any> = Object.is;

  const _valueOfEq: Eq<{ valueOf(): any }> = (v1, v2) =>
    Object.is(v1.valueOf(), v2.valueOf());

  /**
   * Returns an Eq instance for objects that have a `valueOf` method. It returns true if the `.valueOf` values of both given objects are equal.
   * @typeparam T - the object type containing a valueOf function of type V
   * @typeparam V - the valueOf result type
   * @example
   * const eq = Eq.valueOfEq()
   * console.log(eq(new Number(5), new Number(5)))
   * // => true
   * console.log(eq(new Number(5), new Number(3)))
   * // => false
   */
  export function valueOfEq<T extends { valueOf(): V }, V>(): Eq<T> {
    return _valueOfEq;
  }

  /**
   * Returns an Eq instance that compares Date objects according to their `valueOf` value.
   * @example
   * const eq = Eq.dateEq()
   * console.log(eq(new Date(2020, 1, 1), new Date(2020, 1, 1))
   * // => true
   * console.log(eq(new Date(2020, 1, 1), new Date(2020, 2, 1))
   * // => false
   */
  export function dateEq(): Eq<Date> {
    return _valueOfEq;
  }

  function createIterableEq<T>(itemEq: Eq<T>): Eq<Iterable<T>> {
    return (v1, v2) => {
      const iter1 = v1[Symbol.iterator]();
      const iter2 = v2[Symbol.iterator]();

      while (true) {
        const value1 = iter1.next();
        const value2 = iter2.next();

        if (value1.done || value2.done) return value1.done === value2.done;

        if (!itemEq(value1.value, value2.value)) return false;
      }
    };
  }

  const _iterableAnyEq: Eq<Iterable<any>> = createIterableEq(anyFlatEq());

  /**
   * Returns an Eq instance that compares Iterables by comparing their elements with the given `itemEq` Eq instance.
   * @typeparam T - the Iterable element type
   * @param itemEq - (optional) the Eq instance to use to compare the Iterable's elements
   * @example
   * const eq = Eq.iterableEq();
   * console.log(eq([1, 2, 3], [1, 2, 3])
   * // => true
   * console.log(eq([1, 2, 3], [1, 3, 2])
   * // => false
   */
  export function iterableEq<T>(itemEq?: Eq<T>): Eq<Iterable<T>> {
    if (undefined === itemEq) return _iterableAnyEq;

    return createIterableEq(itemEq);
  }

  function createObjectEq(valueEq: Eq<any>): Eq<Record<any, any>> {
    return (v1, v2) => {
      if (v1.constructor !== v2.constructor) return false;

      for (const key in v1) {
        if (!(key in v2)) return false;
      }

      for (const key in v2) {
        if (!(key in v1)) return false;
      }

      for (const key in v1) {
        const value1 = v1[key];
        const value2 = v2[key];

        if (!valueEq(value1, value2)) return false;
      }

      return true;
    };
  }

  const _objectEq: Eq<Record<any, any>> = createObjectEq(anyFlatEq());

  /**
   * Returns an Eq instance that checks equality of objects containing property values of type V by iteratively
   * applying given `valueEq` to each of the object's property values.
   * @typeparam - the object property value type
   * @param valueEq - (optional) the Eq instance to use to compare property values
   * @example
   * const eq = Eq.objectEq()
   * console.log(eq({ a: 1, b: { c: 2 }}, { b: { c: 2 }, a: 1 }))
   * // => true
   * console.log(eq({ a: 1, b: { c: 2 }}, { a: 1, b: { c: 3 }}))
   * // => false
   */
  export function objectEq<V = any>(valueEq?: Eq<V>): Eq<Record<any, V>> {
    if (undefined === valueEq) return _objectEq;

    return createObjectEq(valueEq);
  }

  function createAnyEq(mode: 'FLAT' | 'SHALLOW' | 'DEEP'): Eq<any> {
    const result: Eq<any> = (v1, v2) => {
      if (Object.is(v1, v2)) return true;

      const type1 = typeof v1;
      const type2 = typeof v2;

      if (type1 !== type2) return false;

      switch (type1) {
        case 'undefined':
        case 'bigint':
        case 'boolean':
        case 'number':
        case 'string':
        case 'symbol':
        case 'function':
          return Object.is(v1, v2);
        default: {
          if (v1 === null || v2 === null) return false;

          if (v1.constructor !== v2.constructor) {
            return false;
          }

          if (
            v1 instanceof Boolean ||
            v1 instanceof Date ||
            v1 instanceof Number ||
            v1 instanceof String
          ) {
            return _valueOfEq(v1, v2);
          }

          if (mode !== 'FLAT') {
            if (Symbol.iterator in v1 && Symbol.iterator in v2) {
              if (mode === 'SHALLOW') return _iterableAnyEq(v1, v2);

              return createIterableEq(result)(v1, v2);
            }

            return _objectEq(v1, v2);
          }

          return _anyJsonEq(v1, v2);
        }
      }
    };

    return result;
  }

  /**
   * Returns an Eq instance that checks equality of any values. For composed values (objects and iterables)
   * it will compare the JSON.stringify results of the values.
   * @typeparam T - the value type
   * @example
   * const eq = anyFlatEq()
   * console.log(eq(1, 'a'))
   * // => false
   * console.log(eq({ a: 1, b: 2 }, { b: 2, a: 1 }))
   * // => false
   */
  export function anyFlatEq<T = any>(): Eq<T> {
    return _anyFlatEq;
  }

  /**
   * Returns an Eq instance that checks equality of any values. For composed values (objects and iterables)
   * it will enter 1 level, and if again compound values are found, they are compared
   * using JSON.stringify.
   * @typeparam T - the value type
   * @example
   * const eq = anyFlatEq()
   * console.log(eq(1, 'a'))
   * // => false
   * console.log(eq({ a: 1, b: 2 }, { b: 2, a: 1 }))
   * // => true
   * console.log(eq([{ a: 1, b: 2 }], [{ b: 2, a: 1 }]))
   * // => false
   */
  export function anyShallowEq<T = any>(): Eq<T> {
    return _anyShallowEq;
  }

  /**
   * Returns an Eq instance that checks equality of any values. For composed values (objects and iterables)
   * it will recursively compare the contained values.
   * @note may have poor performance for deeply nested types and large arrays, and objects with circular structures
   * may cause infinite loops
   * @typeparam T - the value type
   * @example
   * const eq = anyFlatEq()
   * console.log(eq(1, 'a'))
   * // => false
   * console.log(eq({ a: 1, b: 2 }, { b: 2, a: 1 }))
   * // => true
   * console.log(eq([{ a: 1, b: 2 }], [{ b: 2, a: 1 }]))
   * // => false
   */
  export function anyDeepEq<T = any>(): Eq<T> {
    return _anyDeepEq;
  }

  function createStringEq(
    ...args: Tail<Parameters<string['localeCompare']>>
  ): Eq<string> {
    return (v1, v2) => v1.localeCompare(v2, ...args) === 0;
  }

  const _stringCaseInsensitiveEq: Eq<string> = createStringEq('und', {
    sensitivity: 'accent',
  });

  /**
   * Returns an Eq instance that considers strings equal regardless of their case.
   * @example
   * const eq = Eq.stringCaseInsentitiveEq()
   * console.log(eq('aB', 'Ab'))
   * // => true
   * console.log(eq('aBc', 'abB'))
   * // => false
   */
  export function stringCaseInsentitiveEq(): Eq<string> {
    return _stringCaseInsensitiveEq;
  }

  const _stringEq: Eq<string> = createStringEq();

  /**
   * Returns an Eq instance that considers strings equal taking the given or default locale into account.
   * @param locales - (optional) a locale or list of locales
   * @param options - (optional) see String.localeCompare for details
   * @example
   * const eq = Eq.stringLocaleEq()
   * console.log(eq('a', 'a'))
   * // => true
   * console.log(eq('abc', 'aBc'))
   * // => false
   */
  export function stringLocaleEq(
    ...args: Tail<Parameters<string['localeCompare']>>
  ) {
    if (args.length === 0) return _stringEq;

    return createStringEq(...args);
  }

  const _stringCharCodeEq: Eq<string> = (v1, v2) => {
    const len = v1.length;

    if (len !== v2.length) return false;

    let i = -1;

    while (++i < len) {
      if (v1.charCodeAt(i) !== v2.charCodeAt(i)) return false;
    }

    return true;
  };

  /**
   * Returns an Eq instance that considers strings equal when all their charcodes are equal.
   * @example
   * const eq = Eq.stringCharCodeEq()
   * console.log(eq('a', 'a'))
   * // => true
   * console.log(eq('abc', 'aBc'))
   * // => false
   */
  export function stringCharCodeEq(): Eq<string> {
    return _stringCharCodeEq;
  }

  const _anyJsonEq: Eq<any> = (v1, v2) =>
    Object.is(JSON.stringify(v1), JSON.stringify(v2));

  /**
   * Returns an Eq instance that considers values equal their JSON.stringify values are equal.
   * @example
   * const eq = Eq.anyJsonEq()
   * console.log(eq({ a: 1, b: 2 }, { a: 1, b: 2 }))
   * // => true
   * console.log(eq({ a: 1, b: 2 }, { b: 2, a: 1 }))
   * // => false
   */
  export function anyJsonEq(): Eq<any> {
    return _anyJsonEq;
  }

  /**
   * Returns an `Eq` instance for tuples that considers two tuples [A, B] and [C, D] equal if [A, B] equals [C, D],
   * or if [A, B] equals [D, C]
   * @param eq - (optional) an alternative `Eq` instance to use for the values in the tuple
   * @example
   * const eq = Eq.tupleSymmetric()
   * console.log(eq([1, 2], [1, 2]))
   * // => true
   * console.log(eq([1, 2], [2, 1]))
   * // => true
   * console.log(eq([1, 3], [2, 1]))
   * // => false
   */
  export function tupleSymmetric<T>(
    eq: Eq<T> = Eq.objectIs
  ): Eq<readonly [T, T]> {
    return (tup1: readonly [T, T], tup2: readonly [T, T]): boolean =>
      (eq(tup1[0], tup2[0]) && eq(tup1[1], tup2[1])) ||
      (eq(tup1[0], tup2[1]) && eq(tup1[1], tup2[0]));
  }
}
