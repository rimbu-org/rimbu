import {
  BiMultiMapBuilder,
  BiMultiMapEmpty,
  BiMultiMapNonEmpty,
  type BiMultiMapBase,
} from '../../../bimultimap/custom/index.ts';

import type { WithKeyValue } from '../../../collection-types/map-custom/index.ts';
import type { ArrayNonEmpty } from '../../../common/mod.ts';
import { Reducer, type StreamSource } from '../../../stream/mod.ts';
import { isEmptyStreamSourceInstance } from '../../../stream/custom/index.ts';

export interface ContextTypesImpl extends BiMultiMapBase.Types {
  readonly context: BiMultiMapContext<this['_K'], this['_V'], string>;
}

export class BiMultiMapContext<
  UK,
  UV,
  N extends string,
  Tp extends ContextTypesImpl = ContextTypesImpl,
> implements BiMultiMapBase.Context<UK, UV, Tp>
{
  constructor(
    readonly typeTag: N,
    readonly keyValueMultiMapContext: WithKeyValue<
      Tp,
      UK,
      UV
    >['keyValueMultiMapContext'],
    readonly valueKeyMultiMapContext: WithKeyValue<
      Tp,
      UK,
      UV
    >['valueKeyMultiMapContext']
  ) {}

  readonly _fixTypes!: any;

  get _types(): Tp {
    return undefined as any;
  }

  readonly _empty = Object.freeze(
    new BiMultiMapEmpty<UK, UV, Tp>(this)
  ) as WithKeyValue<Tp, UK, UV>['normal'];

  readonly empty = <K extends UK, V extends UV>(): WithKeyValue<
    Tp,
    K,
    V
  >['normal'] => {
    return this._empty;
  };

  readonly of: any = <K extends UK, V extends UV>(
    ...entries: ArrayNonEmpty<readonly [K, V]>
  ): [K, V] extends [UK, UV] ? WithKeyValue<Tp, K, V>['nonEmpty'] : never => {
    return this.from(entries);
  };

  readonly from = <K extends UK, V extends UV>(
    ...sources: ArrayNonEmpty<StreamSource<readonly [K, V]>>
  ): [K, V] extends [UK, UV]
    ? WithKeyValue<Tp, K, V>['normal'] | any
    : never => {
    if (sources.length === 1) {
      const source = sources[0];
      if (source instanceof BiMultiMapNonEmpty && source.context === this)
        return source as any;
    }

    let builder = this.builder<K, V>();

    let i = -1;
    const length = sources.length;

    while (++i < length) {
      const source = sources[i];

      if (isEmptyStreamSourceInstance(source)) continue;
      if (
        builder.isEmpty &&
        source instanceof BiMultiMapNonEmpty &&
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

  readonly builder = <K extends UK, V extends UV>(): WithKeyValue<
    Tp,
    K,
    V
  >['builder'] => {
    return new BiMultiMapBuilder<K, V, Tp>(this) as WithKeyValue<
      Tp,
      K,
      V
    >['builder'];
  };

  readonly reducer = <K extends UK, V extends UV>(
    source?: StreamSource<readonly [K, V]>
  ): Reducer<readonly [K, V], WithKeyValue<Tp, K, V>['normal']> => {
    return Reducer.create(
      () =>
        undefined === source
          ? this.builder<K, V>()
          : (this.from(source) as WithKeyValue<Tp, K, V>['normal']).toBuilder(),
      (builder, entry) => {
        builder.add(entry[0], entry[1]);
        return builder;
      },
      (builder) => builder.build()
    );
  };

  createBuilder<K extends UK, V extends UV>(
    source?: WithKeyValue<Tp, K, V>['nonEmpty']
  ): WithKeyValue<Tp, K, V>['builder'] {
    return new BiMultiMapBuilder<K, V, Tp>(this, source) as WithKeyValue<
      Tp,
      K,
      V
    >['builder'];
  }

  createNonEmpty<K, V>(
    keyValueMultiMap: WithKeyValue<Tp, K, V>['keyValueMultiMapNonEmpty'],
    valueKeyMultiMap: WithKeyValue<Tp, K, V>['valueKeyMultiMapNonEmpty']
  ): WithKeyValue<Tp, K, V>['nonEmpty'] {
    return new BiMultiMapNonEmpty<K, V, Tp>(
      this,
      keyValueMultiMap,
      valueKeyMultiMap
    ) as WithKeyValue<Tp, K, V>['nonEmpty'];
  }
}
