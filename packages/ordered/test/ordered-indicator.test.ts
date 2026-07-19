import { describe, expect, it } from 'bun:test';
import { Indicator } from '../src/internal/common/ordered-indicator';

const { between, after, before, INIT_INDICATOR } = Indicator;

// local lexicographic order to verify invariants without depending on Comp
function lt(a: string, b: string): boolean {
	const min = Math.min(a.length, b.length);
	for (let i = 0; i < min; i++) {
		const ca = a.charCodeAt(i);
		const cb = b.charCodeAt(i);
		if (ca !== cb) return ca < cb;
	}
	return a.length < b.length;
}

describe('Indicator.between', () => {
	it('throws when a === b', () => {
		expect(() => between('abc', 'abc')).toThrow();
	});

	it('produces a value strictly between two differing chars', () => {
		const lo = '0';
		const hi = 'z';
		const mid = between(lo, hi);
		expect(lt(lo, mid)).toBe(true);
		expect(lt(mid, hi)).toBe(true);
	});

	it('uses integer midpoint when a gap > 1 exists', () => {
		// '0' (48) and '2' (50) -> midpoint '1' (49)
		const mid = between('0', '2');
		expect(mid).toBe('1');
		expect(lt('0', mid)).toBe(true);
		expect(lt(mid, '2')).toBe(true);
	});

	it('descends shared prefix then returns a midpoint', () => {
		const lo = 'abc';
		const hi = 'abz';
		const mid = between(lo, hi);
		expect(mid.startsWith('ab')).toBe(true);
		expect(lt(lo, mid)).toBe(true);
		expect(lt(mid, hi)).toBe(true);
	});

	it('handles a being a prefix of b', () => {
		const lo = 'ab';
		const hi = 'abc';
		const mid = between(lo, hi);
		expect(lt(lo, mid)).toBe(true);
		expect(lt(mid, hi)).toBe(true);
		// mid should extend lo with a mid char
		expect(mid.startsWith('ab')).toBe(true);
		expect(mid.length).toBe(lo.length + 1);
	});

	it('falls back to fractional extension on adjacent chars', () => {
		// 'a' (97) and 'b' (98) are adjacent -> no integer between them
		const mid = between('a', 'b');
		expect(lt('a', mid)).toBe(true);
		expect(lt(mid, 'b')).toBe(true);
		// fractional: a + mid char lands between a and b
		expect(mid.length).toBe(2);
	});

	it('is transitive / nestable in the same gap until the precision wall', () => {
		let lo = '0';
		let hi = 'z';
		const seen = new Set<string>([lo, hi]);
		let hitWall = false;
		for (let i = 0; i < 200; i++) {
			let mid: string;
			try {
				mid = between(lo, hi);
			} catch (e) {
				if (e instanceof Indicator.PrecisionWall) {
					hitWall = true;
					break;
				}
				throw e;
			}
			expect(lt(lo, mid)).toBe(true);
			expect(lt(mid, hi)).toBe(true);
			expect(seen.has(mid)).toBe(false);
			seen.add(mid);
			// shrink the gap on the high side
			hi = mid;
		}
		expect(hitWall).toBe(true);
	});

	it('handles repeated front insertion (before INIT) until the precision wall', () => {
		const seq: string[] = [INIT_INDICATOR];
		let hitWall = false;
		for (let i = 0; i < 200; i++) {
			const prev = seq[seq.length - 1];
			let newer: string;
			try {
				newer = between('', prev);
			} catch (e) {
				if (e instanceof Indicator.PrecisionWall) {
					hitWall = true;
					break;
				}
				throw e;
			}
			expect(lt(newer, prev)).toBe(true);
			seq.push(newer);
		}
		// all produced indicators are distinct and strictly decreasing
		for (let i = 1; i < seq.length; i++) {
			expect(seq[i]).not.toBe(seq[i - 1]);
			expect(lt(seq[i], seq[i - 1])).toBe(true);
		}
		// the wall is reachable (proves the limitation is exercised, not hidden)
		expect(hitWall).toBe(true);
	});
});

describe('Indicator.after / before', () => {
	it('after produces a strictly greater indicator', () => {
		const a = after(INIT_INDICATOR);
		expect(lt(INIT_INDICATOR, a)).toBe(true);
	});

	it('before produces a strictly smaller indicator', () => {
		const b = before(INIT_INDICATOR);
		expect(lt(b, INIT_INDICATOR)).toBe(true);
	});

	it('after-then-before does not round-trip to the same value', () => {
		const a = after(INIT_INDICATOR);
		const b = before(a);
		expect(b).not.toBe(INIT_INDICATOR);
		expect(lt(b, a)).toBe(true);
	});

	it('before on a single-char indicator resolves via empty prefix', () => {
		const b = before(INIT_INDICATOR);
		expect(lt(b, INIT_INDICATOR)).toBe(true);
	});

	it('supports many sequential appends without collision', () => {
		let cur = INIT_INDICATOR;
		const seen = new Set<string>([cur]);
		for (let i = 0; i < 500; i++) {
			cur = after(cur);
			expect(seen.has(cur)).toBe(false);
			seen.add(cur);
		}
	});
});

describe('Indicator invariants under stress', () => {
	it('maintains total order across mixed front/back/inner inserts', () => {
		// Build a sorted list of indicators by repeatedly inserting between
		// existing neighbors (front, back, and inner gaps). Verify every produced
		// midpoint actually lies strictly between its endpoints, and all are distinct.
		const order: string[] = [INIT_INDICATOR];

		// append a few to the back
		for (let i = 0; i < 5; i++) {
			order.push(after(order[order.length - 1]));
		}
		// prepend a few to the front (bounded to stay clear of the floor wall)
		for (let i = 0; i < 3; i++) {
			order.unshift(before(order[0]));
		}

		// insert a midpoint in every adjacent gap
		for (let i = 0; i < order.length - 1; i++) {
			let mid: string;
			try {
				mid = between(order[i], order[i + 1]);
			} catch (e) {
				if (e instanceof Indicator.PrecisionWall) break; // gap exhausted
				throw e;
			}
			expect(lt(order[i], mid)).toBe(true);
			expect(lt(mid, order[i + 1])).toBe(true);
			order.splice(i + 1, 0, mid);
			i++; // skip the newly inserted element
		}

		// the list must remain strictly sorted
		for (let i = 1; i < order.length; i++) {
			expect(lt(order[i - 1], order[i])).toBe(true);
		}
		// all distinct
		expect(new Set(order).size).toBe(order.length);
	});

	it('subdivides a gap until the precision wall, staying ordered throughout', () => {
		// Between two fixed endpoints, keep halving the gap from the top. Each
		// midpoint must stay strictly ordered until the precision wall is reached
		// (a fixed alphabet can only subdivide a gap ~BASE times).
		let lo = '0';
		let hi = '1';
		const seen = new Set<string>([lo, hi]);
		let hitWall = false;
		for (let i = 0; i < 1000; i++) {
			let mid: string;
			try {
				mid = between(lo, hi);
			} catch (e) {
				if (e instanceof Indicator.PrecisionWall) {
					hitWall = true;
					break;
				}
				throw e;
			}
			expect(lt(lo, mid)).toBe(true);
			expect(lt(mid, hi)).toBe(true);
			expect(seen.has(mid)).toBe(false);
			seen.add(mid);
			hi = mid; // keep narrowing from the top
		}
		expect(hitWall).toBe(true);
	});
});
