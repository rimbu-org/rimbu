import { expectTypeOf } from 'bun:test';

import type { Collection } from '@rimbu/collection-types/collection';
import type { SortedCollection } from '@rimbu/collection-types/collection/sorted';

type S<E = number, K = string> = SortedCollection<E, K>;
type SNE<E = number, K = string> = SortedCollection.NonEmpty<E, K>;

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

type WithMinMax<E> = SortedCollection.Capability.WithMinMax<E>;
type WithNeighbor<E, K> = SortedCollection.Capability.WithNeighbor<E, K>;

declare const s: S;
declare const sne: SNE;

// ---------------------------------------------------------------------------
// SortedCollection.Advanced.Api
// ---------------------------------------------------------------------------

// kind-conditional min/max
expectTypeOf(s.min()).toEqualTypeOf<number | undefined>();
expectTypeOf(s.min(0)).toEqualTypeOf<number>();
expectTypeOf(sne.min()).toEqualTypeOf<number>();
// @ts-expect-error a fallback is not accepted on a NonEmpty collection
sne.min(0);
expectTypeOf(s.max()).toEqualTypeOf<number | undefined>();
expectTypeOf(s.max(0)).toEqualTypeOf<number>();
expectTypeOf(sne.max()).toEqualTypeOf<number>();

// neighbors: OptLazy fallback inside options
expectTypeOf(s.next('a')).toEqualTypeOf<number | undefined>();
expectTypeOf(s.next('a', { inclusive: true })).toEqualTypeOf<
	number | undefined
>();
expectTypeOf(s.next('a', { otherwise: 0 })).toEqualTypeOf<number>();
expectTypeOf(s.previous('a')).toEqualTypeOf<number | undefined>();
expectTypeOf(s.previous('a', { otherwise: 0 })).toEqualTypeOf<number>();

declare const sb: SortedCollection.Builder<number, string>;
expectTypeOf(sb.min()).toEqualTypeOf<number | undefined>();
expectTypeOf(sb.min(0)).toEqualTypeOf<number>();
expectTypeOf(sb.max()).toEqualTypeOf<number | undefined>();
expectTypeOf(sb.next('a')).toEqualTypeOf<number | undefined>();
expectTypeOf(sb.next('a', { otherwise: 0 })).toEqualTypeOf<number>();
expectTypeOf(sb.previous('a')).toEqualTypeOf<number | undefined>();

// ---------------------------------------------------------------------------
// Capabilities (isolated)
// ---------------------------------------------------------------------------

declare const minmax: N<WithMinMax<number>, number>;
declare const minmaxNE: NE<WithMinMax<number>, number>;
expectTypeOf(minmax.min()).toEqualTypeOf<number | undefined>();
expectTypeOf(minmax.max(0)).toEqualTypeOf<number>();
expectTypeOf(minmaxNE.min()).toEqualTypeOf<number>();
// @ts-expect-error a fallback is not accepted on the NonEmpty kind
minmaxNE.max(0);

declare const neighbor: N<WithNeighbor<number, string>, number>;
expectTypeOf(neighbor.next('a')).toEqualTypeOf<number | undefined>();
expectTypeOf(neighbor.next('a', { otherwise: 'x' })).toEqualTypeOf<
	number | string
>();
expectTypeOf(neighbor.previous('a')).toEqualTypeOf<number | undefined>();

// ---------------------------------------------------------------------------
// Variance
// ---------------------------------------------------------------------------

expectTypeOf<S<number>>().toExtend<S<number | string>>();
expectTypeOf<S<number | string>>().not.toExtend<S<number>>();
expectTypeOf<SNE<number>>().toExtend<S<number>>();
