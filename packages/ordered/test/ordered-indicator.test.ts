import { describe, expect, it } from 'bun:test';

import { Indicator } from '../src/internal/common/ordered-indicator';

const { between, after, before, INIT_INDICATOR } = Indicator;

function lt(a: Indicator, b: Indicator): boolean {
	return Indicator.COMP_INSTANCE.compare(a, b) < 0;
}

describe('Indicator.between', () => {
	it('throws when endpoints are equal or reversed', () => {
		expect(() => between(INIT_INDICATOR, INIT_INDICATOR)).toThrow();
		expect(() => between(after(INIT_INDICATOR), INIT_INDICATOR)).toThrow();
	});

	it('produces an exact rational strictly between two indicators', () => {
		const lo = INIT_INDICATOR;
		const hi = after(lo);
		const mid = between(lo, hi);

		expect(mid).toEqual({ numerator: 1n, denominator: 2n });
		expect(lt(lo, mid)).toBe(true);
		expect(lt(mid, hi)).toBe(true);
	});

	it('reduces the generated rational', () => {
		const mid = between(before(INIT_INDICATOR), after(INIT_INDICATOR));

		expect(mid).toEqual(INIT_INDICATOR);
	});

	it('supports unlimited repeated insertion in a gap', () => {
		let lo = INIT_INDICATOR;
		const hi = after(lo);
		const seen = new Set<string>();

		for (let i = 0; i < 1000; i++) {
			const mid = between(lo, hi);
			expect(lt(lo, mid)).toBe(true);
			expect(lt(mid, hi)).toBe(true);
			expect(seen.has(`${mid.numerator}/${mid.denominator}`)).toBe(false);
			seen.add(`${mid.numerator}/${mid.denominator}`);
			lo = mid;
		}
	});
});

describe('Indicator.after / before', () => {
	it('produce strictly greater and smaller indicators', () => {
		const afterIndicator = after(INIT_INDICATOR);
		const beforeIndicator = before(INIT_INDICATOR);

		expect(lt(INIT_INDICATOR, afterIndicator)).toBe(true);
		expect(lt(beforeIndicator, INIT_INDICATOR)).toBe(true);
	});

	it('supports many sequential appends and prepends', () => {
		let appended = INIT_INDICATOR;
		let prepended = INIT_INDICATOR;

		for (let i = 0; i < 500; i++) {
			const nextAppended = after(appended);
			const nextPrepended = before(prepended);
			expect(lt(appended, nextAppended)).toBe(true);
			expect(lt(nextPrepended, prepended)).toBe(true);
			appended = nextAppended;
			prepended = nextPrepended;
		}
	});
});

describe('Indicator invariants', () => {
	it('maintains total order across mixed inserts', () => {
		const order: Indicator[] = [INIT_INDICATOR];

		for (let i = 0; i < 5; i++) order.push(after(order[order.length - 1]));
		for (let i = 0; i < 3; i++) order.unshift(before(order[0]));

		for (let i = 0; i < order.length - 1; i++) {
			order.splice(i + 1, 0, between(order[i], order[i + 1]));
			i++;
		}

		for (let i = 1; i < order.length; i++) {
			expect(lt(order[i - 1], order[i])).toBe(true);
		}
	});
});
