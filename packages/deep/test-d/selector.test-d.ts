import { expectTypeOf } from 'bun:test';

import type { Protected } from '@rimbu/deep/protected';
import { select, selectAt, selectAtWith, selectWith } from '@rimbu/deep/select';
import type { Select } from '@rimbu/deep/select';
import { Tuple } from '@rimbu/deep/tuple';

const m = {
	a: 1,
	b: { c: true },
	d: Tuple.of(1, true),
};

type M = typeof m;

// --- select: path string ---

expectTypeOf(select(m, 'a')).toEqualTypeOf<number>();
expectTypeOf(select(m, (v) => v.a)).toEqualTypeOf<number>();
expectTypeOf(select(m, 'b')).toEqualTypeOf<{ c: boolean }>();
expectTypeOf(select(m, 'b.c')).toEqualTypeOf<boolean>();
expectTypeOf(select(m, 'd[0]')).toEqualTypeOf<number>();
expectTypeOf(select(m, 'd[1]')).toEqualTypeOf<boolean>();

// @ts-expect-error
select(m, 'q');
// @ts-expect-error
select(m, 'd[2]');

// --- select: object selectors ---

expectTypeOf(select(m, { q: 'a' })).toEqualTypeOf<{ readonly q: number }>();
expectTypeOf(select(m, { q: 'b' })).toEqualTypeOf<{
	readonly q: { c: boolean };
}>();
expectTypeOf(select(m, { q: 'b.c' })).toEqualTypeOf<{ readonly q: boolean }>();
expectTypeOf(select(m, { q: 'd[0]' })).toEqualTypeOf<{ readonly q: number }>();
expectTypeOf(select(m, { q: 'd[1]' })).toEqualTypeOf<{ readonly q: boolean }>();

// nested object selectors (>1 level deep)
expectTypeOf(select(m, { outer: { inner: 'a' } })).toEqualTypeOf<{
	readonly outer: { readonly inner: number };
}>();
expectTypeOf(select(m, { x: { y: { z: 'b.c' } } })).toEqualTypeOf<{
	readonly x: { readonly y: { readonly z: boolean } };
}>();

// object selector with invalid path value should error
// @ts-expect-error
select(m, { q: 'z' });
// @ts-expect-error
select(m, { q: 'd[2]' });

// symbol keys are not allowed — they would be silently dropped by for...in at runtime.
// TypeScript already rejects { [sym]: 'a' } because computed symbol keys don't satisfy
// { [key: string]: Select<T> }, so no @ts-expect-error directive is needed here.

// --- select: tuple selectors ---
// const SL means 'as const' is no longer required at the call site

expectTypeOf(select(m, ['a', 'b'])).toEqualTypeOf<
	readonly [number, { c: boolean }]
>();

expectTypeOf(select(m, [{ q: 'a' }, 'b'])).toEqualTypeOf<
	readonly [{ readonly q: number }, { c: boolean }]
>();

// mixed tuple: path + function + object
expectTypeOf(
	select(m, ['a', (v: Protected<M>) => v.b.c, { q: 'b' }]),
).toEqualTypeOf<readonly [number, boolean, { readonly q: { c: boolean } }]>();

// empty tuple
expectTypeOf(select(m, [])).toEqualTypeOf<readonly []>();

// tuple nested inside object selector
expectTypeOf(select(m, { h: ['a', 'b.c'] })).toEqualTypeOf<{
	readonly h: readonly [number, boolean];
}>();

// --- select: function selectors ---

// function returning object type (Protected makes properties readonly)
expectTypeOf(select(m, (v) => v.b)).toEqualTypeOf<{ readonly c: boolean }>();

// function returning tuple (Protected makes tuple readonly)
expectTypeOf(select(m, (v) => v.d)).toEqualTypeOf<readonly [number, boolean]>();

// function with computed return
expectTypeOf(select(m, (v) => v.a * 2)).toEqualTypeOf<number>();

// parameter is Protected<T>
select(m, (v: Protected<M>) => {
	expectTypeOf(v).toEqualTypeOf<Protected<M>>();
	return v.a;
});

// --- selectWith ---

expectTypeOf(selectWith<M, 'a'>('a')).toEqualTypeOf<(source: M) => number>();
expectTypeOf(selectWith<M, 'b.c'>('b.c')).toEqualTypeOf<
	(source: M) => boolean
>();

// selectWith with tuple selector used via map — each element is a proper readonly tuple
// no 'as const' needed thanks to const SL
const mappedTuple = [m].map(selectWith(['a', 'b.c']));
expectTypeOf(mappedTuple[0]).toEqualTypeOf<readonly [number, boolean]>();
expectTypeOf([m].map(selectWith({ q: 'b.c' }))).toEqualTypeOf<
	{ readonly q: boolean }[]
>();
expectTypeOf([m].map(selectWith((v: Protected<M>) => v.a))).toEqualTypeOf<
	number[]
>();

// --- selectAt ---

// path string sub-selector
expectTypeOf(selectAt(m, 'b', 'c')).toEqualTypeOf<boolean>();

// function selector at path
expectTypeOf(selectAt(m, 'b', (v) => v.c)).toEqualTypeOf<boolean>();

// object selector at path
expectTypeOf(selectAt(m, 'b', { x: 'c' })).toEqualTypeOf<{
	readonly x: boolean;
}>();

// tuple selector at path — no 'as const' needed
expectTypeOf(selectAt(m, 'b', ['c'])).toEqualTypeOf<readonly [boolean]>();

// invalid path
// @ts-expect-error
selectAt(m, 'z', 'a');

// invalid sub-path
// @ts-expect-error
selectAt(m, 'b', 'z');

// --- selectAtWith ---

expectTypeOf(selectAtWith<M, 'b', 'c'>('b', 'c')).toEqualTypeOf<
	(source: M) => boolean
>();

expectTypeOf([m].map(selectAtWith('b', { x: 'c' }))).toEqualTypeOf<
	{ readonly x: boolean }[]
>();

// invalid path (with explicit T so the path can be checked)
// @ts-expect-error
selectAtWith<M, 'z', 'a'>('z', 'a');

// --- Select.Result type alias ---

expectTypeOf<Select.Result<M, 'a'>>().toEqualTypeOf<number>();
expectTypeOf<Select.Result<M, 'b.c'>>().toEqualTypeOf<boolean>();
expectTypeOf<Select.Result<M, (v: Protected<M>) => string>>().toEqualTypeOf<string>();
expectTypeOf<Select.Result<M, { q: 'a'; r: 'b.c' }>>().toEqualTypeOf<{
	readonly q: number;
	readonly r: boolean;
}>();
expectTypeOf<Select.Result<M, readonly ['a', 'b.c']>>().toEqualTypeOf<
	readonly [number, boolean]
>();
expectTypeOf<Select.Result<M, Select<M>>>().toEqualTypeOf<never>();
