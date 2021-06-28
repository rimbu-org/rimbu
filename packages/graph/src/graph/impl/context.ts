import type { ArrayNonEmpty } from '@rimbu/common';
import { StreamSource } from '@rimbu/stream';
import type { WithGraphValues } from '../../gen-graph-custom';
import type { GraphElement } from '../../internal';
import type { GraphBase } from '../graph-custom';
import { GraphBuilder, GraphEmpty, GraphNonEmpty } from '../graph-custom';

export interface GraphTypesContextImpl extends GraphBase.Types {
  context: GraphContext<this['_N'], string, boolean, GraphTypesContextImpl>;
}

export class GraphContext<
  UN,
  TT extends string,
  Dir extends boolean,
  Tp extends GraphTypesContextImpl
> implements GraphBase.Context<UN, Tp>
{
  readonly _empty: WithGraphValues<Tp, UN, any>['normal'];

  constructor(
    readonly isDirected: Dir,
    readonly typeTag: TT,
    readonly linkMapContext: WithGraphValues<Tp, UN, any>['linkMapContext'],
    readonly linkConnectionsContext: WithGraphValues<
      Tp,
      UN,
      any
    >['linkConnectionsContext']
  ) {
    this._empty = new GraphEmpty<UN, any, Tp>(isDirected, this as any) as any;
  }

  isNonEmptyInstance(
    source: any
  ): source is WithGraphValues<Tp, UN, any>['nonEmpty'] {
    return source instanceof GraphNonEmpty;
  }

  empty = <N extends UN>(): WithGraphValues<Tp, N, any>['normal'] => {
    return this._empty;
  };

  from: any = <N extends UN>(
    ...sources: ArrayNonEmpty<StreamSource<GraphElement<N>>>
  ): WithGraphValues<Tp, N, any>['normal'] => {
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

  of = <N>(...values: ArrayNonEmpty<GraphElement<N>>): any => {
    return this.from(values).assumeNonEmpty();
  };

  builder = <N extends UN>(): WithGraphValues<Tp, N, any>['builder'] => {
    return new GraphBuilder<N, Tp>(this.isDirected, this as any) as any;
  };

  createBuilder<N extends UN>(
    source?: WithGraphValues<Tp, N, any>['nonEmpty']
  ): WithGraphValues<Tp, N, any>['builder'] {
    return new GraphBuilder<N, Tp>(this.isDirected, this as any, source) as any;
  }

  createNonEmpty<N extends UN>(
    linkMap: WithGraphValues<Tp, N, any>['linkMapNonEmpty'],
    connectionSize: number
  ): WithGraphValues<Tp, N, any>['nonEmpty'] {
    return new GraphNonEmpty<N, Tp>(
      this.isDirected,
      this as any,
      linkMap,
      connectionSize
    ) as any;
  }
}
