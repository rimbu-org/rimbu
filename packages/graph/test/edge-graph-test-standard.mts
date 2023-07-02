import type { ArrayNonEmpty } from '@rimbu/common';
import { Stream, type StreamSource } from '@rimbu/stream';

import type { GraphElement, Link } from '../src/custom/index.mjs';
import type { EdgeGraph } from '../src/main/index.mjs';

function symmetric<N>(source: StreamSource<Link<N>>): [N, N][] {
  return Stream.from(source)
    .concat(
      Stream.from(source).collect(([n1, n2], _, skip) => {
        if (n1 === n2) return skip;
        return [n2, n1];
      })
    )
    .toArray() as [N, N][];
}

function expectEqual<N>(
  source: { streamConnections(): Stream<Link<N>> },
  arr: Link<N>[]
) {
  expect(new Set(source.streamConnections())).toEqual(new Set(symmetric(arr)));
}

const arr3: ArrayNonEmpty<Link<string>> = [
  ['a', 'b'],
  ['b', 'c'],
  ['c', 'a'],
];

const arr6: ArrayNonEmpty<Link<string>> = [
  ['a', 'b'],
  ['b', 'c'],
  ['c', 'a'],
  ['b', 'd'],
  ['d', 'e'],
  ['f', 'g'],
];

const arrMulti: ArrayNonEmpty<Link<string>> = [
  ['a', 'a'],
  ['a', 'b'],
  ['c', 'b'],
  ['b', 'a'],
];

export function runEdgeGraphTestsWith(name: string, G: EdgeGraph.Context<any>) {
  describe(`${name} creators`, () => {
    it('empty', () => {
      expect(G.empty<number>()).toEqual(G.empty<string>());
    });

    it('of', () => {
      expectEqual(G.of(...arr3), arr3);
      expectEqual(G.of(...arr6), arr6);
    });

    it('from', () => {
      expectEqual(G.from(arr3), arr3);
      expectEqual(G.from(arr6), arr6);
    });

    it('builder', () => {
      const b = G.builder<string>();
      expect(b.nodeSize).toBe(0);
      expect(b.connectionSize).toBe(0);
      b.connectAll(arr6);
      expect(b.nodeSize).toBe(7);
      expect(b.connectionSize).toBe(6);
    });

    it('reducer', () => {
      const source = Stream.of<GraphElement<number>>([1, 2], [3], [4, 5]);
      {
        const result = source.reduce(G.reducer());
        expectEqual(result, [
          [1, 2],
          [4, 5],
        ]);
        expect(result.hasNode(3)).toBe(true);
      }

      {
        const result = source.reduce(G.reducer([[3, 4], [6]]));
        expectEqual(result, [
          [1, 2],
          [3, 4],
          [4, 5],
        ]);
        expect(result.hasNode(6)).toBe(true);
      }
    });
  });

  describe(`${name} methods`, () => {
    const graphEmpty = G.empty<string>();
    const graph3 = G.from(arr3);
    const graph6 = G.from(arr6);
    const graphMulti = G.from(arrMulti);

    it('iterator', () => {
      expect(new Set(graphEmpty)).toEqual(new Set());
      expect(new Set(graph3)).toEqual(new Set(symmetric(arr3)));
      expect(new Set(graph6)).toEqual(new Set(symmetric(arr6)));
      expect(new Set(G.of(['a']))).toEqual(new Set([['a']]));
    });

    it('addNode', () => {
      expect(graphEmpty.addNode('a').nodeSize).toBe(1);
      expect(graphEmpty.addNode('a').connectionSize).toBe(0);
      expect(graphEmpty.addNode('a').hasNode('a')).toBe(true);
      expect(graph3.addNode('a')).toBe(graph3);
      expect(graph3.addNode('z').hasNode('z')).toBe(true);
    });

    it('addNodes', () => {
      expect(graphEmpty.addNodes([])).toBe(graphEmpty);
      expect(graph3.addNodes([])).toBe(graph3);
      expect(new Set(graphEmpty.addNodes('bcdc').streamNodes())).toEqual(
        new Set('bcd')
      );
      expect(graph3.addNodes('bcb')).toBe(graph3);
      expect(new Set(graph3.addNodes('bcd').streamNodes())).toEqual(
        new Set('abcd')
      );
    });

    it('asNormal', () => {
      expect(graph3.asNormal()).toBe(graph3);
    });

    it('assumeNonEmpty', () => {
      expect(() => graphEmpty.assumeNonEmpty()).toThrow();
      expect(graph3.assumeNonEmpty()).toBe(graph3);
      expect(graph6.assumeNonEmpty()).toBe(graph6);
    });

    it('connect', () => {
      expectEqual(graphEmpty.connect('a', 'b'), [['a', 'b']]);
      expectEqual(graphEmpty.connect('a', 'a'), [['a', 'a']]);
      expect(graph3.connect('a', 'b')).toBe(graph3);
      expectEqual(graph3.connect('a', 'd'), [...arr3, ['a', 'd']]);
      expectEqual(graph3.connect('f', 'g'), [...arr3, ['f', 'g']]);
    });

    it('connectAll', () => {
      expect(graphEmpty.connectAll([])).toBe(graphEmpty);
      expectEqual(graphEmpty.connectAll(arr3), arr3);
      expect(graph3.connectAll(arr3)).toBe(graph3);
      expectEqual(
        graph3.connectAll([
          ['a', 'a'],
          ['e', 'f'],
        ]),
        [...arr3, ['a', 'a'], ['e', 'f']]
      );
    });

    it('connectionSize', () => {
      expect(graphEmpty.connectionSize).toBe(0);
      expect(graph3.connectionSize).toBe(3);
      expect(graph6.connectionSize).toBe(6);
    });

    it('context', () => {
      expect(graphEmpty.context).toBe(G);
      expect(graph3.context).toBe(G);
      expect(graph6.context).toBe(G);
    });

    it('disconnrct', () => {
      expect(graphEmpty.disconnect('a', 'b')).toBe(graphEmpty);
      expect(graph3.disconnect('e', 'f')).toBe(graph3);
      expectEqual(graph3.disconnect('b', 'c'), [
        ['a', 'b'],
        ['c', 'a'],
      ]);
    });

    it('disconnectAll', () => {
      expect(
        graphEmpty.disconnectAll([
          ['a', 'b'],
          ['c', 'd'],
        ])
      ).toBe(graphEmpty);
      expect(graph3.disconnectAll([['z', 'z']])).toBe(graph3);
      expectEqual(
        graph3.disconnectAll([
          ['b', 'c'],
          ['c', 'a'],
        ]),
        [['a', 'b']]
      );
      expectEqual(graph3.disconnectAll(arr3), []);
      expect(graph3.disconnectAll(arr3).nodeSize).toBe(3);
    });

    it('getConnectionStreamFrom', () => {
      expect(graphEmpty.getConnectionStreamFrom('a')).toBe(Stream.empty());
      expect(graph3.getConnectionStreamFrom('z')).toBe(Stream.empty());
      expect(new Set(graph3.getConnectionStreamFrom('a'))).toEqual(
        new Set([
          ['a', 'b'],
          ['a', 'c'],
        ])
      );
      expect(new Set(graph6.getConnectionStreamFrom('b'))).toEqual(
        new Set([
          ['b', 'a'],
          ['b', 'c'],
          ['b', 'd'],
        ])
      );
    });

    it('getConnectionStreamTo', () => {
      expect(graphEmpty.getConnectionStreamTo('a')).toBe(Stream.empty());
      expect(graph3.getConnectionStreamTo('z').toArray()).toEqual([]);
      expect(new Set(graph3.getConnectionStreamTo('a'))).toEqual(
        new Set([
          ['b', 'a'],
          ['c', 'a'],
        ])
      );
      expect(new Set(graphMulti.getConnectionStreamTo('a'))).toEqual(
        new Set([
          ['a', 'a'],
          ['b', 'a'],
        ])
      );
    });

    it('getConnectionsFrom', () => {
      expect(graphEmpty.getConnectionsFrom('a')).toBe(
        G.linkConnectionsContext.empty()
      );
      expect(graph3.getConnectionsFrom('z')).toBe(
        G.linkConnectionsContext.empty()
      );
      expect(new Set(graph3.getConnectionsFrom('a'))).toEqual(new Set('bc'));
      expect(new Set(graph6.getConnectionsFrom('b'))).toEqual(new Set('acd'));
    });

    it('hasConnection', () => {
      expect(graphEmpty.hasConnection('a', 'b')).toBe(false);
      expect(graph3.hasConnection('z', 'z')).toBe(false);
      expect(graph3.hasConnection('a', 'z')).toBe(false);
      expect(graph3.hasConnection('z', 'a')).toBe(false);
      expect(graph3.hasConnection('a', 'b')).toBe(true);
    });

    it('hasNode', () => {
      expect(graphEmpty.hasNode('a')).toBe(false);
      expect(graph3.hasNode('z')).toBe(false);
      expect(graph3.hasNode('a')).toBe(true);
    });

    it('isDirected', () => {
      expect(graphEmpty.isDirected).toBe(false);
      expect(graph3.isDirected).toBe(false);
    });

    it('isEmpty', () => {
      expect(graphEmpty.isEmpty).toBe(true);
      expect(graph3.isEmpty).toBe(false);
    });

    it('linkMap', () => {
      expect(graphEmpty.linkMap).toBe(G.linkMapContext.empty());
      expect(graph3.linkMap.size).toBe(3);
      expect(new Set(graph3.linkMap.get('a')!)).toEqual(new Set('bc'));
    });

    it('nodeSize', () => {
      expect(graphEmpty.nodeSize).toBe(0);
      expect(graph3.nodeSize).toBe(3);
      expect(graph6.nodeSize).toBe(7);
      expect(graphMulti.nodeSize).toBe(3);
    });

    it('nonEmpty', () => {
      expect(graphEmpty.nonEmpty()).toBe(false);
      expect(graph3.nonEmpty()).toBe(true);
      expect(graph6.nonEmpty()).toBe(true);
    });

    it('removeNode', () => {
      expect(graphEmpty.removeNode('a')).toBe(graphEmpty);
      expect(graph3.removeNode('z')).toBe(graph3);
      expectEqual(graph3.removeNode('a'), [['b', 'c']]);
      expectEqual(graphMulti.removeNode('a'), [['c', 'b']]);
    });

    it('removeNodes', () => {
      expect(graphEmpty.removeNodes('az')).toBe(graphEmpty);
      expect(graph3.removeNodes('xyz')).toBe(graph3);
      expectEqual(graph3.removeNodes('aybz'), []);
    });

    it('removeUnconnectedNodes', () => {
      expect(graphEmpty.removeUnconnectedNodes()).toBe(graphEmpty);
      expect(graph3.removeUnconnectedNodes()).toBe(graph3);
      expect(graph6.removeUnconnectedNodes()).toBe(graph6);
      {
        const g = graph6.removeNode('f');
        expect(g.nodeSize).toBe(6);
        expect(g.removeUnconnectedNodes().nodeSize).toBe(5);
      }
      {
        const g = graph6.removeNode('g');
        expect(g.nodeSize).toBe(6);
        expect(g.removeUnconnectedNodes().nodeSize).toBe(5);
      }
    });

    it('stream', () => {
      expect(graphEmpty.stream()).toBe(Stream.empty());
      expect(new Set(graph3.stream())).toEqual(new Set(symmetric(arr3)));
      expect(
        G.of([['a']])
          .stream()
          .toArray()
      ).toEqual([[['a']]]);
    });

    it('streamConnections', () => {
      expect(graphEmpty.streamConnections()).toBe(Stream.empty());
      expect(new Set(graph3.streamConnections())).toEqual(
        new Set(symmetric(arr3))
      );
    });

    it('streamNodes', () => {
      expect(graphEmpty.streamNodes()).toBe(Stream.empty());
      expect(new Set(graph3.streamNodes())).toEqual(new Set('abc'));
    });

    it('toBuilder', () => {
      expect(graphEmpty.toBuilder().build()).toBe(graphEmpty);
      expect(graph3.toBuilder().build()).toBe(graph3);
      expect(graph6.toBuilder().build()).toBe(graph6);
      {
        const b = graphEmpty.toBuilder();
        expect(b.isEmpty).toBe(true);
      }
      {
        const b = graph3.toBuilder();
        expect(b.hasConnection('a', 'b')).toBe(true);
      }
      {
        const b = graph6.toBuilder();
        expect(b.hasConnection('a', 'b')).toBe(true);
      }
    });

    it('toString', () => {
      expect(graphEmpty.toString()).toBe(`${G.typeTag}()`);
      expect(graph3.toString()).toBe(`${G.typeTag}(
  a <-> [b, c],
  b <-> [a, c],
  c <-> [a, b]
)`);
    });

    it('creates two way connections', () => {
      const g = G.empty<number>().connect(1, 2);
      expect(g.hasConnection(1, 2)).toBe(true);
      expect(g.hasConnection(2, 1)).toBe(true);
    });

    it('removes connection in two directions', () => {
      const g = G.empty<number>().connect(1, 2);

      const g1 = g.disconnect(1, 2);
      expect(g1.hasConnection(1, 2)).toBe(false);
      expect(g1.hasConnection(2, 1)).toBe(false);

      const g2 = g.disconnect(2, 1);
      expect(g2.hasConnection(1, 2)).toBe(false);
      expect(g2.hasConnection(2, 1)).toBe(false);
    });
  });

  describe(`${name}.Builder`, () => {
    function forEachBuilder(f: (builder: EdgeGraph.Builder<string>) => void) {
      const b1 = G.from(arr3).toBuilder();
      const b2 = G.builder<string>();
      b2.connectAll(arr3);
      f(b1);
      f(b2);
    }

    it('addNode', () => {
      const b = G.builder<string>();
      expect(b.nodeSize).toBe(0);

      expect(b.addNode('a')).toBe(true);
      expect(b.nodeSize).toBe(1);

      expect(b.addNode('a')).toBe(false);
      expect(b.nodeSize).toBe(1);
    });

    it('addNodes', () => {
      const b = G.builder<string>();
      expect(b.nodeSize).toBe(0);

      expect(b.addNodes('abcb')).toBe(true);
      expect(b.nodeSize).toBe(3);

      expect(b.addNodes('abcb')).toBe(false);

      expect(b.addNodes('abcd')).toBe(true);
      expect(b.nodeSize).toBe(4);
    });

    it('build', () => {
      const b = G.builder<string>();
      expect(b.build()).toBe(G.empty());

      forEachBuilder((b) => {
        expect(b.build().nodeSize).toBe(3);
        expect(b.build().connectionSize).toBe(3);
        expectEqual(b.build(), arr3);
      });
    });

    it('connect', () => {
      const b = G.builder<string>();
      expect(b.nodeSize).toBe(0);

      expect(b.connect('a', 'b')).toBe(true);
      expect(b.nodeSize).toBe(2);
      expect(b.connectionSize).toBe(1);

      expect(b.connect('a', 'b')).toBe(false);
      expect(b.nodeSize).toBe(2);
      expect(b.connectionSize).toBe(1);

      expect(b.connect('a', 'a')).toBe(true);
      expect(b.nodeSize).toBe(2);
      expect(b.connectionSize).toBe(2);
    });

    it('connectAll', () => {
      const b = G.builder<string>();
      expect(b.nodeSize).toBe(0);

      expect(b.connectAll([])).toBe(false);
      expect(b.nodeSize).toBe(0);
      expect(b.connectionSize).toBe(0);

      expect(
        b.connectAll([
          ['a', 'b'],
          ['a', 'a'],
        ])
      ).toBe(true);
      expect(b.nodeSize).toBe(2);
      expect(b.connectionSize).toBe(2);

      expect(
        b.connectAll([
          ['a', 'b'],
          ['a', 'a'],
        ])
      ).toBe(false);
    });

    it('connectIfNodesExist', () => {
      const b = G.builder<string>();
      expect(b.connectIfNodesExist('a', 'b')).toBe(false);
      b.addNode('a');
      expect(b.connectIfNodesExist('a', 'b')).toBe(false);
      expect(b.connectIfNodesExist('b', 'a')).toBe(false);
      b.addNode('b');
      expect(b.connectIfNodesExist('b', 'a')).toBe(true);
      expect(b.connectIfNodesExist('a', 'b')).toBe(false);
    });

    it('connectionSize', () => {
      const b = G.builder<string>();
      expect(b.connectionSize).toBe(0);

      forEachBuilder((b) => {
        expect(b.connectionSize).toBe(3);
      });
    });

    it('context', () => {
      const b = G.builder<string>();
      expect(b.context).toBe(G);

      forEachBuilder((b) => {
        expect(b.context).toBe(G);
      });
    });

    it('disconnect', () => {
      const b = G.builder<string>();
      expect(b.disconnect('a', 'b')).toBe(false);

      forEachBuilder((b) => {
        expect(b.disconnect('a', 'b')).toBe(true);
        expect(b.disconnect('a', 'b')).toBe(false);
        expect(b.connectionSize).toBe(2);
      });
    });

    it('disconnectAll', () => {
      const b = G.builder<string>();
      expect(b.disconnectAll([])).toBe(false);
      expect(b.disconnectAll([['a', 'b']])).toBe(false);

      forEachBuilder((b) => {
        expect(b.disconnectAll([])).toBe(false);
        expect(b.disconnectAll([['x', 'y']])).toBe(false);
        expect(
          b.disconnectAll([
            ['x', 'y'],
            ['a', 'b'],
          ])
        ).toBe(true);
      });
    });

    it('hasConnection', () => {
      const b = G.builder<string>();
      expect(b.hasConnection('a', 'b')).toBe(false);

      forEachBuilder((b) => {
        expect(b.hasConnection('x', 'y')).toBe(false);
        expect(b.hasConnection('a', 'y')).toBe(false);
        expect(b.hasConnection('y', 'a')).toBe(false);
        expect(b.hasConnection('a', 'b')).toBe(true);
      });
    });

    it('isEmpty', () => {
      const b = G.builder<string>();
      expect(b.isEmpty).toBe(true);

      b.addNode('a');
      expect(b.isEmpty).toBe(false);

      forEachBuilder((b) => {
        expect(b.isEmpty).toBe(false);
      });
    });

    it('nodeSize', () => {
      const b = G.builder<string>();
      expect(b.nodeSize).toBe(0);

      b.connect('a', 'a');
      expect(b.nodeSize).toBe(1);

      b.connect('b', 'c');
      expect(b.nodeSize).toBe(3);

      forEachBuilder((b) => {
        expect(b.nodeSize).toBe(3);
      });
    });

    it('removeNode', () => {
      const b = G.builder<string>();

      expect(b.removeNode('a')).toBe(false);

      b.addNode('a');
      expect(b.removeNode('a')).toBe(true);

      b.connect('b', 'a');
      expect(b.removeNode('a')).toBe(true);

      forEachBuilder((b) => {
        expect(b.removeNode('z')).toBe(false);
        expect(b.removeNode('b')).toBe(true);
      });
    });

    it('removeNodes', () => {
      const b = G.builder<string>();

      expect(b.removeNodes('ab')).toBe(false);

      forEachBuilder((b) => {
        expect(b.removeNodes('xyz')).toBe(false);
        expect(b.removeNodes('xbz')).toBe(true);
        expect(b.nodeSize).toBe(2);
      });
    });

    it('creates two way connections', () => {
      const b = G.builder<number>();
      b.connect(1, 2);
      expect(b.hasConnection(1, 2)).toBe(true);
      expect(b.hasConnection(2, 1)).toBe(true);
    });

    it('removes connection in two directions', () => {
      const b = G.builder<number>();
      b.connect(1, 2);
      b.connect(2, 1);

      const b1 = b.build().toBuilder();
      b1.disconnect(1, 2);
      expect(b1.hasConnection(1, 2)).toBe(false);
      expect(b1.hasConnection(2, 1)).toBe(false);

      const b2 = b.build().toBuilder();
      b2.disconnect(2, 1);
      expect(b2.hasConnection(1, 2)).toBe(false);
      expect(b2.hasConnection(2, 1)).toBe(false);
    });
  });
}
