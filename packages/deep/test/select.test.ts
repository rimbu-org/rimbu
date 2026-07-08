import { describe, expect, it } from 'bun:test';

import { select, selectAt, selectAtWith, selectWith } from '@rimbu/deep/select';
import { List } from '@rimbu/list';

const m = {
	a: 1,
	b: ['abc', 'def'],
	c: {
		d: true,
		e: [1, 'a'] as [number, string] | null,
	},
	f: List.of(1, 2, 3),
};

describe('select', () => {
	it('select', () => {
		expect(select(m, 'a')).toBe(1);
		expect(select(m, ['a', 'b[0]'] as const)).toEqual([1, 'abc']);
		expect(select(m, { a: 'a', b: 'c.e?.[0]' })).toEqual({ a: 1, b: 1 });
	});

	it('select simple', () => {
		expect(select(m, 'a')).toBe(1);
		expect(select(m, 'b')).toBe(m.b);
		expect(select(m, 'c')).toBe(m.c);
		expect(select(m, 'f')).toBe(m.f);
		expect(select(m, 'c.d')).toBe(m.c.d);
		expect(select(m, 'c.e')).toBe(m.c.e);
	});

	it('select function', () => {
		expect(select(m, (v) => v.b)).toBe(m.b);
		expect(select(m, (v) => v.c)).toBe(m.c);
		expect(select(m, (v) => v.f)).toBe(m.f);
		expect(select(m, (v) => v.c.d)).toBe(m.c.d);
		expect(select(m, (v) => v.c.e)).toBe(m.c.e);
		expect(select(m, (v) => v.a + 1)).toBe(2);
	});

	it('select complex', () => {
		expect(select(m, { m: 'a' })).toEqual({ m: 1 });
		expect(select(m, { m: 'a', q: 'c.d' })).toEqual({ m: 1, q: true });
		expect(select(m, { m: 'a', q: { n: 'c.d' } })).toEqual({
			m: m.a,
			q: { n: m.c.d },
		});
		expect(select(m, [])).toEqual([]);
		expect(select(m, ['a'])).toEqual([m.a]);
		expect(select(m, ['a', 'c.d'])).toEqual([m.a, m.c.d]);
		expect(select(m, ['a', { q: 'c.d' }])).toEqual([m.a, { q: m.c.d }]);
		expect(select(m, { h: ['a', { q: 'c.d' }] })).toEqual({
			h: [m.a, { q: m.c.d }],
		});
		expect(
			select(m, {
				h: ['a', (v) => v.a + 1, { q: 'c.d' }],
			}),
		).toEqual({
			h: [m.a, m.a + 1, { q: m.c.d }],
		});
	});
});

describe('selectAt', () => {
	it('selectAt simple', () => {
		const q = { m };

		expect(selectAt(q, 'm', 'a')).toBe(1);
		expect(selectAt(q, 'm', 'b')).toBe(m.b);
		expect(selectAt(q, 'm', 'c')).toBe(m.c);
		expect(selectAt(q, 'm', 'f')).toBe(m.f);
		expect(selectAt(q, 'm', 'c.d')).toBe(m.c.d);
		expect(selectAt(q, 'm', 'c.e')).toBe(m.c.e);
	});

	it('selectAt complex', () => {
		const q = { m };

		expect(selectAt(q, 'm', { m: 'a' })).toEqual({ m: 1 });
		expect(selectAt(q, 'm', { m: 'a', q: 'c.d' })).toEqual({
			m: 1,
			q: true,
		});
		expect(selectAt(q, 'm', { m: 'a', q: { n: 'c.d' } })).toEqual({
			m: m.a,
			q: { n: m.c.d },
		});
		expect(selectAt(q, 'm', [])).toEqual([]);
		expect(selectAt(q, 'm', ['a'])).toEqual([m.a]);
		expect(selectAt(q, 'm', ['a', 'c.d'])).toEqual([m.a, m.c.d]);
		expect(selectAt(q, 'm', ['a', { q: 'c.d' }])).toEqual([m.a, { q: m.c.d }]);
		expect(selectAt(q, 'm', { h: ['a', { q: 'c.d' }] })).toEqual({
			h: [m.a, { q: m.c.d }],
		});
		expect(
			selectAt(q, 'm', {
				h: ['a', (v) => v.a + 1, { q: 'c.d' }],
			}),
		).toEqual({
			h: [m.a, m.a + 1, { q: m.c.d }],
		});
	});
});

describe('select: object selector only visits own enumerable keys', () => {
	it('does not include inherited enumerable properties', () => {
		const proto = { inherited: 'a' };
		const selector = Object.create(proto) as { own: 'a' };
		selector.own = 'a';
		// 'inherited' is on the prototype — for...in would visit it, Object.keys() does not
		expect(select(m, selector)).toEqual({ own: 1 });
		expect(select(m, selector)).not.toHaveProperty('inherited');
	});
});

describe('select: edge cases', () => {
	it('select with array index path', () => {
		expect(select(m, 'b[0]')).toBe('abc');
		expect(select(m, 'b[1]')).toBe('def');
	});

	it('select with optional chaining on nullable value', () => {
		expect(select(m, 'c.e?.[0]')).toBe(1);
		const mNull: typeof m = { ...m, c: { ...m.c, e: null } };
		expect(select(mNull, 'c.e?.[0]')).toBeUndefined();
	});

	it('select with 3-level deep path', () => {
		const deep = { a: { b: { c: { d: 99 } } } };
		expect(select(deep, 'a.b.c.d')).toBe(99);
		expect(select(deep, { x: 'a.b.c' })).toEqual({ x: { d: 99 } });
	});

	it('select with empty object selector', () => {
		// Empty object selector: picks no keys, returns {}
		// Use a typed empty object explicitly
		type EmptySel = Record<string, never>;
		const emptySelector = {} as EmptySel;
		expect(select(m, emptySelector)).toEqual({});
	});
});

describe('selectWith', () => {
	it('selects from input object', () => {
		expect(
			[{ a: { b: 'a', c: 1 } }, { a: { b: 'b', c: 2 } }].map(
				selectWith({ x: ['a.b'], y: { c: 'a.c' } }),
			),
		).toEqual([
			{ x: ['a'], y: { c: 1 } },
			{ x: ['b'], y: { c: 2 } },
		]);
	});

	it('selectWith with path string selector', () => {
		const fn = selectWith<typeof m, 'a'>('a');
		expect(fn(m)).toBe(1);
		const m2: typeof m = { ...m, a: 42 };
		expect([m, m2].map(fn)).toEqual([1, 42]);
	});

	it('selectWith with function selector', () => {
		const fn = selectWith<typeof m, (v: any) => number>((v: any) => v.a + 10);
		expect(fn(m)).toBe(11);
		expect([m, m].map(fn)).toEqual([11, 11]);
	});

	it('selectWith with tuple selector', () => {
		const fn = selectWith<typeof m, readonly ['a', 'c.d']>(['a', 'c.d'] as const);
		expect(fn(m)).toEqual([m.a, m.c.d]);
	});

	it('selectWith returns reusable function', () => {
		const fn = selectWith<typeof m, { v: 'a' }>({ v: 'a' });
		const input1: typeof m = { ...m, a: 10 };
		const input2: typeof m = { ...m, a: 20 };
		expect(fn(input1)).toEqual({ v: 10 });
		expect(fn(input2)).toEqual({ v: 20 });
		expect(fn(input1)).toEqual({ v: 10 });
	});
});

describe('selectAtWith', () => {
	it('selects from input object at given path', () => {
		expect(
			[{ a: { b: 'a', c: 1 } }, { a: { b: 'b', c: 2 } }].map(
				selectAtWith('a', { x: ['b'], y: { c: 'c' } }),
			),
		).toEqual([
			{ x: ['a'], y: { c: 1 } },
			{ x: ['b'], y: { c: 2 } },
		]);
	});

	it('selectAtWith with path string sub-selector', () => {
		type Q = { m: typeof m };
		const q: Q = { m };
		const fn = selectAtWith<Q, 'm', 'a'>('m', 'a');
		expect(fn(q)).toBe(1);
		expect([q, { m: { ...m, a: 5 } }].map(fn)).toEqual([1, 5]);
	});

	it('selectAtWith with function sub-selector', () => {
		type Q = { m: typeof m };
		const q: Q = { m };
		const fn = selectAtWith<Q, 'm', (v: any) => number>('m', (v: any) => v.a + 1);
		expect(fn(q)).toBe(2);
	});

	it('selectAtWith with tuple sub-selector', () => {
		type Q = { m: typeof m };
		const q: Q = { m };
		const fn = selectAtWith<Q, 'm', readonly ['a', 'c.d']>('m', ['a', 'c.d'] as const);
		expect(fn(q)).toEqual([m.a, m.c.d]);
		expect([q, q].map(fn)).toEqual([
			[m.a, m.c.d],
			[m.a, m.c.d],
		]);
	});
});
