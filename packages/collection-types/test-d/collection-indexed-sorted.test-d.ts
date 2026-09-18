import { expectTypeOf } from 'bun:test';

import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedSortedCollection } from '@rimbu/collection-types/collection/indexed-sorted';

type IS<E = number, K = string> = IndexedSortedCollection<E, K>;
type ISN<E = number, K = string> = IndexedSortedCollection.NonEmpty<E, K>;
type ISB<E = number, K = string> =
	IndexedSortedCollection.Advanced.ExtendFamily<E, K>['_BUILDER'];

type Tp<
	F extends Collection.Advanced.FamilyBase<any>,
	E,
> = Collection.Advanced.Types<F, E>;
type N<
	F extends Collection.Advanced.FamilyBase<any>,
	E,
> = Tp<F, E>['_NORMAL'];

declare const is: IS;

// indexOf: OptLazy fallback
expectTypeOf(is.indexOf('a')).toEqualTypeOf<number | undefined>();
expectTypeOf(is.indexOf('a', -1)).toEqualTypeOf<number>();
expectTypeOf(is.indexOf('a', () => -1)).toEqualTypeOf<number>();

// bounds
expectTypeOf(is.lowerBound('a')).toEqualTypeOf<number>();
expectTypeOf(is.upperBound('a')).toEqualTypeOf<number>();

// composed sorted + indexed members
expectTypeOf(is.min()).toEqualTypeOf<number | undefined>();
expectTypeOf(is.next('a')).toEqualTypeOf<number | undefined>();
expectTypeOf(is.at(0)).toEqualTypeOf<number | undefined>();
const takeIS: IS = is.take(2);

// builder
declare const isb: ISB;
expectTypeOf(isb.indexOf('a')).toEqualTypeOf<number | undefined>();
expectTypeOf(isb.indexOf('a', -1)).toEqualTypeOf<number>();
expectTypeOf(isb.lowerBound('a')).toEqualTypeOf<number>();
expectTypeOf(isb.upperBound('a')).toEqualTypeOf<number>();

// isolated capabilities
declare const indexOfCap: N<
	IndexedSortedCollection.Capability.WithIndexOf<number, string>,
	number
>;
expectTypeOf(indexOfCap.indexOf('a')).toEqualTypeOf<number | undefined>();
expectTypeOf(indexOfCap.indexOf('a', -1)).toEqualTypeOf<number>();
declare const boundsCap: N<
	IndexedSortedCollection.Capability.WithBounds<number, string>,
	number
>;
expectTypeOf(boundsCap.lowerBound('a')).toEqualTypeOf<number>();
expectTypeOf(boundsCap.upperBound('a')).toEqualTypeOf<number>();

// kind
declare const isn: ISN;
expectTypeOf(isn.min()).toEqualTypeOf<number>();

// variance
expectTypeOf<ISN<number, string>>().toExtend<IS<number, string>>();

void [takeIS];
