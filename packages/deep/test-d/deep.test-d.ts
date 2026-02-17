import { expectTypeOf } from 'bun:test';

import type { List } from '@rimbu/list';

import { getAt, getAtWith } from '@rimbu/deep';
import { match, matchAt, matchAtWith, matchWith } from '@rimbu/deep/match';
import { patch, patchAt, patchAtWith, patchWith } from '@rimbu/deep/patch';
import { select, selectAt, selectAtWith, selectWith } from '@rimbu/deep/select';

let m!: {
	a: number;
	b: string[];
	c: {
		d: boolean;
		e: [number, string] | null;
	};
	f: List.NonEmpty<number>;
	g: Record<string, string>;
};
type M = typeof m;

expectTypeOf(getAt(m, 'a')).toEqualTypeOf<number>();

expectTypeOf(patch(m, [{ a: 3 }])).toEqualTypeOf<M>();

expectTypeOf(patchAt(m, 'c', [{ d: true }])).toEqualTypeOf<M>();
expectTypeOf(patchAt(m, 'c.d', (v) => !v)).toEqualTypeOf<M>();

expectTypeOf(match(m, { a: 2 })).toEqualTypeOf<boolean>();

expectTypeOf(matchAt(m, 'a', 1)).toEqualTypeOf<boolean>();

expectTypeOf(select(m, { q: 'c.d' })).toEqualTypeOf<{ readonly q: boolean }>();

expectTypeOf(selectAt(m, 'c', { q: 'd' })).toEqualTypeOf<{
	readonly q: boolean;
}>();

expectTypeOf([m].map(getAtWith('a'))).toEqualTypeOf<number[]>();

expectTypeOf([m].map(patchWith<M>(() => [{ a: 2 }]))).toEqualTypeOf<M[]>();

expectTypeOf([m].map(patchAtWith('c', [{ d: true }]))).toEqualTypeOf<M[]>();
expectTypeOf([m].map(patchAtWith('c', () => [{ d: true }]))).toEqualTypeOf<
	M[]
>();
expectTypeOf([m].map(patchAtWith('c.d', (v) => !v))).toEqualTypeOf<M[]>();

expectTypeOf([m].map(matchWith({ a: 2 }))).toEqualTypeOf<boolean[]>();
expectTypeOf([m].map(matchAtWith('a', 2))).toEqualTypeOf<boolean[]>();

expectTypeOf([m].map(selectWith({ q: 'c.d' }))).toEqualTypeOf<
	{ readonly q: boolean }[]
>();
expectTypeOf([m].map(selectAtWith('c', { q: 'd' }))).toEqualTypeOf<
	{ readonly q: boolean }[]
>();

// @ts-expect-error
[m].map(patchWith(() => [{ a: 2, z: 1 }]));

// const wt = withType<M>();

// expectTypeOf(wt.getAtWith('a')(m)).toEqualTypeOf<number>();

// expectTypeOf(wt.patchWith([{ a: 2 }])(m)).toEqualTypeOf<M>();

// expectTypeOf(wt.patchAtWith('c', [{ d: true }])(m)).toEqualTypeOf<M>();
// expectTypeOf(wt.patchAtWith('c.d', (v) => !v)(m)).toEqualTypeOf<M>();

// expectTypeOf(wt.matchWith({ a: 3 })(m)).toEqualTypeOf<boolean>();

// expectTypeOf(wt.matchAtWith('c', { d: true })(m)).toEqualTypeOf<boolean>();

// expectTypeOf([m].map(wt.selectWith({ q: 'c.d' }))).toEqualTypeOf<
// 	{ readonly q: boolean }[]
// >();

// expectTypeOf([m].map(wt.selectAtWith('c', { q: 'd' }))).toEqualTypeOf<
// 	{ readonly q: boolean }[]
// >();

const person = {
	name: 'Alice',
	age: 34,
	address: {
		street: 'Random street',
		number: 45,
	},
	friends: ['Bob', 'Carol'],
};

type Person = typeof person;

expectTypeOf(
	patch(person, [
		{
			address: [{ street: 'ABC' }],
		},
		{
			name: 'James',
		},
	]),
).toEqualTypeOf<Person>();

expectTypeOf(
	patchAt(person, 'address', [{ street: 'ABC' }, { number: 34 }]),
).toEqualTypeOf<Person>();

expectTypeOf(
	[person].map(patchAtWith('address', [{ street: 'ABC' }, { number: 34 }])),
).toEqualTypeOf<Person[]>();

expectTypeOf(
	[person].map(
		patchWith<Person>([{ name: 'James' }, { address: [{ street: 'ABC' }] }]),
	),
).toEqualTypeOf<Person[]>();

const personUpdate1 = patchWith<Person>([
	{ name: 'James' },
	{ address: [{ street: 'ABC' }] },
]);
expectTypeOf(personUpdate1(person)).toEqualTypeOf<Person>();

// const personUpdate2 = patchAtWith('address', [
// 	{ street: 'ABC' },
// 	{ number: 34 },
// ]);
// expectType<Person>(personUpdate2(person));
