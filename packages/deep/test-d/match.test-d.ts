import { expectTypeOf } from 'bun:test';

import { match } from '@rimbu/deep/match';
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
expectTypeOf(match(v1, ['every', { a: 1 }, { a: 2 }])).toEqualTypeOf<boolean>();
expectTypeOf(match(v1, ['some', { a: 1 }, { a: 2 }])).toEqualTypeOf<boolean>();
expectTypeOf(match(v1, ['none', { a: 1 }, { a: 2 }])).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v1, ['single', { a: 1 }, { a: 2 }]),
).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v1, [
		'some',
		['every', { a: 1 }, { b: 'a' }],
		['every', { a: 3 }, { b: 'b' }],
	]),
).toEqualTypeOf<boolean>();

expectTypeOf(match(v1, () => ({}))).toEqualTypeOf<boolean>();
expectTypeOf(match(v1, () => ({ a: 2 }))).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v1, () => ['every', { a: 1 }, { a: 2 }]),
).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v1, () => ['some', { a: 1 }, { a: 2 }]),
).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v1, () => ['none', { a: 1 }, { a: 2 }]),
).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v1, () => ['single', { a: 1 }, { a: 2 }]),
).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v1, [
		'some',
		['every', () => ({ a: 1 }), { b: 'a' }],
		['every', () => ({ a: 3 }), { b: 'b' }],
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
	match(v2, { b: ['some', { c: 1 }, { d: false }] }),
).toEqualTypeOf<boolean>();

expectTypeOf(match(v2, () => v2)).toEqualTypeOf<boolean>();
expectTypeOf(match(v2, () => ({}))).toEqualTypeOf<boolean>();
expectTypeOf(match(v2, () => ({ a: 'a' }))).toEqualTypeOf<boolean>();
expectTypeOf(match(v2, () => ({ b: { d: true } }))).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v2, () => ({ b: { c: (v) => v > 1 } })),
).toEqualTypeOf<boolean>();
expectTypeOf(
	match(v2, () => ({ b: ['some', { c: 1 }, { d: false }] })),
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
// expectError(match(v3, () => ({ a: 'a' })));
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
