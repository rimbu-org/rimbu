import { expectTypeOf } from 'bun:test';

import type { Protected } from '@rimbu/deep';

declare function p<T>(): Protected<T>;

// --- any / never ---

expectTypeOf(p<any>()).toEqualTypeOf<any>();
expectTypeOf(p<never>()).toEqualTypeOf<never>();

// --- primitives ---

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

expectTypeOf(p<bigint>()).toEqualTypeOf<bigint>();
expectTypeOf(p<1n>()).toEqualTypeOf<1n>();

expectTypeOf(p<null>()).toEqualTypeOf<null>();
expectTypeOf(p<undefined>()).toEqualTypeOf<undefined>();

// --- functions ---

expectTypeOf(p<(v: number) => string>()).toEqualTypeOf<(v: number) => string>();

// --- plain objects ---

expectTypeOf(p<{ readonly a: number }>()).toEqualTypeOf<{
	readonly a: number;
}>();
expectTypeOf(p<{ a: number }>()).toEqualTypeOf<{ readonly a: number }>();

// nested plain objects
expectTypeOf(p<{ a: { b: number; c: string } }>()).toEqualTypeOf<{
	readonly a: { readonly b: number; readonly c: string };
}>();

// optional properties
expectTypeOf(p<{ a?: number }>()).toEqualTypeOf<{ readonly a?: number }>();
expectTypeOf(p<{ a?: { b: number } }>()).toEqualTypeOf<{
	readonly a?: { readonly b: number };
}>();

// nullable / undefinable values
expectTypeOf(p<{ a: number | null }>()).toEqualTypeOf<{
	readonly a: number | null;
}>();
expectTypeOf(p<{ a: number | undefined }>()).toEqualTypeOf<{
	readonly a: number | undefined;
}>();

// index signatures
expectTypeOf(p<{ [key: string]: number }>()).toEqualTypeOf<{
	readonly [key: string]: number;
}>();

// objects with function properties pass through unchanged (not plain objects at the type level)
expectTypeOf(p<{ a: number; fn: () => void }>()).toEqualTypeOf<{
	a: number;
	fn: () => void;
}>();

// a plain wrapper object around an object-with-method: outer becomes readonly, inner passes through
expectTypeOf(p<{ data: { a: number; fn: () => void } }>()).toEqualTypeOf<{
	readonly data: { a: number; fn: () => void };
}>();

// --- arrays and tuples ---

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

// readonly arrays inside plain objects
expectTypeOf(p<{ a: readonly number[] }>()).toEqualTypeOf<{
	readonly a: readonly number[];
}>();
expectTypeOf(p<{ a: readonly [number, string] }>()).toEqualTypeOf<{
	readonly a: readonly [number, string];
}>();

// plain objects inside arrays inside plain objects (3-level nesting)
expectTypeOf(p<{ a: { b: number }[] }>()).toEqualTypeOf<{
	readonly a: readonly { readonly b: number }[];
}>();

// --- Set ---

expectTypeOf(p<Set<string>>()).toEqualTypeOf<ReadonlySet<string>>();
expectTypeOf(p<Set<{ a: number }>>()).toEqualTypeOf<
	ReadonlySet<{ readonly a: number }>
>();
expectTypeOf([...p<Set<{ a: number }>>()][0]).toEqualTypeOf<{
	readonly a: number;
}>();

// ReadonlySet: values must be recursively protected
expectTypeOf(p<ReadonlySet<string>>()).toEqualTypeOf<ReadonlySet<string>>();
expectTypeOf(p<ReadonlySet<{ a: number }>>()).toEqualTypeOf<
	ReadonlySet<{ readonly a: number }>
>();

// --- Map ---

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

// ReadonlyMap: keys and values must be recursively protected
expectTypeOf(p<ReadonlyMap<string, number>>()).toEqualTypeOf<
	ReadonlyMap<string, number>
>();
expectTypeOf(p<ReadonlyMap<string, { a: number }>>()).toEqualTypeOf<
	ReadonlyMap<string, { readonly a: number }>
>();
expectTypeOf(p<ReadonlyMap<{ a: number }, { b: number }>>()).toEqualTypeOf<
	ReadonlyMap<{ readonly a: number }, { readonly b: number }>
>();

// --- Promise ---

expectTypeOf(p<Promise<number>>()).toEqualTypeOf<Promise<number>>();
expectTypeOf(p<Promise<{ a: number }>>()).toEqualTypeOf<
	Promise<{ readonly a: number }>
>();

// --- nesting: Map / Set / Promise inside plain objects ---

expectTypeOf(p<{ a: Map<string, { b: number }> }>()).toEqualTypeOf<{
	readonly a: ReadonlyMap<string, { readonly b: number }>;
}>();
expectTypeOf(p<{ a: Set<{ b: number }> }>()).toEqualTypeOf<{
	readonly a: ReadonlySet<{ readonly b: number }>;
}>();
expectTypeOf(p<{ a: Promise<{ b: number }> }>()).toEqualTypeOf<{
	readonly a: Promise<{ readonly b: number }>;
}>();

// --- union types (conditional type distributes) ---

expectTypeOf(p<string | number>()).toEqualTypeOf<string | number>();
expectTypeOf(p<number | { a: number }>()).toEqualTypeOf<
	number | { readonly a: number }
>();
expectTypeOf(p<null | { a: number }>()).toEqualTypeOf<
	null | { readonly a: number }
>();
expectTypeOf(p<Map<string, number> | { a: number }>()).toEqualTypeOf<
	ReadonlyMap<string, number> | { readonly a: number }
>();

// --- pass-through types (not handled by any special branch) ---

// Date and RegExp have method properties, so IsObjWithoutFunctions is false → pass through
expectTypeOf(p<Date>()).toEqualTypeOf<Date>();
expectTypeOf(p<RegExp>()).toEqualTypeOf<RegExp>();

// WeakMap / WeakSet have no ReadonlyWeakMap counterpart and are not iterable; pass through
expectTypeOf(p<WeakMap<object, { a: number }>>()).toEqualTypeOf<
	WeakMap<object, { a: number }>
>();
expectTypeOf(p<WeakSet<object>>()).toEqualTypeOf<WeakSet<object>>();
