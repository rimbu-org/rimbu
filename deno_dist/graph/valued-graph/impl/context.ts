import type { ArrayNonEmpty } from '../../../common/mod.ts';
import { Reducer } from '../../../common/mod.ts';
import { StreamSource } from '../../../stream/mod.ts';
import type { WithGraphValues } from '../../gen-graph-custom.ts';
import type { ValuedGraphElement } from '../../internal.ts';
import type { ValuedGraphBase } from '../valued-graph-custom.ts';
import {
  ValuedGraphBuilder,
  ValuedGraphEmpty,
  ValuedGraphNonEmpty,
} from '../valued-graph-custom.ts';

export interface ValuedGraphTypesContextImpl extends ValuedGraphBase.Types {
  context: ValuedGraphContext<this['_N'], string, ValuedGraphTypesContextImpl>;
}

export class ValuedGraphContext<
  UN,
  TT extends string,
  Tp extends ValuedGraphTypesContextImpl
> implements ValuedGraphBase.Context<UN, Tp>
{
  readonly _empty: any;

  constructor(
    readonly isDirected: boolean,
    readonly typeTag: TT,
    readonly linkMapContext: WithGraphValues<Tp, UN, any>['linkMapContext'],
    readonly linkConnectionsContext: WithGraphValues<
      Tp,
      UN,
      any
    >['linkConnectionsContext']
  ) {
    this._empty = new ValuedGraphEmpty<UN, any, Tp>(isDirected, this as any);
  }

  isNonEmptyInstance(
    source: any
  ): source is WithGraphValues<Tp, UN, any>['nonEmpty'] {
    return source instanceof ValuedGraphNonEmpty;
  }

  empty = <N extends UN, V>(): WithGraphValues<Tp, N, V>['normal'] => {
    return this._empty;
  };

  from: any = <N extends UN, V>(
    ...sources: ArrayNonEmpty<StreamSource<ValuedGraphElement<N, V>>>
  ): WithGraphValues<Tp, N, V>['normal'] => {
    let builder = this.builder<N, V>();

    let i = -1;
    const length = sources.length;

    while (++i < length) {
      const source = sources[i];

      if (StreamSource.isEmptyInstance(source)) continue;
      if (
        builder.isEmpty &&
        this.isNonEmptyInstance(source) &&
        source.context === this
      ) {
        if (i === length - 1) return source;
        builder = source.toBuilder();
        continue;
      }

      builder.addGraphElements(source);
    }

    return builder.build();
  };

  of: any = <N, V>(...values: ArrayNonEmpty<ValuedGraphElement<N, V>>): any => {
    return this.from(values).assumeNonEmpty();
  };

  builder = <N extends UN, V>(): WithGraphValues<Tp, N, V>['builder'] => {
    return new ValuedGraphBuilder<N, V, Tp>(
      this.isDirected,
      this as any
    ) as any;
  };

  reducer = <N extends UN, V>(
    source?: StreamSource<ValuedGraphElement<N, V>>
  ): Reducer<ValuedGraphElement<N, V>, WithGraphValues<Tp, N, V>['normal']> => {
    return Reducer.create(
      () =>
        undefined === source
          ? this.builder<N, V>()
          : (
              this.from(source) as WithGraphValues<Tp, N, V>['normal']
            ).toBuilder(),
      (builder, entry) => {
        builder.addGraphElement(entry);
        return builder;
      },
      (builder) => builder.build()
    );
  };

  createBuilder<N extends UN, V>(
    source?: WithGraphValues<Tp, N, V>['nonEmpty']
  ): WithGraphValues<Tp, N, V>['builder'] {
    return new ValuedGraphBuilder<N, V, Tp>(
      this.isDirected,
      this as any,
      source
    ) as any;
  }

  createNonEmpty<N extends UN, V>(
    linkMap: WithGraphValues<Tp, N, V>['linkMapNonEmpty'],
    connectionSize: number
  ): WithGraphValues<Tp, N, V>['nonEmpty'] {
    return new ValuedGraphNonEmpty<N, V, Tp>(
      this.isDirected,
      this as any,
      linkMap,
      connectionSize
    ) as any;
  }
}
