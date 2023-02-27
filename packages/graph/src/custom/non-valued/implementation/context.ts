import { ArrayNonEmpty, generateUUID } from '@rimbu/common';
import type { StreamSource } from '@rimbu/stream';

import { Reducer } from '@rimbu/common';
import { isEmptyStreamSourceInstance } from '@rimbu/stream/custom';

import type { GraphBase, GraphElement, WithGraphValues } from '../../common';

import { GraphEmpty, GraphNonEmpty, GraphBuilder } from '@rimbu/graph/custom';
import { Instances } from '@rimbu/base';

export interface GraphTypesContextImpl extends GraphBase.Types {
  readonly context: GraphContext<this['_N'], string, boolean>;
}

export class GraphContext<
  UN,
  TT extends string,
  Dir extends boolean,
  Tp extends GraphTypesContextImpl = GraphTypesContextImpl
> implements GraphBase.Context<UN, Tp>
{
  readonly _fixedType!: any;

  readonly _empty: WithGraphValues<Tp, UN, any>['normal'];

  constructor(
    readonly isDirected: Dir,
    readonly typeTag: TT,
    readonly linkMapContext: WithGraphValues<Tp, UN, any>['linkMapContext'],
    readonly linkConnectionsContext: WithGraphValues<
      Tp,
      UN,
      any
    >['linkConnectionsContext'],
    readonly contextId = generateUUID()
  ) {
    this._empty = Object.freeze(new GraphEmpty(isDirected, this)) as any;
  }

  isNonEmptyInstance(
    source: any
  ): source is WithGraphValues<Tp, UN, any>['nonEmpty'] {
    return source instanceof GraphNonEmpty;
  }

  readonly empty = <N extends UN>(): any => {
    return this._empty;
  };

  readonly from: any = <N extends UN>(
    ...sources: ArrayNonEmpty<StreamSource<GraphElement<N>>>
  ): any => {
    let builder = this.builder();

    let i = -1;
    const length = sources.length;

    while (++i < length) {
      const source = sources[i];

      if (isEmptyStreamSourceInstance(source)) continue;
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

  readonly of = <N>(...values: ArrayNonEmpty<GraphElement<N>>): any => {
    return this.from(values).assumeNonEmpty();
  };

  readonly builder = (): any => {
    return new GraphBuilder(this.isDirected, this);
  };

  reducer = <N extends UN>(source?: StreamSource<GraphElement<N>>): any => {
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

  createBuilder<N extends UN>(
    source?: WithGraphValues<Tp, N, any>['nonEmpty']
  ): WithGraphValues<Tp, N, any>['builder'] {
    return new GraphBuilder<N, Tp>(this.isDirected, this, source) as any;
  }

  createNonEmpty<N extends UN>(
    linkMap: WithGraphValues<Tp, N, any>['linkMapNonEmpty'],
    connectionSize: number
  ): WithGraphValues<Tp, N, any>['nonEmpty'] {
    return new GraphNonEmpty<N, Tp>(
      this.isDirected,
      this,
      linkMap,
      connectionSize
    ) as any;
  }

  toJSON(): {
    typeTag: string;
    contextId: string;
    isDirected: boolean;
    linkMapContext: Record<string, any>;
    linkConnectionsContext: Record<string, any>;
  } {
    return {
      typeTag: this.typeTag,
      contextId: this.contextId,
      isDirected: this.isDirected,
      linkMapContext: this.linkMapContext.toJSON(),
      linkConnectionsContext: this.linkConnectionsContext.toJSON(),
    };
  }

  isImmutableInstance = <N extends UN>(
    source: any
  ): source is WithGraphValues<Tp, N, unknown>['normal'] =>
    typeof source === 'object' &&
    source?.context?.typeTag === this.typeTag &&
    Instances.isImmutableInstance(source);

  isBuilderInstance = <N extends UN>(
    source: any
  ): source is WithGraphValues<Tp, N, unknown>['builder'] =>
    typeof source === 'object' &&
    source?.context?.typeTag === this.typeTag &&
    Instances.isBuilderInstance(source);
}
