import { expectTypeOf } from 'bun:test';

import type { List } from '@rimbu/list';

import { getAt, getAtWith } from '@rimbu/deep';
import type { Path } from '@rimbu/deep/path';

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

// ---------------------------------------------------------------------------
// Invalid paths — must be rejected by Path.Get
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Valid getAt result types — shallow
// ---------------------------------------------------------------------------

expectTypeOf(getAt(m, '')).toEqualTypeOf<M>();
expectTypeOf(getAt(m, 'a')).toEqualTypeOf<number>();
expectTypeOf(getAt(m, 'b')).toEqualTypeOf<string[]>();
expectTypeOf(getAt(m, 'c')).toEqualTypeOf<M['c']>();
expectTypeOf(getAt(m, 'g')).toEqualTypeOf<M['g']>();

// ---------------------------------------------------------------------------
// Valid getAt result types — nested object access
// ---------------------------------------------------------------------------

expectTypeOf(getAt(m, 'c.d')).toEqualTypeOf<boolean>();
expectTypeOf(getAt(m, 'c.e')).toEqualTypeOf<M['c']['e']>();
// c.f is `string | null`. The null is preserved at the leaf because the
// `Tokens extends []` check fires before IsOptional strips it — result is string | null.
expectTypeOf(getAt(m, 'c.f')).toEqualTypeOf<string | null>();
expectTypeOf(getAt(m, 'h')).toEqualTypeOf<M['h']>();

// ---------------------------------------------------------------------------
// Valid getAt result types — array indexing
// ---------------------------------------------------------------------------

expectTypeOf(getAt(m, 'b[0]')).toEqualTypeOf<string | undefined>();

// ---------------------------------------------------------------------------
// Valid getAt result types — tuple indexing with optional chaining
// ---------------------------------------------------------------------------

// c.e is [number, string] | null. The ?. makes Maybe=true so elements are optional.
expectTypeOf(getAt(m, 'c.e?.[0]')).toEqualTypeOf<number | undefined>();
expectTypeOf(getAt(m, 'c.e?.[1]')).toEqualTypeOf<string | undefined>();

// ---------------------------------------------------------------------------
// Valid getAt result types — optional chaining on nullable object
// ---------------------------------------------------------------------------

expectTypeOf(getAt(m, 'h?.i')).toEqualTypeOf<number | undefined>();

// Root-level nullable value
declare let rootNullable: null | { a: number };
expectTypeOf(getAt(rootNullable, '?.a')).toEqualTypeOf<number | undefined>();

// ---------------------------------------------------------------------------
// Path.Get — direct type tests
// ---------------------------------------------------------------------------

type ValidGetPaths = Path.Get<M>;

// 'c.d' is a valid Get path
type _cdIsValid = 'c.d' extends ValidGetPaths ? true : false;
expectTypeOf<_cdIsValid>().toEqualTypeOf<true>();

// 'z' is not a valid Get path
type _zIsInvalid = 'z' extends ValidGetPaths ? true : false;
expectTypeOf<_zIsInvalid>().toEqualTypeOf<false>();

// Array indexing is valid for Get
type _b0IsValid = 'b[0]' extends ValidGetPaths ? true : false;
expectTypeOf<_b0IsValid>().toEqualTypeOf<true>();

// ---------------------------------------------------------------------------
// Path.Set — must reject optional chaining; array indexing is blocked at
// path-generation time (no array element paths are produced for Set<T>)
// ---------------------------------------------------------------------------

type ValidSetPaths = Path.Set<M>;

// Simple property path is valid for Set
type _aIsValidSet = 'a' extends ValidSetPaths ? true : false;
expectTypeOf<_aIsValidSet>().toEqualTypeOf<true>();

// Nested plain object path is valid for Set
type _cdIsValidSet = 'c.d' extends ValidSetPaths ? true : false;
expectTypeOf<_cdIsValidSet>().toEqualTypeOf<true>();

// Optional chaining paths are rejected when used in a Set-constrained function
declare function requireSetPath(p: Path.Set<M>): void;
// @ts-expect-error — optional chaining not allowed in write paths
requireSetPath('h?.i');

// ---------------------------------------------------------------------------
// Path.Result — direct type tests
// ---------------------------------------------------------------------------

expectTypeOf<Path.Result<M, ''>>().toEqualTypeOf<M>();
expectTypeOf<Path.Result<M, 'a'>>().toEqualTypeOf<number>();
expectTypeOf<Path.Result<M, 'c'>>().toEqualTypeOf<M['c']>();
expectTypeOf<Path.Result<M, 'c.d'>>().toEqualTypeOf<boolean>();
// c.f is string | null — null is preserved at the leaf (see comment at line 57 above)
expectTypeOf<Path.Result<M, 'c.f'>>().toEqualTypeOf<string | null>();
expectTypeOf<Path.Result<M, 'b[0]'>>().toEqualTypeOf<string | undefined>();
expectTypeOf<Path.Result<M, 'c.e?.[0]'>>().toEqualTypeOf<number | undefined>();
expectTypeOf<Path.Result<M, 'h?.i'>>().toEqualTypeOf<number | undefined>();

// ---------------------------------------------------------------------------
// getAtWith — curried form
// ---------------------------------------------------------------------------

const getA = getAtWith<M, 'a'>('a');
expectTypeOf(getA).toEqualTypeOf<(source: M) => number>();
expectTypeOf(getA(m)).toEqualTypeOf<number>();

const getCD = getAtWith<M, 'c.d'>('c.d');
expectTypeOf(getCD(m)).toEqualTypeOf<boolean>();

const getHI = getAtWith<M, 'h?.i'>('h?.i');
expectTypeOf(getHI(m)).toEqualTypeOf<number | undefined>();

// ---------------------------------------------------------------------------
// Functions cannot be further decomposed — only '' path is valid
// ---------------------------------------------------------------------------

declare let fn: (x: number) => string;
expectTypeOf(getAt(fn, '')).toEqualTypeOf<(x: number) => string>();
