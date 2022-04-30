import { RimbuError } from '@rimbu/base';
import type { RelatedTo } from '@rimbu/common';
import {
  GraphElement,
  GraphTypesContextImpl,
  Link,
  WithGraphValues,
} from '@rimbu/graph/custom';
import { Stream, StreamSource } from '@rimbu/stream';

export class GraphBuilder<
  N,
  Tp extends GraphTypesContextImpl,
  TpG extends WithGraphValues<Tp, N, any> = WithGraphValues<Tp, N, any>
> {
  connectionSize = 0;

  constructor(
    readonly isDirected: boolean,
    readonly context: TpG['context'],
    public source?: TpG['nonEmpty']
  ) {
    if (undefined !== source) this.connectionSize = source.connectionSize;
  }

  _linkMap?: TpG['linkMapBuilder'];
  _lock = 0;

  checkLock(): void {
    if (this._lock) RimbuError.throwModifiedBuilderWhileLoopingOverItError();
  }

  get linkMap(): TpG['linkMapBuilder'] {
    if (undefined === this._linkMap) {
      if (undefined === this.source) {
        this._linkMap = this.context.linkMapContext.builder();
      } else {
        this._linkMap = this.source.linkMap
          .mapValues((targets) => targets.toBuilder())
          .toBuilder();
      }
    }

    return this._linkMap!;
  }

  get isEmpty(): boolean {
    return this.source?.isEmpty ?? this.linkMap.isEmpty;
  }

  get nodeSize(): number {
    return this.source?.nodeSize ?? this.linkMap.size;
  }

  hasNode = <UN>(node: RelatedTo<N, UN>): boolean => {
    return this.source?.hasNode(node) ?? this.linkMap.hasKey(node);
  };

  hasConnection = <UN>(
    node1: RelatedTo<N, UN>,
    node2: RelatedTo<N, UN>
  ): boolean => {
    if (undefined !== this.source) {
      return this.source.hasConnection(node1, node2);
    }

    const targets = this.linkMap.get(node1);
    return targets?.has(node2) ?? false;
  };

  addNodeInternal = (node: N): boolean => {
    const changed = this.linkMap.modifyAt(node, {
      ifNew: this.context.linkConnectionsContext.builder,
    });

    if (changed) this.source = undefined;

    return changed;
  };

  addNode = (node: N): boolean => {
    this.checkLock();

    return this.addNodeInternal(node);
  };

  addNodes = (nodes: StreamSource<N>): boolean => {
    this.checkLock();

    return Stream.from(nodes).filterPure(this.addNodeInternal).count() > 0;
  };

  removeNodeInternal = <UN>(node: RelatedTo<N, UN>): boolean => {
    const targets = this.linkMap.removeKey(node);

    if (undefined === targets) return false;

    this.source = undefined;

    if (this.isDirected) {
      this.linkMap.forEach(([sourceNode, targets]) => {
        if (targets.remove(node)) {
          if (sourceNode !== node) this.connectionSize--;
        }
      });
    } else {
      this.connectionSize -= targets.size;
      targets.forEach((target) =>
        this.linkMap.updateAt(target, (values) => {
          values.remove(node);
          return values;
        })
      );
    }

    return true;
  };

  removeNode = <UN>(node: RelatedTo<N, UN>): boolean => {
    this.checkLock();

    return this.removeNodeInternal(node);
  };

  removeNodes = <UN>(nodes: StreamSource<RelatedTo<N, UN>>): boolean => {
    this.checkLock();

    return Stream.from(nodes).filterPure(this.removeNodeInternal).count() > 0;
  };

  connectInternal = (node1: N, node2: N): boolean => {
    let changed = false;

    this.linkMap.modifyAt(node1, {
      ifNew: () => {
        const targetBuilder = this.context.linkConnectionsContext.builder();
        targetBuilder.add(node2);
        this.connectionSize++;
        changed = true;
        return targetBuilder;
      },
      ifExists: (targets) => {
        if (targets.add(node2)) {
          this.connectionSize++;
          changed = true;
        }
        return targets;
      },
    });

    if (changed) this.source = undefined;

    if (changed && node1 !== node2) {
      this.linkMap.modifyAt(node2, {
        ifNew: () => {
          const targetBuilder = this.context.linkConnectionsContext.builder();
          if (!this.isDirected) targetBuilder.add(node1);
          return targetBuilder;
        },
        ifExists: (targets) => {
          if (!this.isDirected) targets.add(node1);
          return targets;
        },
      });
    }

    return changed;
  };

  connect = (node1: N, node2: N): boolean => {
    this.checkLock();

    return this.connectInternal(node1, node2);
  };

  connectAll = (connections: StreamSource<TpG['link']>): boolean => {
    this.checkLock();

    return (
      Stream.applyFilter(
        connections as StreamSource<[N, N]>,
        this.connectInternal
      ).count() > 0
    );
  };

  connectIfNodesExist = (node1: N, node2: N): boolean => {
    this.checkLock();

    let changed = false;

    this.linkMap.updateAt(node1, (targets) => {
      if (this.linkMap.hasKey(node2) && targets.add(node2)) {
        this.connectionSize++;
        changed = true;
      }
      return targets;
    });

    if (changed && !this.isDirected) {
      this.source = undefined;

      this.linkMap.updateAt(node2, (targets) => {
        targets.add(node1);
        return targets;
      });
    }

    return changed;
  };

  addGraphElement = (element: GraphElement<N>): boolean => {
    if (GraphElement.isLink(element)) {
      return this.connectInternal(element[0], element[1]);
    }

    return this.addNodeInternal(element[0]);
  };

  addGraphElements = (elements: StreamSource<GraphElement<N>>): boolean => {
    return Stream.from(elements).filterPure(this.addGraphElement).count() > 0;
  };

  disconnectInternal = <UN>(
    node1: RelatedTo<N, UN>,
    node2: RelatedTo<N, UN>
  ): boolean => {
    if (
      !this.linkMap.context.isValidKey(node1) ||
      !this.linkMap.context.isValidKey(node2)
    ) {
      return false;
    }

    let changed = false;

    this.linkMap.updateAt(node1, (targets) => {
      if (targets.remove(node2)) {
        this.connectionSize--;
        changed = true;
      }
      return targets;
    });

    if (changed) this.source = undefined;

    if (changed && node1 !== node2 && !this.isDirected) {
      this.linkMap.updateAt(node2, (targets) => {
        targets.remove(node1);
        return targets;
      });
    }

    return changed;
  };

  disconnect = <UN>(
    node1: RelatedTo<N, UN>,
    node2: RelatedTo<N, UN>
  ): boolean => {
    this.checkLock();

    return this.disconnectInternal(node1, node2);
  };

  disconnectAll = <UN>(
    connections: StreamSource<Link<RelatedTo<N, UN>>>
  ): boolean => {
    this.checkLock();

    return (
      Stream.applyFilter(
        connections as StreamSource<[RelatedTo<N, UN>, RelatedTo<N, UN>]>,
        this.disconnectInternal
      ).count() > 0
    );
  };

  build = (): TpG['normal'] => {
    if (undefined !== this.source) return this.source as any;

    if (this.isEmpty) return this.context.empty();

    const linkMap = this.linkMap
      .buildMapValues((targets) => targets.build())
      .assumeNonEmpty();

    return this.context.createNonEmpty(linkMap, this.connectionSize);
  };
}
