import { Eq } from '@rimbu/common/eq';
import { Module } from '@rimbu/common/module';

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
	 * const c = Comp.number
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
	isComparable(obj: unknown): obj is K;
	/**
	 * Returns an `Eq` equality instance thet will return true when the given `comp` comparable instance returns 0.
	 * @param comp - the `Comp` comparable instance to convert
	 * @example
	 * ```ts
	 * const eq = Comp.object.toEq()
	 * console.log(eq({ a: 1, b: 2 }, { b: 2, a: 1 }))
	 * // => true
	 * ```
	 */
	toEq(): Eq<K>;
	/**
	 * Returns a Comp instance the reverses the order of the current `comp` instance.
	 * @param comp - the Comp instance to wrap
	 * @example
	 * ```ts
	 * const c = Comp.number.inverted()
	 * console.log(c.compare(3, 5) > 0)
	 * // => true
	 * console.log(c.compare(5, 5))
	 * // => 0
	 * ```
	 */
	inverted(): Comp<K>;
	/**
	 * Returns a Comp instance that extends the current `comp` instance with the capability to handle `undefined` values, where undefined is considered to be smaller
	 * than any other value, and equal to another undefined.
	 * @example
	 * ```ts
	 * const c = Comp.number.withUndefined()
	 * console.log(c.compare(undefined, 5) < 0)
	 * // => true
	 * console.log(c.compare(undefined, undefined))
	 * // => 0
	 * ```
	 */
	withUndefined(): Comp<K | undefined>;
	/**
	 * Returns a Comp instance that extends the given `comp` instance with the capability to handle `null` values, where null is considered to be smaller
	 * than any other value, and equal to another null.
	 * @param comp - the Comp instance to wrap
	 * @example
	 * ```ts
	 * const c = Comp.number.withNull()
	 * console.log(c.compare(null, 5) < 0)
	 * // => true
	 * console.log(c.compare(null, null))
	 * // => 0
	 * ```
	 */
	withNull(): Comp<K | null>;
	/**
	 * Returns a Comp instance for Iterable objects that orders the Iterables by comparing the elements with the given `itemComp` Comp instance.
	 * @param itemComp - (optional) the Comp instance to use to compare the Iterable's elements.
	 * @example
	 * ```ts
	 * const c = Comp.number.forIterable();
	 * console.log(c.compare([1, 3, 2], [1, 3, 2]))
	 * // => 0
	 * console.log(c.compare([1, 2, 3, 4], [1, 3, 2]) < 0)
	 * // => true
	 * ```
	 */
	forIterable(): Comp<Iterable<K>>;
}

class CompImpl<K> implements Comp<K> {
	constructor(
		readonly compare: (value1: K, value2: K) => number,
		readonly isComparable: (obj: any) => obj is K,
	) {}

	toEq(): Eq<K> {
		return (v1: K, v2: K): boolean => this.compare(v1, v2) === 0;
	}

	inverted(): Comp<K> {
		return new CompImpl((v1, v2) => this.compare(v2, v1), this.isComparable);
	}

	withUndefined(): Comp<K | undefined> {
		return new CompImpl(
			(v1, v2) => {
				if (undefined === v1) {
					if (undefined === v2) return 0;
					return -1;
				}
				if (undefined === v2) return 1;
				return this.compare(v1, v2);
			},
			(obj): obj is K | undefined => {
				return undefined === obj || this.isComparable(obj);
			},
		);
	}

	withNull(): Comp<K | null> {
		return new CompImpl(
			(v1, v2) => {
				if (null === v1) {
					if (null === v2) return 0;
					return -1;
				}
				if (null === v2) return 1;
				return this.compare(v1, v2);
			},
			(obj): obj is K | null => {
				return null === obj || this.isComparable(obj);
			},
		);
	}
	forIterable(): Comp<Iterable<K>> {
		return new CompImpl(
			(v1, v2): number => {
				const iter1 = v1[Symbol.iterator]();
				const iter2 = v2[Symbol.iterator]();

				while (true) {
					const value1 = iter1.next();
					const value2 = iter2.next();

					if (value1.done) return value2.done ? 0 : -1;
					if (value2.done) return 1;

					const result = this.compare(value1.value, value2.value);

					if (result !== 0) return result;
				}
			},
			(obj): obj is Iterable<K> => {
				// unfortunately we cannot check element compatability
				return (
					typeof obj === 'object' && obj !== null && Symbol.iterator in obj
				);
			},
		);
	}
}

export namespace Comp {
	export interface Factory {
		create<K>(
			isComparable: (obj: unknown) => obj is K,
			compare: (value1: K, value2: K) => number,
		): Comp<K>;
		/**
		 * Returns the default Comp instance, which is the Comp.anyDeepComp() instance.
		 */
		defaultInstance: Comp<any>;
		/**
		 * Returns a default number Comp instance that orders numbers naturally.
		 * @example
		 * ```ts
		 * const c = Comp.numberComp();
		 * console.log(c.compare(3, 5))
		 * // => -2
		 * ```
		 */
		number: Comp<number>;
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
		boolean: Comp<boolean>;
		/**
		 * Returns a default bigint Comp instance that orders bigint numbers naturally.
		 */
		bigInt: Comp<bigint>;
		/**
		 * Returns a Comp instance converts values to string with JSON.stringify, and orders the resulting string naturally.
		 */
		anyStringJson<T>(): Comp<T>;
		/**
		 * Returns a `Comp` instance that compares strings based on the string's `localeCompare` method.
		 * @param locales - (optional) a locale or list of locales
		 * @param options - (optional) see String.localeCompare for details
		 */
		string(...args: ConstructorParameters<typeof Intl.Collator>): Comp<string>;
		/**
		 * Returns a `Comp` instance that compares strings in a case-insensitive way.
		 */
		stringCaseInsensitive: Comp<string>;
		/**
		 * Returns a string Comp instance that orders strings according to their indexed char codes.
		 */
		stringCharCode: Comp<string>;
		/**
		 * Returns a any Comp instance that orders any according to their toString values.
		 */
		anyToString: Comp<any>;
		/**
		 * Returns a Comp instance that orders objects with a `valueOf` method according to the given `valueComp` instance for the valueOf values.
		 * @param cls - the constructor of the values the Comp instance can compare
		 * @param valueComp - (optional) the Comp instance to use on the .valueOf values
		 */
		byValueOf<T extends { valueOf(): V }, V>(
			cls: {
				new (): T;
			},
			valueComp?: Comp<V> | undefined,
		): Comp<T>;
		/**
		 * Returns a Date Comp instance that orders Dates according to their `.valueOf` value.
		 */
		date: Comp<Date>;
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
		object(options?: {
			keyComp?: Comp<any>;
			valueComp?: Comp<any>;
		}): Comp<Record<any, any>>;
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
		anyFlat<T>(): Comp<T>;
		/**
		 * Returns a Comp instance that compares any value using default comparison functions. For Iterables and objects, their elements are compared
		 * only one level deep for performance and to avoid infinite recursion.
		 * @example
		 * ```ts
		 * const c = Comp.anyShallow();
		 * console.log(c.compare({ a: 1, b: 1 }, { b: 1, a: 1 }))
		 * // => 0
		 * console.log(c.compare([{ a: 1, b: 1 }], [{ b: 1, a: 1 }]) < 0)
		 * // => true
		 * // First object is smaller because the objects are converted to a string and then compares the resulting string.
		 * ```
		 */
		anyShallow<T>(): Comp<T>;
		/**
		 * Returns a Comp instance that compares any value using default comparison functions. For Iterables and objects, their elements are compared
		 * recursively.
		 * @note can become slow with large nested arrays and objects, and circular structures can cause infinite loops
		 * @example
		 * ```ts
		 * const c = Comp.anyDeep();
		 * console.log(c.compare({ a: 1, b: 1 }, { b: 1, a: 1 }))
		 * // => 0
		 * console.log(c.compare([{ a: 1, b: 1 }], [{ b: 1, a: 1 }]))
		 * // => 0
		 * ```
		 */
		anyDeep<T>(): Comp<T>;
	}
}

interface CompModule extends Comp.Factory {
	_createAnyComp(mode: 'FLAT' | 'SHALLOW' | 'DEEP'): Comp<any>;
	_createObjectComp(
		keyComp: Comp<any> | undefined,
		valueComp: Comp<any> | undefined,
	): Comp<Record<any, any>>;
	_defaultCollator: Intl.Collator;
	_stringInstance: Comp<string>;
	_tryWrappedCompare(v1: any, v2: any): number | undefined;
	_objectAnyComp: Comp<any>;
	_iterableAnyComp: Comp<any>;
}

const compModule = Module.create<CompModule>((mod) => ({
	_createAnyComp: (mode) => {
		const result = mod.create(
			(obj): obj is any => {
				return true;
			},
			(v1, v2): number => {
				if (Object.is(v1, v2)) return 0;

				const type1 = typeof v1;
				const type2 = typeof v2;

				if (type1 !== type2) {
					// we can only compare different types though strings
					return mod.anyToString.compare(v1, v2);
				}

				switch (type1) {
					case 'bigint':
						return mod.bigInt.compare(v1, v2);
					case 'boolean':
						return mod.boolean.compare(v1, v2);
					case 'number':
						return mod.number.compare(v1, v2);
					case 'string':
						return mod._stringInstance.compare(v1, v2);
					case 'object': {
						if (null === v1) {
							if (null === v2) return 0;

							return -1;
						}
						if (null === v2) {
							return 1;
						}

						const wrappedComp = mod._tryWrappedCompare(v1, v2);

						if (undefined !== wrappedComp) return wrappedComp;

						if (mode !== 'FLAT') {
							if (
								mod._iterableAnyComp.isComparable(v1) &&
								mod._iterableAnyComp.isComparable(v2)
							) {
								if (mode === 'SHALLOW') {
									return mod.anyFlat().forIterable().compare(v1, v2);
								}

								return result.forIterable().compare(v1, v2);
							}

							if (mode === 'SHALLOW') {
								return mod
									._createObjectComp(mod.anyFlat(), mod.anyFlat())
									.compare(v1, v2);
							}

							return mod.object().compare(v1, v2);
						}
					}
				}

				return mod.anyToString.compare(v1, v2);
			},
		);

		return result;
	},
	_createObjectComp: (
		keyComp = mod.anyFlat(),
		valueComp = mod.defaultInstance,
	) =>
		mod.create(
			(obj): obj is Record<any, any> => {
				return true;
			},
			(v1, v2): number => {
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
		),
	_defaultCollator: Module.lazyGetter(() => Intl.Collator('und')),
	_stringInstance: Module.lazyGetter(() =>
		mod.create(
			(obj): obj is string => typeof obj === 'string',
			mod._defaultCollator.compare,
		),
	),
	_tryWrappedCompare: Module.lazyGetter(() => {
		const wrappedComps = [
			mod.byValueOf(Boolean, mod.boolean),
			mod.date,
			mod.byValueOf(Number, mod.number),
			mod.byValueOf(String, mod._stringInstance),
		] as Comp<unknown>[];

		const len = wrappedComps.length;

		return (v1: any, v2: any): number | undefined => {
			let i = -1;

			while (++i < len) {
				const comp = wrappedComps[i];

				if (comp.isComparable(v1) && comp.isComparable(v2)) {
					return comp.compare(v1, v2);
				}
			}

			return undefined;
		};
	}),
	_objectAnyComp: Module.lazyGetter(() =>
		mod._createObjectComp(mod.anyFlat(), mod.defaultInstance),
	),
	_iterableAnyComp: Module.lazyGetter(() => mod.defaultInstance.forIterable()),
	create: (isComparable, compare) => new CompImpl(compare, isComparable),

	defaultInstance: Module.lazyGetter(() => mod._createAnyComp('DEEP')),
	number: Module.lazyGetter(() =>
		mod.create(
			(obj): obj is number => typeof obj === 'number',
			(v1, v2): number => {
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
		),
	),
	boolean: Module.lazyGetter(() =>
		mod.create(
			(obj): obj is boolean => typeof obj === 'boolean',
			(v1, v2): number => {
				return v1 === v2 ? 0 : v1 ? 1 : -1;
			},
		),
	),
	bigInt: Module.lazyGetter(() =>
		mod.create(
			(obj): obj is bigint => typeof obj === 'bigint',
			(v1, v2): number => {
				const res = v1 - v2;
				if (res > 0) return 1;
				if (res < 0) return -1;
				return 0;
			},
		),
	),
	anyStringJson: Module.lazy(() =>
		mod.create(
			(obj): obj is any => true,
			(v1, v2): number => {
				return mod._defaultCollator.compare(
					JSON.stringify(v1),
					JSON.stringify(v2),
				);
			},
		),
	),
	string: (...args) => {
		if (args.length === 0) return mod._stringInstance;

		const collator = Intl.Collator(...args);

		return mod.create(
			(obj): obj is string => typeof obj === 'string',
			collator.compare,
		);
	},
	stringCaseInsensitive: Module.lazyGetter(() =>
		mod.string('und', { sensitivity: 'accent' }),
	),
	stringCharCode: Module.lazyGetter(() =>
		mod.create(
			(obj: any): obj is any => typeof obj === 'string',
			(v1: any, v2: any): number => {
				const len = Math.min(v1.length, v2.length);

				let i = -1;

				while (++i < len) {
					const diff = v1.charCodeAt(i) - v2.charCodeAt(i);
					if (diff !== 0) return diff;
				}

				return v1.length - v2.length;
			},
		),
	),
	anyToString: Module.lazyGetter(() =>
		mod.create(
			(obj: any): obj is any => true,
			(v1: any, v2: any): number => {
				return mod._defaultCollator.compare(
					Eq.convertAnyToString(v1),
					Eq.convertAnyToString(v2),
				);
			},
		),
	),
	byValueOf: (cls, valueComp = mod.anyShallow<any>()) =>
		mod.create(
			(obj): obj is any => obj instanceof cls,
			(v1, v2): number => {
				return valueComp.compare(v1.valueOf(), v2.valueOf());
			},
		),
	date: Module.lazyGetter(() => mod.byValueOf(Date, mod.number)),
	object: (options) => {
		if (undefined === options) return mod._objectAnyComp;

		return mod._createObjectComp(options.keyComp, options.valueComp);
	},
	anyFlat: Module.lazy(() => mod._createAnyComp('FLAT')),
	anyShallow: Module.lazy(() => mod._createAnyComp('SHALLOW')),
	anyDeep: Module.lazy(() => mod._createAnyComp('DEEP')),
}));

export const Comp = compModule.build<Comp.Factory>();
