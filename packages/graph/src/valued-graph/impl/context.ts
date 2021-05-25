import { ArrayNonEmpty } from '@rimbu/common';
import { StreamSource } from '@rimbu/stream';
import {
  ValuedGraphBase,
  ValuedGraphBuilder,
  ValuedGraphEmpty,
  ValuedGraphNonEmpty,
} from '../../graph-custom';
import { ValuedGraphElement } from '../../internal';
import { WithGraphValues } from '../../graph-custom';
export interface ValuedGraphTypesContextImpl extends ValuedGraphBase.Types {
  context: ValuedGraphContext<this['_N'], string, ValuedGraphTypesContextImpl>;
}

export class ValuedGraphContext<
  UN,
  TT extends string,
  Tp extends ValuedGraphTypesContextImpl
> implements ValuedGraphBase.Context<UN, Tp>
{
  constructor(
    readonly isDirected: boolean,
    readonly typeTag: TT,
    readonly linkMapContext: WithGraphValues<Tp, UN, any>['linkMapContext'],
    readonly linkConnectionsContext: WithGraphValues<
      Tp,
      UN,
      any
    >['linkConnectionsContext']
  ) {}

  readonly _empty: any = new ValuedGraphEmpty<UN, any, Tp>(
    this.isDirected,
    this as any
  );

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
