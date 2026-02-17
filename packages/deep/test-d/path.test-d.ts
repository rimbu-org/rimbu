import { expectTypeOf } from 'bun:test';

import type { List } from '@rimbu/list';

import { getAt } from '@rimbu/deep';

let m!: {
	a: number;
	b: string[];
	c: {
		d: boolean;
		e: [number, string] | null;
		f: string | null;
	};
	g: List.NonEmpty<number>;
	h: { i: number } | null;
};

type M = typeof m;

// @ts-expect-error
getAt(m, 'a.');
// @ts-expect-error
getAt(m, '.a');
// @ts-expect-error
getAt(m, 'a.a');
// @ts-expect-error
getAt(m, 'a.b');
// @ts-expect-error
getAt(m, 'z');
// @ts-expect-error
getAt(m, 'cc');
// @ts-expect-error
getAt(m, 'cd');

expectTypeOf(getAt(m, '')).toEqualTypeOf<M>();
expectTypeOf(getAt(m, 'a')).toEqualTypeOf<number>();
expectTypeOf(getAt(m, 'b')).toEqualTypeOf<string[]>();
expectTypeOf(getAt(m, 'c')).toEqualTypeOf<M['c']>();
expectTypeOf(getAt(m, 'g')).toEqualTypeOf<M['g']>();
expectTypeOf(getAt(m, 'c.e')).toEqualTypeOf<M['c']['e']>();
expectTypeOf(getAt(m, 'c.f')).toEqualTypeOf<M['c']['f']>();
expectTypeOf(getAt(m, 'c.e?.[0]')).toEqualTypeOf<number | undefined>();
expectTypeOf(getAt(m, 'c.e?.[1]')).toEqualTypeOf<string | undefined>();
expectTypeOf(getAt(m, 'h')).toEqualTypeOf<M['h']>();
expectTypeOf(getAt(m, 'h?.i')).toEqualTypeOf<number | undefined>();
