import { RMap } from '@rimbu/collection-types';
import { ArrayNonEmpty } from '@rimbu/common';
import { StreamSource } from '@rimbu/stream';
import { BiMapBuilder, BiMapEmpty, BiMapNonEmptyImpl } from '../bimap-custom';
import { BiMap } from '../internal';

export class BiMapContext<UK, UV, Tp extends BiMap.Types = BiMap.Types>
  implements BiMap.Context<UK, UV>
{
  constructor(
    readonly keyValueContext: RMap.Context<UK>,
    readonly valueKeyContext: RMap.Context<UV>
  ) {}

  readonly typeTag = 'BiMap';
  readonly _types!: Tp;
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

      if (StreamSource.isEmptyInstance(source)) continue;
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
}
