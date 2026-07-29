import { throwInvalidUsageError } from '@rimbu/base/rimbu-error';

export type Int = number & { __integer__: true };

export namespace Int {
	export type Natural = Int & { __natural__: true };

	export type Pos = Int.Natural & { __positive__: true };

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

	export function checkIsNatural(value: number): asserts value is Natural {
		if (value < 0) {
			throwInvalidUsageError(`value ${value} is not a natural number`);
		}
		check(value);
	}

	export function checkIsPos(value: number): asserts value is Pos {
		if (value <= 0) {
			throwInvalidUsageError(`value ${value} is not a positive number`);
		}
		check(value);
	}
}
