import { expectTypeOf } from 'bun:test';

import { select } from '@rimbu/deep/select';
import { Tuple } from '@rimbu/deep/tuple';

const m = {
	a: 1,
	b: { c: true },
	d: Tuple.of(1, true),
};

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

expectTypeOf(select(m, { q: 'a' })).toEqualTypeOf<{ readonly q: number }>();
expectTypeOf(select(m, { q: 'b' })).toEqualTypeOf<{
	readonly q: { c: boolean };
}>();
expectTypeOf(select(m, { q: 'b.c' })).toEqualTypeOf<{ readonly q: boolean }>();
expectTypeOf(select(m, { q: 'd[0]' })).toEqualTypeOf<{ readonly q: number }>();
expectTypeOf(select(m, { q: 'd[1]' })).toEqualTypeOf<{ readonly q: boolean }>();
expectTypeOf(select(m, ['a', 'b'] as const)).toEqualTypeOf<
	readonly [number, { c: boolean }]
>();

expectTypeOf(select(m, [{ q: 'a' }, 'b'] as const)).toEqualTypeOf<
	readonly [{ readonly q: number }, { c: boolean }]
>();

expectTypeOf(select(m, { q: 'b' })).toEqualTypeOf<{
	readonly q: { c: boolean };
}>();
expectTypeOf(select(m, { q: 'b.c' })).toEqualTypeOf<{ readonly q: boolean }>();
expectTypeOf(select(m, { q: 'd[0]' })).toEqualTypeOf<{ readonly q: number }>();
expectTypeOf(select(m, { q: 'd[1]' })).toEqualTypeOf<{ readonly q: boolean }>();
