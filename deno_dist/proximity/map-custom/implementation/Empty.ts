import { Token } from '../../../base/mod.ts';
import { EmptyBase } from '../../../collection-types/map-custom/index.ts';
import { OptLazy, OptLazyOr, ToJSON } from '../../../common/mod.ts';
import { Stream, StreamSource } from '../../../stream/mod.ts';
import type { ProximityMap } from '../../map/index.ts';

export class ProximityMapEmpty<K = any, V = any>
  extends EmptyBase
  implements ProximityMap<K, V>
{
  constructor(readonly context: ProximityMap.Context<K>) {
    super();
  }

  streamKeys(): Stream<K> {
    return Stream.empty();
  }

  streamValues(): Stream<V> {
    return Stream.empty();
  }

  get<O>(_key: K, otherwise?: OptLazy<O>): O {
    return OptLazy(otherwise) as O;
  }

  hasKey(): false {
    return false;
  }

  set(key: K, value: V): ProximityMap.NonEmpty<K, V> {
    return this.context.from([[key, value]]);
  }

  addEntry(entry: readonly [K, V]): ProximityMap.NonEmpty<K, V> {
    return this.context.from([entry]);
  }

  addEntries(
    entries: StreamSource<readonly [K, V]>
  ): ProximityMap.NonEmpty<K, V> {
    return this.context.from(entries) as ProximityMap.NonEmpty<K, V>;
  }

  removeKeyAndGet(): undefined {
    return undefined;
  }

  removeKey(): ProximityMap<K, V> {
    return this;
  }

  removeKeys(): ProximityMap<K, V> {
    return this;
  }

  modifyAt(
    atKey: K,
    options: {
      ifNew?: OptLazyOr<V, Token>;
    }
  ): ProximityMap<K, V> {
    if (!options.ifNew) {
      return this;
    }

    const value = OptLazyOr<V, Token>(options.ifNew, Token);

    if (value === Token) return this;

    return this.set(atKey, value);
  }

  mapValues<V2>(): ProximityMap<K, V2> {
    return this as any;
  }

  updateAt(): ProximityMap<K, V> {
    return this;
  }

  toBuilder(): ProximityMap.Builder<K, V> {
    return this.context.builder();
  }

  override toString(): string {
    return `${this.context.typeTag}()`;
  }

  toJSON(): ToJSON<(readonly [K, V])[]> {
    return {
      dataType: this.context.typeTag,
      value: [],
    };
  }
}
