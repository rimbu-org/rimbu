import { showStateTransitionTable } from 'show.mjs';
import { createFollowPositionsMap } from '../src/follow-positions-map.mjs';
import { EMPTY_POSITIONS } from '../src/positions.mjs';
import {
  createStateTransitionTable,
  type StateTransitionTable,
} from '../src/state-transition-table.mjs';
import { createTreeWithEndNode } from '../src/tree-builder.mjs';
import {
  END_SYMBOL_KEY,
  ExactAmountRepeatNode,
  SeqNode,
} from '../src/tree-node.mjs';

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
            predTransitionsMap: new Map(),
            predNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                {
                  options: [
                    { type: 'unconditional', nextState: EMPTY_POSITIONS },
                  ],
                },
              ],
            ]),
          },
        ],
      ]),
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
                  options: [
                    {
                      type: 'unconditional',
                      nextState: tree.lastPositions,
                    },
                  ],
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            predTransitionsMap: new Map(),
            predNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map(),
          },
        ],
        [
          tree.lastPositions,
          {
            matchTransitionsMap: new Map(),
            matchNegTransitionsMap: new Map(),
            predTransitionsMap: new Map(),
            predNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                {
                  options: [
                    {
                      type: 'unconditional',
                      nextState: EMPTY_POSITIONS,
                    },
                  ],
                },
              ],
            ]),
          },
        ],
      ]),
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
                  options: [
                    {
                      type: 'unconditional',
                      nextState: seqNode.right.firstPositions,
                    },
                  ],
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            predTransitionsMap: new Map(),
            predNegTransitionsMap: new Map(),
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
                  options: [
                    {
                      type: 'unconditional',
                      nextState: tree.lastPositions,
                    },
                  ],
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            predTransitionsMap: new Map(),
            predNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map(),
          },
        ],
        [
          tree.lastPositions,
          {
            matchTransitionsMap: new Map(),
            matchNegTransitionsMap: new Map(),
            predTransitionsMap: new Map(),
            predNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                {
                  options: [
                    {
                      type: 'unconditional',
                      nextState: EMPTY_POSITIONS,
                    },
                  ],
                },
              ],
            ]),
          },
        ],
      ]),
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
                  options: [
                    { type: 'unconditional', nextState: tree.lastPositions },
                  ],
                },
              ],
              [
                'b',
                {
                  options: [
                    { type: 'unconditional', nextState: tree.lastPositions },
                  ],
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            predTransitionsMap: new Map(),
            predNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map(),
          },
        ],
        [
          tree.lastPositions,
          {
            matchTransitionsMap: new Map(),
            matchNegTransitionsMap: new Map(),
            predTransitionsMap: new Map(),
            predNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                {
                  options: [
                    {
                      type: 'unconditional',
                      nextState: EMPTY_POSITIONS,
                    },
                  ],
                },
              ],
            ]),
          },
        ],
      ]),
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
                  options: [
                    {
                      type: 'unconditional',
                      nextState: tree.firstPositions | tree.lastPositions,
                    },
                  ],
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            predTransitionsMap: new Map(),
            predNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                {
                  options: [
                    {
                      type: 'unconditional',
                      nextState: EMPTY_POSITIONS,
                    },
                  ],
                },
              ],
            ]),
          },
        ],
      ]),
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
                  options: [
                    {
                      type: 'repeat',
                      repeatNodeId: 0,
                      repeatAmount: 3,
                      nextState: tree.firstPositions,
                      resetPrevious: false,
                    },
                    { type: 'unconditional', nextState: tree.lastPositions },
                  ],
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            predTransitionsMap: new Map(),
            predNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map(),
          },
        ],
        [
          tree.lastPositions,
          {
            matchTransitionsMap: new Map(),
            matchNegTransitionsMap: new Map(),
            predTransitionsMap: new Map(),
            predNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                {
                  options: [
                    {
                      type: 'unconditional',
                      nextState: EMPTY_POSITIONS,
                    },
                  ],
                },
              ],
            ]),
          },
        ],
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
                  options: [
                    {
                      type: 'repeat',
                      repeatNodeId: 0,
                      repeatAmount: 3,
                      nextState:
                        seqTree.left.firstPositions |
                        seqTree.right.firstPositions,
                      resetPrevious: false,
                    },
                    {
                      type: 'unconditional',
                      nextState: seqTree.right.firstPositions,
                    },
                  ],
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            predTransitionsMap: new Map(),
            predNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                {
                  options: [
                    { type: 'unconditional', nextState: EMPTY_POSITIONS },
                  ],
                },
              ],
            ]),
          },
        ],
        [
          seqTree.right.firstPositions,
          {
            matchTransitionsMap: new Map(),
            matchNegTransitionsMap: new Map(),
            predTransitionsMap: new Map(),
            predNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                {
                  options: [
                    { type: 'unconditional', nextState: EMPTY_POSITIONS },
                  ],
                },
              ],
            ]),
          },
        ],
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
                  options: [
                    {
                      type: 'repeat',
                      repeatNodeId: 0,
                      repeatAmount: 3,
                      nextState: seqTree.left.firstPositions,
                      resetPrevious: false,
                    },
                    {
                      type: 'unconditional',
                      nextState: seqTree.right.firstPositions,
                    },
                  ],
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            predTransitionsMap: new Map(),
            predNegTransitionsMap: new Map(),
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
                  options: [
                    {
                      type: 'unconditional',
                      nextState:
                        seqTree.left.lastPositions |
                        seqTree.right.lastPositions,
                    },
                  ],
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            predTransitionsMap: new Map(),
            predNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                {
                  options: [
                    {
                      type: 'unconditional',
                      nextState: EMPTY_POSITIONS,
                    },
                  ],
                },
              ],
            ]),
          },
        ],
      ]),
    };

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
                  options: [
                    {
                      type: 'repeat',
                      repeatNodeId: 0,
                      repeatAmount: 3,
                      nextState: seqTree.left.firstPositions,
                      resetPrevious: false,
                    },
                    {
                      type: 'unconditional',
                      nextState:
                        seqTree.left.firstPositions |
                        seqTree.right.firstPositions,
                    },
                  ],
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            predTransitionsMap: new Map(),
            predNegTransitionsMap: new Map(),
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
                  options: [
                    {
                      type: 'repeat',
                      repeatNodeId: 1,
                      repeatAmount: 2,
                      nextState:
                        seqTree.right.firstPositions |
                        seqTree.right.firstPositions,
                      resetPrevious: false,
                    },
                    {
                      type: 'unconditional',
                      nextState: seqTree.right.lastPositions,
                    },
                  ],
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            predTransitionsMap: new Map(),
            predNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                {
                  options: [
                    { type: 'unconditional', nextState: EMPTY_POSITIONS },
                  ],
                },
              ],
            ]),
          },
        ],
        [
          seqTree.right.lastPositions,
          {
            matchTransitionsMap: new Map(),
            matchNegTransitionsMap: new Map(),
            predTransitionsMap: new Map(),
            predNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                {
                  options: [
                    { type: 'unconditional', nextState: EMPTY_POSITIONS },
                  ],
                },
              ],
            ]),
          },
        ],
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
                  options: [
                    {
                      type: 'unconditional',
                      nextState: repeatSeqNode.right.firstPositions,
                    },
                  ],
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            predTransitionsMap: new Map(),
            predNegTransitionsMap: new Map(),
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
                  options: [
                    {
                      type: 'repeat',
                      repeatNodeId: 0,
                      repeatAmount: 2,
                      nextState: repeatNode.firstPositions,
                      resetPrevious: false,
                    },
                    { type: 'unconditional', nextState: tree.lastPositions },
                  ],
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            predTransitionsMap: new Map(),
            predNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map(),
          },
        ],
        [
          tree.lastPositions,
          {
            matchTransitionsMap: new Map(),
            matchNegTransitionsMap: new Map(),
            predTransitionsMap: new Map(),
            predNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                {
                  options: [
                    { type: 'unconditional', nextState: EMPTY_POSITIONS },
                  ],
                },
              ],
            ]),
          },
        ],
      ]),
    };

    expect(table).toEqual(targetTable);
  });

  it('creates correct table for min max repeat seq node', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode({
      _repeat: ['a', 'b'],
      min: 2,
      max: 4,
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
          repeatSeqNode.left.firstPositions,
          {
            matchTransitionsMap: new Map([
              [
                'a',
                {
                  options: [
                    {
                      type: 'unconditional',
                      nextState: repeatSeqNode.right.firstPositions,
                    },
                  ],
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            predTransitionsMap: new Map(),
            predNegTransitionsMap: new Map(),
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
                  options: [
                    {
                      type: 'repeat',
                      repeatNodeId: 0,
                      repeatAmount: 2,
                      nextState: repeatNode.firstPositions,
                      resetPrevious: false,
                    },
                    {
                      type: 'repeat',
                      repeatNodeId: 1,
                      repeatAmount: 2,
                      nextState:
                        repeatSeqNode.left.firstPositions |
                        seqTree.right.firstPositions,
                      resetPrevious: false,
                    },
                    {
                      type: 'unconditional',
                      nextState: seqTree.right.lastPositions,
                    },
                  ],
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            predTransitionsMap: new Map(),
            predNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map(),
          },
        ],
        [
          repeatSeqNode.left.firstPositions | seqTree.right.firstPositions,
          {
            matchTransitionsMap: new Map([
              [
                'a',
                {
                  options: [
                    {
                      type: 'unconditional',
                      nextState: repeatSeqNode.right.firstPositions,
                    },
                  ],
                },
              ],
            ]),
            matchNegTransitionsMap: new Map(),
            predTransitionsMap: new Map(),
            predNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                {
                  options: [
                    { type: 'unconditional', nextState: EMPTY_POSITIONS },
                  ],
                },
              ],
            ]),
          },
        ],
        [
          seqTree.right.lastPositions,
          {
            matchTransitionsMap: new Map(),
            matchNegTransitionsMap: new Map(),
            predTransitionsMap: new Map(),
            predNegTransitionsMap: new Map(),
            otherTransitionsMap: new Map([
              [
                END_SYMBOL_KEY,
                {
                  options: [
                    { type: 'unconditional', nextState: EMPTY_POSITIONS },
                  ],
                },
              ],
            ]),
          },
        ],
      ]),
    };

    expect(table).toEqual(targetTable);
  });

  it('creates correct table for exact repeat in non-exact repeat', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode({
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

    const followPositionsMap = createFollowPositionsMap(tree);
    const table = createStateTransitionTable(
      tree.firstPositions,
      followPositionsMap,
      indexToNodeMap
    );

    showStateTransitionTable(table);
  });

  it.skip('creates correct table for or with repeat', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode({
      _or: [{ _repeat: ['a', 'b'] }, { _repeat: ['a', 'b', 'c'] }],
    });

    const followPositionsMap = createFollowPositionsMap(tree);
    const table = createStateTransitionTable(
      tree.firstPositions,
      followPositionsMap,
      indexToNodeMap
    );
  });
});
