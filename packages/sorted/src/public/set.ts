import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedValuedSortedCollection } from '@rimbu/collection-types/collection/indexed-valued-sorted';
import type { SetCollection } from '@rimbu/collection-types/set';
import type { ValuedCollection } from '@rimbu/collection-types/collection/valued';
import type { IndexedCollection } from '@rimbu/collection-types/collection/indexed';
import type { Comp } from '@rimbu/common/comp';
import type { IndexRange } from '@rimbu/common/index-range';
import type { OptLazy } from '@rimbu/common';
import type { Range } from '@rimbu/common/range';
import type { Stream } from '@rimbu/stream';

import { createSortedSetContextModule } from '#set/context-factory';

export interface SortedSet<E>
  extends SortedSet.Advanced.Api<
    E,
    Collection.Advanced.Types<SortedSet.Advanced.Family<E>, E>
  > {}

export namespace SortedSet {
  export interface NonEmpty<E>
    extends Advanced.Api<
      E,
      Collection.Advanced.TypesNonEmpty<Advanced.Family<E>, E>
    > {}

  export interface Builder<E>
    extends Advanced.BuilderApi<
      E,
      Collection.Advanced.Types<Advanced.Family<E>, E>
    > {}

  export interface Context<UE>
    extends Advanced.ContextApi<UE, SortedSet.Advanced.Family<UE>> {}

  export namespace Advanced {
    // @ts-ignore - HKT family variance, allow any for _UPPER_E
    export interface Api<E, Tp extends Collection.Advanced.TypesBase>
      extends SetCollection.Advanced.Api<E, Tp>,
        IndexedValuedSortedCollection.Advanced.Api<E, Tp>,
        Collection.Capability.WithAdd.Api<E, Tp>,
        Collection.Capability.WithToBuilder.Api<E, Tp>,
        ValuedCollection.Capability.WithDifferenceAndIntersection.Api<E, Tp>,
        ValuedCollection.Capability.WithRemove.Api<E, Tp>,
        ValuedCollection.Capability.WithSymmetricDifferenceAndUnion.Api<E, Tp>,
        IndexedCollection.Capability.WithRemoveAt.Api<E, Tp> {
      stream(options?: { reversed?: boolean }): Tp['_AS_STREAM'];
      streamRange(
        range: Range<E>,
        options?: { reversed?: boolean },
      ): Stream<E>;
      streamSliceIndex(
        range: IndexRange,
        options?: { reversed?: boolean },
      ): Stream<E>;
      lowerBound(value: E): number;
      upperBound(value: E): number;
      atIndex<O>(index: number, otherwise?: OptLazy<O>): E | O;
      sliceIndex(range: IndexRange): Tp['_NORMAL'];
      slice(range: Range<E>): Tp['_NORMAL'];
      readonly comp: Comp<E>;
    }

    export interface BuilderApi<E, Tp extends Collection.Advanced.TypesBase>
      extends SetCollection.Advanced.BuilderApi<E, Tp>,
        IndexedValuedSortedCollection.Advanced.BuilderApi<E, Tp>,
        Collection.Capability.WithAdd.BuilderApi<E, Tp>,
        ValuedCollection.Capability.WithRemove.BuilderApi<E, Tp>,
        IndexedCollection.Capability.WithRemoveAt.BuilderApi<E, Tp> {
      min(): E | undefined;
      min<O>(otherwise: OptLazy<O>): E | O;
      max(): E | undefined;
      max<O>(otherwise: OptLazy<O>): E | O;
    }

    export interface ContextApi<
      UE,
      F extends SetCollection.Advanced.Family<UE>,
    > extends SetCollection.Advanced.ContextApi<F>,
        Collection.Capability.WithReducer.ContextApi<F> {
      readonly typeTag: 'SortedSet';
      readonly comp: Comp<UE>;
      readonly blockSizeBits: number;
    }

    // @ts-ignore - HKT variance
    export interface Family<E>
      extends SetCollection.Advanced.Family<E>,
        IndexedValuedSortedCollection.Advanced.Family<E> {
      _NORMAL: SortedSet<E>;
      _NON_EMPTY: SortedSet.NonEmpty<E>;
      _BUILDER: SortedSet.Builder<E>;
      _CONTEXT: SortedSet.Context<E>;

      _UPPER_E: E;
      _INVARIANT: (element: E) => E;

      _FAM: Family<E>;
      _NEW_FAMILY: Family<this['_NEW_E']>;
    }

    export type DefaultFactory = Pick<
      Context<any>,
      'builder' | 'empty' | 'from' | 'of' | 'reducer'
    > & {
      createContext<E>(options?: {
        comp?: Comp<E> | undefined;
        blockSizeBits?: number | undefined;
      }): Context<E>;
      defaultContext<E>(): Context<E>;
    };
  }
}

export const SortedSet: SortedSet.Advanced.DefaultFactory =
  createSortedSetContextModule().build() as unknown as SortedSet.Advanced.DefaultFactory;
