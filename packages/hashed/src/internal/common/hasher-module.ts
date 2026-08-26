import type { Hasher } from '@rimbu/hashed';

import { Eq } from '@rimbu/common/eq';
import { Module } from '@rimbu/common/module';
import { Stream, type StreamSource } from '@rimbu/stream';

export interface HasherModule {
	/**
	 * Returns the default `Hasher` instance used by hashed collections.
	 * @example
	 * ```ts
	 * import { Hasher } from '@rimbu/hashed';
	 *
	 * const h = Hasher.defaultInstance;
	 * console.log(h.isValid({ a: 1, b: 2 })); // => true
	 * console.log(h.hash({ a: 1, b: 2 }) === h.hash({ b: 2, a: 1 })); // => true
	 * ```
	 */
	readonly defaultInstance: Hasher<any>;
	/**
	 * Returns a `Hasher` instance for string values.
	 * @example
	 * ```ts
	 * import { Hasher } from '@rimbu/hashed';
	 *
	 * const h = Hasher.string;
	 * console.log(h.isValid('abc')); // => true
	 * console.log(h.isValid(5)); // => false
	 * ```
	 */
	readonly string: Hasher<string>;
	/**
	 * Returns a `Hasher` instance that hashes the string representation of any value.
	 * @param maxStepBits - the maximum amount of samples to take from the string
	 * @example
	 * ```ts
	 * import { Hasher } from '@rimbu/hashed';
	 *
	 * const h = Hasher.anyToString();
	 * console.log(h.isValid([1, 3, 'a'])); // => true
	 * console.log(h.hash([1, 3, 'a']) === h.hash([1, 3, 'a'])); // => true
	 * ```
	 */
	anyToString(maxStepBits?: number): Hasher<any>;
	/**
	 * Returns a `Hasher` instance that hashes any value by hashing the string resulting from
	 * applying JSON.stringify to the value.
	 * @example
	 * ```ts
	 * import { Hasher } from '@rimbu/hashed';
	 * const h = Hasher.anyJsonString
	 * console.log(h.hash({ a: 1, b: 2 }) === h.hash({ b: 2, a: 1 }))
	 * // => false
	 * ```
	 */
	readonly anyJsonString: Hasher<any>;
	/**
	 * Returns a `Hasher` instance for case-insensitive string values.
	 * @example
	 * ```ts
	 * import { Hasher } from '@rimbu/hashed';
	 * const h = Hasher.stringCaseInsensitive
	 * console.log(h.hash('Abc') === h.hash('aBC'))
	 * // => true
	 * ```
	 */
	readonly stringCaseInsensitive: Hasher<string>;
	/**
	 * Returns a `Hasher` that hashes arrays of elements by sampling the array and using
	 * the given `itemHasher` to hash the sampled elements.
	 * @typeparam T - the array element type
	 * @param options - (optional) an object containing the following items:<br/>
	 * - itemHasher: (optional) a Hasher instance used to hash elements in the array<br/>
	 * - maxStepBits: (optional) the amount of bits to determine the maximum amount of array
	 * elements to process
	 * @example
	 * ```ts
	 * import { Hasher } from '@rimbu/hashed';
	 *
	 * const h = Hasher.array();
	 * console.log(h.hash([1, 2, 3]) === h.hash([1, 3, 2])); // => false
	 * ```
	 */
	array<T = any>(options?: {
		itemHasher?: Hasher<T>;
		maxStepBits?: number;
	}): Hasher<readonly T[]>;
	/**
	 * Returns a `Hasher` instance that hashes any `StreamSource` limited to a certain amount
	 * of elements to prevent hanging on infinite streams.
	 * @typeparam T - the StreamSource element type
	 * @param options - (optional) an object containing the following items:<br/>
	 * - itemHasher: (optional) a Hasher instance used to hash elements in the array<br/>
	 * - maxStepBits: (optional) the amount of bits to determine the maximum amount of array
	 * elements to process
	 * @example
	 * ```ts
	 * import { Hasher } from '@rimbu/hashed';
	 * import { Stream } from '@rimbu/stream';
	 *
	 * const h = Hasher.streamSource();
	 * console.log(h.isValid(Stream.of(1, 2, 3))); // => true
	 * // an infinite stream will not hang due to the max step limit
	 * ```
	 */
	streamSource<T = any>(options?: {
		itemHasher?: Hasher<T>;
		maxStepBits?: number;
	}): Hasher<StreamSource<T>>;
	/**
	 * Returns a `Hasher` instance that hashes numbers, including 'special' values like `NaN` and infinities.
	 * @example
	 * ```ts
	 * import { Hasher } from '@rimbu/hashed';
	 * const h = Hasher.number
	 * console.log(h.hash(Number.POSITIVE_INFINITY) === h.hash(Number.NEGATIVE_INFINITY))
	 * // => false
	 * console.log(h.hash(Number.NaN) === h.hash(Number.NaN))
	 * // => true
	 * ```
	 */
	readonly number: Hasher<number>;
	/**
	 * Returns a `Hasher` instance that hashes booleans.
	 * @example
	 * ```ts
	 * import { Hasher } from '@rimbu/hashed';
	 * const h = Hasher.boolean
	 * console.log(h.hash(true) === h.hash(false))
	 * // => false
	 * ```
	 */
	readonly boolean: Hasher<boolean>;
	/**
	 * Returns a `Hasher` instance that hashes bigints.
	 * @example
	 * ```ts
	 * import { Hasher } from '@rimbu/hashed';
	 * const h = Hasher.bigint
	 * console.log(h.hash(BigInt(5)) === h.hash(BigInt(10)))
	 * // => false
	 * ```
	 */
	readonly bigint: Hasher<bigint>;
	/**
	 * Returns a `Hasher` instance that hashes the `.valueOf` value of the given
	 * object using the given `valueHasher` for instances of the given `cls` class.
	 * @typeparam T - the input object type
	 * @typeparam V - the .valueOf property type
	 * @param cls - the class containing the constructor to check for validity of a given object
	 * @param valueHasher - the `Hasher` instance to use for the `.valueOf` values
	 * @example
	 * ```ts
	 * import { Hasher } from '@rimbu/hashed';
	 * const h = Hasher.byValueOf(Date)
	 * console.log(h.isValid(new Boolean(true)))
	 * // => false
	 * const d1 = new Date()
	 * const d2 = new Date(d1)
	 * console.log(h.hash(d1) === h.hash(d2))
	 * // => true
	 * ```
	 */
	byValueOf<T extends { valueOf(): V }, V>(
		cls: {
			new (): T;
		},
		valueHasher?: Hasher<V> | undefined,
	): Hasher<T>;
	/**
	 * Returns a `Hasher` instance that hashes `Date` values.
	 * @example
	 * ```ts
	 * import { Hasher } from '@rimbu/hashed';
	 * const h = Hasher.date
	 * const d1 = new Date()
	 * const d2 = new Date(d1)
	 * console.log(h.hash(d1) === h.hash(d2))
	 * // => true
	 * ```
	 */
	readonly date: Hasher<Date>;
	/**
	 * Returns a `Hasher` instance that hashes objects of key type K and value type V.
	 * @typeparam K - the key type
	 * @typeparam V - the value type
	 * @param options - (optional) an object containing:<br/>
	 * - keyHasher: (optional) a Hasher instance that is used to hash object keys<br/>
	 * - valueHasher: (optional) a Hasher instance that is used to hash object values
	 * @example
	 * ```ts
	 * import { Hasher } from '@rimbu/hashed';
	 * const h = Hasher.object()
	 * console.log(h.hash({ a: 1, b: 2 }) === h.hash({ b: 2, a: 1 }))
	 * // => true
	 * ```
	 */
	object<K extends string | number | symbol, V = any>(options?: {
		keyHasher: Hasher<K>;
		valueHasher: Hasher<V>;
	}): Hasher<Record<K, V>>;
	/**
	 * Returns a `Hasher` instance that hashes objects of key type K and value type V.
	 * If a value is an object or array, it will convert those values to a string.
	 * @example
	 * ```ts
	 * import { Hasher } from '@rimbu/hashed';
	 * const h = Hasher.objectShallow
	 * console.log(h.hash({ a: 1, b: 2 }) === h.hash({ b: 2, a: 1 }))
	 * // => true
	 * ```
	 */
	readonly objectShallow: Hasher<Record<any, any>>;
	/**
	 * Returns a `Hasher` instance that hashes objects of key type K and value type V.
	 * If a value is an object or array, it will recursively hash its values.
	 * @note be careful with circular structures, they can cause an infinite loop
	 * @example
	 * ```ts
	 * import { Hasher } from '@rimbu/hashed';
	 * const h = Hasher.objectDeep
	 * console.log(h.hash({ a: 1, b: 2 }) === h.hash({ b: 2, a: 1 }))
	 * // => true
	 * ```
	 */
	readonly objectDeep: Hasher<Record<any, any>>;
	/**
	 * Returns a `Hasher` instance that hashes any value, but never traverses into an object
	 * or array to hash its elements. In those cases it will use toString.
	 * @example
	 * ```ts
	 * import { Hasher } from '@rimbu/hashed';
	 * const h = Hasher.anyFlat
	 * console.log(h.hash({ a: 1, b: 2 }) === h.hash({ b: 2, a: 1 }))
	 * // => false
	 * ```
	 */
	readonly anyFlat: Hasher<any>;
	/**
	 * Returns a `Hasher` instance that hashes any value, but only traverses into an object
	 * or array to hash its elements one level deep. After one level, it will use toString.
	 * @example
	 * ```ts
	 * import { Hasher } from '@rimbu/hashed';
	 * const h = Hasher.anyShallow
	 * console.log(h.hash({ a: 1, b: 2 }) === h.hash({ b: 2, a: 1 }))
	 * // => true
	 * console.log(h.hash([{ a: 1, b: 2 }]) === h.hash([{ b: 2, a: 1 }]))
	 * // => false
	 * ```
	 */
	readonly anyShallow: Hasher<any>;
	/**
	 * Returns a `Hasher` instance that hashes any value, and traverses into an object
	 * or array to hash its elements.
	 * @example
	 * ```ts
	 * import { Hasher } from '@rimbu/hashed';
	 * const h = Hasher.anyDeep
	 * console.log(h.hash({ a: 1, b: 2 }) === h.hash({ b: 2, a: 1 }))
	 * // => true
	 * console.log(h.hash([{ a: 1, b: 2 }]) === h.hash([{ b: 2, a: 1 }]))
	 * // => true
	 * ```
	 */
	readonly anyDeep: Hasher<any>;
	/**
	 * Returns a `Hasher` that will return equal hash values for values in a tuple regardless
	 * of their order, and uses the given `hasher` function to hash the tuple elements.
	 * @param hasher - the `Hasher` instance to use for tuple elements
	 * @example
	 * ```ts
	 * import { Hasher } from '@rimbu/hashed';
	 * const h = Hasher.tupleSymmetric()
	 * console.log(h.hash(['abc', 'def']) === h.hash(['def', 'abc'])) // => true
	 * ```
	 */
	tupleSymmetric<T>(hasher?: Hasher<T> | undefined): Hasher<readonly [T, T]>;
}

const MAX_STEP_BITS = 6;

const STRING_INIT = 21;

const BOOL_TRUE = -37;
const BOOL_FALSE = -73;

const OBJ_INIT = 91;

const UNDEF_VALUE = -31;
const NULL_VALUE = -41;

const MIN_HASH = -(2 ** 31);
const MAX_HASH = 2 ** 31 - 1;

function createStringHasher(maxStepBits: number): Hasher<string> {
	const maxSteps = 1 << maxStepBits;

	return Object.freeze({
		isValid(obj: unknown): obj is string {
			return typeof obj === 'string';
		},
		hash(value: string): number {
			const length = Math.min(value.length, maxSteps);
			const stepSize = Math.max(1, value.length >>> maxStepBits);

			let result = STRING_INIT;

			// implement times 31 = 32 - 1
			for (let i = 0; i < length; i += stepSize) {
				result = ((result << 5) - result + value.charCodeAt(i)) | 0;
			}

			return result;
		},
	});
}

function createStringCaseInsensitiveHasher(
	maxStepBits: number,
): Hasher<string> {
	const maxSteps = 1 << maxStepBits;

	return Object.freeze({
		isValid(obj: unknown): obj is string {
			return typeof obj === 'string';
		},
		hash(value: string): number {
			const length = Math.min(value.length, maxSteps);
			const stepSize = Math.max(1, value.length >>> maxStepBits);

			let result = STRING_INIT;

			// implement times 31 = 32 - 1
			for (let i = 0; i < length; i += stepSize) {
				const char = value.charAt(i).toUpperCase();
				result = ((result << 5) - result + char.charCodeAt(0)) | 0;
			}

			return result;
		},
	});
}

function createArrayHasher<T>(
	itemHasher: Hasher<T>,
	maxStepBits: number,
): Hasher<readonly T[]> {
	const maxSteps = 1 << maxStepBits;

	return Object.freeze({
		isValid(obj: unknown): obj is readonly T[] {
			return Array.isArray(obj);
		},
		hash(value: readonly T[]): number {
			const length = Math.min(value.length, maxSteps);
			const stepSize = Math.max(1, value.length >>> maxStepBits);

			let result = value.length | 0;

			// implement times 31 = 32 - 1
			for (let i = 0; i < length; i += stepSize) {
				result =
					((result << 5) - result + (i + 1) * itemHasher.hash(value[i])) | 0;
			}

			return result;
		},
	});
}

function createStreamSourceHasher<T>(
	mod: HasherModule,
	itemHasher: Hasher<T> = mod.defaultInstance,
	maxStepBits = MAX_STEP_BITS,
): Hasher<StreamSource<T>> {
	const maxSteps = 1 << maxStepBits;

	return Object.freeze({
		isValid(obj: unknown): obj is StreamSource<T> {
			return typeof obj === 'object' && obj !== null && Symbol.iterator in obj;
		},
		hash(source: StreamSource<T>): number {
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
				hashItems,
			);

			// include length in hash
			return ((itemHash << 5) - itemHash + length) | 0;
		},
	});
}

function createObjectHasher(
	keyHasher: Hasher<unknown>,
	valueHasher: Hasher<unknown>,
): Hasher<Record<any, any>> {
	return Object.freeze({
		isValid(obj: any): obj is Record<any, any> {
			return typeof obj === 'object';
		},
		hash(value: Record<any, any>): number {
			if (value === null) return NULL_VALUE;

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
	});
}

function createAnyHasher(
	mod: HasherModuleInternal,
	mode: 'FLAT' | 'SHALLOW' | 'DEEP',
	maxStepBits = MAX_STEP_BITS,
): Hasher<any> {
	return Object.freeze({
		isValid(obj: any): obj is any {
			return true;
		},
		hash(value: any): number {
			const valueType = typeof value;

			switch (valueType) {
				case 'undefined':
					return UNDEF_VALUE;
				case 'bigint':
					return mod.bigint.hash(value);
				case 'boolean':
					return mod.boolean.hash(value);
				case 'number':
					return mod.number.hash(value);
				case 'string':
					return mod.string.hash(value);
				case 'function':
				case 'symbol':
					return mod._anyToStringHasher.hash(value);
				case 'object': {
					if (null === value) return NULL_VALUE;

					const wrappedHasher = mod._tryWrappedHasher;

					if (wrappedHasher.isValid(value)) {
						return wrappedHasher.hash(value);
					}

					if (mode !== 'FLAT') {
						if (Array.isArray(value)) {
							if (mode === 'SHALLOW') {
								return createArrayHasher(mod.anyFlat, MAX_STEP_BITS).hash(
									value,
								);
							}

							return createArrayHasher(this, maxStepBits).hash(value);
						}

						if (mod._streamSourceAnyHasher.isValid(value)) {
							if (mode === 'SHALLOW') {
								return createStreamSourceHasher(
									mod,
									mod.anyFlat,
									maxStepBits,
								).hash(value);
							}

							return createStreamSourceHasher(mod, this, maxStepBits).hash(
								value,
							);
						}

						if (mod.objectShallow.isValid(value)) {
							if (mode === 'SHALLOW') return mod.objectShallow.hash(value);

							return createObjectHasher(mod.anyFlat, this).hash(value);
						}
					}

					return mod._anyToStringHasher.hash(value);
				}
			}
		},
	});
}

interface HasherModuleInternal extends HasherModule {
	_anyToStringHasher: Hasher<any>;
	_arrayAnyHasher: Hasher<readonly any[]>;
	_streamSourceAnyHasher: Hasher<StreamSource<any>>;
	_tryWrappedHasher: Hasher<any>;
}

export const hasherModule = Module.create<HasherModuleInternal>((mod) => ({
	defaultInstance: Module.lazyGetter(() => mod.anyShallow),
	string: Module.lazyGetter(() => createStringHasher(MAX_STEP_BITS)),
	_anyToStringHasher: Module.lazyGetter(() =>
		Object.freeze({
			isValid(obj: unknown): obj is any {
				return true;
			},
			hash(value: any) {
				return mod.string.hash(Eq.convertAnyToString(value));
			},
		}),
	),
	anyToString: (maxStepBits?: number): Hasher<any> => {
		if (undefined === maxStepBits) return mod._anyToStringHasher;

		return createStringHasher(maxStepBits);
	},
	anyJsonString: Module.lazyGetter(() =>
		Object.freeze({
			isValid(obj: unknown): obj is any {
				return true;
			},
			hash(value: any) {
				return mod.string.hash(JSON.stringify(value));
			},
		}),
	),
	stringCaseInsensitive: Module.lazyGetter(() =>
		createStringCaseInsensitiveHasher(MAX_STEP_BITS),
	),
	_arrayAnyHasher: Module.lazyGetter(() => {
		return createArrayHasher(mod.defaultInstance, MAX_STEP_BITS);
	}),
	array: <T = any>(
		options?:
			| {
					itemHasher?: Hasher<T>;
					maxStepBits?: number;
			  }
			| undefined,
	): Hasher<readonly T[]> => {
		if (undefined === options) return mod._arrayAnyHasher;

		return createArrayHasher(
			options.itemHasher ?? mod.anyFlat,
			options.maxStepBits ?? MAX_STEP_BITS,
		);
	},
	_streamSourceAnyHasher: Module.lazyGetter(() =>
		createStreamSourceHasher(mod, mod.defaultInstance, MAX_STEP_BITS),
	),
	streamSource: <T>(
		options?:
			| {
					itemHasher?: Hasher<T>;
					maxStepBits?: number;
			  }
			| undefined,
	): Hasher<StreamSource<T>> => {
		if (undefined === options) return mod._streamSourceAnyHasher;

		return createStreamSourceHasher(
			mod,
			options.itemHasher,
			options.maxStepBits,
		);
	},
	number: Module.lazyGetter(() =>
		Object.freeze({
			isValid(obj: unknown): obj is number {
				return typeof obj === 'number';
			},
			hash(value: number) {
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
				return mod._anyToStringHasher.hash(value);
			},
		}),
	),
	boolean: Module.lazyGetter(() =>
		Object.freeze({
			isValid(obj: unknown): obj is boolean {
				return typeof obj === 'boolean';
			},
			hash(value: boolean) {
				return value ? BOOL_TRUE : BOOL_FALSE;
			},
		}),
	),
	bigint: Module.lazyGetter(() =>
		Object.freeze({
			isValid(obj: unknown): obj is bigint {
				return typeof obj === 'bigint';
			},
			hash: mod._anyToStringHasher.hash,
		}),
	),
	byValueOf: <T extends { valueOf(): V }, V>(
		cls: {
			new (): T;
		},
		valueHasher: Hasher<V> = mod.anyFlat,
	): Hasher<T> => {
		return Object.freeze({
			isValid(obj: any): obj is T {
				return obj instanceof cls;
			},
			hash(value: T): number {
				return valueHasher.hash(value.valueOf());
			},
		});
	},
	date: Module.lazyGetter(() => mod.byValueOf(Date, mod.number)),
	_tryWrappedHasher: Module.lazyGetter(() => {
		const _wrappedHashers: Hasher<unknown>[] = [
			mod.byValueOf(Boolean, mod.boolean),
			mod.date,
			mod.byValueOf(Number, mod.number),
			mod.byValueOf(String, mod.string),
		];

		return Object.freeze({
			isValid(obj: any): obj is any {
				let i = -1;
				const len = _wrappedHashers.length;

				while (++i < len) {
					const hasher = _wrappedHashers[i];
					if (hasher.isValid(obj)) {
						return true;
					}
				}
				return false;
			},
			hash(value: any): number {
				let i = -1;
				const len = _wrappedHashers.length;

				while (++i < len) {
					const hasher = _wrappedHashers[i];

					if (hasher.isValid(value)) {
						return hasher.hash(value);
					}
				}
				return 0;
			},
		});
	}),
	object: <K extends string | number | symbol, V = any>(options?: {
		keyHasher: Hasher<K>;
		valueHasher: Hasher<V>;
	}): Hasher<Record<K, V>> => {
		if (undefined === options) return mod.objectShallow;

		return createObjectHasher(options.keyHasher, options.valueHasher);
	},
	objectShallow: Module.lazyGetter(() =>
		createObjectHasher(mod.anyFlat, mod.anyFlat),
	),
	objectDeep: Module.lazyGetter(() =>
		createObjectHasher(mod.anyFlat, mod.anyDeep),
	),
	anyFlat: Module.lazyGetter(() => createAnyHasher(mod, 'FLAT')),
	anyShallow: Module.lazyGetter(() => createAnyHasher(mod, 'SHALLOW')),
	anyDeep: Module.lazyGetter(() => createAnyHasher(mod, 'DEEP')),
	tupleSymmetric: <T>(
		hasher: Hasher<T> = mod.anyShallow,
	): Hasher<readonly [T, T]> => {
		return Object.freeze({
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
		});
	},
}));
