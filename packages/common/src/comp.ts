import { Eq } from './internal';

/**
 * An object providing methods to compare two values of type `K`.
 * @typeparam K - the value type
 */
export interface Comp<K> {
  /**
   * Returns 0 if given `value1` and `value2` are equal, a positive value is `value1` is greater than
   * `value2`, and a negative value otherwise.
   * @param value1 - the first value to compare
   * @param value2 - the seconds value to compare
   * @example
   * ```ts
   * const c = Comp.numberComp()
   * console.log(c.compare(5, 5))
   * // => 0
   * console.log(c.compare(3, 5))
   * // => -2
   * console.log(c.compare(5, 3))
   * // => 2
   * ```
   */
  compare(value1: K, value2: K): number;
  /**
   * Returns true if this instance can compare given `obj`.
   * @param obj - the object to check
   * @example
   * ```ts
   * const c = Comp.numberComp()
   * console.log(c.isComparable(5))
   * // => true
   * console.log(c.isComparable('a'))
   * // => false
   * ```
   */
  isComparable(obj: any): obj is K;
}

export namespace Comp {
  const _anyFlatComp: Comp<any> = createAnyComp('FLAT');
  const _anyShallowComp: Comp<any> = createAnyComp('SHALLOW');
  const _anyDeepComp: Comp<any> = createAnyComp('DEEP');

  /**
   * Returns the default Comp instance, which is the Comp.anyDeepComp() instance.
   */
  export function defaultComp(): Comp<any> {
    return _anyDeepComp;
  }

  const _numberComp: Comp<number> = {
    isComparable(obj): obj is number {
      return typeof obj === 'number';
    },
    compare(v1, v2) {
      if (Number.isFinite(v1) && Number.isFinite(v2)) {
        return v1 - v2;
      }
      if (Number.isNaN(v1)) {
        if (Number.isNaN(v2)) return 0;
        if (v2 === Number.POSITIVE_INFINITY) return 1;
        if (v2 === Number.NEGATIVE_INFINITY) return -1;
        return -1;
      }

      // only infinities remain
      if (v1 === Number.POSITIVE_INFINITY) {
        return v2 === Number.POSITIVE_INFINITY ? 0 : 1;
      }

      // v1 === Number.NEGATIVE_INFINITY
      return v2 === Number.NEGATIVE_INFINITY ? 0 : -1;
    },
  };

  /**
   * Returns a default number Comp instance that orders numbers naturally.
   * @example
   * ```ts
   * const c = Comp.numberComp();
   * console.log(c.compare(3, 5))
   * // => -2
   * ```
   */
  export function numberComp(): Comp<number> {
    return _numberComp;
  }

  const _booleanComp: Comp<boolean> = {
    isComparable(obj): obj is boolean {
      return typeof obj === 'boolean';
    },
    compare(v1, v2) {
      return v1 === v2 ? 0 : v1 ? 1 : -1;
    },
  };

  /**
   * Returns a default boolean Comp instance that orders booleans according to false < true.
   * @example
   * ```ts
   * const c = Comp.booleanComp();
   * console.log(c.compare(false, true) < 0)
   * // => true
   * console.log(c.compare(true, true))
   * // => 0
   * ```
   */
  export function booleanComp(): Comp<boolean> {
    return _booleanComp;
  }

  const _bigIntComp: Comp<bigint> = {
    isComparable(obj): obj is bigint {
      return typeof obj === 'bigint';
    },
    compare(v1, v2) {
      const res = v1 - v2;
      if (res > 0) return 1;
      if (res < 0) return -1;
      return 0;
    },
  };

  /**
   * Returns a default bigint Comp instance that orders bigint numbers naturally.
   */
  export function bigIntComp(): Comp<bigint> {
    return _bigIntComp;
  }

  const _defaultCollator = Intl.Collator('und');

  const _stringComp: Comp<string> = {
    isComparable(obj): obj is string {
      return typeof obj === 'string';
    },
    compare: _defaultCollator.compare,
  };

  const _anyStringJSONComp: Comp<any> = {
    isComparable(obj): obj is any {
      return true;
    },
    compare(v1, v2) {
      return _defaultCollator.compare(JSON.stringify(v1), JSON.stringify(v2));
    },
  };

  /**
   * Returns a Comp instance converts values to string with JSON.stringify, and orders the resulting string naturally.
   */
  export function anyStringJSONComp<T>(): Comp<T> {
    return _anyStringJSONComp;
  }

  /**
   * Returns a `Comp` instance that compares strings based on the string's `localeCompare` method.
   * @param locales - (optional) a locale or list of locales
   * @param options - (optional) see String.localeCompare for details
   */
  export function stringComp(
    ...args: ConstructorParameters<typeof Intl.Collator>
  ): Comp<string> {
    if (args.length === 0) return _stringComp;

    const collator = Intl.Collator(...args);

    return {
      isComparable(obj): obj is string {
        return typeof obj === 'string';
      },
      compare: collator.compare,
    };
  }

  /**
   * Returns a `Comp` instance that compares strings in a case-insensitive way.
   */
  export function stringCaseInsensitiveComp(): Comp<string> {
    return stringComp('und', { sensitivity: 'accent' });
  }

  const _stringCharCodeComp: Comp<string> = {
    isComparable(obj: any): obj is any {
      return typeof obj === 'string';
    },
    compare(v1: any, v2: any): number {
      const len = Math.min(v1.length, v2.length);

      let i = -1;

      while (++i < len) {
        const diff = v1.charCodeAt(i) - v2.charCodeAt(i);
        if (diff !== 0) return diff;
      }

      return v1.length - v2.length;
    },
  };

  /**
   * Returns a string Comp instance that orders strings according to their indexed char codes.
   */
  export function stringCharCodeComp(): Comp<string> {
    return _stringCharCodeComp;
  }

  const _anyToStringComp: Comp<any> = {
    isComparable(obj: any): obj is any {
      return true;
    },
    compare(v1: any, v2: any): number {
      return _defaultCollator.compare(
        Eq.convertAnyToString(v1),
        Eq.convertAnyToString(v2)
      );
    },
  };

  /**
   * Returns a any Comp instance that orders any according to their toString values.
   */
  export function anyToStringComp(): Comp<any> {
    return _anyToStringComp;
  }

  /**
   * Returns a Comp instance that orders objects with a `valueOf` method according to the given `valueComp` instance for the valueOf values.
   * @param cls - the constructor of the values the Comp instance can compare
   * @param valueComp - (optional) the Comp instance to use on the .valueOf values
   */
  export function createValueOfComp<T extends { valueOf(): V }, V>(
    cls: {
      new (): T;
    },
    valueComp: Comp<V> = anyShallowComp()
  ): Comp<T> {
    return {
      isComparable(obj): obj is T {
        return obj instanceof cls;
      },
      compare(v1, v2): number {
        return valueComp.compare(v1.valueOf(), v2.valueOf());
      },
    };
  }

  const _DateComp: Comp<Date> = createValueOfComp(Date, _numberComp);

  /**
   * Returns a Date Comp instance that orders Dates according to their `.valueOf` value.
   */
  export function dateComp(): Comp<Date> {
    return _DateComp;
  }

  function createIterableComp<T>(itemComp: Comp<T>): Comp<Iterable<T>> {
    return {
      isComparable(obj): obj is Iterable<T> {
        // unfortunately we cannot check element compatability
        return (
          typeof obj === 'object' && obj !== null && Symbol.iterator in obj
        );
      },
      compare(v1, v2): number {
        const iter1 = v1[Symbol.iterator]();
        const iter2 = v2[Symbol.iterator]();

        while (true) {
          const value1 = iter1.next();
          const value2 = iter2.next();

          if (value1.done) return value2.done ? 0 : -1;
          if (value2.done) return 1;

          const result = itemComp.compare(value1.value, value2.value);

          if (result !== 0) return result;
        }
      },
    };
  }

  const _iterableAnyComp: Comp<Iterable<any>> = createIterableComp(
    Comp.defaultComp()
  );

  /**
   * Returns a Comp instance for Iterable objects that orders the Iterables by comparing the elements with the given `itemComp` Comp instance.
   * @param itemComp - (optional) the Comp instance to use to compare the Iterable's elements.
   * @example
   * ```ts
   * const c = Comp.iterableComp();
   * console.log(c.compare([1, 3, 2], [1, 3, 2]))
   * // => 0
   * console.log(c.compare([1, 2, 3, 4], [1, 3, 2]) < 0)
   * // => true
   * ```
   */
  export function iterableComp<T>(itemComp?: Comp<T>): Comp<Iterable<T>> {
    if (undefined === itemComp) return _iterableAnyComp;

    return createIterableComp(itemComp);
  }

  const _BooleanComp = createValueOfComp(Boolean, _booleanComp);
  const _NumberComp = createValueOfComp(Number, _numberComp);
  const _StringComp = createValueOfComp(String, _stringComp);

  const _wrappedComps: Comp<unknown>[] = [
    _BooleanComp,
    _DateComp,
    _NumberComp,
    _StringComp,
  ];

  function tryWrappedComp(v1: any, v2: any): number | undefined {
    let i = -1;
    const len = _wrappedComps.length;

    while (++i < len) {
      const comp = _wrappedComps[i];

      if (comp.isComparable(v1) && comp.isComparable(v2)) {
        return comp.compare(v1, v2);
      }
    }

    return undefined;
  }

  function createObjectComp(
    keyComp: Comp<any> = anyFlatComp(),
    valueComp: Comp<any> = defaultComp()
  ): Comp<Record<any, any>> {
    return {
      isComparable(obj): obj is Record<any, any> {
        return true;
      },
      compare(v1, v2): number {
        const keys1 = Object.keys(v1);
        const keys2 = Object.keys(v2);

        if (keys1.length === 0) {
          return keys2.length === 0 ? 0 : -1;
        }
        if (keys2.length === 0) {
          return keys1.length === 0 ? 0 : 1;
        }

        keys1.sort(keyComp.compare);
        keys2.sort(keyComp.compare);

        const length = Math.min(keys1.length, keys2.length);

        for (let index = 0; index < length; index++) {
          const key1 = keys1[index];
          const key2 = keys2[index];
          const keyResult = keyComp.compare(key1, key2);

          if (keyResult !== 0) return keyResult;

          const value1 = v1[key1];
          const value2 = v2[key2];

          const valueResult = valueComp.compare(value1, value2);

          if (valueResult !== 0) return valueResult;
        }

        const keyDiff = keys1.length - keys2.length;

        return keyDiff;
      },
    };
  }

  const _objectAnyComp: Comp<Record<any, any>> = createObjectComp();

  /**
   * Returns a Comp instance for objects that orders the object keys according to the given `keyComp`, and then compares the corresponding
   * values using the given `valueComp`. Objects are then compared as follows:<br/>
   * starting with the smallest key of either object:<br/>
   * - if only one of the objects has the key, the object with the key is considered to be larger than the other<br/>
   * - if both objects have the key, the values are compared with `valueComp`. If the values are not equal, this result is returned.<br/>
   *
   * if the objects have the same keys with the same values, they are considered equal<br/>
   * @param keyComp - (optional) the Comp instance used to order the object keys
   * @param valueComp - (optional) the Comp instance used to order the object values
   * @example
   * ```ts
   * const c = Comp.objectComp();
   * console.log(c.compare({ a: 1 }, { a: 1 }))
   * // => 0
   * console.log(c.compare({ a: 1 }, { a: 2 }) < 0)
   * // => true
   * console.log(c.compare({ b: 5 }, { a: 2 }) < 0)
   * // => true
   * console.log(c.compare({ a: 1, b: 2 }, { b: 5 }) < 0)
   * // => true
   * console.log(c.compare({ a: 1, b: 2 }, { b: 2, a: 1 }))
   * // => 0
   * ```
   */
  export function objectComp(options?: {
    keyComp?: Comp<any>;
    valueComp?: Comp<any>;
  }): Comp<Record<any, any>> {
    if (undefined === options) return _objectAnyComp;

    return createObjectComp(options.keyComp, options.valueComp);
  }

  function createAnyComp(mode: 'FLAT' | 'SHALLOW' | 'DEEP'): Comp<any> {
    return {
      isComparable(obj): obj is any {
        return true;
      },
      compare(v1, v2): number {
        if (Object.is(v1, v2)) return 0;

        const type1 = typeof v1;
        const type2 = typeof v2;

        if (type1 !== type2) {
          // we can only compare different types though strings
          return _anyToStringComp.compare(v1, v2);
        }

        switch (type1) {
          case 'bigint':
            return _bigIntComp.compare(v1, v2);
          case 'boolean':
            return _booleanComp.compare(v1, v2);
          case 'number':
            return _numberComp.compare(v1, v2);
          case 'string':
            return _stringComp.compare(v1, v2);
          case 'object': {
            if (null === v1) {
              if (null === v2) return 0;

              return -1;
            }
            if (null === v2) {
              return 1;
            }

            const wrappedComp = tryWrappedComp(v1, v2);

            if (undefined !== wrappedComp) return wrappedComp;

            if (mode !== 'FLAT') {
              if (
                _iterableAnyComp.isComparable(v1) &&
                _iterableAnyComp.isComparable(v2)
              ) {
                if (mode === 'SHALLOW') {
                  return iterableComp(_anyFlatComp).compare(v1, v2);
                }

                return iterableComp(this).compare(v1, v2);
              }

              if (mode === 'SHALLOW') {
                return createObjectComp(_anyFlatComp, _anyFlatComp).compare(
                  v1,
                  v2
                );
              }

              return _objectAnyComp.compare(v1, v2);
            }
          }
        }

        return _anyToStringComp.compare(v1, v2);
      },
    };
  }

  /**
   * Returns a Comp instance that compares any value using default comparison functions, but never recursively compares
   * Iterables or objects. In those cases, it will use the stringComp instance.
   * @example
   * ```ts
   * const c = Comp.anyFlatComp();
   * console.log(c.compare({ a: 1, b: 1 }, { b: 1, a: 1 }) < 0)
   * // => true
   * // First object is smaller because the objects are converted to a string with and then compares the resulting string.
   * ```
   */
  export function anyFlatComp<T>(): Comp<T> {
    return _anyFlatComp;
  }

  /**
   * Returns a Comp instance that compares any value using default comparison functions. For Iterables and objects, their elements are compared
   * only one level deep for performance and to avoid infinite recursion.
   * @example
   * ```ts
   * const c = Comp.anyShallowComp();
   * console.log(c.compare({ a: 1, b: 1 }, { b: 1, a: 1 }))
   * // => 0
   * console.log(c.compare([{ a: 1, b: 1 }], [{ b: 1, a: 1 }]) < 0)
   * // => true
   * // First object is smaller because the objects are converted to a string and then compares the resulting string.
   * ```
   */
  export function anyShallowComp<T>(): Comp<T> {
    return _anyShallowComp;
  }

  /**
   * Returns a Comp instance that compares any value using default comparison functions. For Iterables and objects, their elements are compared
   * recursively.
   * @note can become slow with large nested arrays and objects, and circular structures can cause infinite loops
   * @example
   * ```ts
   * const c = Comp.anyDeepComp();
   * console.log(c.compare({ a: 1, b: 1 }, { b: 1, a: 1 }))
   * // => 0
   * console.log(c.compare([{ a: 1, b: 1 }], [{ b: 1, a: 1 }]))
   * // => 0
   * ```
   */
  export function anyDeepComp<T>(): Comp<T> {
    return _anyDeepComp;
  }

  /**
   * Returns a Comp instance that extends the given `comp` instance with the capability to handle `undefined` values, where undefined is considered to be smaller
   * than any other value, and equal to another undefined.
   * @param comp - the Comp instance to wrap
   * @example
   * ```ts
   * const c = Comp.withUndefined(Comp.numberComp())
   * console.log(c.compare(undefined, 5) < 0)
   * // => true
   * console.log(c.compare(undefined, undefined))
   * // => 0
   * ```
   */
  export function withUndefined<T>(comp: Comp<T>): Comp<T | undefined> {
    return {
      isComparable(obj): obj is T | undefined {
        return undefined === obj || comp.isComparable(obj);
      },
      compare(v1, v2): number {
        if (undefined === v1) {
          if (undefined === v2) return 0;
          return -1;
        }
        if (undefined === v2) return 1;
        return comp.compare(v1, v2);
      },
    };
  }

  /**
   * Returns a Comp instance that extends the given `comp` instance with the capability to handle `null` values, where null is considered to be smaller
   * than any other value, and equal to another null.
   * @param comp - the Comp instance to wrap
   * @example
   * ```ts
   * const c = Comp.withNull(Comp.numberComp())
   * console.log(c.compare(null, 5) < 0)
   * // => true
   * console.log(c.compare(null, null))
   * // => 0
   * ```
   */
  export function withNull<T>(comp: Comp<T>): Comp<T | null> {
    return {
      isComparable(obj): obj is T | null {
        return null === obj || comp.isComparable(obj);
      },
      compare(v1, v2): number {
        if (null === v1) {
          if (null === v2) return 0;
          return -1;
        }
        if (null === v2) return 1;
        return comp.compare(v1, v2);
      },
    };
  }

  /**
   * Returns a Comp instance the reverses the order of the given `comp` instance.
   * @param comp - the Comp instance to wrap
   * @example
   * ```ts
   * const c = Comp.invert(Comp.numberComp())
   * console.log(c.compare(3, 5) > 0)
   * // => true
   * console.log(c.compare(5, 5))
   * // => 0
   * ```
   */
  export function invert<T>(comp: Comp<T>): Comp<T> {
    return {
      compare(v1, v2): number {
        return comp.compare(v2, v1);
      },
      isComparable: comp.isComparable,
    };
  }

  /**
   * Returns an `Eq` equality instance thet will return true when the given `comp` comparable instance returns 0.
   * @param comp - the `Comp` comparable instance to convert
   * @example
   * ```ts
   * const eq = Comp.toEq(Comp.objectComp())
   * console.log(eq({ a: 1, b: 2 }, { b: 2, a: 1 }))
   * // => true
   * ```
   */
  export function toEq<T>(comp: Comp<T>): Eq<T> {
    return (v1: T, v2: T): boolean => comp.compare(v1, v2) === 0;
  }
}
