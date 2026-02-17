import { expectTypeOf } from 'bun:test';

import type { PlainObj } from '@rimbu/base/plain-object';

function f<T>(p: T): PlainObj<T> {
	return p as any;
}

expectTypeOf(f(1)).toEqualTypeOf<never>();
expectTypeOf(f('a')).toEqualTypeOf<never>();
expectTypeOf(f(true)).toEqualTypeOf<never>();
expectTypeOf(f(new Map())).toEqualTypeOf<never>();
expectTypeOf(f(Promise.resolve(1))).toEqualTypeOf<never>();
expectTypeOf(f([1, 2])).toEqualTypeOf<never>();
expectTypeOf(f({ q: () => {}, b: 5 })).toEqualTypeOf<never>();
const obj = {
	a() {},
	b: 5,
};
const iter = {
	[Symbol.iterator]() {},
};
expectTypeOf(f(obj)).toEqualTypeOf<never>();

expectTypeOf(f(iter)).toEqualTypeOf<never>();

expectTypeOf(f({} as {})).toEqualTypeOf<{}>();
expectTypeOf(f({ a: 1 })).toEqualTypeOf<{ a: number }>();
expectTypeOf(f({ a: { b: 3, c: 'a' } })).toEqualTypeOf<{
	a: { b: number; c: string };
}>();
expectTypeOf(f({ a: [1, 2] })).toEqualTypeOf<{ a: number[] }>();
expectTypeOf(f({ a: Promise.resolve(5) })).toEqualTypeOf<{
	a: Promise<number>;
}>();
