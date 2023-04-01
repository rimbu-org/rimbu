import { RimbuError, Token } from '@rimbu/base';
import { OptLazy, OptLazyOr, RelatedTo } from '@rimbu/common';
import { Stream, StreamSource } from '@rimbu/stream';

import type { ValuedGraphTypesContextImpl } from '@rimbu/graph/custom';
import type { Link, WithGraphValues } from '../../common';

import { ValuedGraphElement } from '../../common';

export class ValuedGraphBuilder<
  N,
  V,
  Tp extends ValuedGraphTypesContextImpl,
  TpG extends WithGraphValues<Tp, N, V> = WithGraphValues<Tp, N, V>
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
    if (this.source) return this.source.isEmpty;
    return this.linkMap.isEmpty;
  }

  get nodeSize(): number {
    if (this.source) return this.source.nodeSize;
    return this.linkMap.size;
  }

  hasNode = <UN>(node: RelatedTo<N, UN>): boolean => {
    if (this.source) return this.source.hasNode(node);
    return this.linkMap.hasKey(node);
  };

  hasConnection = <UN>(
    node1: RelatedTo<N, UN>,
    node2: RelatedTo<N, UN>
  ): boolean => {
    if (this.source) return this.source.hasConnection(node1, node2);

    const targets = this.linkMap.get(node1);

    return targets?.hasKey(node2) ?? false;
  };

  getValue = <UN, O>(
    node1: RelatedTo<N, UN>,
    node2: RelatedTo<N, UN>,
    otherwise?: OptLazy<O>
  ): V | O => {
    if (undefined !== this.source) {
      return this.source.getValue(node1, node2, otherwise!);
    }

    const targets = this.linkMap.get(node1);

    if (undefined === targets) return OptLazy(otherwise!);

    return targets.get(node2, otherwise!);
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

    if (!targets) return false;

    this.source = undefined;

    if (this.isDirected) {
      this.linkMap.forEach(([sourceNode, targets]) => {
        if (targets.removeKey(node)) {
          if (sourceNode !== node) this.connectionSize--;
        }
      });
    } else {
      this.connectionSize -= targets.size;

      targets.forEach(([target]) =>
        this.linkMap.updateAt(target, (values) => {
          values.removeKey(node);
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

  connectInternal = (node1: N, node2: N, value: V): boolean => {
    let changed = false;

    this.linkMap.modifyAt(node1, {
      ifNew: () => {
        const targetBuilder = this.context.linkConnectionsContext.builder<
          N,
          V
        >();
        targetBuilder.set(node2, value);
        this.connectionSize++;
        changed = true;
        return targetBuilder;
      },
      ifExists: (targets) => {
        const oldSize = targets.size;
        if (targets.set(node2, value)) {
          if (targets.size !== oldSize) this.connectionSize++;
          changed = true;
        }
        return targets;
      },
    });

    if (changed) this.source = undefined;

    if (changed && node1 !== node2) {
      this.linkMap.modifyAt(node2, {
        ifNew: () => {
          const targetBuilder = this.context.linkConnectionsContext.builder<
            N,
            V
          >();
          if (!this.isDirected) targetBuilder.set(node1, value);
          return targetBuilder;
        },
        ifExists: (targets) => {
          if (!this.isDirected) targets.set(node1, value);
          return targets;
        },
      });
    }

    return changed;
  };

  connect = (node1: N, node2: N, value: V): boolean => {
    this.checkLock();

    return this.connectInternal(node1, node2, value);
  };

  connectAll = (connections: StreamSource<TpG['link']>): boolean => {
    this.checkLock();

    return (
      Stream.applyFilter(
        connections as StreamSource<[N, N, V]>,
        this.connectInternal
      ).count() > 0
    );
  };

  addGraphElement = (element: ValuedGraphElement<N, V>): boolean => {
    if (ValuedGraphElement.isLink(element)) {
      return this.connectInternal(element[0], element[1], element[2]);
    }

    return this.addNodeInternal(element[0]);
  };

  addGraphElements = (
    elements: StreamSource<ValuedGraphElement<N, V>>
  ): boolean => {
    return Stream.from(elements).filterPure(this.addGraphElement).count() > 0;
  };

  modifyAt = (
    node1: N,
    node2: N,
    options: {
      ifNew?: OptLazyOr<V, Token>;
      ifExists?: (value: V, remove: Token) => V | Token;
    }
  ): boolean => {
    this.checkLock();

    const preConnectionSize = this.connectionSize;
    let changed = false;
    let addedOrUpdatedValue: V;

    this.linkMap.modifyAt(node1, {
      ifNew: (none) => {
        if (undefined === options.ifNew) return none;

        const newValue = OptLazyOr<V, Token>(options.ifNew, none);

        if (none === newValue) return none;

        changed = true;
        addedOrUpdatedValue = newValue;

        this.connectionSize++;

        const builder = this.context.linkMapContext.builder<N, V>();

        builder.set(node2, newValue);

        return builder;
      },
      ifExists: (valueMap) => {
        const { ifExists } = options;

        if (undefined === ifExists) return valueMap;

        valueMap.modifyAt(node2, {
          ifNew: (none) => {
            if (undefined === options.ifNew) return none;

            const newValue = OptLazyOr<V, Token>(options.ifNew, none);

            if (none === newValue) return none;

            changed = true;
            addedOrUpdatedValue = newValue;

            this.connectionSize++;

            return newValue;
          },
          ifExists: (currentValue, remove) => {
            const newValue = ifExists(currentValue, remove);

            if (Object.is(newValue, currentValue)) return currentValue;

            changed = true;

            if (remove === newValue) {
              this.connectionSize--;
            } else {
              addedOrUpdatedValue = newValue;
            }

            return newValue;
          },
        });

        return valueMap;
      },
    });

    if (!changed) return false;
    if (this.isDirected) return true;

    // edge graph, need to update counterpart

    if (this.connectionSize === preConnectionSize) {
      // value was updated
      this.linkMap.modifyAt(node2, {
        ifNew: () => {
          const builder = this.context.linkMapContext.builder<N, V>();
          builder.set(node1, addedOrUpdatedValue);
          return builder;
        },
        ifExists: (valueMap) => {
          valueMap.set(node1, addedOrUpdatedValue);
          return valueMap;
        },
      });

      return true;
    }

    if (this.connectionSize < preConnectionSize) {
      // value was removed
      this.linkMap.modifyAt(node2, {
        ifExists: (valueMap) => {
          valueMap.removeKey(node1);
          return valueMap;
        },
      });

      return true;
    }

    // value was added
    this.linkMap.modifyAt(node2, {
      ifNew: () => {
        const builder = this.context.linkMapContext.builder<N, V>();
        builder.set(node1, addedOrUpdatedValue);
        return builder;
      },
      ifExists: (valueMap) => {
        valueMap.set(node1, addedOrUpdatedValue);
        return valueMap;
      },
    });

    return true;
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

    const token = Symbol();

    this.linkMap.updateAt(node1, (targets) => {
      if (token !== targets.removeKey(node2, token)) {
        this.connectionSize--;
        changed = true;
      }
      return targets;
    });

    if (changed) this.source = undefined;

    if (changed && node1 !== node2 && !this.isDirected) {
      this.linkMap.updateAt(node2, (targets) => {
        targets.removeKey(node1);
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
        connections as StreamSource<[N, N]>,
        this.disconnectInternal
      ).count() > 0
    );
  };

  build = (): TpG['normal'] => {
    if (undefined !== this.source) return this.source as any;

    if (this.isEmpty) return this.context.empty<N, V>();

    const linkMap = this.linkMap
      .buildMapValues((targets) => targets.build())
      .assumeNonEmpty();

    return this.context.createNonEmpty(linkMap, this.connectionSize);
  };

  buildMapValues = <V2>(
    mapFun: (value: V, node1: N, node2: N) => V2
  ): WithGraphValues<Tp, N, V2>['normal'] => {
    if (undefined !== this.source) return this.source.mapValues(mapFun) as any;

    if (this.isEmpty) return this.context.empty<N, V2>();

    const linkMap = this.linkMap
      .buildMapValues((targets, source) =>
        targets.buildMapValues((value, target) => mapFun(value, source, target))
      )
      .assumeNonEmpty();

    return this.context.createNonEmpty(linkMap, this.connectionSize) as any;
  };
}
