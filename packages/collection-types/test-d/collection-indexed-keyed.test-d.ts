import { expectTypeOf } from 'bun:test';

import type { IndexedKeyedCollection } from '@rimbu/collection-types/collection/indexed-keyed';

type IK<K = number, V = string> = IndexedKeyedCollection<K, V>;
type IKN<K = number, V = string> = IndexedKeyedCollection.NonEmpty<K, V>;
type IKB<K = number, V = string> =
	IndexedKeyedCollection.Advanced.ExtendFamily<K, V>['_BUILDER'];

declare const ik: IK;

// indexOf: OptLazy fallback
expectTypeOf(ik.indexOf(1)).toEqualTypeOf<number | undefined>();
expectTypeOf(ik.indexOf(1, -1)).toEqualTypeOf<number>();
expectTypeOf(ik.indexOf(1, () => -1)).toEqualTypeOf<number>();

// composed keyed + indexed members
expectTypeOf(ik.get(1)).toEqualTypeOf<string | undefined>();
expectTypeOf(ik.at(0)).toEqualTypeOf<readonly [number, string] | undefined>();
const takeIK: IK = ik.take(2);

// builder
declare const ikb: IKB;
expectTypeOf(ikb.indexOf(1)).toEqualTypeOf<number | undefined>();
expectTypeOf(ikb.indexOf(1, -1)).toEqualTypeOf<number>();

// variance
expectTypeOf<IKN<number, string>>().toExtend<IK<number, string>>();

void [takeIK];
