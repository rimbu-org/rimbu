import { expectTypeOf } from 'bun:test';

import type { List } from '@rimbu/list';

import { getAt, getAtWith, protect } from '@rimbu/deep';
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

// protect — zero-cost cast to Protected<T>
expectTypeOf(protect(m)).toEqualTypeOf<{
	readonly a: number;
	readonly b: readonly string[];
	readonly c: { readonly d: boolean; readonly e: readonly [number, string] | null };
	readonly f: List.NonEmpty<number>;
	readonly g: { readonly [k: string]: string };
}>();
expectTypeOf(protect(42)).toEqualTypeOf<number>();
expectTypeOf(protect('hello')).toEqualTypeOf<string>();
expectTypeOf(protect([1, 2, 3])).toEqualTypeOf<readonly number[]>();

// getAt — empty path returns the source value itself
expectTypeOf(getAt(m, '')).toEqualTypeOf<M>();

// getAt — simple top-level property
expectTypeOf(getAt(m, 'a')).toEqualTypeOf<number>();

// getAt — nested path
expectTypeOf(getAt(m, 'c.d')).toEqualTypeOf<boolean>();
expectTypeOf(getAt(m, 'c.e')).toEqualTypeOf<[number, string] | null>();

// getAt — array index access (always potentially undefined)
expectTypeOf(getAt(m, 'b[0]')).toEqualTypeOf<string | undefined>();

// getAt — tuple index (exact per-index type, no undefined since tuple length is fixed)
expectTypeOf(getAt(m, 'c.e?.[0]')).toEqualTypeOf<number | undefined>();
expectTypeOf(getAt(m, 'c.e?.[1]')).toEqualTypeOf<string | undefined>();

// getAt — Record<string, V> access
expectTypeOf(getAt(m, 'g')).toEqualTypeOf<Record<string, string>>();

// getAt — nullable root with optional chaining
let nullable!: { a: number } | null;
expectTypeOf(getAt(nullable, '?.a')).toEqualTypeOf<number | undefined>();

// getAt — @ts-expect-error: invalid path should not compile
// @ts-expect-error
getAt(m, 'z');
// @ts-expect-error
getAt(m, 'a.nonexistent');

// getAtWith — inferred via array map context (simple path)
expectTypeOf([m].map(getAtWith('a'))).toEqualTypeOf<number[]>();

// getAtWith — nested path inferred via array map context
expectTypeOf([m].map(getAtWith('c.d'))).toEqualTypeOf<boolean[]>();

// getAtWith — optional chaining produces union with undefined
expectTypeOf([m].map(getAtWith('c.e?.[0]'))).toEqualTypeOf<(number | undefined)[]>();

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
