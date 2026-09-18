import { expectTypeOf } from 'bun:test';

import type { IndexedValuedSortedCollection } from '@rimbu/collection-types/collection/indexed-valued-sorted';

type IVS<E = number> = IndexedValuedSortedCollection<E>;
type IVSN<E = number> = IndexedValuedSortedCollection.NonEmpty<E>;

declare const ivs: IVS;

// indexOf / bounds (from the indexed-sorted composition)
expectTypeOf(ivs.indexOf(1)).toEqualTypeOf<number | undefined>();
expectTypeOf(ivs.indexOf(1, -1)).toEqualTypeOf<number>();
expectTypeOf(ivs.lowerBound(1)).toEqualTypeOf<number>();
expectTypeOf(ivs.upperBound(1)).toEqualTypeOf<number>();

// valued + sorted + indexed members
expectTypeOf(ivs.has(1)).toEqualTypeOf<boolean>();
expectTypeOf(ivs.min()).toEqualTypeOf<number | undefined>();
expectTypeOf(ivs.next(1)).toEqualTypeOf<number | undefined>();
expectTypeOf(ivs.at(0)).toEqualTypeOf<number | undefined>();
const takeIVS: IVS = ivs.take(2);

// kind
declare const ivsn: IVSN;
expectTypeOf(ivsn.min()).toEqualTypeOf<number>();

// variance
expectTypeOf<IVSN<number>>().toExtend<IVS<number>>();

void [takeIVS];
