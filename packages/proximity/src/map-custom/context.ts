import { RMapBase } from '@rimbu/collection-types/map-custom';
import type { HashMap } from '@rimbu/hashed/map';

import type { DistanceFunction } from '@rimbu/proximity/common';
import type { ProximityMap } from '@rimbu/proximity/map';
import {
  ProximityMapEmpty,
  ProximityMapNonEmpty,
} from './implementation/index.mjs';
import { ProximityMapBuilder } from './builder.mjs';

/**
 * Default concrete implementation of {@link ProximityMap.Context}.<br/>
 * <br/>
 * It wires the configured {@link DistanceFunction} and `HashMap` context together and
 * is used by the `ProximityMap` factory methods to create new instances.
 *
 * @typeparam UK - the upper key type bound for which the context can be used
 */
export class ProximityMapContext<UK>
  extends RMapBase.ContextBase<UK, ProximityMap.Types>
  implements ProximityMap.Context<UK>
{
  readonly _empty: ProximityMap<any, any>;

  constructor(
    readonly distanceFunction: DistanceFunction<UK>,
    readonly hashMapContext: HashMap.Context<UK>
  ) {
    super();

    this._empty = Object.freeze(new ProximityMapEmpty<any, any>(this));
  }

  readonly typeTag = 'ProximityMap';

  isValidKey(key: any): key is UK {
    return true;
  }

  isNonEmptyInstance(source: any): source is any {
    return source instanceof ProximityMapNonEmpty;
  }

  readonly builder = <K extends UK, V>(): ProximityMap.Builder<K, V> => {
    return this.createBuilder();
  };

  createBuilder<K extends UK, V>(
    source?: ProximityMap.NonEmpty<K, V>
  ): ProximityMap.Builder<K, V> {
    return new ProximityMapBuilder<K, V>(this as any, source);
  }
}
