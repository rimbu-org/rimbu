import { Module } from '@rimbu/common/module';

/**
 * A function returning true if given `v1` and `v2` should be considered equal.
 */
export type Eq<T> = (v1: T, v2: T) => boolean;

export namespace Eq {
	export interface Factory {
		/**
		 * Converts any given `value` to a string representation that is stable for equality
		 * and ordering comparisons.
		 *
		 * For primitive values and objects with a custom `toString` implementation, it uses
		 * `String(value)`. For plain objects with the default `Object.prototype.toString`
		 * implementation, it uses `JSON.stringify(value)` instead.
		 * @param value - the value to convert
		 * @returns a stable string representation for `value`
		 */
		convertAnyToString(value: any): string;

		/**
		 * Returns the default Eq instance, which is the Eq.anyDeepEq() instance.
		 * @returns the default deep equality `Eq` instance
		 */
		defaultInstance: Eq<any>;

		/**
		 * An Eq instance that uses `Object.is` to determine if two objects are equal.
		 * @example
		 * ```ts
		 * const eq = Eq.objectIs
		 * console.log(eq(5, 5))
		 * // => true
		 * console.log(eq(5, 'a'))
		 * // => false
		 * ```
		 */
		objectIs: Eq<any>;

		/**
		 * Returns an Eq instance for objects that have a `valueOf` method. It returns true if the `.valueOf` values of both given objects are equal.
		 * @typeparam T - the object type containing a valueOf function of type V
		 * @typeparam V - the valueOf result type
		 * @returns an `Eq<T>` that compares objects by their `valueOf()` result
		 */
		byValueOf<T extends { valueOf(): V }, V>(): Eq<T>;

		/**
		 * Returns an Eq instance that compares Date objects according to their `valueOf` value.
		 * @example
		 * ```ts
		 * const eq = Eq.dateEq()
		 * console.log(eq(new Date(2020, 1, 1), new Date(2020, 1, 1))
		 * // => true
		 * console.log(eq(new Date(2020, 1, 1), new Date(2020, 2, 1))
		 * // => false
		 * ```
		 * @returns an `Eq<Date>` comparing dates by value
		 */
		date: Eq<Date>;

		/**
		 * Returns an Eq instance that compares Iterables by comparing their elements with the given `itemEq` Eq instance.
		 * @typeparam T - the Iterable element type
		 * @param itemEq - (optional) the Eq instance to use to compare the Iterable's elements
		 * @returns an `Eq<Iterable<T>>` that compares iterables element-wise
		 */
		forIterable<T>(itemEq?: Eq<T>): Eq<Iterable<T>>;

		/**
		 * Returns an Eq instance that checks equality of objects containing property values of type V by iteratively
		 * applying given `valueEq` to each of the object's property values.
		 * @typeparam V - the object property value type
		 * @param valueEq - (optional) the Eq instance to use to compare property values
		 * @returns an `Eq<Record<any, V>>` that compares objects by property values
		 */
		object<V = any>(valueEq?: Eq<V>): Eq<Record<any, V>>;

		/**
		 * Returns an Eq instance that checks equality of any values. For composed values (objects and iterables)
		 * it will compare with Object.is.
		 * @typeparam T - the value type
		 * @returns an `Eq<T>` performing a flat equality comparison
		 */
		anyFlat<T = any>(): Eq<T>;

		/**
		 * Returns an Eq instance that checks equality of any values. For composed values (objects and iterables)
		 * it will enter 1 level, and if again compound values are found, they are compared
		 * with Object.is.
		 * @typeparam T - the value type
		 * @returns an `Eq<T>` performing a shallow equality comparison
		 */
		anyShallow<T = any>(): Eq<T>;

		/**
		 * Returns an Eq instance that checks equality of any values. For composed values (objects and iterables)
		 * it will recursively compare the contained values.
		 * @note may have poor performance for deeply nested types and large arrays, and objects with circular structures
		 * may cause infinite loops
		 * @typeparam T - the value type
		 * @returns an `Eq<T>` performing a deep equality comparison
		 */
		anyDeep<T = any>(): Eq<T>;

		/**
		 * Returns an Eq instance that considers strings equal taking the given or default locale into account.
		 * @param locales - (optional) a locale or list of locales
		 * @param options - (optional) see String.localeCompare for details
		 * @returns an `Eq<string>` that compares strings using the provided collator
		 */
		stringWithStringCollator(
			...args: ConstructorParameters<typeof Intl.Collator>
		): Eq<string>;

		/**
		 * Returns an Eq instance that considers strings equal regardless of their case.
		 * @returns an `Eq<string>` that compares strings case-insensitively
		 */
		stringCaseInsentitive: Eq<string>;

		/**
		 * Returns an Eq instance that considers strings equal when all their charcodes are equal.
		 * @returns an `Eq<string>` that compares strings by char codes
		 */
		stringCharCode: Eq<string>;

		/**
		 * Returns an Eq instance that considers two values equal when their string
		 * representations, as returned by `Eq.convertAnyToString`, are equal.
		 * @returns an `Eq<any>` that compares values by their stable string form
		 */
		anyByToString: Eq<any>;

		/**
		 * Returns an Eq instance that considers values equal their JSON.stringify values are equal.
		 * @returns an `Eq<any>` that compares values via `JSON.stringify`
		 */
		anyByJsonStringify(): Eq<any>;

		/**
		 * Returns an `Eq` instance for tuples that considers two tuples [A, B] and [C, D] equal if [A, B] equals [C, D],
		 * or if [A, B] equals [D, C]
		 * @param eq - (optional) an alternative `Eq` instance to use for the values in the tuple
		 * @returns an `Eq` for symmetric tuples
		 */
		tupleSymmetric<T>(eq?: Eq<T> | undefined): Eq<readonly [T, T]>;
	}
}

function createIterableEq<T>(itemEq: Eq<T>): Eq<Iterable<T>> {
	return (v1, v2) => {
		if (Object.is(v1, v2)) return true;

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

function createObjectEq(valueEq: Eq<any>): Eq<Record<any, any>> {
	return (v1, v2) => {
		if (Object.is(v1, v2)) return true;

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

interface EqModule extends Eq.Factory {
	_createAnyEq(mode: 'FLAT' | 'SHALLOW' | 'DEEP'): Eq<any>;
	_iterableAnyInstance: Eq<Iterable<any>>;
	_objectAnyInstance: Eq<Record<any, any>>;
	_defaultCollator: Intl.Collator;
	_defaultWithStringCollatorInstance: Eq<string>;
}

const eqModule = Module.create<EqModule>((mod) => ({
	_createAnyEq: (mode) => {
		const result: Eq<any> = (v1, v2): boolean => {
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
				case 'object': {
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
						return mod.byValueOf()(v1, v2);
					}

					if (mode !== 'FLAT') {
						if (Symbol.iterator in v1 && Symbol.iterator in v2) {
							if (mode === 'SHALLOW') {
								return mod.forIterable(mod.anyFlat())(v1, v2);
							}

							return mod.forIterable(result)(v1, v2);
						}

						if (mode === 'SHALLOW') {
							return mod.object(mod.anyFlat())(v1, v2);
						}

						return mod.object()(v1, v2);
					}

					// cannot establish that they are equal in flat mode
					return false;
				}
			}
		};

		return result;
	},
	_iterableAnyInstance: Module.lazyGetter(() =>
		createIterableEq(mod.defaultInstance),
	),
	_objectAnyInstance: Module.lazyGetter(() =>
		createObjectEq(mod.defaultInstance),
	),
	_defaultCollator: Module.lazyGetter(() => new Intl.Collator('und')),
	_defaultWithStringCollatorInstance: (v1, v2) =>
		mod._defaultCollator.compare(v1, v2) === 0,
	convertAnyToString: (value: any): string => {
		if (
			typeof value !== 'object' ||
			null === value ||
			!('toString' in value) ||
			typeof value.toString !== 'function' ||
			value.toString !== Object.prototype.toString
		) {
			return String(value);
		}

		return JSON.stringify(value);
	},
	defaultInstance: Module.lazyGetter(() => mod.anyDeep()),
	objectIs: Object.is,
	byValueOf: () => (v1, v2) => Object.is(v1.valueOf(), v2.valueOf()),
	date: Module.lazyGetter(() => mod.byValueOf()),
	forIterable: (itemEq) => {
		if (undefined === itemEq) return mod._iterableAnyInstance;
		return createIterableEq(itemEq);
	},
	object: (valueEq) => {
		if (undefined === valueEq) return mod._objectAnyInstance;
		return createObjectEq(valueEq);
	},
	anyFlat: Module.lazy(() => mod._createAnyEq('FLAT')),
	anyShallow: Module.lazy(() => mod._createAnyEq('SHALLOW')),
	anyDeep: Module.lazy(() => mod._createAnyEq('DEEP')),
	stringWithStringCollator: (...args) => {
		if (args.length === 0) return mod._defaultWithStringCollatorInstance;

		const collator = Intl.Collator(...args);

		return (v1, v2) => collator.compare(v1, v2) === 0;
	},
	stringCaseInsentitive: Module.lazyGetter(() =>
		mod.stringWithStringCollator('und', { sensitivity: 'accent' }),
	),
	stringCharCode: (v1, v2) => {
		const len = v1.length;

		if (len !== v2.length) return false;

		let i = -1;

		while (++i < len) {
			if (v1.charCodeAt(i) !== v2.charCodeAt(i)) return false;
		}

		return true;
	},
	anyByToString: (v1, v2) =>
		mod.convertAnyToString(v1) === mod.convertAnyToString(v2),
	anyByJsonStringify: () => (v1, v2) =>
		JSON.stringify(v1) === JSON.stringify(v2),
	tupleSymmetric: <T>(eq: Eq<T> = mod.defaultInstance) => {
		return (tup1: readonly [T, T], tup2: readonly [T, T]): boolean =>
			(eq(tup1[0], tup2[0]) && eq(tup1[1], tup2[1])) ||
			(eq(tup1[0], tup2[1]) && eq(tup1[1], tup2[0]));
	},
}));

export const Eq = eqModule.build<Eq.Factory>();
