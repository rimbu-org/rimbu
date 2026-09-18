import { expectTypeOf } from 'bun:test';

import type { Op, TypesKey } from '@rimbu/collection-types/types';

// TypesKey is a unique symbol usable for an HKT slot key.
expectTypeOf<TypesKey>().toExtend<symbol>();
expectTypeOf<TypesKey>().not.toEqualTypeOf<symbol>();

// Op.WithResult shape and the hasResult discriminant.
expectTypeOf<Op.WithResult<number, string>>().toEqualTypeOf<{
	collection: number;
	hasResult: boolean;
	result: string;
	hasChanged: boolean;
}>();
expectTypeOf<Op.WithResult<number, string, true>>().toEqualTypeOf<{
	collection: number;
	hasResult: true;
	result: string;
	hasChanged: boolean;
}>();

// Op.DynamicResult is a union discriminated by hasResult, with independent
// collection and result types for the "with result" branch.
expectTypeOf<Op.DynamicResult<number, string>>().toEqualTypeOf<
	| { collection: number; hasResult: false; result: string; hasChanged: boolean }
	| { collection: number; hasResult: true; result: string; hasChanged: boolean }
>();
expectTypeOf<Op.DynamicResult<number, string, boolean, Date>>().toEqualTypeOf<
	| { collection: number; hasResult: false; result: string; hasChanged: boolean }
	| { collection: Date; hasResult: true; result: boolean; hasChanged: boolean }
>();
