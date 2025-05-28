import { createFollowPositionsMap } from '../src/follow-positions-map.mjs';
import { EMPTY_POSITIONS } from '../src/positions.mjs';
import { createTreeWithEndNode } from '../src/tree-builder.mjs';
import {
  END_SYMBOL_KEY,
  ExactAmountRepeatNode,
  SeqNode,
} from '../src/tree-node.mjs';
import {
  createStateTransitionTable,
  type StateTransitionTable,
} from '../src/state-transition-table.mjs';
import { showFollowPositionsMap, showStateTransitionTable } from 'show.js';

describe('createStateTransitionTable', () => {
  it('creates correct table for empty tree', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode([]);
    const followPositionsMap = createFollowPositionsMap(tree);

    const table = createStateTransitionTable(
      tree.firstPositions,
      followPositionsMap,
      indexToNodeMap
    );

    const targetTable: StateTransitionTable = {
      transitions: new Map([
        [
          tree.firstPositions,
          {
            matchTransitionsMap: new Map(),
            matchNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                {
                  type: 'nextState',
                  nextState: EMPTY_POSITIONS,
                },
              ],
            ]),
          },
        ],
      ]),
      initCounters: new Map(),
    };

    expect(table).toEqual(targetTable);
  });

  it('create correct table for tree with one node', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode(['a']);
    const followPositionsMap = createFollowPositionsMap(tree);

    const table = createStateTransitionTable(
      tree.firstPositions,
      followPositionsMap,
      indexToNodeMap
    );

    const targetTable: StateTransitionTable = {
      transitions: new Map([
        [
          tree.firstPositions,
          {
            matchTransitionsMap: new Map([
              [
                'a',
                {
                  type: 'nextState',
                  nextState: tree.lastPositions,
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map(),
          },
        ],
        [
          tree.lastPositions,
          {
            matchTransitionsMap: new Map(),
            matchNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                {
                  type: 'nextState',
                  nextState: EMPTY_POSITIONS,
                },
              ],
            ]),
          },
        ],
      ]),
      initCounters: new Map(),
    };

    expect(table).toEqual(targetTable);
  });

  it('create correct table for tree with seq node', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode(['a', 'b']);
    const followPositionsMap = createFollowPositionsMap(tree);

    const table = createStateTransitionTable(
      tree.firstPositions,
      followPositionsMap,
      indexToNodeMap
    );

    const seqNode = tree as SeqNode;

    const targetTable: StateTransitionTable = {
      transitions: new Map([
        [
          tree.firstPositions,
          {
            matchTransitionsMap: new Map([
              [
                'a',
                {
                  type: 'nextState',
                  nextState: seqNode.right.firstPositions,
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map(),
          },
        ],
        [
          seqNode.right.firstPositions,
          {
            matchTransitionsMap: new Map([
              [
                'b',
                {
                  type: 'nextState',
                  nextState: tree.lastPositions,
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map(),
          },
        ],
        [
          tree.lastPositions,
          {
            matchTransitionsMap: new Map(),
            matchNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                {
                  type: 'nextState',
                  nextState: EMPTY_POSITIONS,
                },
              ],
            ]),
          },
        ],
      ]),
      initCounters: new Map(),
    };

    expect(table).toEqual(targetTable);
  });

  it('creates correct table for tree with or node', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode({ _or: ['a', 'b'] });
    const followPositionsMap = createFollowPositionsMap(tree);
    const table = createStateTransitionTable(
      tree.firstPositions,
      followPositionsMap,
      indexToNodeMap
    );

    const targetTable: StateTransitionTable = {
      transitions: new Map([
        [
          tree.firstPositions,
          {
            matchTransitionsMap: new Map([
              [
                'a',
                {
                  type: 'nextState',
                  nextState: tree.lastPositions,
                },
              ],
              [
                'b',
                {
                  type: 'nextState',
                  nextState: tree.lastPositions,
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map(),
          },
        ],
        [
          tree.lastPositions,
          {
            matchTransitionsMap: new Map(),
            matchNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                {
                  type: 'nextState',
                  nextState: EMPTY_POSITIONS,
                },
              ],
            ]),
          },
        ],
      ]),
      initCounters: new Map(),
    };

    expect(table).toEqual(targetTable);
  });

  it('creates correct table for tree with zero or more repeat node', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode({
      _repeat: ['a'],
    });

    const followPositionsMap = createFollowPositionsMap(tree);
    const table = createStateTransitionTable(
      tree.firstPositions,
      followPositionsMap,
      indexToNodeMap
    );

    const targetTable: StateTransitionTable = {
      transitions: new Map([
        [
          tree.firstPositions,
          {
            matchTransitionsMap: new Map([
              [
                'a',
                {
                  type: 'nextState',
                  nextState: tree.firstPositions | tree.lastPositions,
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                {
                  type: 'nextState',
                  nextState: EMPTY_POSITIONS,
                },
              ],
            ]),
          },
        ],
      ]),
      initCounters: new Map(),
    };

    expect(table).toEqual(targetTable);
  });

  it('creates correct table for tree with exact amount repeat node', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode({
      _repeat: ['a'],
      min: 3,
      max: 3,
    });

    const followPositionsMap = createFollowPositionsMap(tree);
    const table = createStateTransitionTable(
      tree.firstPositions,
      followPositionsMap,
      indexToNodeMap
    );

    const targetTable: StateTransitionTable = {
      transitions: new Map([
        [
          tree.firstPositions,
          {
            matchTransitionsMap: new Map([
              [
                'a',
                {
                  type: 'counter',
                  conditions: new Map([
                    [
                      0,
                      {
                        repeatPositions: tree.firstPositions,
                        donePositions: tree.lastPositions,
                      },
                    ],
                  ]),
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map(),
          },
        ],
        [
          tree.lastPositions,
          {
            matchTransitionsMap: new Map(),
            matchNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                {
                  type: 'nextState',
                  nextState: EMPTY_POSITIONS,
                },
              ],
            ]),
          },
        ],
      ]),
      initCounters: new Map([
        [tree.firstPositions, { repeatAmount: 3, counterId: 0 }],
      ]),
    };

    expect(table).toEqual(targetTable);
  });

  it('creates correct table for tree with max amount repeat node', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode({
      _repeat: ['a'],
      max: 3,
    });

    const seqTree = tree as SeqNode;

    const followPositionsMap = createFollowPositionsMap(tree);
    const table = createStateTransitionTable(
      tree.firstPositions,
      followPositionsMap,
      indexToNodeMap
    );

    const targetTable: StateTransitionTable = {
      transitions: new Map([
        [
          seqTree.left.firstPositions | seqTree.right.firstPositions,
          {
            matchTransitionsMap: new Map([
              [
                'a',
                {
                  type: 'counter',
                  conditions: new Map([
                    [
                      0,
                      {
                        repeatPositions:
                          seqTree.left.firstPositions |
                          seqTree.right.firstPositions,
                        donePositions: seqTree.right.lastPositions,
                      },
                    ],
                  ]),
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                { type: 'nextState', nextState: EMPTY_POSITIONS },
              ],
            ]),
          },
        ],
        [
          seqTree.right.firstPositions,
          {
            matchTransitionsMap: new Map(),
            matchNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                { type: 'nextState', nextState: EMPTY_POSITIONS },
              ],
            ]),
          },
        ],
      ]),
      initCounters: new Map([
        [seqTree.firstPositions, { repeatAmount: 3, counterId: 0 }],
      ]),
    };

    expect(table).toEqual(targetTable);
  });

  it('creates correct table for tree with min amount repeat node', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode({
      _repeat: ['a'],
      min: 3,
    });

    const seqTree = tree as SeqNode;

    const followPositionsMap = createFollowPositionsMap(tree);
    const table = createStateTransitionTable(
      tree.firstPositions,
      followPositionsMap,
      indexToNodeMap
    );

    const targetTable: StateTransitionTable = {
      transitions: new Map([
        [
          seqTree.left.firstPositions,
          {
            matchTransitionsMap: new Map([
              [
                'a',
                {
                  type: 'counter',
                  conditions: new Map([
                    [
                      0,
                      {
                        repeatPositions: seqTree.left.firstPositions,
                        donePositions: seqTree.right.firstPositions,
                      },
                    ],
                  ]),
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map(),
          },
        ],
        [
          seqTree.right.firstPositions,
          {
            matchTransitionsMap: new Map([
              [
                'a',
                {
                  type: 'nextState',
                  nextState: seqTree.right.firstPositions,
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                { type: 'nextState', nextState: EMPTY_POSITIONS },
              ],
            ]),
          },
        ],
      ]),
      initCounters: new Map([
        [seqTree.firstPositions, { repeatAmount: 3, counterId: 0 }],
      ]),
    };

    console.log(tree.toString());
    console.log(seqTree.right.firstPositions);
    console.log(table);

    expect(table).toEqual(targetTable);
  });

  it('creates correct table for tree with min and max amount repeat node', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode({
      _repeat: ['a'],
      min: 3,
      max: 5,
    });

    const seqTree = tree as SeqNode;

    const followPositionsMap = createFollowPositionsMap(tree);
    const table = createStateTransitionTable(
      tree.firstPositions,
      followPositionsMap,
      indexToNodeMap
    );

    const targetTable: StateTransitionTable = {
      transitions: new Map([
        [
          seqTree.left.firstPositions,
          {
            matchTransitionsMap: new Map([
              [
                'a',
                {
                  type: 'counter',
                  conditions: new Map([
                    [
                      0,
                      {
                        repeatPositions: seqTree.left.firstPositions,
                        donePositions: seqTree.right.firstPositions,
                      },
                    ],
                  ]),
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map(),
          },
        ],
        [
          seqTree.left.firstPositions | seqTree.right.firstPositions,
          {
            matchTransitionsMap: new Map([
              [
                'a',
                {
                  type: 'counter',
                  conditions: new Map([
                    [
                      1,
                      {
                        repeatPositions:
                          seqTree.left.firstPositions |
                          seqTree.right.firstPositions,
                        donePositions: seqTree.right.lastPositions,
                      },
                    ],
                  ]),
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                { type: 'nextState', nextState: EMPTY_POSITIONS },
              ],
            ]),
          },
        ],
        [
          seqTree.right.lastPositions,
          {
            matchTransitionsMap: new Map(),
            matchNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                { type: 'nextState', nextState: EMPTY_POSITIONS },
              ],
            ]),
          },
        ],
      ]),
      initCounters: new Map([
        [seqTree.left.firstPositions, { repeatAmount: 3, counterId: 0 }],
        [seqTree.right.firstPositions, { repeatAmount: 2, counterId: 1 }],
      ]),
    };

    expect(table).toEqual(targetTable);
  });

  it('creates correct table for exact repeat seq node', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode({
      _repeat: ['a', 'b'],
      min: 2,
      max: 2,
    });

    const followPositionsMap = createFollowPositionsMap(tree);
    const table = createStateTransitionTable(
      tree.firstPositions,
      followPositionsMap,
      indexToNodeMap
    );

    const seqTree = tree as SeqNode;
    const repeatNode = seqTree.left as ExactAmountRepeatNode;
    const repeatSeqNode = repeatNode.child as SeqNode;

    const targetTable: StateTransitionTable = {
      transitions: new Map([
        [
          repeatNode.firstPositions,
          {
            matchTransitionsMap: new Map([
              [
                'a',
                {
                  type: 'nextState',
                  nextState: repeatSeqNode.right.firstPositions,
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map(),
          },
        ],
        [
          repeatSeqNode.right.firstPositions,
          {
            matchTransitionsMap: new Map([
              [
                'b',
                {
                  type: 'counter',
                  conditions: new Map([
                    [
                      0,
                      {
                        repeatPositions: repeatNode.firstPositions,
                        donePositions: tree.lastPositions,
                      },
                    ],
                  ]),
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map(),
          },
        ],
        [
          tree.lastPositions,
          {
            matchTransitionsMap: new Map(),
            matchNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                { type: 'nextState', nextState: EMPTY_POSITIONS },
              ],
            ]),
          },
        ],
      ]),
      initCounters: new Map([
        [repeatSeqNode.right.firstPositions, { repeatAmount: 2, counterId: 0 }],
      ]),
    };

    expect(table).toEqual(targetTable);
  });

  it.only('creates correct table for min max repeat seq node', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode({
      _repeat: ['a', 'b'],
      min: 2,
      max: 4,
    });

    console.log(tree.toString());

    const followPositionsMap = createFollowPositionsMap(tree);
    const table = createStateTransitionTable(
      tree.firstPositions,
      followPositionsMap,
      indexToNodeMap
    );

    const seqTree = tree as SeqNode;
    const repeatNode = seqTree.left as ExactAmountRepeatNode;
    const repeatSeqNode = repeatNode.child as SeqNode;

    const targetTable: StateTransitionTable = {
      transitions: new Map([
        [
          repeatSeqNode.left.firstPositions,
          {
            matchTransitionsMap: new Map([
              [
                'a',
                {
                  type: 'nextState',
                  nextState: repeatSeqNode.right.firstPositions,
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map(),
          },
        ],
        [
          repeatSeqNode.right.firstPositions,
          {
            matchTransitionsMap: new Map([
              [
                'b',
                {
                  type: 'counter',
                  conditions: new Map([
                    [
                      0,
                      {
                        repeatPositions: repeatNode.firstPositions,
                        donePositions:
                          seqTree.right.firstPositions |
                          seqTree.right.lastPositions,
                      },
                    ],
                    [
                      1,
                      {
                        repeatPositions:
                          repeatSeqNode.left.firstPositions |
                          seqTree.right.firstPositions,
                        donePositions: tree.lastPositions,
                      },
                    ],
                  ]),
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map(),
          },
        ],
        [
          tree.lastPositions,
          {
            matchTransitionsMap: new Map(),
            matchNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                { type: 'nextState', nextState: EMPTY_POSITIONS },
              ],
            ]),
          },
        ],
      ]),
      initCounters: new Map([
        [repeatSeqNode.right.firstPositions, { repeatAmount: 2, counterId: 0 }],
        [
          repeatSeqNode.left.firstPositions | seqTree.right.lastPositions,
          { repeatAmount: 2, counterId: 1 },
        ],
      ]),
    };

    showFollowPositionsMap(followPositionsMap);
    showStateTransitionTable(table);
    console.log('-----------------');
    showStateTransitionTable(targetTable);
    expect(table).toEqual(targetTable);
  });
});
