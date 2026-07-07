import { describe, expect, it } from 'bun:test';

import {
	match,
	matchAt,
	matchAtWith,
	matchVerbose,
	matchWith,
} from '@rimbu/deep/match';
import { Tuple } from '@rimbu/deep/tuple';
import { List } from '@rimbu/list';
import { SortedMap } from '@rimbu/sorted/map';

describe('match', () => {
	it('matches primitives', () => {
		expect(match(undefined, undefined)).toBe(true);
		expect(match(null, null)).toBe(true);
		expect(match(1, 2)).toBe(false);
		expect(match('a', 'b')).toBe(false);
		expect(match(true, false)).toBe(false);
	});

	it('matches primivies with provider function', () => {
		expect(match(undefined, () => undefined)).toBe(true);
		expect(match(null, () => null)).toBe(true);
		expect(match(1, () => 2)).toBe(false);
		expect(match('a', () => 'b')).toBe(false);
		expect(match(true, () => false)).toBe(false);
	});

	it('matches primitives with multiple matchers', () => {
		expect(match(1, { some: [2, (v) => v > 0] })).toBe(true);
		expect(match(1, { some: [2, (v) => v > 10] })).toBe(false);
	});

	it('matches simple', () => {
		expect(match({ a: 1 }, { a: 1 })).toBe(true);
		expect(match({ a: 1 }, { a: 2 })).toBe(false);
		expect(match({ a: 1 }, { a: (v) => v < 2 })).toBe(true);
		expect(match({ a: 1 }, { a: (v) => v > 2 })).toBe(false);
	});

	it('matches simple with provider function', () => {
		expect(match({ a: 1 }, () => ({ a: 1 }))).toBe(true);
		expect(match({ a: 1 }, () => ({ a: 2 }))).toBe(false);
		expect(match({ a: 1 }, () => ({ a: (v) => v < 2 }))).toBe(true);
		expect(match({ a: 1 }, () => ({ a: (v) => v > 2 }))).toBe(false);
	});

	it('matches deep', () => {
		expect(match({ a: { b: 1, c: 2 } }, { a: { b: 1 } })).toBe(true);
		expect(match({ a: { b: 1, c: 2 } }, { a: { b: 2 } })).toBe(false);
		expect(match({ a: { b: 1, c: 2 } }, { a: { b: (v) => v < 2 } })).toBe(true);
		expect(match({ a: { b: 1, c: 2 } }, { a: { b: (v) => v > 2 } })).toBe(
			false,
		);
	});

	it('matches deep with provider function', () => {
		expect(match({ a: { b: 1, c: 2 } }, () => ({ a: { b: 1 } }))).toBe(true);
		expect(match({ a: { b: 1, c: 2 } }, () => ({ a: { b: 2 } }))).toBe(false);
		expect(
			match({ a: { b: 1, c: 2 } }, () => ({ a: { b: (v) => v < 2 } })),
		).toBe(true);
		expect(
			match({ a: { b: 1, c: 2 } }, () => ({ a: { b: (v) => v > 2 } })),
		).toBe(false);
	});

	it('matches null', () => {
		expect(match({ v: null as null }, {})).toBe(true);
		expect(match({ v: null as null }, { v: null })).toBe(true);
		expect(match({ v: { a: 1 } as { a: number } | null }, { v: null })).toBe(
			false,
		);
		expect(
			match({ v: null as { a: number } | null }, { v: (q) => q?.a === 1 }),
		).toBe(false);
	});

	it('matches undefined', () => {
		expect(match({ v: undefined as undefined }, { v: undefined })).toBe(true);
		expect(match({ v: undefined as undefined }, { v: () => undefined })).toBe(
			true,
		);
		expect(
			match(
				{ v: { a: 1 } as { a: number } | undefined },
				{
					v: undefined,
				},
			),
		).toBe(false);
	});

	it('handles array', () => {
		expect(match({ s: [1] }, { s: [] })).toBe(false);
		expect(match({ s: [1, 2, 3] }, { s: [1, 2, 3] })).toBe(true);
		expect(match({ s: [1, 2, 3] }, { s: [1, 2, 4] })).toBe(false);
		expect(match({ s: [1] }, { s: [1, 2] })).toBe(false);
		expect(match({ s: [1] }, { s: (v) => v.length > 3 })).toBe(false);
		expect(match({ s: [1] }, { s: (v) => v.length < 3 })).toBe(true);
		expect(match({ s: [1, 2, 3] }, { s: { 1: 2, 2: 3 } })).toBe(true);
		expect(match({ s: [1, 2, 3] }, { s: { 1: 2, 3: 5 } })).toBe(false);
		expect(match({ s: [1, 2, 3] }, { s: { some: [{ 0: 1 }, { 1: 3 }] } })).toBe(
			true,
		);
		expect(
			match({ s: [1, 2, 3] }, { s: { every: [{ 0: 1 }, { 1: 3 }] } }),
		).toBe(false);
		expect(match({ s: [1, 2, 3] }, { s: { none: [{ 0: 1 }, { 1: 3 }] } })).toBe(
			false,
		);
		expect(
			match({ s: [1, 2, 3] }, { s: { single: [{ 0: 1 }, { 1: 3 }] } }),
		).toBe(true);
	});

	it('handles deep array', () => {
		const values = [
			{ x: [1, 2, 3], y: 6 },
			{ x: [10, 11], y: 10 },
		];
		expect(match(values, values)).toBe(true);
		expect(match(values, [{ x: { 0: 1 } }, { y: 10 }])).toBe(true);
		expect(match(values, [{ x: { 0: 1 } }, { y: 12 }])).toBe(false);

		expect(match(values, { someItem: { x: { someItem: 2 } } })).toBe(true);
		expect(match(values, { someItem: { x: { someItem: 0 } } })).toBe(false);

		expect(match(values, { someItem: { y: (v) => v > 8 } })).toBe(true);
		expect(match(values, { everyItem: { y: (v) => v > 8 } })).toBe(false);
	});

	it('handles array traversal', () => {
		const values = [
			{ a: 1, b: 2 },
			{ a: 3, b: 4 },
		];

		expect(match(values, { someItem: { a: 0 } })).toBe(false);
		expect(match(values, { someItem: { a: 3 } })).toBe(true);

		expect(match(values, { everyItem: { a: 1 } })).toBe(false);
		expect(match(values, { everyItem: { a: (v) => v > 0 } })).toBe(true);

		expect(match(values, { noneItem: { a: 1 } })).toBe(false);
		expect(match(values, { noneItem: { a: 0 } })).toBe(true);

		expect(match(values, { singleItem: { a: 1 } })).toBe(true);
		expect(match(values, { singleItem: { a: 0 } })).toBe(false);
		expect(match(values, { singleItem: { a: (v) => v > 0 } })).toBe(false);

		expect(
			match(
				{ values },
				{
					values: {
						everyItem: (v, p, r) => p[0].a === r.values[0].a,
					},
				},
			),
		).toBe(true);
	});

	it('handles tuples', () => {
		expect(
			match({ s: Tuple.of(true, { q: 5 }) }, { s: Tuple.of(true, { q: 5 }) }),
		).toBe(true);
		expect(match({ s: Tuple.of(true, { q: 5 }) }, { s: { 0: true } })).toBe(
			true,
		);
		expect(match({ s: Tuple.of(true, { q: 5 }) }, { s: { 1: { q: 5 } } })).toBe(
			true,
		);
		expect(match({ s: Tuple.of(true, { q: 5 }) }, { s: { 1: { q: 3 } } })).toBe(
			false,
		);
		expect(
			match({ s: Tuple.of(true, { q: 5 }) }, () => ({
				s: { 1: { q: (v: number) => v > 3 } },
			})),
		).toBe(true);
		expect(
			match({ s: Tuple.of(true, { q: 5 }) }, () => ({
				s: { 1: { q: (v: number) => v < 3 } },
			})),
		).toBe(false);
	});

	it('matches object', () => {
		const obj = {
			value: 1,
			nested: { prop1: 'a', prop2: true },
			nested2: { foo: [5] },
		};

		expect(match(obj, { value: 1 })).toBe(true);
		expect(match(obj, { value: 2 })).toBe(false);
		expect(match(obj, { value: (v) => v > 0 })).toBe(true);
		expect(match(obj, { value: (v) => v < 0 })).toBe(false);
		expect(match(obj, { nested: { prop1: 'a' } })).toBe(true);
		expect(match(obj, { nested: { prop1: 'b' } })).toBe(false);
		expect(match(obj, { nested: { prop1: (v) => v.length > 0 } })).toBe(true);
		expect(match(obj, { nested: { prop1: (v) => v.length === 0 } })).toBe(
			false,
		);
		expect(
			match(obj, { nested: { prop1: (_, p) => p.prop1.length > 0 } }),
		).toBe(true);
		expect(
			match(obj, { nested: { prop1: (_, p) => p.prop1.length === 0 } }),
		).toBe(false);
		expect(
			match(obj, {
				nested: { prop1: (_, __, r) => r.nested.prop1.length > 0 },
			}),
		).toBe(true);
		expect(
			match(obj, {
				nested: { prop1: (_, __, r) => r.nested.prop1.length === 0 },
			}),
		).toBe(false);
		expect(match(obj, { value: () => 2 })).toBe(false);
	});

	it('matches function', () => {
		const f = () => 1;
		expect(match({ a: { b: f } }, { a: { b: f } })).toBe(true);
		expect(match({ a: { b: f } }, { a: () => ({ b: f }) })).toBe(true);
		expect(match({ a: { b: f } }, { a: () => ({ b: () => 1 }) })).toBe(false);
		expect(match({ a: { b: f } }, { a: (v) => v.b === (() => 1) })).toBe(false);
	});

	it('matches list', () => {
		const l = List.of(1);
		expect(match({ s: l }, { s: l })).toBe(true);
		expect(match({ s: l }, { s: () => l })).toBe(true);
		expect(match({ s: l }, { s: List.of(1) })).toBe(false);
		expect(match({ s: l }, { s: (v) => v.stream().equals(List.of(1)) })).toBe(
			true,
		);
	});

	it('matches map', () => {
		const obj = {
			personAge: SortedMap.of(['Jim', 25], ['Bob', 56]),
		};
		expect(
			match(obj, {
				personAge: (l) => l.size > 0,
			}),
		).toBe(true);
		expect(
			match(obj, {
				personAge: (l) => l.size === 0,
			}),
		).toBe(false);
		expect(
			match(obj, {
				personAge: SortedMap.of(['Jim', 25], ['Bob', 56]),
			}),
		).toBe(false);
	});

	it('matches some matchers using the `some` provider', () => {
		expect(match({ a: 1 }, [{ some: [{ a: 1 }, { a: (v) => v > 0 }] }])).toBe(
			true,
		);
		expect(match({ a: 1 }, [{ some: [{ a: 2 }, { a: (v) => v > 0 }] }])).toBe(
			true,
		);
		expect(match({ a: 1 }, [{ some: [{ a: 1 }, { a: (v) => v > 10 }] }])).toBe(
			true,
		);
		expect(match({ a: 1 }, [{ some: [{ a: 2 }, { a: (v) => v > 10 }] }])).toBe(
			false,
		);
	});

	it('matches every matchers using the `every` provider', () => {
		expect(match({ a: 1 }, [{ every: [{ a: 1 }, { a: (v) => v > 0 }] }])).toBe(
			true,
		);
		expect(match({ a: 1 }, [{ every: [{ a: 2 }, { a: (v) => v > 0 }] }])).toBe(
			false,
		);
		expect(match({ a: 1 }, [{ every: [{ a: 1 }, { a: (v) => v > 10 }] }])).toBe(
			false,
		);
		expect(match({ a: 1 }, [{ every: [{ a: 2 }, { a: (v) => v > 10 }] }])).toBe(
			false,
		);
	});

	it('matches none matchers using the `none` provider', () => {
		expect(match({ a: 1 }, [{ none: [{ a: 1 }, { a: (v) => v > 0 }] }])).toBe(
			false,
		);
		expect(match({ a: 1 }, [{ none: [{ a: 2 }, { a: (v) => v > 0 }] }])).toBe(
			false,
		);
		expect(match({ a: 1 }, [{ none: [{ a: 1 }, { a: (v) => v > 10 }] }])).toBe(
			false,
		);
		expect(match({ a: 1 }, [{ none: [{ a: 2 }, { a: (v) => v > 10 }] }])).toBe(
			true,
		);
	});

	it('matches one matcher using the `single` provider', () => {
		match(1, () => ({ single: [1, (v) => v > 2] }));

		expect(match({ a: 1 }, [{ single: [{ a: 1 }, { a: (v) => v > 0 }] }])).toBe(
			false,
		);
		expect(match({ a: 1 }, [{ single: [{ a: 2 }, { a: (v) => v > 0 }] }])).toBe(
			true,
		);
		expect(
			match({ a: 1 }, [{ single: [{ a: 1 }, { a: (v) => v > 10 }] }]),
		).toBe(true);
		expect(
			match({ a: 1 }, [{ single: [{ a: 2 }, { a: (v) => v > 10 }] }]),
		).toBe(false);
	});

	it('matches booleans', () => {
		expect(match({ a: true }, { a: true })).toBe(true);
		expect(match({ a: true }, { a: false })).toBe(false);
		expect(match({ a: false }, { a: false })).toBe(true);
		expect(match({ a: false }, { a: true })).toBe(false);

		expect(match({ a: true }, { a: () => true })).toBe(true);
		expect(match({ a: true }, { a: () => false })).toBe(false);
		expect(match({ a: false }, { a: () => false })).toBe(false);
		expect(match({ a: false }, { a: () => true })).toBe(true);
	});

	it('matches non-plain data objects', () => {
		class B {
			constructor(readonly b: number) {}
		}
		const cls1 = new B(1);
		const cls2 = new B(2);

		expect(match({ a: cls1 }, { a: cls1 })).toBe(true);
		expect(match({ a: cls1 }, { a: cls2 })).toBe(false);
	});

	it('matches source objects that are not plain objects by reference', () => {
		class B {
			b: number;
			constructor(b: number) {
				this.b = b;
			}
		}
		const cls = new B(1);

		expect(
			match(
				{
					a: cls,
				},
				{ a: { b: 1 } },
			),
		).toBe(false);

		expect(
			match(
				{
					a: { b: 1 },
				},
				{ a: cls },
			),
		).toBe(true);
	});

	it('always returns false when receiving match keys that are not in the source object', () => {
		expect(match({ a: 1 }, { a: 1, b: 1 } as any)).toEqual(false);
		expect(match({ a: 1 }, () => ({ a: 1, b: 1 }) as any)).toEqual(false);
	});
});

describe('matchAt', () => {
	const m = {
		a: 1,
		b: ['abc', 'def'],
		c: {
			d: true,
			e: [1, 'a'] as [number, string] | null,
		},
		f: List.of(1, 2, 3),
	};

	it('matches at path', () => {
		expect(matchAt(m, 'a', 1)).toBe(true);
		expect(matchAt(m, 'a', 3)).toBe(false);
		expect(matchAt(m, 'c', { d: true })).toBe(true);
		expect(matchAt(m, 'c', { d: false })).toBe(false);
	});
});

describe('matchAtWith', () => {
	it('matches input object at path', () => {
		expect(
			[{ a: { b: 'a', c: 1 } }, { a: { b: 'b', c: 2 } }].filter(
				matchAtWith('a', { c: 2 }),
			),
		).toEqual([{ a: { b: 'b', c: 2 } }]);
	});
});

describe('matchWith', () => {
	it('returns a predicate that matches objects', () => {
		const isA1 = matchWith({ a: 1 });
		expect(isA1({ a: 1 })).toBe(true);
		expect(isA1({ a: 2 })).toBe(false);
	});

	it('returns a predicate that can be used with array filter', () => {
		const items = [{ a: 1 }, { a: 2 }, { a: 1 }];
		expect(items.filter(matchWith({ a: 1 }))).toEqual([{ a: 1 }, { a: 1 }]);
	});

	it('returns a predicate for primitive matchers', () => {
		const isPositive = matchWith<number>((v: number) => v > 0);
		expect(isPositive(5)).toBe(true);
		expect(isPositive(-1)).toBe(false);
	});
});

describe('matchVerbose', () => {
	it('returns result true and empty log on match', () => {
		const { result, failureLog } = matchVerbose({ a: 1 }, { a: 1 });
		expect(result).toBe(true);
		expect(failureLog).toEqual([]);
	});

	it('returns result false and non-empty log on mismatch', () => {
		const { result, failureLog } = matchVerbose({ a: 1 }, { a: 2 });
		expect(result).toBe(false);
		expect(failureLog.length).toBeGreaterThan(0);
	});

	it('logs failure for wrong primitive value', () => {
		const { result, failureLog } = matchVerbose(1, 2);
		expect(result).toBe(false);
		expect(failureLog.some((msg) => msg.includes('1'))).toBe(true);
	});

	it('logs failure for missing key in source', () => {
		const { result, failureLog } = matchVerbose(
			{ a: 1 } as any,
			{ a: 1, b: 2 } as any,
		);
		expect(result).toBe(false);
		expect(failureLog.some((msg) => msg.includes('b'))).toBe(true);
	});

	it('logs failure for null matcher mismatch', () => {
		const { result, failureLog } = matchVerbose(1 as any, null as any);
		expect(result).toBe(false);
		expect(failureLog.length).toBeGreaterThan(0);
	});

	it('logs failure for compound mismatch', () => {
		const { result, failureLog } = matchVerbose({ a: 1 }, [
			{ every: [{ a: 1 }, { a: 2 }] },
		]);
		expect(result).toBe(false);
		expect(failureLog.length).toBeGreaterThan(0);
	});
});

describe('match — customMatch compound', () => {
	it('uses getResult to determine pass/fail', () => {
		// pass if at least 1 matcher passes
		const atLeastOne = (pass: number) => pass >= 1;

		expect(
			match({ a: 1 }, [
				{
					customMatch: {
						matchers: [{ a: 1 }, { a: 2 }],
						getResult: atLeastOne,
					},
				},
			]),
		).toBe(true); // 1 pass (a:1 matches), 1 fail

		expect(
			match({ a: 1 }, [
				{
					customMatch: {
						matchers: [{ a: 2 }, { a: 3 }],
						getResult: atLeastOne,
					},
				},
			]),
		).toBe(false); // 0 pass

		// pass if strictly more passes than fails
		const majority = (pass: number, fail: number) => pass > fail;

		expect(
			match({ a: 1 }, [
				{
					customMatch: {
						matchers: [{ a: 1 }, { a: 1 }, { a: 2 }],
						getResult: majority,
					},
				},
			]),
		).toBe(true); // 2 pass, 1 fail

		expect(
			match({ a: 1 }, [
				{
					customMatch: {
						matchers: [{ a: 2 }, { a: 2 }, { a: 1 }],
						getResult: majority,
					},
				},
			]),
		).toBe(false); // 1 pass, 2 fail
	});

	it('halts early when halt condition is met', () => {
		let evaluations = 0;
		const countingMatcher = (v: { a: number }) => {
			evaluations++;
			return v.a === 999;
		};

		match({ a: 1 }, [
			{
				customMatch: {
					matchers: [countingMatcher, countingMatcher, countingMatcher],
					getResult: (pass) => pass > 0,
					halt: (pass) => pass > 0,
				},
			},
		]);

		// halt triggers after first pass; all 3 fail (a !== 999) so no halt fires,
		// all 3 are evaluated
		expect(evaluations).toBe(3);

		evaluations = 0;
		match({ a: 999 }, [
			{
				customMatch: {
					matchers: [countingMatcher, countingMatcher, countingMatcher],
					getResult: (pass) => pass > 0,
					halt: (pass) => pass > 0,
				},
			},
		]);

		// first matcher passes -> halt fires -> only 1 evaluated
		expect(evaluations).toBe(1);
	});

	it('customMatch with optional halt not provided evaluates all matchers', () => {
		let evaluations = 0;
		const counter = () => {
			evaluations++;
			return false;
		};

		match(1, {
			customMatch: {
				matchers: [counter, counter, counter],
				getResult: (pass) => pass > 0,
			},
		});

		expect(evaluations).toBe(3);
	});
});

describe('match — customMatchItem traversal', () => {
	it('uses getResult to determine pass/fail over array items', () => {
		const values = [1, 2, 3, 4, 5];

		// pass if more than half of items are > 2
		expect(
			match(values, {
				customMatchItem: {
					matcher: (v: number) => v > 2,
					getResult: (pass: number, fail: number) => pass > fail,
				},
			}),
		).toBe(true); // 3 pass, 2 fail

		// pass if all items > 0
		expect(
			match(values, {
				customMatchItem: {
					matcher: (v: number) => v > 0,
					getResult: (pass: number, fail: number) => fail === 0,
				},
			}),
		).toBe(true);

		expect(
			match(values, {
				customMatchItem: {
					matcher: (v: number) => v > 10,
					getResult: (pass: number) => pass > 0,
				},
			}),
		).toBe(false); // none pass
	});

	it('halts early when halt condition is met', () => {
		let evaluations = 0;
		const counter = (v: number) => {
			evaluations++;
			return v > 0;
		};

		match([1, 2, 3], {
			customMatchItem: {
				matcher: counter,
				getResult: (pass: number) => pass > 0,
				halt: (pass: number) => pass > 0,
			},
		});

		// first item passes -> halt fires
		expect(evaluations).toBe(1);
	});
});

describe('match — Object.is edge cases', () => {
	it('treats NaN as equal to NaN', () => {
		expect(match(Number.NaN, Number.NaN)).toBe(true);
		expect(match({ a: Number.NaN }, { a: Number.NaN })).toBe(true);
	});

	it('distinguishes +0 and -0', () => {
		// Object.is(-0, 0) is false
		expect(match(-0, 0)).toBe(false);
		expect(match(0, -0)).toBe(false);
		expect(match(-0, -0)).toBe(true);
		expect(match(0, 0)).toBe(true);
	});
});

describe('match — compound on primitives', () => {
	it('applies every/some/none/single directly to a primitive source', () => {
		expect(match(5, { every: [5, (v: number) => v > 0] })).toBe(true);
		expect(match(5, { every: [5, (v: number) => v > 10] })).toBe(false);

		expect(match(5, { some: [3, (v: number) => v > 0] })).toBe(true);
		expect(match(5, { some: [3, (v: number) => v > 10] })).toBe(false);

		expect(match(5, { none: [3, (v: number) => v > 10] })).toBe(true);
		expect(match(5, { none: [5, (v: number) => v > 0] })).toBe(false);

		expect(match(5, { single: [3, (v: number) => v > 0] })).toBe(true);
		expect(match(5, { single: [5, (v: number) => v > 0] })).toBe(false);
		expect(match(5, { single: [3, (v: number) => v > 10] })).toBe(false);
	});
});

describe('match — empty compound arrays', () => {
	it('every with empty array is vacuously true', () => {
		expect(match({ a: 1 }, [{ every: [] }])).toBe(true);
		expect(match(1, { every: [] })).toBe(true);
	});

	it('some with empty array is false (no matchers to pass)', () => {
		expect(match({ a: 1 }, [{ some: [] }])).toBe(false);
		expect(match(1, { some: [] })).toBe(false);
	});

	it('none with empty array is true (nothing passed)', () => {
		expect(match({ a: 1 }, [{ none: [] }])).toBe(true);
		expect(match(1, { none: [] })).toBe(true);
	});

	it('single with empty array is false (exactly 1 required, 0 passed)', () => {
		expect(match({ a: 1 }, [{ single: [] }])).toBe(false);
		expect(match(1, { single: [] })).toBe(false);
	});
});

describe('match — function matcher returning a matcher value', () => {
	it('re-evaluates the returned matcher object against the source', () => {
		// Function returns an object matcher which is then evaluated against source
		expect(match({ a: 1 }, () => ({ a: 1 }))).toBe(true);
		expect(match({ a: 1 }, () => ({ a: 2 }))).toBe(false);
	});

	it('re-evaluates the returned compound against the source', () => {
		expect(
			match({ a: 1 }, () => [
				{ every: [{ a: 1 }, { a: (v: number) => v > 0 }] },
			]),
		).toBe(true);
		expect(match({ a: 1 }, () => [{ some: [{ a: 2 }, { a: 3 }] }])).toBe(false);
	});

	it('re-evaluates a returned primitive matcher against a primitive source', () => {
		// Returning a value from a function re-dispatches
		expect(match(5, (v) => (v > 0 ? 5 : 99))).toBe(true);
		expect(match(5, (v) => (v > 0 ? 99 : 5))).toBe(false);
	});
});

describe('match — sparse array index matching', () => {
	it('returns false when index does not exist in source', () => {
		expect(match([1, 2], { 5: 1 })).toBe(false);
	});

	it('matches undefined at an index beyond array length', () => {
		// index 5 is out of bounds but still "in" the array object only as undefined
		// matchArr checks `index in source` — for arrays, numeric indices beyond length
		// are NOT in the array, so it should return false
		expect(match([1, 2, 3], { 10: undefined })).toBe(false);
	});
});

describe('match — function source matching', () => {
	it('returns true only when matcher is the exact same function reference', () => {
		const fn = () => 42;
		expect(match({ a: fn }, { a: fn })).toBe(true);
	});

	it('returns false for different function references even if logically equivalent', () => {
		const fn1 = () => 42;
		const fn2 = () => 42;
		expect(match({ a: fn1 }, { a: fn2 })).toBe(false);
	});

	it('returns false when using a different function reference of the same type', () => {
		// Function sources are matched by reference only; two independently created
		// functions with the same signature and body are not equal
		const fn1 = () => 42;
		const fn2 = () => 42;
		expect(fn1 === fn2).toBe(false);
		expect(match({ a: fn1 }, { a: fn2 })).toBe(false);
	});
});

describe('matchAt — additional paths', () => {
	const obj = {
		a: 1,
		b: { c: 2, d: { e: 'hello' } },
		arr: [10, 20, 30],
	};

	it('matches at a nested path', () => {
		expect(matchAt(obj, 'b.c', 2)).toBe(true);
		expect(matchAt(obj, 'b.c', 99)).toBe(false);
	});

	it('matches at a deeply nested path', () => {
		expect(matchAt(obj, 'b.d', { e: 'hello' })).toBe(true);
		expect(matchAt(obj, 'b.d', { e: 'world' })).toBe(false);
	});

	it('matches with a function matcher at a path', () => {
		expect(matchAt(obj, 'a', (v) => v > 0)).toBe(true);
		expect(matchAt(obj, 'a', (v) => v > 10)).toBe(false);
	});

	it('matches array value at a path', () => {
		expect(matchAt(obj, 'arr', { someItem: 20 })).toBe(true);
		expect(matchAt(obj, 'arr', { everyItem: (v: number) => v > 5 })).toBe(true);
		expect(matchAt(obj, 'arr', { everyItem: (v: number) => v > 25 })).toBe(
			false,
		);
	});
});
