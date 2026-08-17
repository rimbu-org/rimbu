import { throwInvalidUsageError } from '@rimbu/base/rimbu-error';

export type Int = number & { __integer__: true };

export namespace Int {
	export type AtLeastZero = Int & { __atLeastZero: true };

	export type AtLeastOne = Int.AtLeastZero & { __atLeastOne: true };

	/**
	 * Throws an `InvalidUsageError` if the provided value is not a safe integer.
	 * @param value - the value to check
	 * @throws InvalidUsageError
	 */
	export function check(value: number): asserts value is Int {
		if (!Number.isSafeInteger(value)) {
			throwInvalidUsageError(`value ${value} is not a (safe) integer`);
		}
	}

	export function checkAtLeastZero(
		value: number,
	): asserts value is AtLeastZero {
		if (!Number.isSafeInteger(value)) {
			throwInvalidUsageError(`value ${value} is not a (safe) integer`);
		}
		if (value < 0) {
			throwInvalidUsageError(`value ${value} is not a natural number`);
		}
	}

	export function checkAtLeastOne(value: number): asserts value is AtLeastOne {
		if (!Number.isSafeInteger(value)) {
			throwInvalidUsageError(`value ${value} is not a (safe) integer`);
		}
		if (value <= 0) {
			throwInvalidUsageError(`value ${value} is not a positive number`);
		}
	}

	export function isZero(value: number): value is 0 {
		return value === 0;
	}

	export function checkIsZero(value: number): asserts value is 0 {}

	export function isInt(value: number): value is Int {
		return Number.isSafeInteger(value);
	}

	export function isAtLeastZero(value: number): value is AtLeastZero {
		return Number.isSafeInteger(value) && value >= 0;
	}

	export function isAtLeastOne(value: number): value is AtLeastOne {
		return Number.isSafeInteger(value) && value > 0;
	}
}
