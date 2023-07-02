import type { Token } from '../../base/mod.ts';
import type {
  OptLazy,
  OptLazyOr,
  RelatedTo,
  TraverseState,
} from '../../common/mod.ts';
import type { StreamSource } from '../../stream/mod.ts';
import type { RMapBase } from '../../collection-types/map-custom/index.ts';
import { HashMap } from '../../hashed/map/index.ts';

import type { ProximityMap } from '../../proximity/map/index.ts';
import { wrapHashMap } from './wrapping.ts';

export class ProximityMapBuilder<K, V> implements ProximityMap.Builder<K, V> {
  private readonly internalBuilder: HashMap.Builder<K, V>;

  constructor(
    readonly context: ProximityMap.Context<K>,
    private source?: ProximityMap.NonEmpty<K, V>
  ) {
    this.internalBuilder = context.hashMapContext.builder();
    this.internalBuilder.addEntries(source);
  }

  get size(): number {
    return this.internalBuilder.size;
  }

  get isEmpty(): boolean {
    return this.internalBuilder.isEmpty;
  }

  /**
   * Applying `get()` to the Builder does NOT apply the proximity algorithm - which would
   * be pointless at this construction stage; the internal, hash-based builder
   * is queried instead
   *
   */
  get = <UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O => {
    if (undefined !== this.source) return this.source.get(key, otherwise!);

    return this.internalBuilder.get(key, otherwise!);
  };

  // prettier-ignore
  hasKey = <UK = K,>(key: RelatedTo<K, UK>): boolean => {
    return this.internalBuilder.hasKey(key);
  };

  forEach = (
    f: (entry: readonly [K, V], index: number, halt: () => void) => void,
    state?: TraverseState | undefined
  ): void => {
    this.internalBuilder.forEach(f, state);
  };

  addEntry = (entry: readonly [K, V]): boolean => {
    const hasChanged = this.internalBuilder.addEntry(entry);

    if (hasChanged) {
      this.source = undefined;
    }

    return hasChanged;
  };

  addEntries = (entries: StreamSource<readonly [K, V]>): boolean => {
    const hasChanged = this.internalBuilder.addEntries(entries);

    if (hasChanged) {
      this.source = undefined;
    }

    return hasChanged;
  };

  set = (key: K, value: V): boolean => {
    const hasChanged = this.internalBuilder.set(key, value);

    if (hasChanged) {
      this.source = undefined;
    }

    return hasChanged;
  };

  removeKey = <UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O => {
    if (this.internalBuilder.hasKey(key)) {
      this.source = undefined;
    }

    return this.internalBuilder.removeKey(key, otherwise!);
  };

  // prettier-ignore
  removeKeys = <UK = K,>(keys: StreamSource<RelatedTo<K, UK>>): boolean => {
    const hasChanged = this.internalBuilder.removeKeys(keys);

    if (hasChanged) {
      this.source = undefined;
    }

    return hasChanged;
  };

  modifyAt = (
    key: K,
    options: {
      ifNew?: OptLazyOr<V, typeof Token>;
      ifExists?: <V2 extends V = V>(
        currentValue: V & V2,
        remove: typeof Token
      ) => V | typeof Token;
    }
  ): boolean => {
    const hasChanged = this.internalBuilder.modifyAt(key, options);

    if (hasChanged) {
      this.source = undefined;
    }

    return hasChanged;
  };

  // prettier-ignore
  updateAt = <O,>(
    key: K,
    update: RMapBase.Update<V>,
    otherwise?: OptLazy<O>
  ): V | O => {
    const previousValue = this.internalBuilder.updateAt(
      key,
      update,
      otherwise!
    );

    const newValue = this.internalBuilder.get(key);

    if (previousValue !== newValue) {
      this.source = undefined;
    }

    return previousValue;
  };

  build = (): ProximityMap<K, V> => {
    return this.source !== undefined
      ? this.source
      : wrapHashMap(this.context, this.internalBuilder.build());
  };

  // prettier-ignore
  buildMapValues = <V2,>(
    mapFun: (value: V, key: K) => V2
  ): ProximityMap<K, V2> => {
    return wrapHashMap(
      this.context,
      this.internalBuilder.buildMapValues(mapFun)
    );
  };
}
