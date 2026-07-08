import { describe, expect, it } from 'bun:test';

import { getAt, getAtWith } from '@rimbu/deep';
import { List } from '@rimbu/list';

const m = {
	a: 1,
	b: ['abc', 'def'],
	c: {
		d: true,
		e: [1, 'a'] as [number, string] | null,
		f: null as string | null,
	},
	g: List.of(1, 2, 3),
	h: { i: 42 } as { i: number } | null,
};

describe('getAt', () => {
	it('gets simple props', () => {
		expect(getAt(m, '')).toBe(m);
		expect(getAt(m, 'a')).toBe(1);
		expect(getAt(m, 'b')).toBe(m.b);
		expect(getAt(m, 'c')).toBe(m.c);
		expect(getAt(m, 'g')).toBe(m.g);
		expect(getAt(m, 'c.d')).toBe(true);
		expect(getAt(m, 'c.e')).toBe(m.c.e);
	});

	it('gets nested object props', () => {
		expect(getAt(m, 'c.d')).toBe(true);
		expect(getAt(m, 'c.f')).toBeNull();
		expect(getAt(m, 'h')).toBe(m.h);
	});

	it('gets in array', () => {
		expect(getAt(m, 'b[0]')).toBe('abc');
		expect(getAt(m, 'b[1]')).toBe(m.b[1]);
		expect(getAt(m, 'b[10]')).toBeUndefined();
	});

	it('gets in union-element array', () => {
		const arr = [true, 'hello'] as Array<string | boolean>;
		expect(getAt(arr, '[0]')).toBe(true);
		expect(getAt(arr, '[1]')).toBe('hello');
		expect(getAt(arr, '[99]')).toBeUndefined();
	});

	it('gets in nullable array when non-null', () => {
		expect(getAt(m, 'c.e?.[0]')).toBe(1);
		expect(getAt(m, 'c.e?.[1]')).toBe('a');
	});

	it('gets in nullable array when null — returns undefined', () => {
		const mNull = { ...m, c: { ...m.c, e: null as [number, string] | null } };
		expect(getAt(mNull, 'c.e?.[0]')).toBeUndefined();
		expect(getAt(mNull, 'c.e?.[1]')).toBeUndefined();
	});

	it('gets in nullable nested value when non-null', () => {
		expect(getAt(m, 'h?.i')).toBe(42);
	});

	it('gets in nullable nested value when null — returns undefined', () => {
		const mNull = { ...m, h: null as { i: number } | null };
		expect(getAt(mNull, 'h?.i')).toBeUndefined();
	});

	it('gets in nullable nested value at root', () => {
		const v = null as null | { a: number };
		expect(getAt(v, '?.a')).toBeUndefined();
	});

	it('gets in nullable nested value at root when non-null', () => {
		const v = { a: 7 } as null | { a: number };
		expect(getAt(v, '?.a')).toBe(7);
	});
});

describe('getAtWith', () => {
	it('returns a function that gets the value at the given path', () => {
		const getA = getAtWith<typeof m, 'a'>('a');
		expect(getA(m)).toBe(1);
	});

	it('works for nested paths', () => {
		const getCD = getAtWith<typeof m, 'c.d'>('c.d');
		expect(getCD(m)).toBe(true);
	});

	it('works for optional chaining paths', () => {
		const getHI = getAtWith<typeof m, 'h?.i'>('h?.i');
		expect(getHI(m)).toBe(42);

		const mNull = { ...m, h: null as { i: number } | null };
		expect(getHI(mNull)).toBeUndefined();
	});

	it('works for array indexing', () => {
		const getB0 = getAtWith<typeof m, 'b[0]'>('b[0]');
		expect(getB0(m)).toBe('abc');
	});

	it('can be used in Array.map', () => {
		const items = [{ a: 1 }, { a: 2 }, { a: 3 }];
		const result = items.map(getAtWith('a'));
		expect(result).toEqual([1, 2, 3]);
	});
});
