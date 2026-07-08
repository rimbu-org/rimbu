import { expectTypeOf } from 'bun:test';

import type { Protected } from '@rimbu/deep/protected';
import { patch, patchAt, patchAtWith, patchWith } from '@rimbu/deep/patch';
import { Tuple } from '@rimbu/deep/tuple';

const num = 1 as number;
const str = 'b' as string;
const bool = false as boolean;

expectTypeOf(patch(undefined, undefined)).toEqualTypeOf<undefined>();
expectTypeOf(patch(null, null)).toEqualTypeOf<null>();
expectTypeOf(patch(num, 2)).toEqualTypeOf<number>();
expectTypeOf(patch(bool, false)).toEqualTypeOf<boolean>();
expectTypeOf(patch(str, 'b')).toEqualTypeOf<string>();
expectTypeOf(patch(Symbol(), Symbol())).toEqualTypeOf<symbol>();

expectTypeOf(patch(undefined, () => undefined)).toEqualTypeOf<undefined>();
expectTypeOf(patch(null, () => null)).toEqualTypeOf<null>();
expectTypeOf(patch(num, () => 2)).toEqualTypeOf<number>();
expectTypeOf(patch(bool, () => false)).toEqualTypeOf<boolean>();
expectTypeOf(patch(str, () => 'b')).toEqualTypeOf<string>();
expectTypeOf(patch(Symbol(), () => Symbol())).toEqualTypeOf<symbol>();

expectTypeOf(patch(undefined, (v) => v)).toEqualTypeOf<undefined>();
expectTypeOf(patch(null, (v) => v)).toEqualTypeOf<null>();
expectTypeOf(patch(num, (v) => v)).toEqualTypeOf<number>();
expectTypeOf(patch(bool, (v) => v)).toEqualTypeOf<boolean>();
expectTypeOf(patch(bool, (v) => !v)).toEqualTypeOf<boolean>();
expectTypeOf(patch(str, (v) => v)).toEqualTypeOf<string>();
expectTypeOf(patch(Symbol(), (v) => v)).toEqualTypeOf<symbol>();

// @ts-expect-error
patch(undefined, null);
// @ts-expect-error
patch(null, undefined);
// @ts-expect-error
patch(1, true);
// @ts-expect-error
patch(true, 1);
// @ts-expect-error
patch('a', true);
// @ts-expect-error
patch(Symbol(), 'a');

// @ts-expect-error
patch(1, [2]);
// @ts-expect-error
patch(true, [false]);
// @ts-expect-error
patch('a', ['b']);
// @ts-expect-error
patch(Symbol(), [Symbol()]);

// @ts-expect-error
patch(1, () => true);
// @ts-expect-error
patch(true, () => 1);
// @ts-expect-error
patch('a', () => true);
// @ts-expect-error
patch(Symbol(), () => 'a');

type NU = number | undefined;

expectTypeOf(patch(1 as NU, 2)).toEqualTypeOf<NU>();
expectTypeOf(patch(1 as NU, undefined)).toEqualTypeOf<NU>();

expectTypeOf(patch(1 as NU, () => 2)).toEqualTypeOf<NU>();
expectTypeOf(patch(1 as NU, () => undefined)).toEqualTypeOf<NU>();
expectTypeOf(patch(1 as NU, (v) => (v ?? 1) + 1)).toEqualTypeOf<NU>();

type NN = number | null;

expectTypeOf(patch(1 as NN, 2)).toEqualTypeOf<NN>();
expectTypeOf(patch(1 as NN, null)).toEqualTypeOf<NN>();

expectTypeOf(patch(1 as NN, () => 2)).toEqualTypeOf<NN>();
expectTypeOf(patch(1 as NN, () => null)).toEqualTypeOf<NN>();
expectTypeOf(patch(1 as NN, (v) => (v ?? 1) + 1)).toEqualTypeOf<NN>();

type AN = { a: number } | null;

expectTypeOf(patch(null as AN, null)).toEqualTypeOf<AN>();
expectTypeOf(patch(null as AN, { a: 3 })).toEqualTypeOf<AN>();
expectTypeOf(patch({ a: 3 } as AN, null)).toEqualTypeOf<AN>();

expectTypeOf(patch(null as AN, () => null)).toEqualTypeOf<AN>();
expectTypeOf(patch(null as AN, () => ({ a: 3 }))).toEqualTypeOf<AN>();
expectTypeOf(patch({ a: 3 } as AN, () => null)).toEqualTypeOf<AN>();

// @ts-expect-error
patch(null as AN, [{ a: 1 }]);
// @ts-expect-error
patch(null as AN, [{}]);

// @ts-expect-error
patch(null as AN, () => [{ a: 1 }]);
// @ts-expect-error
patch(null as AN, () => [{}]);

type AU = { a: number } | undefined;

expectTypeOf(patch(undefined as AU, undefined)).toEqualTypeOf<AU>();
expectTypeOf(patch(undefined as AU, { a: 3 })).toEqualTypeOf<AU>();
expectTypeOf(patch({ a: 3 } as AU, undefined)).toEqualTypeOf<AU>();

expectTypeOf(patch(undefined as AU, () => undefined)).toEqualTypeOf<AU>();
expectTypeOf(patch(undefined as AU, () => ({ a: 3 }))).toEqualTypeOf<AU>();
expectTypeOf(patch({ a: 3 } as AU, () => undefined)).toEqualTypeOf<AU>();

// @ts-expect-error
patch(undefined as AU, [{ a: 1 }]);
// @ts-expect-error
patch(undefined as AU, [{}]);

// @ts-expect-error
patch(undefined as AU, () => [{ a: 1 }]);
// @ts-expect-error
patch(undefined as AU, () => [{}]);

const v = { a: 1, b: { c: 'a', d: true } };
type V = typeof v;

expectTypeOf(patch(v, v)).toEqualTypeOf<V>();
expectTypeOf(patch(v, [v])).toEqualTypeOf<V>();
expectTypeOf(patch(v, [{}])).toEqualTypeOf<V>();
expectTypeOf(patch(v, [{ a: 2 }])).toEqualTypeOf<V>();
expectTypeOf(patch(v, [{ a: 2 }, { a: (v) => v + 1 }])).toEqualTypeOf<V>();
expectTypeOf(patch(v, [{ a: () => 2 }])).toEqualTypeOf<V>();
expectTypeOf(patch(v, [{ a: (v) => v }])).toEqualTypeOf<V>();
expectTypeOf(patch(v, [{ a: (v) => v, b: [{ c: 'b' }] }])).toEqualTypeOf<V>();

expectTypeOf(patch(v, () => v)).toEqualTypeOf<V>();
expectTypeOf(patch(v, () => [v])).toEqualTypeOf<V>();
expectTypeOf(patch(v, () => [{}])).toEqualTypeOf<V>();
expectTypeOf(patch(v, () => [{ a: 2 }])).toEqualTypeOf<V>();
expectTypeOf(
	patch(v, () => [{ a: 2 }, { a: (v) => v + 1 }]),
).toEqualTypeOf<V>();
expectTypeOf(patch(v, () => [{ a: () => 2 }])).toEqualTypeOf<V>();
expectTypeOf(patch(v, () => [{ a: (v) => v }])).toEqualTypeOf<V>();
expectTypeOf(
	patch(v, () => [{ a: (v) => v, b: [{ c: 'b' }] }]),
).toEqualTypeOf<V>();

expectTypeOf(patch(v, [{ b: { c: 'b', d: false } }])).toEqualTypeOf<V>();
expectTypeOf(patch(v, [{ b: [{ c: 'b', d: false }] }])).toEqualTypeOf<V>();
expectTypeOf(patch(v, [{ b: [{ c: 'b' }] }])).toEqualTypeOf<V>();
expectTypeOf(patch(v, [{ b: [{ d: (v) => !v }] }])).toEqualTypeOf<V>();

// @ts-expect-error
patch(v, [{ a: 2, q: 1 }]);
// @ts-expect-error
patch(v, () => [{ a: 2, q: 1 }]);

const t = { a: 1, b: Tuple.of(true, 'a', { x: 1, y: 2 }) };
type T = typeof t;

expectTypeOf(patch(t, t)).toEqualTypeOf<T>();
expectTypeOf(patch(t, t)).toEqualTypeOf<T>();
expectTypeOf(
	patch(t, [{ b: Tuple.of(false, 'b', { x: 0, y: 0 }) }]),
).toEqualTypeOf<T>();
expectTypeOf(patch(t, [{ b: {} }])).toEqualTypeOf<T>();
expectTypeOf(patch(t, [{ b: { 0: true } }])).toEqualTypeOf<T>();
expectTypeOf(patch(t, [{ b: { 1: 'c' } }])).toEqualTypeOf<T>();
expectTypeOf(patch(t, [{ b: { 0: true, 1: 'c' } }])).toEqualTypeOf<T>();
expectTypeOf(patch(t, [{ b: { 0: (v) => !v } }])).toEqualTypeOf<T>();
expectTypeOf(patch(t, [{ b: { 2: { x: 2, y: 2 } } }])).toEqualTypeOf<T>();
expectTypeOf(patch(t, [{ b: { 2: [{ y: 2 }] } }])).toEqualTypeOf<T>();
expectTypeOf(
	patch(t, [{ b: { 2: [{ y: (v, p) => v + p.x }] } }]),
).toEqualTypeOf<T>();

// @ts-expect-error
patch(t, [{ b: [] }]);
// @ts-expect-error
patch(t, [{ b: Tuple.of(1, 'b') }]);
// @ts-expect-error
patch(t, [{ b: { 3: 1 } }]);
// @ts-expect-error
patch(t, [{ b: { 0: 1 } }]);
// @ts-expect-error
patch(t, [{ b: { 0: () => 1 } }]);
// @ts-expect-error
patch(t, [{ b: { 2: { x: 1 } } }]);
// @ts-expect-error
patch(t, [{ b: { 2: [{ z: 1 }] } }]);

const arr = [1, 2, 3];
expectTypeOf(patch(arr, arr)).toEqualTypeOf<number[]>();
expectTypeOf(patch(arr, [])).toEqualTypeOf<number[]>();
expectTypeOf(patch(arr, [1, 2])).toEqualTypeOf<number[]>();
expectTypeOf(patch(arr, () => [1, 2, 3])).toEqualTypeOf<number[]>();
expectTypeOf(patch(arr, (v) => v)).toEqualTypeOf<number[]>();

// @ts-expect-error
patch(arr, [[]]);
// @ts-expect-error
patch(arr, ['a']);
// @ts-expect-error
patch(arr, { 0: 2 });
// @ts-expect-error
patch(arr, [{ 0: 2 }]);
// expectError(
//   patch(arr, (v) => {
//     v[0] = 3;
//     return v;
//   })
// );

const s = new Set([1, 2]);
type S = typeof s;

expectTypeOf(patch(s, s)).toEqualTypeOf<S>();
expectTypeOf(patch(s, (s) => s)).toEqualTypeOf<S>();

// @ts-expect-error
patch(s, { size: 3 });
// @ts-expect-error
patch(s, [{ size: 3 }]);
// @ts-expect-error
patch(s, () => ({ size: 3 }));
// @ts-expect-error
patch(s, () => [{ size: 3 }]);

const n = { a: { b: { c: 5 } } };
type N = typeof n;

expectTypeOf(patch(n, (v, p, r) => v)).toEqualTypeOf<N>();
expectTypeOf(patch(n, (v, p, r) => p)).toEqualTypeOf<N>();
expectTypeOf(patch(n, (v, p, r) => r)).toEqualTypeOf<N>();

expectTypeOf(patch(n, [{ a: (v, p, r) => v }])).toEqualTypeOf<N>();
expectTypeOf(patch(n, [{ a: (v, p, r) => p.a }])).toEqualTypeOf<N>();
expectTypeOf(patch(n, [{ a: (v, p, r) => r.a }])).toEqualTypeOf<N>();

expectTypeOf(patch(n, [{ a: [{ b: (v, p, r) => v }] }])).toEqualTypeOf<N>();
expectTypeOf(patch(n, [{ a: [{ b: (v, p, r) => p.b }] }])).toEqualTypeOf<N>();
expectTypeOf(patch(n, [{ a: [{ b: (v, p, r) => r.a.b }] }])).toEqualTypeOf<N>();

expectTypeOf(
	patch(
		() => 5,
		() => 5,
	),
).toEqualTypeOf<() => number>();

patch(
	() => 5,
	// @ts-expect-error
	() => () => 5,
);

expectTypeOf(patch({ a: () => 5 as number }, { a: () => 6 })).toEqualTypeOf<{
	a: () => number;
}>();
// @ts-expect-error
patch({ a: () => 5 as number }, { a: () => () => 6 });

expectTypeOf(patch(Tuple.of(1, 'a'), [2, 'b'])).toEqualTypeOf<
	readonly [number, string]
>();
// @ts-expect-error
patch(Tuple.of(1, 'a'), [1]);
// @ts-expect-error
patch(Tuple.of(1, 'a'), [2, 'b', true]);
// @ts-expect-error
patch(Tuple.of(1, 2), [1, 2, 3]);

expectTypeOf(
	patch({ a: 1, b: 1 } as { a: number | undefined; b: number }, [
		{ a: undefined },
	]),
).toEqualTypeOf<{ a: number | undefined; b: number }>();
expectTypeOf(
	patch({ a: 1, b: 1 } as { a?: number | undefined; b: number }, [
		{ a: undefined },
	]),
).toEqualTypeOf<{ a?: number | undefined; b: number }>();

// @ts-expect-error
patch({ a: 1, b: 1 } as { a?: number; b: number }, [{ a: undefined }]);
// @ts-expect-error
patch({ a: 1 }, [{ a: undefined }]);

// --- Patch.Func parameter types at various nesting levels ---

const nested = { a: { b: { c: 5 } } };
type Nested = typeof nested;

patch(nested, (v, p, r) => {
	expectTypeOf(v).toEqualTypeOf<Protected<Nested>>();
	expectTypeOf(p).toEqualTypeOf<Protected<Nested>>();
	expectTypeOf(r).toEqualTypeOf<Protected<Nested>>();
	return v;
});

patch(nested, [
	{
		a: (v, p, r) => {
			expectTypeOf(v).toEqualTypeOf<Protected<{ b: { c: number } }>>();
			expectTypeOf(p).toEqualTypeOf<Protected<Nested>>();
			expectTypeOf(r).toEqualTypeOf<Protected<Nested>>();
			return v;
		},
	},
]);

patch(nested, [
	{
		a: [
			{
				b: (v, p, r) => {
					expectTypeOf(v).toEqualTypeOf<Protected<{ c: number }>>();
					expectTypeOf(p).toEqualTypeOf<Protected<{ b: { c: number } }>>();
					expectTypeOf(r).toEqualTypeOf<Protected<Nested>>();
					return v;
				},
			},
		],
	},
]);

patch(nested, [
	{
		a: [
			{
				b: [
					{
						c: (v, p, r) => {
							expectTypeOf(v).toEqualTypeOf<Protected<number>>();
							expectTypeOf(p).toEqualTypeOf<Protected<{ c: number }>>();
							expectTypeOf(r).toEqualTypeOf<Protected<Nested>>();
							return v;
						},
					},
				],
			},
		],
	},
]);

// --- Objects with function-valued properties ---
// Such types are not considered plain objects (IsPlainObj is false when any
// property is a function), so only direct replacement or a function patch is allowed.

// @ts-expect-error — patch-array form is not valid for objects with function props
patch({ fn: () => 5 as number }, [{ fn: () => 6 }]);

// @ts-expect-error — same applies to nested objects with function props
patch({ a: { fn: () => 1 as number } }, [{ a: [{ fn: () => 2 }] }]);

// --- patchWith ---

const pw1 = patchWith<Nested>([{ a: { b: { c: 10 } } }]);
expectTypeOf(pw1).toEqualTypeOf<(source: Nested) => Nested>();
expectTypeOf(pw1(nested)).toEqualTypeOf<Nested>();

const pw2 = patchWith<Nested>([{ a: (v) => v }]);
expectTypeOf(pw2(nested)).toEqualTypeOf<Nested>();

// @ts-expect-error — unknown key
patchWith<Nested>([{ a: { b: { c: 10 } }, z: 1 }]);

// @ts-expect-error — wrong source type passed to returned function
patchWith<Nested>([{ a: { b: { c: 10 } } }])({ a: { b: { c: 5 } }, extra: true });

// --- patchAt ---

expectTypeOf(patchAt(nested, '', nested)).toEqualTypeOf<Nested>();
expectTypeOf(patchAt(nested, 'a', { b: { c: 10 } })).toEqualTypeOf<Nested>();
expectTypeOf(patchAt(nested, 'a', (v) => v)).toEqualTypeOf<Nested>();
expectTypeOf(patchAt(nested, 'a.b', { c: 10 })).toEqualTypeOf<Nested>();
expectTypeOf(patchAt(nested, 'a.b.c', 10)).toEqualTypeOf<Nested>();
expectTypeOf(patchAt(nested, 'a.b.c', (v) => v + 1)).toEqualTypeOf<Nested>();

const withTuple = { b: Tuple.of(1, 'a') };
type WithTuple = typeof withTuple;
expectTypeOf(patchAt(withTuple, 'b[0]', 2)).toEqualTypeOf<WithTuple>();
expectTypeOf(patchAt(withTuple, 'b[0]', (v) => v + 1)).toEqualTypeOf<WithTuple>();

// --- patchAtWith ---

const patw1 = patchAtWith<Nested, 'a.b.c'>('a.b.c', (v) => v + 1);
expectTypeOf(patw1).toEqualTypeOf<(source: Nested) => Nested>();
expectTypeOf(patw1(nested)).toEqualTypeOf<Nested>();

const patw2 = patchAtWith<WithTuple, 'b[0]'>('b[0]', 2);
expectTypeOf(patw2(withTuple)).toEqualTypeOf<WithTuple>();

// --- Union of two plain objects ---

type AB = { a: number } | { b: string };

const ab = { a: 1 } as AB;
expectTypeOf(patch(ab, ab)).toEqualTypeOf<AB>();
expectTypeOf(patch(ab, () => ab)).toEqualTypeOf<AB>();
expectTypeOf(patch(ab, (v) => v)).toEqualTypeOf<AB>();

// --- Optional properties ---

type ObjWithOpt = { a?: number; b: number };

expectTypeOf(
	patch({ a: 1, b: 1 } as ObjWithOpt, [{ a: 5 }]),
).toEqualTypeOf<ObjWithOpt>();
expectTypeOf(
	patch({ a: 1, b: 1 } as ObjWithOpt, [{}]),
).toEqualTypeOf<ObjWithOpt>();

// nested optional prop
type ObjNested = { inner: { a?: number; b: number } };
expectTypeOf(
	patch({ inner: { a: 1, b: 2 } } as ObjNested, [{ inner: [{ a: 5 }] }]),
).toEqualTypeOf<ObjNested>();
