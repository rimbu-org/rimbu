import { expectTypeOf } from 'bun:test';

import type { IndexedValuedCollection } from '@rimbu/collection-types/collection/indexed-valued';

type IV<E = number> = IndexedValuedCollection<E>;
type IVN<E = number> = IndexedValuedCollection.NonEmpty<E>;
type IVB<E = number> =
	IndexedValuedCollection.Advanced.ExtendFamily<E>['_BUILDER'];

declare const iv: IV;

// indexOf: OptLazy fallback
expectTypeOf(iv.indexOf(1)).toEqualTypeOf<number | undefined>();
expectTypeOf(iv.indexOf(1, -1)).toEqualTypeOf<number>();
expectTypeOf(iv.indexOf(1, () => -1)).toEqualTypeOf<number>();

// valued + indexed members
expectTypeOf(iv.has(1)).toEqualTypeOf<boolean>();
expectTypeOf(iv.at(0)).toEqualTypeOf<number | undefined>();
const takeIV: IV = iv.take(2);

// builder
declare const ivb: IVB;
expectTypeOf(ivb.indexOf(1)).toEqualTypeOf<number | undefined>();
expectTypeOf(ivb.indexOf(1, -1)).toEqualTypeOf<number>();

// variance
expectTypeOf<IVN<number>>().toExtend<IV<number>>();

void [takeIV];
