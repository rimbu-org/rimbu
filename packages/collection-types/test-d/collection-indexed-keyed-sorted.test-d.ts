import { expectTypeOf } from 'bun:test';

import type { IndexedKeyedSortedCollection } from '@rimbu/collection-types/collection/indexed-keyed-sorted';

type IKS<K = number, V = string> = IndexedKeyedSortedCollection<K, V>;
type IKSN<K = number, V = string> =
	IndexedKeyedSortedCollection.NonEmpty<K, V>;

declare const iks: IKS;

// indexOf (from the indexed-keyed composition): OptLazy fallback
expectTypeOf(iks.indexOf(1)).toEqualTypeOf<number | undefined>();
expectTypeOf(iks.indexOf(1, -1)).toEqualTypeOf<number>();

// keyed read
expectTypeOf(iks.get(1)).toEqualTypeOf<string | undefined>();

// sorted members search by the key K
expectTypeOf(iks.min()).toEqualTypeOf<readonly [number, string] | undefined>();
expectTypeOf(iks.next(1)).toEqualTypeOf<readonly [number, string] | undefined>();
expectTypeOf(iks.max()).toEqualTypeOf<readonly [number, string] | undefined>();

// indexed members
const takeIKS: IKS = iks.take(2);

// variance
expectTypeOf<IKSN<number, string>>().toExtend<IKS<number, string>>();

void [takeIKS];
