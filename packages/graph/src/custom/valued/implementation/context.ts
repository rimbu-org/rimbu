import { ArrayNonEmpty, generateUUID } from '@rimbu/common';
import type { StreamSource } from '@rimbu/stream';

import { Reducer } from '@rimbu/common';
import { isEmptyStreamSourceInstance } from '@rimbu/stream/custom';

import type { ValuedGraphBase } from '@rimbu/graph/custom';
import type { ValuedGraphElement, WithGraphValues } from '../../common';

import { Instances } from '@rimbu/base';
import {
  ValuedGraphBuilder,
  ValuedGraphEmpty,
  ValuedGraphNonEmpty,
} from '@rimbu/graph/custom';

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
    >['linkConnectionsContext'],
    readonly contextId = generateUUID()
  ) {
    this._empty = Object.freeze(new ValuedGraphEmpty(isDirected, this));
  }

  isNonEmptyInstance(
    source: any
  ): source is WithGraphValues<Tp, UN, any>['nonEmpty'] {
    return source instanceof ValuedGraphNonEmpty;
  }

  readonly empty = <N extends UN, V>(): any => {
    return this._empty;
  };

  readonly from: any = <N extends UN, V>(
    ...sources: ArrayNonEmpty<StreamSource<ValuedGraphElement<N, V>>>
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

  readonly of: any = <N, V>(
    ...values: ArrayNonEmpty<ValuedGraphElement<N, V>>
  ): any => {
    return this.from(values).assumeNonEmpty();
  };

  readonly builder = (): any => {
    return new ValuedGraphBuilder(this.isDirected, this);
  };

  readonly reducer = <N extends UN, V>(
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

  toJSON = (): {
    typeTag: string;
    contextId: string;
    isDirected: boolean;
    linkMapContext: Record<string, any>;
    linkConnectionsContext: Record<string, any>;
  } => {
    return {
      typeTag: this.typeTag,
      contextId: this.contextId,
      isDirected: this.isDirected,
      linkMapContext: this.linkMapContext.toJSON(),
      linkConnectionsContext: this.linkConnectionsContext.toJSON(),
    };
  };

  isImmutableInstance = (source: any): source is any =>
    typeof source === 'object' &&
    source?.context?.typeTag === this.typeTag &&
    Instances.isImmutableInstance(source);

  isBuilderInstance = (source: any): source is any =>
    typeof source === 'object' &&
    source?.context?.typeTag === this.typeTag &&
    Instances.isBuilderInstance(source);
}
