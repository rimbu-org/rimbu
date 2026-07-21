import { Eq } from '@rimbu/common/eq';
import { Module } from '@rimbu/common/module';

/**
 * An object providing methods to compare two values of type `K`.
 * @typeparam K - the value type
 */
export interface Comp<K> {
	/**
	 * Returns 0 if given `value1` and `value2` are equal, a positive value if `value1` is greater than
	 * `value2`, and a negative value otherwise.
	 * @param value1 - the first value to compare
	 * @param value2 - the second value to compare
	 * @example
	 * ```ts
	 * import { Comp } from '@rimbu/common/comp';
	 * const c = Comp.number
	 * console.log(c.compare(5, 5))
	 * // => 0
	 * console.log(c.compare(3, 5))
	 * // => -2
	 * console.log(c.compare(5, 3))
	 * // => 2
	 * ```
	 * @returns a number: 0 if equal, >0 if `value1` > `value2`, <0 otherwise
	 */
	compare(value1: K, value2: K): number;
	/**
	 * Returns true if this instance can compare given `obj`.
	 * @param obj - the object to check
	 * @example
	 * ```ts
	 * import { Comp } from '@rimbu/common/comp';
	 * const c = Comp.number
	 * console.log(c.isComparable(5))
	 * // => true
	 * console.log(c.isComparable('a'))
	 * // => false
	 * ```
	 * @returns `true` if `obj` can be compared by this instance
	 */
	isComparable(obj: unknown): obj is K;
	/**
	 * Returns an `Eq` equality instance that will return true when the given `comp` comparable instance returns 0.
	 * @param comp - the `Comp` comparable instance to convert
	 * @example
	 * ```ts
	 * import { Comp } from '@rimbu/common/comp';
	 * const eq = Comp.object().toEq()
	 * console.log(eq({ a: 1, b: 2 }, { b: 2, a: 1 }))
	 * // => true
	 * ```
	 * @returns an `Eq<K>` equivalent to this `Comp`
	 */
	toEq(): Eq<K>;
	/**
	 * Returns a Comp instance that reverses the order of the current `comp` instance.
	 * @example
	 * ```ts
	 * import { Comp } from '@rimbu/common/comp';
	 * const c = Comp.number.inverted()
	 * console.log(c.compare(3, 5) > 0)
	 * // => true
	 * console.log(c.compare(5, 5))
	 * // => 0
	 * ```
	 * @returns a `Comp<K>` with inverted ordering
	 */
	inverted(): Comp<K>;
	/**
	 * Returns a Comp instance that extends the current `comp` instance with the capability to handle `undefined` values, where undefined is considered to be smaller
	 * than any other value, and equal to another undefined.
	 * @example
	 * ```ts
	 * import { Comp } from '@rimbu/common/comp';
	 * const c = Comp.number.withUndefined()
	 * console.log(c.compare(undefined, 5) < 0)
	 * // => true
	 * console.log(c.compare(undefined, undefined))
	 * // => 0
	 * ```
	 * @returns a `Comp<K | undefined>` that handles `undefined` values
	 */
	withUndefined(): Comp<K | undefined>;
	/**
	 * Returns a Comp instance that extends the current `comp` instance with the capability to handle `null` values, where null is considered to be smaller
	 * than any other value, and equal to another null.
	 * @example
	 * ```ts
	 * import { Comp } from '@rimbu/common/comp';
	 * const c = Comp.number.withNull()
	 * console.log(c.compare(null, 5) < 0)
	 * // => true
	 * console.log(c.compare(null, null))
	 * // => 0
	 * ```
	 * @returns a `Comp<K | null>` that handles `null` values
	 */
	withNull(): Comp<K | null>;
	/**
	 * Returns a Comp instance for Iterable objects that orders the Iterables by comparing the elements with the given `itemComp` Comp instance.
	 * @param itemComp - (optional) the Comp instance to use to compare the Iterable's elements.
	 * @example
	 * ```ts
	 * import { Comp } from '@rimbu/common/comp';
	 * const c = Comp.number.forIterable();
	 * console.log(c.compare([1, 3, 2], [1, 3, 2]))
	 * // => 0
	 * console.log(c.compare([1, 2, 3, 4], [1, 3, 2]) < 0)
	 * // => true
	 * ```
	 * @returns a `Comp<Iterable<K>>` that compares iterables element-wise
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
				// unfortunately we cannot check element compatibility
				return (
					typeof obj === 'object' && obj !== null && Symbol.iterator in obj
				);
			},
		);
	}
}

export namespace Comp {
	export interface Factory {
		/**
		 * Creates a new `Comp<K>` from the provided predicates.
		 * @typeparam K - the value type
		 * @param isComparable - function that determines if an object is of type `K`
		 * @param compare - function that compares two `K` values and returns a number
		 * @returns a `Comp<K>` that uses the provided comparison functions
		 */
		create<K>(
			isComparable: (obj: unknown) => obj is K,
			compare: (value1: K, value2: K) => number,
		): Comp<K>;

		/**
		 * The default `Comp<any>` instance (deep compare).
		 * @returns the default `Comp<any>` instance (deep compare)
		 */
		defaultInstance: Comp<any>;

		/**
		 * A `Comp<number>` ordering numbers naturally.
		 * @returns a `Comp<number>`
		 */
		number: Comp<number>;

		/**
		 * A `Comp<boolean>` ordering booleans (false < true).
		 * @returns a `Comp<boolean>`
		 */
		boolean: Comp<boolean>;

		/**
		 * A `Comp<bigint>` ordering bigint values.
		 * @returns a `Comp<bigint>`
		 */
		bigInt: Comp<bigint>;

		/**
		 * Returns a `Comp<T>` that orders by `JSON.stringify`.
		 * @returns a `Comp<T>`
		 */
		anyStringJson<T>(): Comp<T>;

		/**
		 * Returns a `Comp<string>` using `Intl.Collator`.
		 * @param ...args - forwarded to `Intl.Collator`
		 * @returns a `Comp<string>`
		 */
		string(...args: ConstructorParameters<typeof Intl.Collator>): Comp<string>;

		/**
		 * A `Comp<string>` that compares strings case-insensitively.
		 * @returns a `Comp<string>`
		 */
		stringCaseInsensitive: Comp<string>;

		/**
		 * A `Comp<string>` that compares strings by char codes.
		 * @returns a `Comp<string>`
		 */
		stringCharCode: Comp<string>;

		/**
		 * A `Comp<any>` that compares by stable string representation.
		 * @returns a `Comp<any>`
		 */
		anyToString: Comp<any>;

		/**
		 * Returns a `Comp<T>` comparing instances by their `valueOf()`.
		 * @param cls - constructor for the class to compare
		 * @param valueComp - optional `Comp` for comparing `.valueOf()` results
		 * @returns a `Comp<T>` comparing instances by their `valueOf()`
		 */
		byValueOf<T extends { valueOf(): V }, V>(
			cls: { new (): T },
			valueComp?: Comp<V> | undefined,
		): Comp<T>;

		/**
		 * A `Comp<Date>` comparing dates by numeric value.
		 * @returns a `Comp<Date>`
		 */
		date: Comp<Date>;

		/**
		 * Returns a `Comp<Record<any, any>>` for comparing objects by keys and values.
		 * @param options - optional `keyComp` and `valueComp` to customize ordering
		 * @returns a `Comp<Record<any, any>>`
		 */
		object(options?: {
			keyComp?: Comp<any>;
			valueComp?: Comp<any>;
		}): Comp<Record<any, any>>;

		/**
		 * A `Comp<T>` performing a flat comparison (no recursive comparison of Iterables or objects).
		 * @returns a `Comp<T>`
		 */
		anyFlat<T>(): Comp<T>;

		/**
		 * A `Comp<T>` performing a shallow comparison (one-level deep).
		 * @returns a `Comp<T>`
		 */
		anyShallow<T>(): Comp<T>;

		/**
		 * A `Comp<T>` performing a deep comparison (recursive).
		 * @returns a `Comp<T>`
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
				if (v1 === v2) return 0;
				if (Number.isNaN(v1) && Number.isNaN(v2)) return 0;
				if (Number.isNaN(v1)) return 1;
				if (Number.isNaN(v2)) return -1;
				return v1 < v2 ? -1 : 1;
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
