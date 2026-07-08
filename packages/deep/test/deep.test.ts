import { describe, expect, it } from 'bun:test';

import { getAt, getAtWith, protect } from '@rimbu/deep';
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

describe('protect', () => {
	it('returns same object', () => {
		expect(protect(m)).toBe(m);
	});

	it('returns same primitive values', () => {
		expect(protect(42)).toBe(42);
		expect(protect('hello')).toBe('hello');
		expect(protect(true)).toBe(true);
		expect(protect(null)).toBe(null);
		expect(protect(undefined)).toBe(undefined);
	});

	it('returns same array reference', () => {
		const arr = [1, 2, 3];
		expect(protect(arr)).toBe(arr);
	});

	it('returns same nested object reference', () => {
		expect(protect(m.c)).toBe(m.c);
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
		expect(getAt(m, 'b[0]')).toBe('abc');
		expect(getAt(m, 'b[1]')).toBe(m.b[1]);
		expect(getAt(m, 'b[10]')).toBeUndefined();
	});

	it('gets in nullable array', () => {
		expect(getAt(m, 'c.e?.[0]')).toBe(1);
		expect(getAt(m, 'c.e?.[1]')).toBe('a');
	});

	it('gets in nullable nested value', () => {
		const v = null as null | { a: number };
		expect(getAt(v, '?.a')).toBeUndefined();
	});

	it('returns source for empty path', () => {
		expect(getAt(m, '')).toBe(m);
		expect(getAt(42 as any, '')).toBe(42);
		expect(getAt('hello' as any, '')).toBe('hello');
	});

	it('returns undefined when optional chain hits null', () => {
		const v = { c: { e: null as [number, string] | null } };
		expect(getAt(v, 'c.e?.[0]')).toBeUndefined();
	});

	it('returns undefined when optional chain hits undefined', () => {
		const v = { c: undefined as undefined | { d: boolean } };
		expect(getAt(v, 'c?.d')).toBeUndefined();
	});

	it('gets from Record via string key', () => {
		const rec = { g: { foo: 'bar', baz: 'qux' } };
		expect(getAt(rec, 'g')).toBe(rec.g);
	});

	it('handles deeply nested paths', () => {
		const deep = { a: { b: { c: { d: 42 } } } };
		expect(getAt(deep, 'a.b.c.d')).toBe(42);
	});
});

describe('getAtWith', () => {
	it('gets from input object with given path', () => {
		expect([{ a: 1 }, { a: 2 }].map(getAtWith('a'))).toEqual([1, 2]);
	});

	it('gets nested paths', () => {
		const items = [{ x: { y: 10 } }, { x: { y: 20 } }];
		expect(items.map(getAtWith('x.y'))).toEqual([10, 20]);
	});

	it('gets array elements', () => {
		const items = [{ arr: ['a', 'b'] }, { arr: ['c', 'd'] }];
		expect(items.map(getAtWith('arr[0]'))).toEqual(['a', 'c']);
	});

	it('handles optional chaining returning undefined when null', () => {
		const items = [
			{ v: null as null | { n: number } },
			{ v: { n: 7 } as null | { n: number } },
		];
		expect(items.map(getAtWith('v?.n'))).toEqual([undefined, 7]);
	});
});
