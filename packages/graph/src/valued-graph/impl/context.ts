import type { ArrayNonEmpty } from '@rimbu/common';
import { Reducer } from '@rimbu/common';
import { StreamSource } from '@rimbu/stream';
import type { WithGraphValues } from '../../gen-graph-custom';
import type { ValuedGraphElement } from '../../internal';
import type { ValuedGraphBase } from '../valued-graph-custom';
import {
  ValuedGraphBuilder,
  ValuedGraphEmpty,
  ValuedGraphNonEmpty,
} from '../valued-graph-custom';

export interface ValuedGraphTypesContextImpl extends ValuedGraphBase.Types {
  readonly context: ValuedGraphContext<this['_N'], string>;
}

export class ValuedGraphContext<
  UN,
  TT extends string,
  Tp extends ValuedGraphTypesContextImpl = ValuedGraphTypesContextImpl
> implements ValuedGraphBase.Context<UN, Tp>
{
  readonly _fixedType!: UN;

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
    this._empty = new ValuedGraphEmpty(isDirected, this);
  }

  isNonEmptyInstance(
    source: any
  ): source is WithGraphValues<Tp, UN, any>['nonEmpty'] {
    return source instanceof ValuedGraphNonEmpty;
  }

  empty = <N extends UN, V>(): any => {
    return this._empty;
  };

  from: any = <N extends UN, V>(
    ...sources: ArrayNonEmpty<StreamSource<ValuedGraphElement<N, V>>>
  ): any => {
    let builder = this.builder();

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

  builder = (): any => {
    return new ValuedGraphBuilder(this.isDirected, this);
  };

  reducer = <N extends UN, V>(
    source?: StreamSource<ValuedGraphElement<N, V>>
  ): any => {
    return Reducer.create(
      () =>
        undefined === source ? this.builder() : this.from(source).toBuilder(),
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
      this,
      source
    ) as any;
  }

  createNonEmpty<N extends UN, V>(
    linkMap: WithGraphValues<Tp, N, V>['linkMapNonEmpty'],
    connectionSize: number
  ): WithGraphValues<Tp, N, V>['nonEmpty'] {
    return new ValuedGraphNonEmpty<N, V, Tp>(
      this.isDirected,
      this,
      linkMap,
      connectionSize
    ) as any;
  }
}
