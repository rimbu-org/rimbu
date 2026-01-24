import type { RSet } from '@rimbu/collection-types';
import type { ToJSON } from '@rimbu/common';
import { Stream, type StreamSource } from '@rimbu/stream';

import type { GraphTypesContextImpl } from '@rimbu/graph/custom';
import type { GraphBase, WithGraphValues } from '../../common/index.mjs';
import { GraphEmptyBase } from '../../common/index.mjs';

export class GraphEmpty<
    N,
    V,
    Tp extends GraphTypesContextImpl,
    TpG extends WithGraphValues<Tp, N, V> = WithGraphValues<Tp, N, V>,
  >
  extends GraphEmptyBase
  implements GraphBase<N, Tp>
{
  declare _NonEmptyType: TpG['nonEmpty'];

  constructor(
    readonly isDirected: boolean,
    readonly context: TpG['context']
  ) {
    super();
  }

  get linkMap(): TpG['linkMap'] {
    return this.context.linkMapContext.empty();
  }

  getConnectionsFrom(): TpG['linkConnections'] {
    return this.context.linkConnectionsContext.empty<N>();
  }

  addNode(node: N): TpG['nonEmpty'] {
    return this.context.createNonEmpty(
      this.linkMap.context.of([
        node,
        this.context.linkConnectionsContext.empty(),
      ]),
      0
    );
  }

  addNodes(nodes: StreamSource<N>): WithGraphValues<Tp, N, V>['nonEmpty'] {
    const emptyConnections = this.context.linkConnectionsContext.empty();

    const linkMap = this.context.linkMapContext.from<N, RSet<N>>(
      Stream.from(nodes).map((node) => [node, emptyConnections] as [N, RSet<N>])
    );

    if (!linkMap.nonEmpty()) return this as any;
    return this.context.createNonEmpty(linkMap, 0) as TpG['nonEmpty'];
  }

  connect(node1: N, node2: N): TpG['nonEmpty'] {
    const linkMap = this.context.linkMapContext.of([
      node1,
      this.context.linkConnectionsContext.of(node2) as RSet<N>,
    ]);

    if (node1 === node2) return this.context.createNonEmpty(linkMap, 1);

    const linkConnections = this.isDirected
      ? this.context.linkConnectionsContext.empty()
      : this.context.linkConnectionsContext.of(node1);

    return this.context.createNonEmpty(linkMap.set(node2, linkConnections), 1);
  }

  connectAll(
    links: StreamSource<WithGraphValues<Tp, N, V>['link']>
  ): WithGraphValues<Tp, N, V>['nonEmpty'] {
    return this.context.from(links);
  }

  toString(): string {
    return `${this.context.typeTag}()`;
  }

  toJSON(): ToJSON<any[]> {
    return {
      dataType: this.context.typeTag,
      value: [],
    };
  }

  toBuilder(): TpG['builder'] {
    return this.context.builder();
  }
}
