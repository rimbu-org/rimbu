import { expectTypeOf } from 'bun:test';

import type { Protected } from '@rimbu/deep';

declare function p<T>(): Protected<T>;

expectTypeOf(p<any>()).toEqualTypeOf<any>();
expectTypeOf(p<never>()).toEqualTypeOf<never>();

expectTypeOf(p<number>()).toEqualTypeOf<number>();
expectTypeOf(p<2>()).toEqualTypeOf<2>();

expectTypeOf(p<string>()).toEqualTypeOf<string>();
expectTypeOf(p<'abc'>()).toEqualTypeOf<'abc'>();

expectTypeOf(p<boolean>()).toEqualTypeOf<boolean>();
expectTypeOf(p<true>()).toEqualTypeOf<true>();
expectTypeOf(p<false>()).toEqualTypeOf<false>();

const sym = Symbol();
expectTypeOf(p<symbol>()).toEqualTypeOf<symbol>();
expectTypeOf(p<typeof sym>()).toEqualTypeOf<typeof sym>();

expectTypeOf(p<(v: number) => string>()).toEqualTypeOf<(v: number) => string>();

expectTypeOf(p<{ readonly a: number }>()).toEqualTypeOf<{
	readonly a: number;
}>();
expectTypeOf(p<{ a: number }>()).toEqualTypeOf<{ readonly a: number }>();

expectTypeOf(p<{ a: { b: number; c: string } }>()).toEqualTypeOf<{
	readonly a: { readonly b: number; readonly c: string };
}>();

expectTypeOf(p<[]>()).toEqualTypeOf<readonly []>();
expectTypeOf(p<readonly []>()).toEqualTypeOf<readonly []>();
expectTypeOf(p<number[]>()).toEqualTypeOf<readonly number[]>();
expectTypeOf(p<[number, string]>()).toEqualTypeOf<readonly [number, string]>();
expectTypeOf(p<readonly [number, string]>()).toEqualTypeOf<
	readonly [number, string]
>();

expectTypeOf(p<{ a: number }[]>()).toEqualTypeOf<
	readonly { readonly a: number }[]
>();
expectTypeOf(p<[{ a: number }, { b: string }]>()).toEqualTypeOf<
	readonly [{ readonly a: number }, { readonly b: string }]
>();

expectTypeOf(p<{ a: { b: number }[] }>()).toEqualTypeOf<{
	readonly a: readonly { readonly b: number }[];
}>();

expectTypeOf(p<Set<string>>()).toEqualTypeOf<ReadonlySet<string>>();
expectTypeOf(p<Set<{ a: number }>>()).toEqualTypeOf<
	ReadonlySet<{ readonly a: number }>
>();
expectTypeOf([...p<Set<{ a: number }>>()][0]).toEqualTypeOf<{
	readonly a: number;
}>();

expectTypeOf(p<Map<string, number>>()).toEqualTypeOf<
	ReadonlyMap<string, number>
>();
expectTypeOf(p<Map<{ a: number }, { b: number }>>()).toEqualTypeOf<
	ReadonlyMap<{ readonly a: number }, { readonly b: number }>
>();
expectTypeOf([...p<Map<{ a: number }, { b: number }>>()][0][0]).toEqualTypeOf<{
	readonly a: number;
}>();
expectTypeOf([...p<Map<{ a: number }, { b: number }>>()][0][1]).toEqualTypeOf<{
	readonly b: number;
}>();

expectTypeOf(p<Promise<number>>()).toEqualTypeOf<Promise<number>>();
expectTypeOf(p<Promise<{ a: number }>>()).toEqualTypeOf<
	Promise<{ readonly a: number }>
>();

expectTypeOf(p<boolean>()).toEqualTypeOf<boolean>();
