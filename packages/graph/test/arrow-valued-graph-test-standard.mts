import type { ArrayNonEmpty } from '@rimbu/common';
import { Stream } from '@rimbu/stream';

import type { ValuedGraphElement, ValuedLink } from '../src/custom/index.mjs';
import type { ArrowValuedGraph } from '../src/main/index.mjs';

function expectEqual<N, V>(
  source: { streamConnections(): Stream<ValuedLink<N, V>> },
  arr: ValuedLink<N, V>[]
) {
  expect(new Set(source.streamConnections())).toEqual(new Set(arr));
}

const arr3: ArrayNonEmpty<ValuedLink<string, number>> = [
  ['a', 'b', 1],
  ['b', 'c', 2],
  ['c', 'a', 3],
];

const arr6: ArrayNonEmpty<ValuedLink<string, number>> = [
  ['a', 'b', 1],
  ['b', 'c', 2],
  ['c', 'a', 3],
  ['b', 'd', 4],
  ['d', 'e', 5],
  ['f', 'g', 6],
];

const arrMulti: ArrayNonEmpty<ValuedLink<string, number>> = [
  ['a', 'a', 1],
  ['a', 'b', 2],
  ['c', 'b', 3],
  ['b', 'a', 4],
];

export function runGraphTestsWith(
  name: string,
  G: ArrowValuedGraph.Context<any>
) {
  describe(`${name} creators`, () => {
    it('empty', () => {
      expect(G.empty<number, string>()).toEqual(G.empty<boolean, Symbol>());
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
      const b = G.builder<string, number>();
      expect(b.nodeSize).toBe(0);
      expect(b.connectionSize).toBe(0);
      b.connectAll(arr6);
      expect(b.nodeSize).toBe(7);
      expect(b.connectionSize).toBe(6);
    });

    it('reducer', () => {
      const source = Stream.of<ValuedGraphElement<number, string>>(
        [1, 2, 'a'],
        [3],
        [4, 5, 'b']
      );
      {
        const result = source.reduce(G.reducer());
        expectEqual(result, [
          [1, 2, 'a'],
          [4, 5, 'b'],
        ]);
        expect(result.hasNode(3)).toBe(true);
      }

      {
        const result = source.reduce(G.reducer([[3, 4, 'q'], [6]]));
        expectEqual(result, [
          [1, 2, 'a'],
          [3, 4, 'q'],
          [4, 5, 'b'],
        ]);
        expect(result.hasNode(6)).toBe(true);
      }
    });
  });

  describe(`${name} methods`, () => {
    const graphEmpty = G.empty<string, number>();
    const graph3 = G.from(arr3);
    const graph6 = G.from(arr6);
    const graphMulti = G.from(arrMulti);

    it('iterator', () => {
      expect(new Set(graphEmpty)).toEqual(new Set());
      expect(new Set(graph3)).toEqual(new Set(arr3));
      expect(new Set(graph6)).toEqual(new Set([...arr6, ['e'], ['g']]));
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
      expectEqual(graphEmpty.connect('a', 'b', 1), [['a', 'b', 1]]);
      expectEqual(graphEmpty.connect('a', 'a', 1), [['a', 'a', 1]]);

      expect(graph3.connect('a', 'b', 1)).toBe(graph3);
      expectEqual(graph3.connect('a', 'd', 9), [...arr3, ['a', 'd', 9]]);
      expectEqual(graph3.connect('f', 'g', 9), [...arr3, ['f', 'g', 9]]);
    });

    it('connectAll', () => {
      expect(graphEmpty.connectAll([])).toBe(graphEmpty);
      expectEqual(graphEmpty.connectAll(arr3), arr3);
      expect(graph3.connectAll(arr3)).toBe(graph3);
      expectEqual(
        graph3.connectAll([
          ['a', 'a', 10],
          ['e', 'f', 11],
        ]),
        [...arr3, ['a', 'a', 10], ['e', 'f', 11]]
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
        ['a', 'b', 1],
        ['c', 'a', 3],
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
        [['a', 'b', 1]]
      );
      expectEqual(graph3.disconnectAll(arr3), []);
      expect(graph3.disconnectAll(arr3).nodeSize).toBe(3);
    });

    it('forEach', () => {
      let counter = 0;
      graphEmpty.forEach(() => counter++);
      expect(counter).toEqual(0);

      counter = 0;
      graph3.forEach(() => counter++);
      expect(counter).toEqual(3);

      counter = 0;
      graph6.forEach(() => counter++);
      expect(counter).toEqual(8);
    });

    it('getConnectionStreamFrom', () => {
      expect(graphEmpty.getConnectionStreamFrom('a')).toBe(Stream.empty());
      expect(graph3.getConnectionStreamFrom('z')).toBe(Stream.empty());
      expect(graph3.getConnectionStreamFrom('a').toArray()).toEqual([
        ['a', 'b', 1],
      ]);
      expect(new Set(graph6.getConnectionStreamFrom('b'))).toEqual(
        new Set([
          ['b', 'c', 2],
          ['b', 'd', 4],
        ])
      );
    });

    it('getConnectionStreamTo', () => {
      expect(graphEmpty.getConnectionStreamTo('a')).toBe(Stream.empty());
      expect(graph3.getConnectionStreamTo('z').toArray()).toEqual([]);
      expect(graph3.getConnectionStreamTo('a').toArray()).toEqual([
        ['c', 'a', 3],
      ]);
      expect(new Set(graphMulti.getConnectionStreamTo('a'))).toEqual(
        new Set([
          ['a', 'a', 1],
          ['b', 'a', 4],
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
      expect(graph3.getConnectionsFrom('a').toArray()).toEqual([['b', 1]]);
      expect(new Set(graph6.getConnectionsFrom('b'))).toEqual(
        new Set([
          ['c', 2],
          ['d', 4],
        ])
      );
    });

    it('getValue', () => {
      expect(graphEmpty.getValue('a', 'b')).toBe(undefined);
      expect(graphEmpty.getValue('a', 'b', 1)).toBe(1);
      expect(graphEmpty.getValue('a', 'b', () => 1)).toBe(1);

      expect(graph3.getValue('a', 'z')).toBe(undefined);
      expect(graph3.getValue('z', 'a')).toBe(undefined);
      expect(graph3.getValue('a', 'b')).toBe(1);

      expect(graph3.getValue('a', 'z', 10)).toBe(10);
      expect(graph3.getValue('z', 'a', 10)).toBe(10);
      expect(graph3.getValue('a', 'b', 10)).toBe(1);

      expect(graph3.getValue('a', 'z', () => 10)).toBe(10);
      expect(graph3.getValue('z', 'a', () => 10)).toBe(10);
      expect(graph3.getValue('a', 'b', () => 10)).toBe(1);
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
      expect(graphEmpty.isDirected).toBe(true);
      expect(graph3.isDirected).toBe(true);
    });

    it('isEmpty', () => {
      expect(graphEmpty.isEmpty).toBe(true);
      expect(graph3.isEmpty).toBe(false);
    });

    it('isSink', () => {
      expect(graphEmpty.isSink('a')).toBe(false);
      expect(graph6.isSink('f')).toBe(false);
      expect(graph6.isSink('g')).toBe(true);
      expect(graph6.isSink('a')).toBe(false);
      expect(graph6.isSink('z')).toBe(false);
    });

    it('isSource', () => {
      expect(graphEmpty.isSource('a')).toBe(false);
      expect(graph6.isSource('f')).toBe(true);
      expect(graph6.isSource('g')).toBe(false);
      expect(graph6.isSource('a')).toBe(false);
      expect(graph6.isSource('z')).toBe(false);
    });

    it('linkMap', () => {
      expect(graphEmpty.linkMap).toBe(G.linkMapContext.empty());
      expect(graph3.linkMap.size).toBe(3);
      expect(graph3.linkMap.get('a')!.toArray()).toEqual([['b', 1]]);
    });

    it('mapValues', () => {
      expect(graphEmpty.mapValues((v) => v + 1)).toBe(graphEmpty);
      expectEqual(
        graph3.mapValues((v) => v + 1),
        arr3.map(([n1, n2, v]) => [n1, n2, v + 1])
      );
      expectEqual(
        graph6.mapValues((v) => v + 1),
        arr6.map(([n1, n2, v]) => [n1, n2, v + 1])
      );
    });

    it('modifyAt', () => {
      expect(
        graphEmpty.modifyAt('a', 'b', {
          ifNew: (none) => none,
          ifExists: (v) => v + 1,
        })
      ).toBe(graphEmpty);
      expectEqual(
        graphEmpty.modifyAt('a', 'b', { ifNew: 1, ifExists: (v) => v + 1 }),
        [['a', 'b', 1]]
      );
      expectEqual(
        graphEmpty.modifyAt('a', 'b', {
          ifNew: () => 1,
          ifExists: (v) => v + 1,
        }),
        [['a', 'b', 1]]
      );

      expectEqual(
        graph3.modifyAt('a', 'b', { ifNew: 1, ifExists: (v) => v + 1 }),
        [
          ['a', 'b', 2],
          ['b', 'c', 2],
          ['c', 'a', 3],
        ]
      );

      expectEqual(
        graph3.modifyAt('a', 'b', {
          ifNew: 1,
          ifExists: (_, remove) => remove,
        }),
        [
          ['b', 'c', 2],
          ['c', 'a', 3],
        ]
      );

      expectEqual(
        graph3.modifyAt('z', 'b', {
          ifNew: 1,
          ifExists: (_, remove) => remove,
        }),
        [
          ['a', 'b', 1],
          ['b', 'c', 2],
          ['c', 'a', 3],
          ['z', 'b', 1],
        ]
      );
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
      expectEqual(graph3.removeNode('a'), [['b', 'c', 2]]);
      expectEqual(graphMulti.removeNode('a'), [['c', 'b', 3]]);
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
      expect(new Set(graph3.stream())).toEqual(new Set(arr3));
    });

    it('streamConnections', () => {
      expect(graphEmpty.streamConnections()).toBe(Stream.empty());
      expect(new Set(graph3.streamConnections())).toEqual(new Set(arr3));
      expect(
        G.of([['a']])
          .stream()
          .toArray()
      ).toEqual([[['a']]]);
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
  a -> [{b: 1}],
  b -> [{c: 2}],
  c -> [{a: 3}]
)`);
    });

    it('creates one way connections', () => {
      const g = G.empty<number, number>().connect(1, 2, 5);
      expect(g.getValue(1, 2)).toBe(5);
      expect(g.hasConnection(2, 1)).toBe(false);
    });

    it('removes connection in one way', () => {
      const g = G.empty<number, number>().connect(1, 2, 5).connect(2, 1, 8);

      const g1 = g.disconnect(1, 2);
      expect(g1.hasConnection(1, 2)).toBe(false);
      expect(g1.getValue(2, 1)).toBe(8);

      const g2 = g.disconnect(2, 1);
      expect(g2.getValue(1, 2)).toBe(5);
      expect(g2.hasConnection(2, 1)).toBe(false);
    });
  });

  describe(`${name}.Builder`, () => {
    function forEachBuilder(
      f: (builder: ArrowValuedGraph.Builder<string, number>) => void
    ) {
      const b1 = G.from(arr3).toBuilder();
      const b2 = G.builder<string, number>();
      b2.connectAll(arr3);
      f(b1);
      f(b2);
    }

    it('addNode', () => {
      const b = G.builder<string, number>();
      expect(b.nodeSize).toBe(0);
      expect(b.addNode('a')).toBe(true);
      expect(b.nodeSize).toBe(1);
      expect(b.addNode('a')).toBe(false);
      expect(b.nodeSize).toBe(1);
    });

    it('addNodes', () => {
      const b = G.builder<string, number>();
      expect(b.nodeSize).toBe(0);

      expect(b.addNodes('abcb')).toBe(true);
      expect(b.nodeSize).toBe(3);

      expect(b.addNodes('abcb')).toBe(false);
      expect(b.addNodes('abcd')).toBe(true);
      expect(b.nodeSize).toBe(4);
    });

    it('build', () => {
      const b = G.builder<string, number>();
      expect(b.build()).toBe(G.empty());

      forEachBuilder((b) => {
        expect(b.build().nodeSize).toBe(3);
        expect(b.build().connectionSize).toBe(3);
        expectEqual(b.build(), arr3);
      });
    });

    it('buildMapValues', () => {
      const b = G.builder<string, number>();
      expect(b.buildMapValues((v) => v + 1)).toBe(G.empty());

      b.connect('a', 'b', 3);
      expectEqual(
        b.buildMapValues((v, s, t) => `${v}${s}${t}`),
        [['a', 'b', '3ab']]
      );

      forEachBuilder((b) => {
        expect(b.buildMapValues((v) => v + 1).nodeSize).toBe(3);
        expect(b.buildMapValues((v) => v + 1).connectionSize).toBe(3);
        expectEqual(
          b.buildMapValues((v) => v + 1),
          arr3.map(([s, t, n]) => [s, t, n + 1])
        );
      });
    });

    it('connect', () => {
      const b = G.builder<string, number>();
      expect(b.nodeSize).toBe(0);

      expect(b.connect('a', 'b', 1)).toBe(true);
      expect(b.nodeSize).toBe(2);
      expect(b.connectionSize).toBe(1);

      expect(b.connect('a', 'b', 1)).toBe(false);
      expect(b.nodeSize).toBe(2);
      expect(b.connectionSize).toBe(1);

      expect(b.connect('a', 'a', 2)).toBe(true);
      expect(b.nodeSize).toBe(2);
      expect(b.connectionSize).toBe(2);

      expect(b.connect('a', 'a', 3)).toBe(true);
      expect(b.nodeSize).toBe(2);
      expect(b.connectionSize).toBe(2);
    });

    it('connectAll', () => {
      const b = G.builder<string, number>();
      expect(b.nodeSize).toBe(0);

      expect(b.connectAll([])).toBe(false);
      expect(b.nodeSize).toBe(0);
      expect(b.connectionSize).toBe(0);

      expect(
        b.connectAll([
          ['a', 'b', 1],
          ['a', 'a', 2],
        ])
      ).toBe(true);
      expect(b.nodeSize).toBe(2);
      expect(b.connectionSize).toBe(2);

      expect(
        b.connectAll([
          ['a', 'b', 1],
          ['a', 'a', 2],
        ])
      ).toBe(false);
    });

    it('connectionSize', () => {
      const b = G.builder<string, number>();

      expect(b.connectionSize).toBe(0);

      forEachBuilder((b) => {
        expect(b.connectionSize).toBe(3);
      });
    });

    it('context', () => {
      const b = G.builder<string, number>();

      expect(b.context).toBe(G);

      forEachBuilder((b) => {
        expect(b.context).toBe(G);
      });
    });

    it('disconnect', () => {
      const b = G.builder<string, number>();

      expect(b.disconnect('a', 'b')).toBe(false);

      forEachBuilder((b) => {
        expect(b.disconnect('a', 'b')).toBe(true);
        expect(b.disconnect('a', 'b')).toBe(false);
        expect(b.connectionSize).toBe(2);
      });
    });

    it('disconnectAll', () => {
      const b = G.builder<string, number>();

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
      const b = G.builder<string, number>();

      expect(b.hasConnection('a', 'b')).toBe(false);

      forEachBuilder((b) => {
        expect(b.hasConnection('x', 'y')).toBe(false);
        expect(b.hasConnection('a', 'y')).toBe(false);
        expect(b.hasConnection('y', 'a')).toBe(false);
        expect(b.hasConnection('a', 'b')).toBe(true);
      });
    });

    it('isEmpty', () => {
      const b = G.builder<string, number>();

      expect(b.isEmpty).toBe(true);

      b.addNode('a');

      expect(b.isEmpty).toBe(false);

      forEachBuilder((b) => {
        expect(b.isEmpty).toBe(false);
      });
    });

    it('modifyAt', () => {
      const b = G.builder<string, number>();

      expect(
        b.modifyAt('a', 'b', { ifNew: (none) => none, ifExists: (v) => v + 1 })
      ).toBe(false);

      expect(b.getValue('a', 'b')).toBe(undefined);

      expect(b.modifyAt('a', 'b', { ifNew: 1, ifExists: (v) => v + 1 })).toBe(
        true
      );

      expect(b.getValue('a', 'b')).toBe(1);

      expect(b.modifyAt('a', 'b', { ifNew: 1, ifExists: (v) => v + 1 })).toBe(
        true
      );

      expect(b.getValue('a', 'b')).toBe(2);

      expect(b.modifyAt('a', 'b', { ifNew: 1, ifExists: () => 2 })).toBe(false);

      expect(
        b.modifyAt('a', 'b', { ifNew: 1, ifExists: (_, remove) => remove })
      ).toBe(true);

      expect(b.getValue('a', 'b')).toBe(undefined);
    });

    it('nodeSize', () => {
      const b = G.builder<string, number>();

      expect(b.nodeSize).toBe(0);

      b.connect('a', 'a', 1);
      expect(b.nodeSize).toBe(1);

      b.connect('b', 'c', 1);
      expect(b.nodeSize).toBe(3);

      forEachBuilder((b) => {
        expect(b.nodeSize).toBe(3);
      });
    });

    it('removeNode', () => {
      const b = G.builder<string, number>();

      expect(b.removeNode('a')).toBe(false);

      b.addNode('a');
      expect(b.removeNode('a')).toBe(true);

      b.connect('b', 'a', 1);
      expect(b.removeNode('a')).toBe(true);

      forEachBuilder((b) => {
        expect(b.removeNode('z')).toBe(false);
        expect(b.removeNode('b')).toBe(true);
      });
    });

    it('removeNodes', () => {
      const b = G.builder<string, number>();

      expect(b.removeNodes('ab')).toBe(false);

      forEachBuilder((b) => {
        expect(b.removeNodes('xyz')).toBe(false);
        expect(b.removeNodes('xbz')).toBe(true);
        expect(b.nodeSize).toBe(2);
      });
    });

    it('creates one way connections', () => {
      const b = G.builder<number, number>();
      b.connect(1, 2, 5);
      expect(b.getValue(1, 2)).toBe(5);
      expect(b.hasConnection(2, 1)).toBe(false);
    });

    it('removes connection in one way', () => {
      const b = G.builder<number, number>();
      b.connect(1, 2, 5);
      b.connect(2, 1, 8);

      const b1 = b.build().toBuilder();
      b1.disconnect(1, 2);
      expect(b1.hasConnection(1, 2)).toBe(false);
      expect(b1.getValue(2, 1)).toBe(8);

      const b2 = b.build().toBuilder();
      b2.disconnect(2, 1);
      expect(b2.getValue(1, 2)).toBe(5);
      expect(b2.hasConnection(2, 1)).toBe(false);
    });
  });
}
