import { Comp } from '@rimbu/common';

/**
 * An exact rational number used as an order-maintenance indicator.
 *
 * Indicators are kept in reduced form with a positive denominator. Bigints
 * avoid a precision wall when a gap is repeatedly subdivided.
 */
export interface Indicator {
	readonly numerator: bigint;
	readonly denominator: bigint;
}

function gcd(a: bigint, b: bigint): bigint {
	while (b !== 0n) {
		[a, b] = [b, a % b];
	}
	return a < 0n ? -a : a;
}

function create(numerator: bigint, denominator: bigint): Indicator {
	if (denominator === 0n)
		throw new Error('Indicator denominator cannot be zero.');
	if (denominator < 0n) {
		numerator = -numerator;
		denominator = -denominator;
	}

	const divisor = gcd(numerator, denominator);
	return {
		numerator: numerator / divisor,
		denominator: denominator / divisor,
	};
}

function compare(a: Indicator, b: Indicator): number {
	const left = a.numerator * b.denominator;
	const right = b.numerator * a.denominator;
	return left < right ? -1 : left > right ? 1 : 0;
}

export namespace Indicator {
	export const COMP_INSTANCE: Comp<Indicator> = Comp.create(
		(value): value is Indicator =>
			typeof value === 'object' &&
			value !== null &&
			typeof (value as Indicator).numerator === 'bigint' &&
			typeof (value as Indicator).denominator === 'bigint',
		compare,
	);

	export const INIT_INDICATOR: Indicator = create(0n, 1n);

	/** Generate an indicator strictly between two existing indicators. */
	export function between(a: Indicator, b: Indicator): Indicator {
		const order = compare(a, b);
		if (order === 0) {
			throw new Error(
				'Cannot generate an indicator between two equal indicators.',
			);
		}
		if (order > 0) {
			throw new Error(
				'Cannot generate an indicator between indicators in reverse order.',
			);
		}

		// The mediant is strictly between two ordered rationals. Unlike an
		// arithmetic midpoint, it needs no common denominator or rounding.
		return create(a.numerator + b.numerator, a.denominator + b.denominator);
	}

	/** Generate an indicator strictly after `ind`. */
	export function after(ind: Indicator): Indicator {
		return create(ind.numerator + ind.denominator, ind.denominator);
	}

	/** Generate an indicator strictly before `ind`. */
	export function before(ind: Indicator): Indicator {
		return create(ind.numerator - ind.denominator, ind.denominator);
	}
}
