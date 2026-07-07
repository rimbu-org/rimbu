import { expectTypeOf } from 'bun:test';

import {
	type Match,
	match,
	matchAt,
	matchAtWith,
	matchVerbose,
	matchWith,
} from '@rimbu/deep/match';
import type { Protected } from '@rimbu/deep/protected';
import { Tuple } from '@rimbu/deep/tuple';

expectTypeOf(match(undefined, undefined)).toEqualTypeOf<boolean>();
expectTypeOf(match(null, null)).toEqualTypeOf<boolean>();
expectTypeOf(match(1, 2)).toEqualTypeOf<boolean>();
expectTypeOf(match('a', 'b')).toEqualTypeOf<boolean>();
expectTypeOf(match(true, false)).toEqualTypeOf<boolean>();
expectTypeOf(match(Symbol(), Symbol())).toEqualTypeOf<boolean>();

expectTypeOf(match(undefined, () => undefined)).toEqualTypeOf<boolean>();
expectTypeOf(match(null, () => null)).toEqualTypeOf<boolean>();
expectTypeOf(match(1, () => 2)).toEqualTypeOf<boolean>();
expectTypeOf(match('a', () => 'b')).toEqualTypeOf<boolean>();
expectTypeOf(match(true, () => false)).toEqualTypeOf<boolean>();
expectTypeOf(match(Symbol(), () => Symbol())).toEqualTypeOf<boolean>();

// @ts-expect-error
match(undefined, null);
// @ts-expect-error
match(null, undefined);
// @ts-expect-error
match(null, {});
// @ts-expect-error
match({}, null);
// @ts-expect-error
match(1, 'a');
// @ts-expect-error
match('a', true);
// @ts-expect-error
match(true, 3);
// @ts-expect-error
match(Symbol(), 3);

// @ts-expect-error
match(undefined, () => null);
// @ts-expect-error
match(null, () => undefined);
// @ts-expect-error
match(null, () => ({}));
// expectError(match({}, () => null));
// @ts-expect-error
match(1, () => 'a');
// @ts-expect-error
match('a', () => 3);
// @ts-expect-error
match(true, () => 3);
// @ts-expect-error
match(Symbol(), () => 3);

const v1 = { a: 1, b: 'a' };

expectTypeOf(match(v1, v1)).toEqualTypeOf<boolean>();
expectTypeOf(match(v1, {})).toEqualTypeOf<boolean>();
expectTypeOf(match(v1, { a: 2 })).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v1, [{ every: [{ a: 1 }, { a: 2 }] }]),
).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v1, [{ some: [{ a: 1 }, { a: 2 }] }]),
).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v1, [{ none: [{ a: 1 }, { a: 2 }] }]),
).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v1, [{ single: [{ a: 1 }, { a: 2 }] }]),
).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v1, [
		{
			some: [
				[{ every: [{ a: 1 }, { b: 'a' }] }],
				[{ every: [{ a: 3 }, { b: 'b' }] }],
			],
		},
	]),
).toEqualTypeOf<boolean>();

expectTypeOf(match(v1, () => ({}))).toEqualTypeOf<boolean>();
expectTypeOf(match(v1, () => ({ a: 2 }))).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v1, () => [{ every: [{ a: 1 }, { a: 2 }] }]),
).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v1, () => [{ some: [{ a: 1 }, { a: 2 }] }]),
).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v1, () => [{ none: [{ a: 1 }, { a: 2 }] }]),
).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v1, () => [{ single: [{ a: 1 }, { a: 2 }] }]),
).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v1, [
		{
			some: [
				[{ every: [() => ({ a: 1 }), { b: 'a' }] }],
				[{ every: [() => ({ a: 3 }), { b: 'b' }] }],
			],
		},
	]),
).toEqualTypeOf<boolean>();

// @ts-expect-error
match(v1, []);
// @ts-expect-error
match(v1, undefined);
// @ts-expect-error
match(v1, null);
// @ts-expect-error
match(v1, { b: 1 });
// @ts-expect-error
match(v1, { c: 1 });
// @ts-expect-error
match(v1, { b: { c: 1 } });
// @ts-expect-error
match(v1, { every: [{ a: 1 }] });

// @ts-expect-error
match(v1, () => []);
// @ts-expect-error
match(v1, () => undefined);
// @ts-expect-error
match(v1, () => null);
// @ts-expect-error
match(v1, () => ({ b: 1 }));
// @ts-expect-error
match(v1, () => ({ c: 1 }));
// @ts-expect-error
match(v1, () => ({ a: 1, c: 1 }));
// @ts-expect-error
match(v1, () => ({ b: { c: 1 } }));
// @ts-expect-error
match(v1, () => ({ every: [{ a: 1 }] }));

const v2 = { a: 'a', b: { c: 1, d: true } };

expectTypeOf(match(v2, v2)).toEqualTypeOf<boolean>();
expectTypeOf(match(v2, {})).toEqualTypeOf<boolean>();
expectTypeOf(match(v2, { a: 'a' })).toEqualTypeOf<boolean>();
expectTypeOf(match(v2, { b: { d: true } })).toEqualTypeOf<boolean>();
expectTypeOf(match(v2, { b: { c: (v) => v > 1 } })).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v2, { b: [{ some: [{ c: 1 }, { d: false }] }] }),
).toEqualTypeOf<boolean>();

expectTypeOf(match(v2, () => v2)).toEqualTypeOf<boolean>();
expectTypeOf(match(v2, () => ({}))).toEqualTypeOf<boolean>();
expectTypeOf(match(v2, () => ({ a: 'a' }))).toEqualTypeOf<boolean>();
expectTypeOf(match(v2, () => ({ b: { d: true } }))).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v2, () => ({ b: { c: (v) => v > 1 } })),
).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v2, () => ({ b: [{ some: [{ c: 1 }, { d: false }] }] })),
).toEqualTypeOf<boolean>();

// @ts-expect-error
match(v2, []);
// @ts-expect-error
match(v2, { b: 1 });
// @ts-expect-error
match(v2, { c: 1 });
// @ts-expect-error
match(v2, { every: [{ a: 'a' }] });

// @ts-expect-error
match(v2, () => []);
// @ts-expect-error
match(v2, () => ({ b: 1 }));
// @ts-expect-error
match(v2, () => ({ c: 1 }));
// @ts-expect-error
match(v2, () => ({ every: [{ a: 'a' }] }));

const v3 = [1, 2, 3];

expectTypeOf(match(v3, v3)).toEqualTypeOf<boolean>();
expectTypeOf(match(v3, [])).toEqualTypeOf<boolean>();
expectTypeOf(match(v3, {})).toEqualTypeOf<boolean>();
expectTypeOf(match(v3, { 0: 1 })).toEqualTypeOf<boolean>();
expectTypeOf(match(v3, { 1024: 1, 1025: undefined })).toEqualTypeOf<boolean>();
expectTypeOf(match(v3, { some: [{ 1: 1 }] })).toEqualTypeOf<boolean>();
expectTypeOf(match(v3, { every: [{ 1: 1 }] })).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v3, { some: [{ 1: 1 }, (v) => v.length > 3] }),
).toEqualTypeOf<boolean>();
expectTypeOf(match(v3, { someItem: 2 })).toEqualTypeOf<boolean>();
expectTypeOf(match(v3, { everyItem: 2 })).toEqualTypeOf<boolean>();
expectTypeOf(match(v3, { noneItem: 2 })).toEqualTypeOf<boolean>();
expectTypeOf(match(v3, { singleItem: 2 })).toEqualTypeOf<boolean>();

expectTypeOf(match(v3, () => v3)).toEqualTypeOf<boolean>();
expectTypeOf(match(v3, () => [])).toEqualTypeOf<boolean>();
expectTypeOf(match(v3, () => ({}))).toEqualTypeOf<boolean>();
expectTypeOf(match(v3, () => ({ 0: 1 }))).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v3, () => ({ 1024: 1, 1025: undefined })),
).toEqualTypeOf<boolean>();
expectTypeOf(match(v3, () => ({ some: [{ 1: 1 }] }))).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v3, () => ({ some: [{ 1: 1 }, (v) => v.length > 3] })),
).toEqualTypeOf<boolean>();
expectTypeOf(match(v3, { someItem: () => 2 })).toEqualTypeOf<boolean>();
expectTypeOf(match(v3, { everyItem: () => 2 })).toEqualTypeOf<boolean>();
expectTypeOf(match(v3, { noneItem: () => 2 })).toEqualTypeOf<boolean>();
expectTypeOf(match(v3, { singleItem: () => 2 })).toEqualTypeOf<boolean>();

// @ts-expect-error
match(v3, ['a']);
// @ts-expect-error
match(v3, { a: 'a' });
// @ts-expect-error
match(v3, { 1: 'a' });
// @ts-expect-error
match(v3, ['some', { 0: 1 }]);
// @ts-expect-error
match(v3, { some: 13 });
// @ts-expect-error
match(v3, { some: [13] });
// @ts-expect-error
match(v3, { every: [], some: [] });
// @ts-expect-error
match(v3, { every: [], some: undefined });

// @ts-expect-error
match(v3, () => ['a']);
// TODO cannot get this to work
// // @ts-expect-error
// match(v3, () => ({ a: 'a' }))
// @ts-expect-error
match(v3, () => ({ 1: 'a' }));
// @ts-expect-error
match(v3, () => ['some', { 0: 1 }]);
// @ts-expect-error
match(v3, () => ({ some: 13 }));
// @ts-expect-error
match(v3, () => ({ some: [13] }));
// @ts-expect-error
match(v3, () => ({ every: [], some: [] }));

const v4 = Tuple.of(1, 'a', true);

expectTypeOf(match(v4, v4)).toEqualTypeOf<boolean>();
expectTypeOf(match(v4, {})).toEqualTypeOf<boolean>();
expectTypeOf(match(v4, { 1: 'a' })).toEqualTypeOf<boolean>();
expectTypeOf(match(v4, { 1: 'a', 2: true })).toEqualTypeOf<boolean>();
expectTypeOf(match(v4, { some: [{ 0: 2 }] })).toEqualTypeOf<boolean>();

expectTypeOf(match(v4, () => v4)).toEqualTypeOf<boolean>();
expectTypeOf(match(v4, () => ({}))).toEqualTypeOf<boolean>();
expectTypeOf(match(v4, () => ({ 1: 'a' }))).toEqualTypeOf<boolean>();
expectTypeOf(match(v4, () => ({ 1: 'a', 2: true }))).toEqualTypeOf<boolean>();
expectTypeOf(match(v4, () => ({ some: [{ 0: 2 }] }))).toEqualTypeOf<boolean>();

// @ts-expect-error
match(v4, ['some', { 0: 1 }]);
// @ts-expect-error
match(v4, { some: [], every: [] });
// @ts-expect-error
match(v4, { a: 1 });

// @ts-expect-error
match(v4, () => ['some', { 0: 1 }]);
// @ts-expect-error
match(v4, () => ({ some: [], every: [] }));
// @ts-expect-error
match(v4, () => ({ a: 1 }));

const v5 = { a: 1 } as { a: number } | [number, number];

// expectType<boolean>(match(v5, { a: 5 }));
expectTypeOf(match(v5, [5, 4])).toEqualTypeOf<boolean>();

const v6 = [{ x: 1, y: 2 }];

expectTypeOf(match(v6, v6)).toEqualTypeOf<boolean>();
expectTypeOf(match(v6, [{ x: 1 }])).toEqualTypeOf<boolean>();
expectTypeOf(match(v6, { someItem: { x: 1 } })).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v6, { someItem: () => ({ x: 1 }) }),
).toEqualTypeOf<boolean>();

expectTypeOf(match(v6, () => v6)).toEqualTypeOf<boolean>();
expectTypeOf(match(v6, () => [{ x: 1 }])).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v6, () => ({ someItem: { x: 1 } })),
).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v6, () => ({ someItem: () => ({ x: 1 }) })),
).toEqualTypeOf<boolean>();

// ---- Match<T> type alias ----

// Match<T> accepts valid matchers for the given type
declare function acceptsMatch<T>(m: Match<T>): void;

acceptsMatch<{ a: number; b: string }>({ a: 1 });
acceptsMatch<{ a: number; b: string }>({});
acceptsMatch<{ a: number; b: string }>([{ every: [{ a: 1 }] }]);
acceptsMatch<number>(1);
acceptsMatch<number>((v) => v > 0);

// ---- matchVerbose ----

const r1 = matchVerbose({ a: 1 }, { a: 1 });
expectTypeOf(r1).toEqualTypeOf<{ result: boolean; failureLog: string[] }>();
expectTypeOf(r1.result).toEqualTypeOf<boolean>();
expectTypeOf(r1.failureLog).toEqualTypeOf<string[]>();

expectTypeOf(
	matchVerbose({ a: 1, b: 'x' }, { a: 1 }),
).toEqualTypeOf<{ result: boolean; failureLog: string[] }>();

// @ts-expect-error
matchVerbose({ a: 1 }, { b: 2 });

// ---- matchWith ----

const withMatcher = matchWith({ a: 1 });
expectTypeOf(withMatcher).toEqualTypeOf<(source: { a: number }) => boolean>();
expectTypeOf(withMatcher({ a: 2 })).toEqualTypeOf<boolean>();

const withMatcherPrimitive = matchWith(42);
expectTypeOf(withMatcherPrimitive).toEqualTypeOf<(source: number) => boolean>();

// ---- matchAt ----

const nested = { a: 1, b: { c: true, d: 'hello' } };

expectTypeOf(matchAt(nested, 'b', { c: true })).toEqualTypeOf<boolean>();
expectTypeOf(matchAt(nested, 'b.c', true)).toEqualTypeOf<boolean>();
expectTypeOf(matchAt(nested, 'a', 1)).toEqualTypeOf<boolean>();

// @ts-expect-error — wrong type at path
matchAt(nested, 'b.c', 'not-a-boolean');
// @ts-expect-error — path does not exist
matchAt(nested, 'x', 1);

// ---- matchAtWith ----

const atWithMatcher = matchAtWith<typeof nested, 'b'>('b', { c: true });
expectTypeOf(atWithMatcher).toEqualTypeOf<(source: typeof nested) => boolean>();
expectTypeOf(atWithMatcher(nested)).toEqualTypeOf<boolean>();

// ---- customMatch compound ----

const vObj = { a: 1, b: 'hello' };

expectTypeOf(
	match(vObj, [
		{
			customMatch: {
				matchers: [{ a: 1 }, { a: 2 }],
				getResult: (pass, fail) => pass > fail,
			},
		},
	]),
).toEqualTypeOf<boolean>();

expectTypeOf(
	match(vObj, [
		{
			customMatch: {
				matchers: [{ a: 1 }, { a: 2 }],
				getResult: (pass, fail) => pass > fail,
				halt: (pass) => pass > 1,
			},
		},
	]),
).toEqualTypeOf<boolean>();

// @ts-expect-error — customMatch missing required getResult
match(vObj, [{ customMatch: { matchers: [{ a: 1 }] } }]);

// Note: customMatchItem is supported at runtime but not exposed in the public
// type system (TraversalForArr only covers everyItem/someItem/noneItem/singleItem).

// ---- Function matchers: typed (current, parent, root) parameters ----

const vTyped = { a: 1, b: { c: true, d: 'hello' } };

// current, parent, root are Protected<T>
match(vTyped, (current, parent, root) => {
	expectTypeOf(current).toEqualTypeOf<Protected<typeof vTyped>>();
	expectTypeOf(parent).toEqualTypeOf<Protected<typeof vTyped>>();
	expectTypeOf(root).toEqualTypeOf<Protected<typeof vTyped>>();
	return true;
});

// nested function matcher: current is the nested type, parent is the containing object, root is the top
match(vTyped, {
	b: (current, parent, root) => {
		expectTypeOf(current).toEqualTypeOf<Protected<{ c: boolean; d: string }>>();
		expectTypeOf(parent).toEqualTypeOf<Protected<typeof vTyped>>();
		expectTypeOf(root).toEqualTypeOf<Protected<typeof vTyped>>();
		return true;
	},
});

// nested nested: `b.c` — current is boolean, parent is b's type, root is vTyped
match(vTyped, {
	b: {
		c: (current, parent, root) => {
			expectTypeOf(current).toEqualTypeOf<Protected<boolean>>();
			expectTypeOf(parent).toEqualTypeOf<Protected<{ c: boolean; d: string }>>();
			expectTypeOf(root).toEqualTypeOf<Protected<typeof vTyped>>();
			return current;
		},
	},
});

// array item function matcher: current is the element type, parent is the array, root is root
const vArrObj = [{ x: 1 }];
match(vArrObj, {
	someItem: (current, parent, root) => {
		expectTypeOf(current).toEqualTypeOf<Protected<{ x: number }>>();
		expectTypeOf(parent).toEqualTypeOf<Protected<typeof vArrObj>>();
		expectTypeOf(root).toEqualTypeOf<Protected<typeof vArrObj>>();
		return true;
	},
});

// ---- Optional properties ----

const vOpt = { a: 1, b: undefined as string | undefined };

expectTypeOf(match(vOpt, { b: undefined })).toEqualTypeOf<boolean>();
expectTypeOf(match(vOpt, { b: 'hello' })).toEqualTypeOf<boolean>();
expectTypeOf(match(vOpt, {})).toEqualTypeOf<boolean>();

// @ts-expect-error — b is string | undefined, not number
match(vOpt, { b: 42 });

// ---- Union source types ----

const vUnion = { a: 1, b: 'x' } as { a: number } | { b: string; c: boolean };

// match on common-enough structure (both branches are objects)
// matching with a value of one branch should work
expectTypeOf(match(vUnion, { a: 1 } as Match<typeof vUnion>)).toEqualTypeOf<boolean>();

// ---- Deeply nested objects (3+ levels) ----

const vDeep = { a: { b: { c: { d: 42 } } } };

expectTypeOf(match(vDeep, { a: { b: { c: { d: 42 } } } })).toEqualTypeOf<boolean>();
expectTypeOf(match(vDeep, { a: { b: { c: {} } } })).toEqualTypeOf<boolean>();
expectTypeOf(match(vDeep, { a: {} })).toEqualTypeOf<boolean>();
expectTypeOf(
	match(vDeep, { a: { b: { c: { d: (v) => v > 10 } } } }),
).toEqualTypeOf<boolean>();

// @ts-expect-error — d is number, not string
match(vDeep, { a: { b: { c: { d: 'wrong' } } } });

// ---- noneItem / singleItem array traversal ----

const vNums = [1, 2, 3, 4];

expectTypeOf(match(vNums, { noneItem: 5 })).toEqualTypeOf<boolean>();
expectTypeOf(match(vNums, { singleItem: 1 })).toEqualTypeOf<boolean>();
expectTypeOf(match(vNums, { noneItem: (v) => v > 10 })).toEqualTypeOf<boolean>();
expectTypeOf(match(vNums, { singleItem: (v) => v === 1 })).toEqualTypeOf<boolean>();

// @ts-expect-error — noneItem value must match element type (number), not string
match(vNums, { noneItem: 'five' });
// @ts-expect-error — singleItem value must match element type (number), not string
match(vNums, { singleItem: 'one' });

// ---- Compound on primitives ----

const vNum = 5;

expectTypeOf(match(vNum, { every: [1, 5] })).toEqualTypeOf<boolean>();
expectTypeOf(match(vNum, { some: [1, 5] })).toEqualTypeOf<boolean>();
expectTypeOf(match(vNum, { none: [1, 2] })).toEqualTypeOf<boolean>();
expectTypeOf(match(vNum, { single: [1, 5] })).toEqualTypeOf<boolean>();
expectTypeOf(
	match(vNum, { every: [(v) => v > 0, (v) => v < 10] }),
).toEqualTypeOf<boolean>();

// @ts-expect-error — cannot mix compound keys
match(vNum, { every: [1], some: [5] });

// ---- Exact-reference match for function sources ----

const fn1 = () => 42;

// Functions can only be matched against themselves (same type); matching is valid at the type level.
// Runtime reference equality is enforced but cannot be captured in the type system.
expectTypeOf(match(fn1, fn1)).toEqualTypeOf<boolean>();

// A function value cannot be matched with a non-function matcher
// @ts-expect-error — number is not a valid matcher for a function source
match(fn1, 42);

// ---- Array: exact element matching ----

expectTypeOf(match([1, 2, 3], [1, 2, 3])).toEqualTypeOf<boolean>();
expectTypeOf(match([1, 2, 3], [])).toEqualTypeOf<boolean>();

// @ts-expect-error — wrong element type in array matcher
match([1, 2, 3], ['a', 'b', 'c']);
