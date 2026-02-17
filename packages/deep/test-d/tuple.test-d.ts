import { expectTypeOf } from 'bun:test';

import { Tuple } from '@rimbu/deep/tuple';

expectTypeOf(Tuple.of(1, 'a')).toEqualTypeOf<readonly [number, string]>();
expectTypeOf(Tuple.of(1, 'a', true)).toEqualTypeOf<
	readonly [number, string, boolean]
>();
// @ts-expect-error
Tuple.of();

const tuple = Tuple.of(1, 'a', true);

expectTypeOf(Tuple.getIndex(tuple, 0)).toEqualTypeOf<number>();
expectTypeOf(Tuple.getIndex(tuple, 2)).toEqualTypeOf<boolean>();
expectTypeOf(Tuple.getIndex(tuple, 3)).toEqualTypeOf<undefined>();

expectTypeOf(Tuple.first(tuple)).toEqualTypeOf<number>();

expectTypeOf(Tuple.second(tuple)).toEqualTypeOf<string>();

expectTypeOf(Tuple.last(tuple)).toEqualTypeOf<boolean>();

expectTypeOf(Tuple.updateAt(tuple, 1, 'b')).toEqualTypeOf<typeof tuple>();

expectTypeOf(Tuple.append(tuple, 1, true)).toEqualTypeOf<
	readonly [...typeof tuple, number, boolean]
>();

expectTypeOf(Tuple.concat(tuple, tuple)).toEqualTypeOf<
	readonly [...typeof tuple, ...typeof tuple]
>();

expectTypeOf(Tuple.init(tuple)).toEqualTypeOf<readonly [number, string]>();

expectTypeOf(Tuple.tail(tuple)).toEqualTypeOf<readonly [string, boolean]>();

expectTypeOf(Tuple.append(Tuple.of('a', true), 5)).toEqualTypeOf<
	readonly [string, boolean, number]
>();

expectTypeOf(Tuple.updateAt(Tuple.of(1, 'a'), 1, 'b')).toEqualTypeOf<
	readonly [number, string]
>();
