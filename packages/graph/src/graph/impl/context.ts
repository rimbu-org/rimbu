import { ArrayNonEmpty } from '@rimbu/common';
import { StreamSource } from '@rimbu/stream';
import {
  GraphBase,
  GraphBuilder,
  GraphEmpty,
  GraphNonEmpty,
  WithGraphValues,
} from '../../graph-custom';
import { GraphElement } from '../../internal';

export interface GraphTypesContextImpl extends GraphBase.Types {
  context: GraphContext<this['_N'], string, boolean, GraphTypesContextImpl>;
}

export class GraphContext<
  UN,
  TT extends string,
  Dir extends boolean,
  Tp extends GraphTypesContextImpl
> implements GraphBase.Context<UN, Tp> {
  constructor(
    readonly isDirected: Dir,
    readonly typeTag: TT,
    readonly linkMapContext: WithGraphValues<Tp, UN, any>['linkMapContext'],
    readonly linkConnectionsContext: WithGraphValues<
      Tp,
      UN,
      any
    >['linkConnectionsContext']
  ) {}

  readonly _empty: WithGraphValues<Tp, UN, any>['normal'] = new GraphEmpty<
    UN,
    any,
    Tp
  >(this.isDirected, this as any) as any;

  isNonEmptyInstance(
    source: any
  ): source is WithGraphValues<Tp, UN, any>['nonEmpty'] {
    return source instanceof GraphNonEmpty;
  }

  empty = <N extends UN>(): WithGraphValues<Tp, N, unknown>['normal'] => {
    return this._empty;
  };

  from: any = <N extends UN>(
    ...sources: ArrayNonEmpty<StreamSource<GraphElement<N>>>
  ): WithGraphValues<Tp, N, unknown>['normal'] => {
    let builder = this.builder<N>();

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

  of = <N>(
    ...values: ArrayNonEmpty<GraphElement<N>>
  ): N extends UN ? WithGraphValues<Tp, N, unknown>['nonEmpty'] : never => {
    return this.from(values).assumeNonEmpty();
  };

  builder = <N extends UN>(): WithGraphValues<Tp, N, unknown>['builder'] => {
    return new GraphBuilder<N, Tp>(this.isDirected, this as any) as any;
  };

  createBuilder<N extends UN>(
    source?: WithGraphValues<Tp, N, unknown>['nonEmpty']
  ): WithGraphValues<Tp, N, unknown>['builder'] {
    return new GraphBuilder<N, Tp>(this.isDirected, this as any, source) as any;
  }

  createNonEmpty<N extends UN>(
    linkMap: WithGraphValues<Tp, N, unknown>['linkMapNonEmpty'],
    connectionSize: number
  ): WithGraphValues<Tp, N, unknown>['nonEmpty'] {
    return new GraphNonEmpty<N, Tp>(
      this.isDirected,
      this as any,
      linkMap,
      connectionSize
    ) as any;
  }
}
