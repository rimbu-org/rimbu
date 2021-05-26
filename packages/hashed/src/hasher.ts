import { Stream, StreamSource } from '@rimbu/stream';

/**
 * Interface used to hash objects for hashed collections.
 * @typeparam UK - the upper type limit for which the hasher is assumed to be valid
 * @note A hashcode is a 32-bit JS integer and therefore signed.
 * You can obtain the 32-bit version of any JS number by applying a
 * bitwise operator to it, e.g. if x is a number, use x | 0.
 */
export interface Hasher<UK> {
  /**
   * Returns true if this hasher can be applied to the given `obj` object.
   * @param obj - the object to check
   * @example
   * const h = Hasher.numberHasher()
   * console.log(h.isValid(5))
   * // => true
   * console.log(h.isValid('a'))
   * // => false
   */
  isValid(obj: unknown): obj is UK;
  /**
   * Returns the 32-bit hash code for the given `value`.
   * @param value - the value to hash
   * @note it is assumed that the caller has verified that the given object
   * is valid, either by knowing the types up front, or by using the `isValid` function.
   * @example
   * const h = Hasher.anyHasher()
   * h.hash([1, 3, 2])
   */
  hash(value: UK): number;
}

export namespace Hasher {
  const MAX_STEP_BITS = 6;

  const STRING_INIT = 21;

  const BOOL_TRUE = -37;
  const BOOL_FALSE = -73;

  const OBJ_INIT = 91;

  const UNDEF_VALUE = -31;
  const NULL_VALUE = -41;

  const _anyFlatHasher: Hasher<any> = createAnyHasher('FLAT');
  const _anyShallowHasher: Hasher<any> = createAnyHasher('SHALLOW');
  const _anyDeepHasher: Hasher<any> = createAnyHasher('DEEP');

  function createStringHasher(maxStepBits: number): Hasher<string> {
    const maxSteps = 1 << maxStepBits;

    return {
      isValid(obj: unknown): obj is string {
        return typeof obj === 'string';
      },
      hash(value) {
        const length = Math.min(value.length, maxSteps);
        const stepSize = Math.max(1, value.length >>> maxStepBits);

        let result = STRING_INIT;

        // implement times 31 = 32 - 1
        for (let i = 0; i < length; i += stepSize) {
          result = ((result << 5) - result + value.charCodeAt(i)) | 0;
        }

        return result;
      },
    };
  }

  const _stringHasher: Hasher<string> = createStringHasher(MAX_STEP_BITS);

  /**
   * Returns a Hasher instance for string values.
   * @example
   * const h = Hasher.stringHasher()
   * h.hash('abc')
   */
  export function stringHasher(): Hasher<string> {
    return _stringHasher;
  }

  const _anyStringHasher: Hasher<any> = {
    isValid(obj: unknown): obj is any {
      return true;
    },
    hash(value) {
      return _stringHasher.hash(String(value));
    },
  };

  /**
   * Returns a Hasher instance that hashes the string representation of any value
   * @param maxStepBits - the maximum amount of samples to take from the string
   * @example
   * const h = Hasher.anyStringHasher()
   * h.hash([1, 3, 'a'])
   */
  export function anyStringHasher(maxStepBits?: number): Hasher<any> {
    if (undefined === maxStepBits) return _anyStringHasher;

    return createStringHasher(maxStepBits);
  }

  const _anyJsonStringHasher: Hasher<any> = {
    isValid(obj: unknown): obj is any {
      return true;
    },
    hash(value) {
      return _stringHasher.hash(JSON.stringify(value));
    },
  };

  /**
   * Returns a Hasher instance that hashes any value by hashing the string resulting from
   * applying JSON.stringify to the value.
   * @example
   * const h = Hasher.anyJsonStringHasher()
   * console.log(h.hash({ a: 1, b: 2 }) === h.hash({ b: 2, a: 1 }))
   * // => false
   */
  export function anyJsonStringHasher(): Hasher<any> {
    return _anyJsonStringHasher;
  }

  function createArrayHasher<T>(
    itemHasher: Hasher<T>,
    maxStepBits: number
  ): Hasher<readonly T[]> {
    const maxSteps = 1 << maxStepBits;

    return {
      isValid(obj: unknown): obj is readonly T[] {
        return Array.isArray(obj);
      },
      hash(value) {
        const length = Math.min(value.length, maxSteps);
        const stepSize = Math.max(1, value.length >>> maxStepBits);

        let result = value.length | 0;

        // implement times 31 = 32 - 1
        for (let i = 0; i < length; i += stepSize) {
          result = ((result << 5) - result + itemHasher.hash(value[i])) | 0;
        }

        return result;
      },
    };
  }

  const _arrayAnyHasher: Hasher<readonly any[]> = createArrayHasher(
    anyFlatHasher(),
    MAX_STEP_BITS
  );

  /**
   * Returns a Hasher that hashes arrays of elements by sampling the array and using
   * the given `itemHasher` to hash the sampled elements.
   * @typeparam T - the array element type
   * @param options - (optional) an object containing the following items:
   * * itemHasher - (optional) a Hasher instance used to hash elements in the array
   * * maxStepBits - (optional) the amount of bits to determine the maximum amount of array
   * elements to process
   * @example
   * const h = Hasher.arrayHasher()
   * console.log(h.hash([1, 2, 3] === h.hash([1, 3, 2])))
   * // => false
   */
  export function arrayHasher<T = any>(options?: {
    itemHasher?: Hasher<T>;
    maxStepBits?: number;
  }): Hasher<readonly T[]> {
    if (undefined === options) return _arrayAnyHasher;

    return createArrayHasher(
      options.itemHasher ?? anyFlatHasher(),
      options.maxStepBits ?? MAX_STEP_BITS
    );
  }

  function createStreamSourceHasher<T>(
    itemHasher: Hasher<T> = anyFlatHasher(),
    maxStepBits = MAX_STEP_BITS
  ): Hasher<StreamSource<T>> {
    const maxSteps = 1 << maxStepBits;

    return {
      isValid(obj: unknown): obj is StreamSource<T> {
        return (
          typeof obj === 'object' && obj !== null && Symbol.iterator in obj
        );
      },
      hash(source) {
        const iter = Stream.from(source)[Symbol.iterator]();

        let hashItems: T[] = [];
        const storeItems: T[] = [];
        let skipAmount = 1;
        let skipCount = 0;

        const done = Symbol('done');
        let value: T | typeof done;

        let length = 0;

        while (done !== (value = iter.fastNext(done))) {
          length++;
          skipCount++;

          if (skipCount >= skipAmount) {
            storeItems.push(value);
            skipCount = 0;
          }

          if (storeItems.length >= maxSteps) {
            hashItems = storeItems.slice();

            // remove elements from store items
            const newLength = maxSteps >>> 1;

            for (let index = 0; index < newLength; index += 1) {
              storeItems[index] = storeItems[index * 2];
            }
            storeItems.length = newLength;

            skipAmount *= 2;
          }
        }

        if (hashItems.length === 0) {
          hashItems = storeItems;
        }

        const itemHash = createArrayHasher(itemHasher, maxStepBits).hash(
          hashItems
        );

        // include length in hash
        return ((itemHash << 5) - itemHash + length) | 0;
      },
    };
  }

  const _streamSourceAnyHasher: Hasher<StreamSource<any>> =
    createStreamSourceHasher(anyFlatHasher(), MAX_STEP_BITS);

  /**
   * Returns a Hasher instance that hashes any StreamSource limited to a certain amount
   * of elements to prevent haning on infinite streams.
   * @typeparam T - the StreamSource element type
   * @param options - (optional) an object containing the following items:
   * * itemHasher - (optional) a Hasher instance used to hash elements in the array
   * * maxStepBits - (optional) the amount of bits to determine the maximum amount of array
   * elements to process
   * @example
   * const h = Hasher.streamSourceHasher()
   * h.hash(Stream.random())
   * // infinite stream but will not hang due to the max step limit
   */
  export function streamSourceHasher<T = any>(options?: {
    itemHasher?: Hasher<T>;
    maxStepBits?: number;
  }): Hasher<StreamSource<T>> {
    if (undefined === options) return _streamSourceAnyHasher;

    return createStreamSourceHasher(options.itemHasher, options.maxStepBits);
  }

  // bitwise operators only work on 32-bit integers
  const MIN_HASH = -Math.pow(2, 31);
  const MAX_HASH = Math.pow(2, 31) - 1;

  const _numberHasher: Hasher<number> = {
    isValid(obj: unknown): obj is number {
      return typeof obj === 'number';
    },
    hash(value) {
      if (Number.isInteger(value)) {
        return value | 0;
      }
      if (Number.isNaN(value)) {
        return MAX_HASH - 1;
      }
      if (value === Number.POSITIVE_INFINITY) {
        return MAX_HASH;
      }
      if (value === Number.NEGATIVE_INFINITY) {
        return MIN_HASH;
      }

      // not sure what else it could be
      return _stringHasher.hash(String(value));
    },
  };

  /**
   * Returns a Hasher instance that hashes numbers, including 'special' values like NaN and infinities.
   * @example
   * const h = Hasher.numberHasher()
   * console.log(h.hash(Number.POSITIVE_INFINITY) === h.hash(Number.NEGATIVE_INFINITY))
   * // => false
   * console.log(h.hash(Number.NaN) === h.hash(Number.NaN))
   * // => true
   */
  export function numberHasher(): Hasher<number> {
    return _numberHasher;
  }

  const _booleanHasher: Hasher<boolean> = {
    isValid(obj: unknown): obj is boolean {
      return typeof obj === 'boolean';
    },
    hash(value) {
      return value ? BOOL_TRUE : BOOL_FALSE;
    },
  };

  /**
   * Returns a Hasher instance that hashes booleans.
   * @example
   * const h = Hasher.booleanHasher()
   * console.log(h.hash(true) === h.hash(false))
   * // => false
   */
  export function booleanHasher(): Hasher<boolean> {
    return _booleanHasher;
  }

  const _bigintHasher: Hasher<bigint> = {
    isValid(obj: unknown): obj is bigint {
      return typeof obj === 'bigint';
    },
    hash: _anyStringHasher.hash,
  };

  /**
   * Returns a Hasher instance that hashes bigints.
   * @example
   * const h = Hasher.bigintHasher()
   * console.log(h.hash(BigInt(5)) === h.hash(BigInt(10)))
   * // => false
   */
  export function bigintHasher(): Hasher<bigint> {
    return _bigintHasher;
  }

  /**
   * Returns a Hasher instance that hashes the `.valueOf` value of the given
   * object using the given `valueHasher` for instances of given `cls` class.
   * @typeparam T - the input object type
   * @typeparam V - the .valueOf property type
   * @param cls - the class containing the contructur to check for validity of a given object
   * @param valueHasher - the Hasher instance to use for the `.valueOf` values
   * @example
   * const h = Hasher.createValueOfHasher(Date)
   * console.log(h.isValid(new Boolean(true)))
   * // => false
   * const d1 = new Date()
   * const d2 = new Date(d1)
   * console.log(h.hash(d1) === h.hash(d2))
   * // => true
   */
  export function createValueOfHasher<T extends { valueOf(): V }, V>(
    cls: {
      new (): T;
    },
    valueHasher: Hasher<V> = anyShallowHasher()
  ): Hasher<T> {
    return {
      isValid(obj): obj is T {
        return obj instanceof cls;
      },
      hash(value) {
        return valueHasher.hash(value.valueOf());
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  const _BooleanHasher: Hasher<Boolean> = createValueOfHasher(
    Boolean,
    _booleanHasher
  );

  const _DateHasher: Hasher<Date> = createValueOfHasher(Date, _numberHasher);

  /**
   * Returns a Hasher instance that hashes Dates.
   * @example
   * const h = Hasher.dateHasher()
   * const d1 = new Date()
   * const d2 = new Date(d1)
   * console.log(h.hash(d1) === h.hash(d2))
   * // => true
   */
  export function dateHasher(): Hasher<Date> {
    return _DateHasher;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  const _NumberHasher: Hasher<Number> = createValueOfHasher(
    Number,
    _numberHasher
  );

  // eslint-disable-next-line @typescript-eslint/ban-types
  const _StringHasher: Hasher<String> = createValueOfHasher(
    String,
    _stringHasher
  );

  const _wrappedHashers: Hasher<unknown>[] = [
    _BooleanHasher,
    _DateHasher,
    _NumberHasher,
    _StringHasher,
  ];

  function tryWrappedHasher(value: any): number | undefined {
    let i = -1;
    const len = _wrappedHashers.length;

    while (++i < len) {
      const hasher = _wrappedHashers[i];

      if (hasher.isValid(value)) {
        return hasher.hash(value);
      }
    }

    return undefined;
  }

  function createObjectHasher(
    keyHasher: Hasher<unknown>,
    valueHasher: Hasher<unknown>
  ): Hasher<Record<any, any>> {
    return {
      isValid(obj): obj is Record<any, any> {
        return typeof obj === 'object' && obj !== null;
      },
      hash(value) {
        let result = OBJ_INIT;

        // implement order independent hash
        for (const key in value) {
          const keyValue = value[key];

          const keyHash = keyHasher.hash(key);
          const valueHash = valueHasher.hash(keyValue);

          result = result ^ (keyHash + valueHash);
        }

        return result;
      },
    };
  }

  const _objectShallowHasher: Hasher<Record<any, any>> = createObjectHasher(
    anyFlatHasher(),
    anyFlatHasher()
  );

  const _objectDeepHasher: Hasher<Record<any, any>> = createObjectHasher(
    anyFlatHasher(),
    anyDeepHasher()
  );

  /**
   * Returns a Hasher instance that hashes objects of key type K and value type V.
   * @typeparam K - the key type
   * @typeparam V - the value type
   * @param options - (optional) an object containing:
   * * keyHasher - (optional) a Hasher instance that is used to hash object keys
   * * valueHasher - (optional) a Hasher instance that is used to hash object values
   * @example
   * const h = Hasher.objectHasher()
   * console.log(h.hash({ a: 1, b: 2 }) === h.hash({ b: 2, a: 1 }))
   * // => true
   */
  export function objectHasher<
    K extends string | number | symbol,
    V = any
  >(options?: {
    keyHasher: Hasher<K>;
    valueHasher: Hasher<V>;
  }): Hasher<Record<K, V>> {
    if (undefined === options) return _objectShallowHasher;

    return createObjectHasher(options.keyHasher, options.valueHasher);
  }

  /**
   * Returns a Hasher instance that hashes objects of key type K and value type V.
   * If a value if an object or array, it will recursively hash its values.
   * @note be careful with circular structures, they can cause an infinite loop
   * @typeparam K - the key type
   * @typeparam V - the value type
   * @param options - (optional) an object containing:
   * * keyHasher - (optional) a Hasher instance that is used to hash object keys
   * * valueHasher - (optional) a Hasher instance that is used to hash object values
   * @example
   * const h = Hasher.objectHasher()
   * console.log(h.hash({ a: 1, b: 2 }) === h.hash({ b: 2, a: 1 }))
   * // => true
   */
  export function objectDeepHasher<
    K extends string | number | symbol,
    V = any
  >(): Hasher<Record<K, V>> {
    return _objectDeepHasher;
  }

  function createAnyHasher(
    mode: 'FLAT' | 'SHALLOW' | 'DEEP',
    maxStepBits = MAX_STEP_BITS
  ): Hasher<any> {
    return {
      isValid(obj): obj is any {
        return true;
      },
      hash(value) {
        const valueType = typeof value;

        switch (valueType) {
          case 'undefined':
            return UNDEF_VALUE;
          case 'bigint':
            return _bigintHasher.hash(value);
          case 'boolean':
            return _booleanHasher.hash(value);
          case 'number':
            return _numberHasher.hash(value);
          case 'string':
            return _stringHasher.hash(value);
          case 'function':
          case 'symbol':
            return _anyStringHasher.hash(value);
          default: {
            if (null === value) return NULL_VALUE;

            const result = tryWrappedHasher(value);

            if (undefined !== result) return result;

            if (mode !== 'FLAT') {
              if (Array.isArray(value)) {
                if (mode === 'SHALLOW') return _arrayAnyHasher.hash(value);
                return createArrayHasher(this, maxStepBits).hash(value);
              }

              if (_streamSourceAnyHasher.isValid(value)) {
                if (mode === 'SHALLOW')
                  return _streamSourceAnyHasher.hash(value);
                return createStreamSourceHasher(this, maxStepBits).hash(value);
              }

              if (_objectShallowHasher.isValid(value)) {
                if (mode === 'SHALLOW') return _objectShallowHasher.hash(value);

                return createObjectHasher(this, this).hash(value);
              }
            }

            return _anyStringHasher.hash(value);
          }
        }
      },
    };
  }

  /**
   * Returns a Hasher instance that hashes any value, but never traverses into an object
   * or array to hash its elements. In those cases it will use toString.
   * @example
   * const h = Hasher.anyFlatHasher()
   * console.log(h.hash({ a: 1, b: 2 }) === h.hash({ b: 2, a: 1 }))
   * // => false
   */
  export function anyFlatHasher(): Hasher<any> {
    return _anyFlatHasher;
  }

  /**
   * Returns a Hasher instance that hashes any value, but only traverses into an object
   * or array to hash its elements one level deep. After one level, it will use toString.
   * @example
   * const h = Hasher.anyShallowHasher()
   * console.log(h.hash({ a: 1, b: 2 }) === h.hash({ b: 2, a: 1 }))
   * // => true
   * console.log(h.hash([{ a: 1, b: 2 }]) === h.hash([{ b: 2, a: 1 }]))
   * // => false
   */
  export function anyShallowHasher(): Hasher<any> {
    return _anyShallowHasher;
  }

  /**
   * Returns a Hasher instance that hashes any value, and traverses into an object
   * or array to hash its elements.
   * @example
   * const h = Hasher.anyDeepHasher()
   * console.log(h.hash({ a: 1, b: 2 }) === h.hash({ b: 2, a: 1 }))
   * // => true
   * console.log(h.hash([{ a: 1, b: 2 }]) === h.hash([{ b: 2, a: 1 }]))
   * // => true
   */
  export function anyDeepHasher(): Hasher<any> {
    return _anyDeepHasher;
  }

  /**
   * Returns a Hasher that will return equal hash values for values in a tuple regardless
   * of their order, and uses the given `hasher` function to hash the tuple elements.
   * @param hasher - the Hasher instance to use for tuple elements
   * const h = Hasher.tupleSymmetric()
   * console.log(h.hash(['abc', 'def']) === h.hash(['def', 'abc']))
   */
  export function tupleSymmetric<T>(
    hasher: Hasher<T> = anyShallowHasher()
  ): Hasher<readonly [T, T]> {
    return {
      isValid(obj: unknown): obj is readonly [T, T] {
        return (
          Array.isArray(obj) &&
          obj.length === 2 &&
          hasher.isValid(obj[0]) &&
          hasher.isValid(obj[1])
        );
      },
      hash(value: readonly [T, T]): number {
        return (hasher.hash(value[0]) + hasher.hash(value[1])) | 0;
      },
    };
  }
}
