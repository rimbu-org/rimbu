import type { Token } from '@rimbu/base';

import { NonEmptyBase } from '@rimbu/collection-types/map-custom';
import {
  OptLazy,
  OptLazyOr,
  RelatedTo,
  ToJSON,
  TraverseState,
} from '@rimbu/common';
import { Stream, StreamSource } from '@rimbu/stream';

import type {
  ValuedGraphBase,
  ValuedGraphTypesContextImpl,
} from '@rimbu/graph/custom';
import type {
  Link,
  ValuedGraphElement,
  ValuedLink,
  WithGraphValues,
} from '../../common';

export class ValuedGraphNonEmpty<
    N,
    V,
    Tp extends ValuedGraphTypesContextImpl,
    TpG extends WithGraphValues<Tp, N, V> = WithGraphValues<Tp, N, V>
  >
  extends NonEmptyBase<ValuedGraphElement<N, V>>
  implements ValuedGraphBase.NonEmpty<N, V, Tp>
{
  constructor(
    readonly isDirected: boolean,
    readonly context: TpG['context'],
    readonly linkMap: TpG['linkMapNonEmpty'],
    readonly connectionSize: number
  ) {
    super();
  }

  copy(
    linkMap: TpG['linkMapNonEmpty'],
    connectionSize: number
  ): TpG['nonEmpty'] {
    if (linkMap === this.linkMap && connectionSize === this.connectionSize) {
      return this as any;
    }
    return this.context.createNonEmpty<N, V>(linkMap as any, connectionSize);
  }

  copyE(linkMap: TpG['linkMap'], connectionSize: number): TpG['normal'] {
    if (linkMap.nonEmpty()) {
      return this.copy(linkMap, connectionSize) as TpG['normal'];
    }
    return this.context.empty();
  }

  assumeNonEmpty(): any {
    return this;
  }

  asNormal(): any {
    return this;
  }

  forEach(
    f: (node: N, index: number, halt: () => void) => void,
    state?: TraverseState
  ): void {
    this.linkMap.streamKeys().forEach(f, state);
  }

  stream(): Stream.NonEmpty<ValuedGraphElement<N, V>> {
    return this.linkMap.stream().flatMap(([node, targets]) => {
      if (!targets.nonEmpty()) return [[node]];
      return targets
        .stream()
        .map(
          ([target, value]) => [node, target, value] as ValuedGraphElement<N, V>
        );
    });
  }

  get nodeSize(): number {
    return this.linkMap.size;
  }

  streamNodes(): Stream.NonEmpty<N> {
    return this.linkMap.streamKeys();
  }

  streamConnections(): Stream<ValuedLink<N, V>> {
    return this.linkMap
      .stream()
      .flatMap(([node1, targets]) =>
        targets
          .stream()
          .map(([node2, value]) => [node1, node2, value] as [N, N, V])
      );
  }

  hasNode<UN = N>(node: RelatedTo<N, UN>): boolean {
    return this.linkMap.hasKey(node);
  }

  hasConnection<UN = N>(
    node1: RelatedTo<N, UN>,
    node2: RelatedTo<N, UN>
  ): boolean {
    const targets = this.linkMap.get(node1);

    return targets?.hasKey(node2) ?? false;
  }

  getValue<UN, O>(
    node1: RelatedTo<N, UN>,
    node2: RelatedTo<N, UN>,
    otherwise?: OptLazy<O>
  ): V | O {
    const targets = this.linkMap.get(node1);

    if (undefined === targets) return OptLazy(otherwise!);

    return targets.get(node2, otherwise!);
  }

  getConnectionStreamFrom<UN = N>(
    node1: RelatedTo<N, UN>
  ): Stream<ValuedLink<N, V>> {
    const targets = this.linkMap.get(node1);

    if (undefined === targets) return Stream.empty();

    return targets
      .stream()
      .map(([node2, value]) => [node1, node2, value] as [N, N, V]);
  }

  getConnectionStreamTo<UN = N>(
    node: RelatedTo<N, UN>
  ): Stream<ValuedLink<N, V>> {
    if (this.isDirected) {
      return this.streamConnections().filter(([_, node2]) => node2 === node);
    }

    const targets = this.linkMap.get(node);

    if (undefined === targets) return Stream.empty();

    return targets
      .stream()
      .map(([node1, value]) => [node1, node, value] as [N, N, V]);
  }

  getConnectionsFrom<UN = N>(node1: RelatedTo<N, UN>): TpG['linkConnections'] {
    return this.linkMap.get(
      node1,
      this.context.linkConnectionsContext.empty<N, V>()
    );
  }

  isSink<UN = N>(node: RelatedTo<N, UN>): boolean {
    const targets = this.linkMap.get(node);

    return targets?.isEmpty ?? false;
  }

  isSource<UN = N>(node: RelatedTo<N, UN>): boolean {
    return (
      this.linkMap.hasKey(node) &&
      this.linkMap.streamValues().every((targets) => !targets.hasKey(node))
    );
  }

  addNode(node: N): TpG['nonEmpty'] {
    return this.copy(
      this.linkMap
        .modifyAt(node, { ifNew: this.context.linkConnectionsContext.empty })
        .assumeNonEmpty(),
      this.connectionSize
    );
  }

  addNodes(nodes: StreamSource<N>): TpG['nonEmpty'] {
    const builder = this.toBuilder();
    builder.addNodes(nodes);
    return builder.build().assumeNonEmpty();
  }

  removeNode<UN = N>(node: RelatedTo<N, UN>): TpG['normal'] {
    const builder = this.toBuilder();
    builder.removeNode(node);
    return builder.build();
  }

  removeNodes<UN>(nodes: StreamSource<RelatedTo<N, UN>>): TpG['normal'] {
    const builder = this.toBuilder();
    builder.removeNodes(nodes);
    return builder.build();
  }

  connect(node1: N, node2: N, value: V): TpG['nonEmpty'] {
    const newLinkMap = this.linkMap.modifyAt(node1, {
      ifNew: this.context.linkConnectionsContext.of([node2, value]),
      ifExists: (targets) => targets.set(node2, value),
    });

    if (newLinkMap === this.linkMap) return this as any;

    const newConnectionSize = this.connectionSize + 1;

    if (Object.is(node1, node2) || this.isDirected) {
      return this.context.createNonEmpty(
        newLinkMap.assumeNonEmpty(),
        newConnectionSize
      );
    }

    return this.copy(
      newLinkMap
        .modifyAt(node2, {
          ifNew: () => {
            if (this.isDirected) {
              return this.context.linkConnectionsContext.empty();
            }
            return this.context.linkConnectionsContext.of([node1, value]);
          },
        })
        .assumeNonEmpty(),
      newConnectionSize
    );
  }

  connectAll(
    links: StreamSource<WithGraphValues<Tp, N, V>['link']>
  ): TpG['nonEmpty'] {
    const builder = this.toBuilder();
    builder.connectAll(links as any);
    return builder.build().assumeNonEmpty();
  }

  modifyAt(
    node1: N,
    node2: N,
    options: {
      ifNew?: OptLazyOr<V, Token>;
      ifExists?: (value: V, remove: Token) => V | Token;
    }
  ): TpG['nonEmpty'] {
    let newConnectionSize = this.connectionSize;
    let addedOrUpdatedValue: V;

    const newLinkMap = this.linkMap.modifyAt(node1, {
      ifNew: (none) => {
        if (undefined === options.ifNew) return none;

        const newValue = OptLazyOr<V, Token>(options.ifNew, none);

        if (none === newValue) return none;

        addedOrUpdatedValue = newValue;

        newConnectionSize++;

        return this.context.linkMapContext.of([node2, newValue]);
      },
      ifExists: (valueMap) => {
        const { ifExists } = options;

        if (undefined === ifExists) return valueMap;

        return valueMap.modifyAt(node2, {
          ifNew: (none) => {
            if (undefined === options.ifNew) return none;

            const newValue = OptLazyOr<V, Token>(options.ifNew, none);

            if (none === newValue) return none;

            addedOrUpdatedValue = newValue;

            newConnectionSize++;

            return newValue;
          },
          ifExists: (currentValue, remove) => {
            const newValue = ifExists(currentValue, remove);

            if (Object.is(newValue, currentValue)) return currentValue;

            if (remove === newValue) {
              newConnectionSize--;
            } else {
              addedOrUpdatedValue = newValue;
            }

            return newValue;
          },
        });
      },
    });

    if (newLinkMap === this.linkMap) return this as any;

    if (this.isDirected) {
      return this.copy(newLinkMap.assumeNonEmpty(), newConnectionSize);
    }

    // edge graph, need to update counterpart

    if (newConnectionSize === this.connectionSize) {
      // value was updated
      const newLinkMap2 = newLinkMap.modifyAt(node2, {
        ifNew: () =>
          this.context.linkMapContext.of([node1, addedOrUpdatedValue]),
        ifExists: (valueMap) => valueMap.set(node1, addedOrUpdatedValue),
      });

      return this.copy(newLinkMap2.assumeNonEmpty(), newConnectionSize);
    }

    if (newConnectionSize < this.connectionSize) {
      // value was removed
      const newLinkMap2 = newLinkMap.modifyAt(node2, {
        ifExists: (valueMap) => valueMap.removeKey(node1),
      });

      return this.copy(newLinkMap2.assumeNonEmpty(), newConnectionSize);
    }

    // value was added
    const newLinkMap2 = newLinkMap.modifyAt(node2, {
      ifNew: () => this.context.linkMapContext.of([node1, addedOrUpdatedValue]),
      ifExists: (valueMap) => valueMap.set(node1, addedOrUpdatedValue),
    });

    return this.copy(newLinkMap2.assumeNonEmpty(), newConnectionSize);
  }

  disconnect<UN = N>(
    node1: RelatedTo<N, UN>,
    node2: RelatedTo<N, UN>
  ): TpG['nonEmpty'] {
    if (
      !this.linkMap.context.isValidKey(node1) ||
      !this.linkMap.context.isValidKey(node2)
    )
      return this as any;

    const newLinkMap = this.linkMap.updateAt(node1, (targets) =>
      targets.removeKey(node2)
    );

    if (newLinkMap === this.linkMap) return this as any;

    const newConnectionSize = this.connectionSize - 1;

    if (this.isDirected) return this.copy(newLinkMap, newConnectionSize);

    return this.copy(
      newLinkMap.updateAt(node2, (targets) => targets.removeKey(node1)),
      newConnectionSize
    );
  }

  disconnectAll<UN = N>(
    links: StreamSource<Link<RelatedTo<N, UN>>>
  ): TpG['nonEmpty'] {
    const builder = this.toBuilder();
    builder.disconnectAll(links);
    return builder.build().assumeNonEmpty();
  }

  removeUnconnectedNodes(): TpG['normal'] {
    if (!this.isDirected) {
      const newLinkMap = this.linkMap.filter(([_, targets]) =>
        targets.nonEmpty()
      );
      return this.copyE(newLinkMap, this.connectionSize);
    }

    const unconnectedNodes = this.linkMap
      .stream()
      .collect(([source, targets], _, skip) => {
        if (
          targets.isEmpty &&
          !this.linkMap.streamValues().some((t) => t.hasKey(source))
        ) {
          return source;
        }
        return skip;
      });

    return this.removeNodes(unconnectedNodes);
  }

  mapValues<V2>(
    mapFun: (value: V, node1: N, node2: N) => V2
  ): WithGraphValues<Tp, N, V2>['nonEmpty'] {
    const newLinkMap = this.linkMap.mapValues((targets, node1) =>
      targets.mapValues((value, node2) => mapFun(value, node1, node2))
    );

    return this.context.createNonEmpty<N, V2>(
      newLinkMap,
      this.connectionSize
    ) as any;
  }

  toString(): string {
    const connector = this.isDirected ? '->' : '<->';

    return this.linkMap.stream().join({
      start: `${this.context.typeTag}(\n  `,
      sep: ',\n  ',
      end: '\n)',
      valueToString: ([node, targets]) =>
        `${node} ${connector} ${targets.stream().join({
          start: '[',
          sep: ', ',
          end: ']',
          valueToString: ([node2, value]) => `{${node2}: ${value}}`,
        })}`,
    });
  }

  toJSON(): ToJSON<[N, (readonly [N, V])[]][]> {
    return {
      dataType: this.context.typeTag,
      value: this.linkMap
        .stream()
        .map(
          (entry) => [entry[0], entry[1].toArray()] as [N, (readonly [N, V])[]]
        )
        .toArray(),
    };
  }

  toBuilder(): TpG['builder'] {
    return this.context.createBuilder<N, V>(this as any);
  }
}
