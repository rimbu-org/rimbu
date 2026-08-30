import type { Collection } from '@rimbu/collection-types/collection';
import type { IndexedKeyedSortedCollection } from '@rimbu/collection-types/collection/indexed-keyed-sorted';
import type { MapCollection } from '@rimbu/collection-types/map';
import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
import type { IndexedCollection } from '@rimbu/collection-types/collection/indexed';
import type { RMapBase } from '@rimbu/collection-types/advanced/map/base';
import type { Comp } from '@rimbu/common/comp';
import type { IndexRange } from '@rimbu/common/index-range';
import type { OptLazy } from '@rimbu/common';
import type { Range } from '@rimbu/common/range';
import type { Stream, StreamSource } from '@rimbu/stream';

import { createSortedMapContextModule } from '#map/context-factory';

export interface SortedMap<K, V>
  extends SortedMap.Advanced.Api<
    K,
    V,
    Collection.Advanced.Types<SortedMap.Advanced.Family<K, V>, readonly [K, V]>
  > {}

export namespace SortedMap {
  export interface NonEmpty<K, V>
    extends Advanced.Api<
      K,
      V,
      Collection.Advanced.TypesNonEmpty<Advanced.Family<K, V>, readonly [K, V]>
    > {}

  export interface Builder<K, V>
    extends Advanced.BuilderApi<
      K,
      V,
      Collection.Advanced.Types<Advanced.Family<K, V>, readonly [K, V]>
    > {}

  export interface Context<UK>
    extends Advanced.ContextApi<UK, SortedMap.Advanced.Family<UK, any>> {}

  export namespace Advanced {
    export interface Api<
      K,
      V,
      Tp extends Collection.Advanced.TypesBase,
    > extends MapCollection.Advanced.Api<K, V, Tp>,
        IndexedKeyedSortedCollection.Advanced.Api<K, V, Tp>,
        Collection.Capability.WithAdd.Api<readonly [K, V], Tp>,
        Collection.Capability.WithMutate.Api<readonly [K, V], Tp>,
        Collection.Capability.WithToBuilder.Api<readonly [K, V], Tp>,
        KeyedCollection.Capability.WithRemove.Api<K, V, Tp>,
        KeyedCollection.Capability.WithMapValues.Api<K, V, Tp>,
        MapCollection.Capability.WithSet.Api<K, V, Tp>,
        MapCollection.Capability.WithUpdateAtKey.Api<K, V, Tp>,
        MapCollection.Capability.WithModifyAtKey.Api<K, V, Tp>,
        IndexedCollection.Capability.WithRemoveAt.Api<readonly [K, V], Tp> {
      stream(options?: { reversed?: boolean | undefined } | undefined): any;
      streamKeys(options?: { reversed?: boolean | undefined } | undefined): any;
      streamValues(options?: { reversed?: boolean | undefined } | undefined): any;
      streamRange(
        range: Range<K>,
        options?: { reversed?: boolean | undefined } | undefined,
      ): Stream<readonly [K, V]>;
      streamSliceIndex(
        range: IndexRange,
        options?: { reversed?: boolean | undefined } | undefined,
      ): Stream<readonly [K, V]>;
      /** @deprecated use `streamRange` or `streamSlice` */
      min(...args: any[]): any;
      /** @deprecated use `min` */
      minKey(...args: any[]): any;
      /** @deprecated use `min` */
      minValue(...args: any[]): any;
      /** @deprecated use `streamRange` or `streamSlice` */
      max(...args: any[]): any;
      /** @deprecated use `max` */
      maxKey(...args: any[]): any;
      /** @deprecated use `max` */
      maxValue(...args: any[]): any;
      /** @deprecated use `indexOf` */
      findIndex(...args: any[]): any;
      lowerBound(...args: any[]): any;
      upperBound(...args: any[]): any;
      nextEntry(...args: any[]): any;
      previousEntry(...args: any[]): any;
      /** @deprecated use `at` */
      atIndex(index: number): readonly [K, V] | undefined;
      /** @deprecated use `at` */
      atIndex<O>(index: number, otherwise: OptLazy<O>): readonly [K, V] | O;
      take(amount: any): any;
      drop(amount: any): any;
      /** @deprecated use `slice` */
      sliceIndex(range: any): any;
      slice(range: any): any;
      readonly comp: Comp<K>;
      /** @deprecated use `add` */
      addEntry(entry: readonly [K, V]): Tp['_NON_EMPTY'];
      /** @deprecated use `addAll` */
      addEntries(entries: StreamSource<readonly [K, V]>): Tp['_NORMAL'];
      /** @deprecated use `has` */
      hasKey(...args: any[]): any;
      /** @deprecated use `get` */
      at(...args: any[]): any;
      /** @deprecated use `modifyAtKey` */
      modifyAt(...args: any[]): any;
      /** @deprecated use `updateAtKey` */
      updateAt(...args: any[]): any;
      /** @deprecated use `updateAtKeyAndReturn` */
      updateAtAndGet(...args: any[]): any;
      /** @deprecated use `remove` */
      removeKey(...args: any[]): any;
      /** @deprecated use `removeAll` */
      removeKeys(...args: any[]): any;
      /** @deprecated use `removeAndReturn` */
      removeKeyAndGet(...args: any[]): any;
      /** @deprecated use `removeAndReturn` */
      removeKeyAndReturn(...args: any[]): any;
    }

    export interface BuilderApi<K, V, Tp extends Collection.Advanced.TypesBase>
      extends MapCollection.Advanced.BuilderApi<K, V, Tp>,
        IndexedKeyedSortedCollection.Advanced.BuilderApi<K, V, Tp>,
        Collection.Capability.WithAdd.BuilderApi<readonly [K, V], Tp>,
        KeyedCollection.Capability.WithRemove.BuilderApi<K, V, Tp>,
        KeyedCollection.Capability.WithMapValues.BuilderApi<K, V, Tp>,
        MapCollection.Capability.WithSet.BuilderApi<K, V, Tp>,
        MapCollection.Capability.WithUpdateAtKey.BuilderApi<K, V, Tp>,
        MapCollection.Capability.WithModifyAtKey.BuilderApi<K, V, Tp>,
        IndexedCollection.Capability.WithRemoveAt.BuilderApi<readonly [K, V], Tp> {
      /** @deprecated use `add` */
      addEntry(entry: readonly [K, V]): boolean;
      /** @deprecated use `addAll` */
      addEntries(entries: StreamSource<readonly [K, V]>): boolean;
      /** @deprecated use `has` */
      hasKey(...args: any[]): any;
      /** @deprecated use `get` */
      at(...args: any[]): any;
      /** @deprecated use `modifyAtKey` */
      modifyAt(...args: any[]): any;
      /** @deprecated use `updateAtKey` */
      updateAt(...args: any[]): any;
      min(): readonly [K, V] | undefined;
      min<O>(otherwise: OptLazy<O>): readonly [K, V] | O;
      max(): readonly [K, V] | undefined;
      max<O>(otherwise: OptLazy<O>): readonly [K, V] | O;
      /** @deprecated use `at` */
      atIndex(index: number): readonly [K, V] | undefined;
      /** @deprecated use `at` */
      atIndex<O>(index: number, otherwise: OptLazy<O>): readonly [K, V] | O;
    }

    export interface ContextApi<
      UK,
      FAM extends KeyedCollection.Advanced.Family<UK, any>,
    > extends MapCollection.Advanced.ContextApi<FAM>,
        Collection.Capability.WithReducer.ContextApi<FAM> {
      readonly typeTag: 'SortedMap';
      readonly comp: Comp<UK>;
      readonly blockSizeBits: number;
    }

    export interface KeyedContextApi<
      UK,
      FAM extends KeyedCollection.Advanced.Family<UK, any>,
    > extends KeyedCollection.Advanced.KeyedContextApi<FAM>,
        KeyedCollection.Capability.WithMerge.KeyedContextApi<FAM>,
        KeyedCollection.Capability.WithReducer.KeyedContextApi<FAM> {
      createContext<K>(options?: {
        comp?: Comp<K> | undefined;
        blockSizeBits?: number | undefined;
      }): Context<K>;
    }

    export interface Family<K, V> extends MapCollection.Advanced.Family<K, V> {
      _NORMAL: SortedMap<K, V>;
      _NON_EMPTY: SortedMap.NonEmpty<K, V>;
      _BUILDER: SortedMap.Builder<K, V>;
      _CONTEXT: SortedMap.Context<K>;
      _KEYED_CONTEXT: KeyedContextApi<K, this['_FAM']>;

      _UPPER_E: readonly [K, any];

      _FAM: Family<K, V>;
      _NEW_FAMILY: Family<this['_NEW_K'], this['_NEW_V']>;
    }

    export type DefaultFactory = KeyedContextApi<any, Family<any, any>>;
  }

  // @ts-ignore
  export interface Types extends RMapBase.Types {
    readonly normal: SortedMap<this['_K'], this['_V']>;
    readonly nonEmpty: SortedMap.NonEmpty<this['_K'], this['_V']>;
    readonly context: SortedMap.Context<this['_K']>;
    readonly builder: SortedMap.Builder<this['_K'], this['_V']>;
  }
}

export const SortedMap: SortedMap.Advanced.DefaultFactory =
  createSortedMapContextModule().build() as unknown as SortedMap.Advanced.DefaultFactory;
