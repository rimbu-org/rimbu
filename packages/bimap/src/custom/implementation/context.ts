import type { RMap } from '@rimbu/collection-types/map';
import type { ArrayNonEmpty } from '@rimbu/common';
import { Reducer } from '@rimbu/common';
import type { StreamSource } from '@rimbu/stream';
import {
  BiMapBuilder,
  BiMapEmpty,
  BiMapNonEmptyImpl,
} from '@rimbu/bimap/custom';
import type { BiMap } from '@rimbu/bimap';
import { isEmptyStreamSourceInstance } from '@rimbu/stream/custom';

export class BiMapContext<UK, UV, Tp extends BiMap.Types = BiMap.Types>
  implements BiMap.Context<UK, UV>
{
  constructor(
    readonly keyValueContext: RMap.Context<UK>,
    readonly valueKeyContext: RMap.Context<UV>
  ) {}

  get typeTag(): 'BiMap' {
    return 'BiMap';
  }

  get _types(): Tp {
    return undefined as any;
  }

  readonly _empty: BiMap<any, any> = new BiMapEmpty<any, any>(this);

  empty = <K extends UK, V extends UV>(): BiMap<K, V> => {
    return this._empty;
  };

  of: any = <K, V>(
    ...entries: ArrayNonEmpty<readonly [K, V]>
  ): [K, V] extends [UK, UV] ? BiMap.NonEmpty<K, V> : never => {
    return this.from(entries);
  };

  from = <K, V>(
    ...sources: ArrayNonEmpty<StreamSource<readonly [K, V]>>
  ): [K, V] extends [UK, UV] ? BiMap<K, V> | any : never => {
    if (sources.length === 1) {
      const source = sources[0];
      if (source instanceof BiMapNonEmptyImpl && source.context === this)
        return source as any;
    }

    let builder: BiMap.Builder<K, V> = this.builder() as any;

    let i = -1;
    const length = sources.length;

    while (++i < length) {
      const source = sources[i];

      if (isEmptyStreamSourceInstance(source)) continue;
      if (
        builder.isEmpty &&
        source instanceof BiMapNonEmptyImpl &&
        source.context === this
      ) {
        if (i === length - 1) return source as any;
        builder = source.toBuilder();
        continue;
      }

      builder.addEntries(source);
    }

    return builder.build() as any;
  };

  builder = <K extends UK, V extends UV>(): BiMap.Builder<K, V> => {
    return new BiMapBuilder(this as unknown as BiMapContext<K, V>);
  };

  reducer = <K extends UK, V extends UV>(
    source?: StreamSource<readonly [K, V]>
  ): Reducer<readonly [K, V], BiMap<K, V>> => {
    return Reducer.create(
      () =>
        undefined === source
          ? this.builder<K, V>()
          : (this.from(source) as BiMap<K, V>).toBuilder(),
      (builder, entry) => {
        builder.addEntry(entry);
        return builder;
      },
      (builder) => builder.build()
    );
  };
}
