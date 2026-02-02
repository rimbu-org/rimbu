import { describe, expect, it } from 'bun:test';

import { List } from '@rimbu/list';

import { getAt, getAtWith, protect } from '@rimbu/deep';

const m = {
	a: 1,
	b: ['abc', 'def'],
	c: {
		d: true,
		e: [1, 'a'] as [number, string] | null,
	},
	f: List.of(1, 2, 3),
};

type M = typeof m;

describe('protect', () => {
	it('returns same object', () => {
		expect(protect(m)).toBe(m);
	});
});

describe('getAt', () => {
	it('gets simple props', () => {
		expect(getAt(m, 'a')).toBe(1);
		expect(getAt(m, 'b')).toBe(m.b);
		expect(getAt(m, 'c')).toBe(m.c);
		expect(getAt(m, 'f')).toBe(m.f);
		expect(getAt(m, 'c.d')).toBe(true);
		expect(getAt(m, 'c.e')).toBe(m.c.e);
	});

	it('gets in array', () => {
		expect(getAt(m, 'b[1]')).toBe(m.b[1]);
		expect(getAt(m, 'b[10]')).toBeUndefined();
	});

	it('gets in nullable array', () => {
		expect(getAt(m, 'c.e?.[0]')).toBe(1);
	});

	it('gets in nullable nested value', () => {
		const v = null as null | { a: number };
		expect(getAt(v, '?.a')).toBeUndefined();
	});
});

describe('getAtWith', () => {
	it('gets from input object with given path', () => {
		expect([{ a: 1 }, { a: 2 }].map(getAtWith('a'))).toEqual([1, 2]);
	});
});
