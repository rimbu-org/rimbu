import {
	type HasherModule,
	hasherModule,
} from '#hashed/hasher-module';

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
	 * @returns `true` when `obj` is a valid value for this hasher (of type `UK`), otherwise `false`
	 * @example
	 * ```ts
	 * const h = Hasher.numberHasher()
	 * console.log(h.isValid(5))
	 * // => true
	 * console.log(h.isValid('a'))
	 * // => false
	 * ```
	 */
	isValid(obj: unknown): obj is UK;
	/**
	 * Returns the 32-bit hash code for the given `value`.
	 * @param value - the value to hash
	 * @returns a 32-bit signed integer hash code
	 * @note it is assumed that the caller has verified that the given object
	 * is valid, either by knowing the types up front, or by using the `isValid` function.
	 * @example
	 * ```ts
	 * const h = Hasher.anyHasher()
	 * h.hash([1, 3, 2])
	 * ```
	 */
	hash(value: UK): number;
}

/**
 * @expandType HasherModule
 */
export const Hasher: HasherModule = hasherModule.build();
