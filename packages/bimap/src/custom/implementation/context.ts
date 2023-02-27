import { Instances } from '@rimbu/base';
import type { BiMap } from '@rimbu/bimap';
import {
  BiMapBuilder,
  BiMapEmpty,
  BiMapNonEmptyImpl,
} from '@rimbu/bimap/custom';
import { ArrayNonEmpty, generateUUID, Reducer } from '@rimbu/common';
import { HashMap } from '@rimbu/hashed';
import type { StreamSource } from '@rimbu/stream';
import { isEmptyStreamSourceInstance } from '@rimbu/stream/custom';

export class BiMapContext<UK, UV, Tp extends BiMap.Types = BiMap.Types>
  implements BiMap.Context<UK, UV>
{
  constructor(
    options: BiMap.Context.Options<UK, UV> = {},
    readonly keyValueContext = options.keyValueContext ??
      HashMap.defaultContext(),
    readonly valueKeyContext = options.valueKeyContext ??
      HashMap.defaultContext(),
    readonly contextId = options.contextId ?? generateUUID()
  ) {}

  get typeTag(): 'BiMap' {
    return 'BiMap';
  }

  get _types(): Tp {
    return undefined as any;
  }

  readonly _empty: BiMap<any, any> = Object.freeze(
    new BiMapEmpty<any, any>(this)
  );

  readonly empty = <K extends UK, V extends UV>(): BiMap<K, V> => {
    return this._empty;
  };

  readonly of: any = <K, V>(
    ...entries: ArrayNonEmpty<readonly [K, V]>
  ): [K, V] extends [UK, UV] ? BiMap.NonEmpty<K, V> : never => {
    return this.from(entries);
  };

  readonly from = <K, V>(
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

  readonly builder = <K extends UK, V extends UV>(): BiMap.Builder<K, V> => {
    return new BiMapBuilder(this as unknown as BiMapContext<K, V>);
  };

  readonly reducer = <K extends UK, V extends UV>(
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

  readonly isImmutableInstance = <K = unknown, V = unknown>(
    source: any
  ): source is BiMap<K, V> =>
    typeof source === 'object' &&
    source?.context?.typeTag === this.typeTag &&
    Instances.isImmutableInstance(source);

  readonly isBuilderInstance = <K = unknown, V = unknown>(
    source: any
  ): source is BiMap.Builder<K, V> =>
    typeof source === 'object' &&
    source?.context?.typeTag === this.typeTag &&
    Instances.isBuilderInstance(source);

  readonly toJSON = (): BiMap.Context.Serialized => ({
    typeTag: this.typeTag,
    contextId: this.contextId,
    keyValueContext: this.keyValueContext.toJSON(),
    valueKeyContext: this.valueKeyContext.toJSON(),
  });
}
