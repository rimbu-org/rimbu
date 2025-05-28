import type { Expr } from '../src/expression-types.mjs';
import {
  createFollowPositionsMap,
  type FollowPositionsMap,
} from '../src/follow-positions-map.mjs';
import { type Index } from '../src/positions.mjs';
import { createTreeWithEndNode } from '../src/tree-builder.mjs';
import type { TreeNode } from '../src/tree-node.mjs';

function getMap(expr: Expr<any>): {
  tree: TreeNode;
  followPositionsMap: FollowPositionsMap;
} {
  const { tree } = createTreeWithEndNode(expr);
  return {
    tree,
    followPositionsMap: createFollowPositionsMap(tree),
  };
}

function toPositions(indices: Index[]): bigint {
  let positions = 0n;
  for (const index of indices) {
    positions |= 1n << BigInt(index);
  }
  return positions;
}

describe('Follow positions map', () => {
  it('works for empty tree', () => {
    const { followPositionsMap } = getMap([]);
    expect(followPositionsMap.size).toBe(1);
    expect(followPositionsMap.get(0)).toMatchObject({
      type: 'followPositions',
      followPositions: toPositions([]),
    });
  });

  it('works for simple seq tree', () => {
    const { followPositionsMap } = getMap([1, 2, 3]);
    expect(followPositionsMap.size).toBe(4);
    expect(followPositionsMap.get(0)).toMatchObject({
      type: 'followPositions',
      followPositions: toPositions([1]),
    });
    expect(followPositionsMap.get(1)).toMatchObject({
      type: 'followPositions',
      followPositions: toPositions([2]),
    });
    expect(followPositionsMap.get(2)).toMatchObject({
      type: 'followPositions',
      followPositions: toPositions([3]),
    });
    expect(followPositionsMap.get(3)).toMatchObject({
      type: 'followPositions',
      followPositions: toPositions([]),
    });
  });

  it('works for simple or tree', () => {
    const { followPositionsMap } = getMap({ _or: [1, 2, 3] });
    expect(followPositionsMap.size).toBe(4);

    expect(followPositionsMap.get(0)).toMatchObject({
      type: 'followPositions',

      followPositions: toPositions([3]),
    });
    expect(followPositionsMap.get(1)).toMatchObject({
      type: 'followPositions',
      followPositions: toPositions([3]),
    });
    expect(followPositionsMap.get(2)).toMatchObject({
      type: 'followPositions',
      followPositions: toPositions([3]),
    });
    expect(followPositionsMap.get(3)).toMatchObject({
      type: 'followPositions',
      followPositions: toPositions([]),
    });
  });

  it('works for simple repeat', () => {
    const { followPositionsMap } = getMap({ _repeat: [1] });
    expect(followPositionsMap.size).toBe(2);
    expect(followPositionsMap.get(0)).toMatchObject({
      type: 'followPositions',
      followPositions: toPositions([0, 1]),
    });
  });

  it('works for repeat exact amount', () => {
    const { followPositionsMap } = getMap({ _repeat: [1], min: 2, max: 2 });
    expect(followPositionsMap.size).toBe(2);
    expect(followPositionsMap.get(0)).toMatchObject({
      type: 'counterPositions',
      counters: new Map([
        [
          0,
          {
            repeatAmount: 2,
            repeatFollowPositions: toPositions([0]),
            doneFollowPositions: toPositions([1]),
          },
        ],
      ]),
    });
  });

  it('works for repeat max amount', () => {
    const { followPositionsMap } = getMap({ _repeat: [1], max: 2 });
    expect(followPositionsMap.size).toBe(2);
    expect(followPositionsMap.get(0)).toMatchObject({
      type: 'counterPositions',
      counters: new Map([
        [
          0,
          {
            repeatAmount: 2,
            repeatFollowPositions: toPositions([0, 1]),
            doneFollowPositions: toPositions([1]),
          },
        ],
      ]),
    });
  });

  it('works for at least repeat', () => {
    const { followPositionsMap } = getMap({ _repeat: [1], min: 2 });
    expect(followPositionsMap.size).toBe(2);
    expect(followPositionsMap.get(0)).toMatchObject({
      type: 'counterPositions',
      counters: new Map([
        [
          0,
          {
            repeatAmount: 2,
            repeatFollowPositions: toPositions([0]),
            doneFollowPositions: toPositions([0, 1]),
          },
        ],
      ]),
    });
  });

  it('works for repeat min-max', () => {
    const { followPositionsMap } = getMap({ _repeat: [1], min: 2, max: 5 });
    expect(followPositionsMap.size).toBe(2);
    expect(followPositionsMap.get(0)).toMatchObject({
      type: 'counterPositions',
      counters: new Map([
        [
          0,
          {
            repeatAmount: 2,
            repeatFollowPositions: toPositions([0]),
            doneFollowPositions: toPositions([0, 1]),
          },
        ],
        [
          1,
          {
            repeatAmount: 3,
            repeatFollowPositions: toPositions([0, 1]),
            doneFollowPositions: toPositions([1]),
          },
        ],
      ]),
    });
  });

  it('works for min repeat', () => {
    const { followPositionsMap } = getMap({ _repeat: [1], min: 2 });
    expect(followPositionsMap.size).toBe(2);
    expect(followPositionsMap.get(0)).toMatchObject({
      type: 'counterPositions',
      counters: new Map([
        [
          0,
          {
            repeatAmount: 2,
            repeatFollowPositions: toPositions([0]),
            doneFollowPositions: toPositions([0, 1]),
          },
        ],
      ]),
    });
  });

  it('works for repeat with or', () => {
    const { followPositionsMap } = getMap({ _repeat: [{ _or: [1, 2] }] });
    expect(followPositionsMap.size).toBe(3);
    expect(followPositionsMap.get(0)).toMatchObject({
      type: 'followPositions',
      followPositions: toPositions([0, 1, 2]),
    });
    expect(followPositionsMap.get(1)).toMatchObject({
      type: 'followPositions',
      followPositions: toPositions([0, 1, 2]),
    });
    expect(followPositionsMap.get(2)).toMatchObject({
      type: 'followPositions',
      followPositions: toPositions([]),
    });
  });

  it('works for repeat or with min-max', () => {
    const { followPositionsMap } = getMap({
      _repeat: [{ _or: [2, 3], min: 2, max: 3 }],
      min: 4,
      max: 5,
    });

    expect(followPositionsMap.size).toBe(3);
    expect(followPositionsMap.get(0)).toMatchObject({
      type: 'counterPositions',
      counters: new Map([
        [
          0,
          {
            repeatAmount: 4,
            repeatFollowPositions: toPositions([0, 1]),
            doneFollowPositions: toPositions([0, 1, 2]),
          },
        ],
        [
          1,
          {
            repeatAmount: 1,
            repeatFollowPositions: toPositions([0, 1, 2]),
            doneFollowPositions: toPositions([2]),
          },
        ],
      ]),
    });
    // expect(followPositionsMap.get(1)).toMatchObject({
    //   type: 'counterPositions',
    //   counters: new Map([
    //     [0, { repeatAmount: 4, followPositions: toPositions([0, 1]) }],
    //     [1, { repeatAmount: 1, followPositions: toPositions([0, 1, 2]) }],
    //   ]),
    // });
    // expect(followPositionsMap.get(2)).toMatchObject({
    //   type: 'followPositions',
    //   followPositions: toPositions([]),
    // });
  });

  it('works for min-max repeat', () => {
    const { followPositionsMap } = getMap({ _repeat: [1], min: 2, max: 5 });
    expect(followPositionsMap.size).toBe(2);
    expect(followPositionsMap.get(0)).toMatchObject({
      type: 'counterPositions',
      counters: new Map([
        [
          0,
          {
            repeatAmount: 2,
            repeatFollowPositions: toPositions([0]),
            doneFollowPositions: toPositions([0, 1]),
          },
        ],
        [
          1,
          {
            repeatAmount: 3,
            repeatFollowPositions: toPositions([0, 1]),
            doneFollowPositions: toPositions([1]),
          },
        ],
      ]),
    });
    expect(followPositionsMap.get(1)).toMatchObject({
      type: 'followPositions',
      followPositions: toPositions([]),
    });
  });

  it('works for exact repeat seq', () => {
    const { followPositionsMap } = getMap({
      _repeat: ['a', 'b'],
      min: 2,
      max: 2,
    });

    expect(followPositionsMap.size).toBe(3);
    expect(followPositionsMap.get(0)).toMatchObject({
      type: 'followPositions',
      followPositions: toPositions([1]),
    });
    expect(followPositionsMap.get(1)).toMatchObject({
      type: 'counterPositions',
      counters: new Map([
        [
          0,
          {
            repeatAmount: 2,
            repeatFollowPositions: toPositions([0]),
            doneFollowPositions: toPositions([2]),
          },
        ],
      ]),
    });
    expect(followPositionsMap.get(2)).toMatchObject({
      type: 'followPositions',
      followPositions: toPositions([]),
    });
  });

  it('works for seq repeat or', () => {
    const { followPositionsMap } = getMap([
      1,
      {
        _repeat: { _or: [2, 3], min: 2, max: 3 },
        min: 4,
        max: 5,
      },
    ]);

    expect(followPositionsMap.size).toBe(4);
    expect(followPositionsMap.get(0)).toMatchObject({
      type: 'followPositions',
      followPositions: toPositions([1, 2]),
    });
    expect(followPositionsMap.get(1)).toMatchObject({
      type: 'counterPositions',
      counters: new Map([
        [
          0,
          {
            repeatAmount: 4,
            repeatFollowPositions: toPositions([1, 2]),
            doneFollowPositions: toPositions([1, 2, 3]),
          },
        ],
        [
          1,
          {
            repeatAmount: 1,
            repeatFollowPositions: toPositions([1, 2, 3]),
            doneFollowPositions: toPositions([3]),
          },
        ],
      ]),
    });
    expect(followPositionsMap.get(2)).toMatchObject({
      type: 'counterPositions',
      counters: new Map([
        [
          0,
          {
            repeatAmount: 4,
            repeatFollowPositions: toPositions([1, 2]),
            doneFollowPositions: toPositions([1, 2, 3]),
          },
        ],
        [
          1,
          {
            repeatAmount: 1,
            repeatFollowPositions: toPositions([1, 2, 3]),
            doneFollowPositions: toPositions([3]),
          },
        ],
      ]),
    });
    expect(followPositionsMap.get(3)).toMatchObject({
      type: 'followPositions',
      followPositions: toPositions([]),
    });
  });

  it('works for seq with left repeat', () => {
    const { followPositionsMap } = getMap([
      {
        _repeat: [1],
        min: 2,
        max: 5,
      },
      3,
    ]);

    expect(followPositionsMap.size).toBe(3);
    expect(followPositionsMap.get(0)).toMatchObject({
      type: 'counterPositions',
      counters: new Map([
        [
          0,
          {
            repeatAmount: 2,
            repeatFollowPositions: toPositions([0]),
            doneFollowPositions: toPositions([0, 1]),
          },
        ],
        [
          1,
          {
            repeatAmount: 3,
            repeatFollowPositions: toPositions([0, 1]),
            doneFollowPositions: toPositions([1]),
          },
        ],
      ]),
    });
    expect(followPositionsMap.get(1)).toMatchObject({
      type: 'followPositions',
      followPositions: toPositions([2]),
    });
    expect(followPositionsMap.get(2)).toMatchObject({
      type: 'followPositions',
      followPositions: toPositions([]),
    });
  });

  it('works for seq with left repeat two elements', () => {
    const { followPositionsMap } = getMap([
      {
        _repeat: [1, 2],
        min: 2,
        max: 5,
      },
      3,
    ]);

    expect(followPositionsMap.size).toBe(4);
    expect(followPositionsMap.get(0)).toMatchObject({
      type: 'followPositions',
      followPositions: toPositions([1]),
    });
    expect(followPositionsMap.get(1)).toMatchObject({
      type: 'counterPositions',
      counters: new Map([
        [
          0,
          {
            repeatAmount: 2,
            repeatFollowPositions: toPositions([0]),
            doneFollowPositions: toPositions([0, 2]),
          },
        ],
        [
          1,
          {
            repeatAmount: 3,
            repeatFollowPositions: toPositions([0, 2]),
            doneFollowPositions: toPositions([2]),
          },
        ],
      ]),
    });
    expect(followPositionsMap.get(2)).toMatchObject({
      type: 'followPositions',
      followPositions: toPositions([3]),
    });
    expect(followPositionsMap.get(3)).toMatchObject({
      type: 'followPositions',
      followPositions: toPositions([]),
    });
  });

  it('works for exact repeat in repeat', () => {
    const { followPositionsMap } = getMap({
      _repeat: [
        {
          _repeat: [1],
          min: 3,
          max: 3,
        },
      ],
      min: 2,
      max: 2,
    });

    expect(followPositionsMap.size).toBe(2);
    expect(followPositionsMap.get(0)).toMatchObject({
      type: 'counterPositions',
      counters: new Map([
        [
          0,
          {
            repeatAmount: 6,
            repeatFollowPositions: toPositions([0]),
            doneFollowPositions: toPositions([1]),
          },
        ],
      ]),
    });
  });

  it.skip('works for exact repeat in non-exact repeat', () => {
    const { tree, followPositionsMap } = getMap({
      _repeat: [
        {
          _repeat: [1],
          min: 3,
          max: 3,
        },
      ],
      min: 2,
      max: 3,
    });

    expect(followPositionsMap.size).toBe(2);
    expect(followPositionsMap.get(0)).toMatchObject({
      type: 'counterPositions',
      counters: new Map([
        [
          0,
          {
            repeatAmount: 6,
            repeatFollowPositions: toPositions([0]),
            doneFollowPositions: toPositions([0, 1]),
          },
        ],
        [
          1,
          {
            repeatAmount: 3,
            repeatFollowPositions: toPositions([0, 1]),
            doneFollowPositions: toPositions([1]),
          },
        ],
      ]),
    });
  });

  it.skip('works for non-exact repeat in exact repeat', () => {
    const { followPositionsMap } = getMap({
      _repeat: [
        {
          _repeat: [1],
          min: 2,
          max: 3,
        },
      ],
      min: 2,
      max: 2,
    });

    expect(followPositionsMap.size).toBe(2);
    expect(followPositionsMap.get(0)).toMatchObject({
      type: 'counterPositions',
      counters: new Map([
        [
          0,
          {
            repeatAmount: 2,
            repeatFollowPositions: toPositions([0]),
            doneFollowPositions: toPositions([1]),
          },
        ],
        [
          1,
          {
            repeatAmount: 1,
            repeatFollowPositions: toPositions([0]),
            doneFollowPositions: toPositions([0]),
          },
        ],
        [
          2,
          {
            repeatAmount: 2,
            repeatFollowPositions: toPositions([0]),
            doneFollowPositions: toPositions([1]),
          },
        ],
      ]),
    });
  });

  it.skip('works for complex tree', () => {
    const { tree, followPositionsMap } = getMap({
      _repeat: [1, { _repeat: { _or: [2, 3], min: 2, max: 3 } }],
      min: 4,
      max: 5,
    });

    expect(followPositionsMap.size).toBe(4);

    expect(followPositionsMap.get(0)).toMatchObject({
      type: 'followPositions',
      followPositions: toPositions([0, 1, 2, 3]),
    });
    // expect(followPositionsMap.get(1)).toMatchObject({
    //   followPositions: toPositions([]),
    //   counters: new Map([
    //     [0, { repeatAmount: 4, followPositions: toPositions([1, 2]) }],
    //     [1, { repeatAmount: 1, followPositions: toPositions([1, 2, 3]) }],
    //   ]),
    // });
    // expect(followPositionsMap.get(2)).toMatchObject({
    //   followPositions: toPositions([]),
    //   counters: new Map([
    //     [0, { repeatAmount: 4, followPositions: toPositions([1, 2]) }],
    //     [1, { repeatAmount: 1, followPositions: toPositions([1, 2, 3]) }],
    //   ]),
    // });
  });
});
