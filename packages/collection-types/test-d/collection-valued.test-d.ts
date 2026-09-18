import { expectTypeOf } from 'bun:test';

import type { StreamSource } from '@rimbu/stream';

import type { Collection } from '@rimbu/collection-types/collection';
import type { ValuedCollection } from '@rimbu/collection-types/collection/valued';

type V<E = number> = ValuedCollection<E>;
type VNE<E = number> = ValuedCollection.NonEmpty<E>;

type Tp<
	F extends Collection.Advanced.FamilyBase<any>,
	E,
> = Collection.Advanced.Types<F, E>;
type N<
	F extends Collection.Advanced.FamilyBase<any>,
	E,
> = Tp<F, E>['_NORMAL'];
type NE<
	F extends Collection.Advanced.FamilyBase<any>,
	E,
> = Tp<F, E>['_NON_EMPTY'];
type B<
	F extends Collection.Advanced.FamilyBase<any>,
	E,
> = Tp<F, E>['_BUILDER'];

type WithDifference<E> = ValuedCollection.Capability.WithDifference<E>;
type WithIntersection<E> = ValuedCollection.Capability.WithIntersection<E>;
type WithRemove<E> = ValuedCollection.Capability.WithRemove<E>;
type WithRemoveAll<E> = ValuedCollection.Capability.WithRemoveAll<E>;
type WithSymmetricDifference<E> =
	ValuedCollection.Capability.WithSymmetricDifference<E>;
type WithUnion<E> = ValuedCollection.Capability.WithUnion<E>;

declare const v: V;
declare const vne: VNE;
declare const streamN: StreamSource<number>;
declare const streamNE: StreamSource.NonEmpty<number>;

// ---------------------------------------------------------------------------
// ValuedCollection.Advanced.Api (adds `has`)
// ---------------------------------------------------------------------------

expectTypeOf(v.has(1)).toEqualTypeOf<boolean>();
expectTypeOf(vne.has(1)).toEqualTypeOf<boolean>();
// @ts-expect-error a value of the wrong element type is rejected
v.has('a');

// ---------------------------------------------------------------------------
// Capabilities
// ---------------------------------------------------------------------------

declare const difference: N<WithDifference<number>, number>;
expectTypeOf(difference.difference(streamN)).toEqualTypeOf<
	N<WithDifference<number>, number>
>();

declare const intersection: N<WithIntersection<number>, number>;
expectTypeOf(intersection.intersection(streamN)).toEqualTypeOf<
	N<WithIntersection<number>, number>
>();

declare const remove: N<WithRemove<number>, number>;
declare const removeBuilder: B<WithRemove<number>, number>;
expectTypeOf(remove.remove(1)).toEqualTypeOf<N<WithRemove<number>, number>>();
expectTypeOf(removeBuilder.remove(1)).toEqualTypeOf<boolean>();

declare const removeAll: N<WithRemoveAll<number>, number>;
declare const removeAllBuilder: B<WithRemoveAll<number>, number>;
expectTypeOf(removeAll.removeAll(streamN)).toEqualTypeOf<
	N<WithRemoveAll<number>, number>
>();
expectTypeOf(removeAllBuilder.removeAll(streamN)).toEqualTypeOf<boolean>();

declare const symDifference: N<WithSymmetricDifference<number>, number>;
expectTypeOf(symDifference.symmetricDifference(streamN)).toEqualTypeOf<
	N<WithSymmetricDifference<number>, number>
>();

// WithUnion: NonEmpty-first overload
declare const union: N<WithUnion<number>, number>;
declare const unionNE: NE<WithUnion<number>, number>;
expectTypeOf(union.union(streamNE)).toEqualTypeOf<NE<WithUnion<number>, number>>();
expectTypeOf(union.union(streamN)).toEqualTypeOf<N<WithUnion<number>, number>>();
expectTypeOf(unionNE.union(streamN)).toEqualTypeOf<
	NE<WithUnion<number>, number>
>();

// ---------------------------------------------------------------------------
// Variance
// ---------------------------------------------------------------------------

expectTypeOf<V<number>>().toExtend<V<number | string>>();
expectTypeOf<V<number | string>>().not.toExtend<V<number>>();
expectTypeOf<VNE<number>>().toExtend<V<number>>();
