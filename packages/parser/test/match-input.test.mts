import { EMPTY_POSITIONS } from 'positions.mjs';
import { createFollowPositionsMap } from '../src/follow-positions-map.mjs';
import { matchInput } from '../src/match-input.mjs';
import { createStateTransitionTable } from '../src/state-transition-table.mjs';
import { createTreeWithEndNode } from '../src/tree-builder.mjs';
import { type SeqNode, type TreeNode } from '../src/tree-node.mjs';
import { showFollowPositionsMap, showStateTransitionTable } from 'show.mjs';

function createInitState(tree: TreeNode) {
  return {
    stateContext: new Map(),
    currentState: tree.firstPositions,
  };
}

describe('matchInput', () => {
  it('does not match input for empty tree', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode([]);
    const followPositionsMap = createFollowPositionsMap(tree);

    const table = createStateTransitionTable(
      tree.firstPositions,
      followPositionsMap,
      indexToNodeMap
    );

    const { currentState } = matchInput('a', table, createInitState(tree));
    expect(currentState).toBe(EMPTY_POSITIONS);
  });

  it('matches single input', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode(['a']);
    const followPositionsMap = createFollowPositionsMap(tree);

    const table = createStateTransitionTable(
      tree.firstPositions,
      followPositionsMap,
      indexToNodeMap
    );

    {
      const { currentState } = matchInput('a', table, createInitState(tree));
      expect(currentState).toEqual(tree.lastPositions);
    }

    {
      const { currentState } = matchInput('b', table, createInitState(tree));
      expect(currentState).toBe(EMPTY_POSITIONS);
    }
  });

  it('matches seq inputs', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode(['a', 'b']);
    const followPositionsMap = createFollowPositionsMap(tree);

    const seqTree = tree as SeqNode;

    const table = createStateTransitionTable(
      tree.firstPositions,
      followPositionsMap,
      indexToNodeMap
    );

    const res1 = matchInput('a', table, createInitState(tree));
    expect(res1.currentState).toEqual(seqTree.right.firstPositions);

    const res2 = matchInput('b', table, res1);
    expect(res2.currentState).toEqual(seqTree.right.lastPositions);
  });

  it('matches or inputs', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode({ _or: ['a', 'b'] });
    const followPositionsMap = createFollowPositionsMap(tree);

    const table = createStateTransitionTable(
      tree.firstPositions,
      followPositionsMap,
      indexToNodeMap
    );

    {
      const { currentState } = matchInput('a', table, createInitState(tree));
      expect(currentState).toEqual(tree.lastPositions);
    }
    {
      const { currentState } = matchInput('b', table, createInitState(tree));
      expect(currentState).toEqual(tree.lastPositions);
    }
    {
      const { currentState } = matchInput('c', table, createInitState(tree));
      expect(currentState).toBe(EMPTY_POSITIONS);
    }
  });

  it('matches repeat inputs', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode({
      _repeat: ['a'],
    });
    const followPositionsMap = createFollowPositionsMap(tree);

    const table = createStateTransitionTable(
      tree.firstPositions,
      followPositionsMap,
      indexToNodeMap
    );

    {
      const { currentState } = matchInput('a', table, createInitState(tree));
      expect(currentState).toEqual(tree.firstPositions | tree.lastPositions);
    }
    {
      const { currentState } = matchInput('b', table, createInitState(tree));
      expect(currentState).toBe(EMPTY_POSITIONS);
    }
  });

  it('matches repeat exact amount', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode({
      _repeat: ['a'],
      min: 2,
      max: 2,
    });
    const followPositionsMap = createFollowPositionsMap(tree);

    const table = createStateTransitionTable(
      tree.firstPositions,
      followPositionsMap,
      indexToNodeMap
    );

    const res1 = matchInput('a', table, createInitState(tree));
    expect(res1.currentState).toEqual(tree.firstPositions);
    // expect(res1.stateContext.get(0)).toEqual(1);

    const res2 = matchInput('a', table, res1);
    expect(res2.currentState).toEqual(tree.lastPositions);
    // expect(res2.counterStates.has(0)).toBe(false);

    const res3 = matchInput('a', table, res2);
    expect(res3.currentState).toBe(EMPTY_POSITIONS);
  });

  it('matches repeat max amount', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode({
      _repeat: ['a'],
      max: 2,
    });
    const followPositionsMap = createFollowPositionsMap(tree);

    const table = createStateTransitionTable(
      tree.firstPositions,
      followPositionsMap,
      indexToNodeMap
    );

    const res1 = matchInput('a', table, createInitState(tree));
    expect(res1.currentState).toEqual(tree.firstPositions);
    // expect(res1.counterStates.get(0)).toEqual(1);

    const res2 = matchInput('a', table, res1);
    expect(res2.currentState).toEqual(tree.lastPositions);
    // expect(res2.counterStates.has(0)).toBe(false);

    const res3 = matchInput('a', table, res2);
    expect(res3.currentState).toBe(EMPTY_POSITIONS);
  });

  it('matches repeat min amount', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode({
      _repeat: ['a'],
      min: 2,
    });
    const followPositionsMap = createFollowPositionsMap(tree);

    const table = createStateTransitionTable(
      tree.firstPositions,
      followPositionsMap,
      indexToNodeMap
    );

    const res1 = matchInput('a', table, createInitState(tree));
    expect(res1.currentState).toEqual(tree.firstPositions);
    // expect(res1.counterStates.get(0)).toEqual(1);

    const res2 = matchInput('a', table, res1);
    expect(res2.currentState).toEqual(tree.firstPositions | tree.lastPositions);
    // expect(res2.counterStates.has(0)).toBe(false);

    const res3 = matchInput('a', table, res2);
    expect(res3.currentState).toEqual(tree.firstPositions | tree.lastPositions);

    const res4 = matchInput('a', table, res3);
    expect(res4.currentState).toEqual(tree.firstPositions | tree.lastPositions);

    const res5 = matchInput('b', table, res3);
    expect(res5.currentState).toBe(EMPTY_POSITIONS);
  });

  it('matches repeat min and max amount', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode({
      _repeat: ['a'],
      min: 2,
      max: 3,
    });
    const followPositionsMap = createFollowPositionsMap(tree);

    const table = createStateTransitionTable(
      tree.firstPositions,
      followPositionsMap,
      indexToNodeMap
    );

    const res1 = matchInput('a', table, createInitState(tree));
    expect(res1.currentState).toEqual(tree.firstPositions);
    // expect(res1.counterStates.get(0)).toEqual(1);

    const res2 = matchInput('a', table, res1);
    expect(res2.currentState).toEqual(tree.firstPositions | tree.lastPositions);
    // expect(res2.counterStates.has(0)).toBe(false);

    const res3 = matchInput('a', table, res2);
    expect(res3.currentState).toEqual(tree.lastPositions);
    // expect(res3.counterStates.has(0)).toBe(false);

    const res4 = matchInput('a', table, res3);
    expect(res4.currentState).toBe(EMPTY_POSITIONS);
  });

  it('matches opt input', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode({
      _opt: ['a'],
    });
    const followPositionsMap = createFollowPositionsMap(tree);

    const table = createStateTransitionTable(
      tree.firstPositions,
      followPositionsMap,
      indexToNodeMap
    );

    {
      const res1 = matchInput('a', table, createInitState(tree));
      expect(res1.currentState).toEqual(tree.lastPositions);

      const res2 = matchInput('b', table, res1);
      expect(res2.currentState).toBe(EMPTY_POSITIONS);
    }
    {
      const res1 = matchInput('b', table, createInitState(tree));
      expect(res1.currentState).toBe(EMPTY_POSITIONS);
    }
  });

  it('matches not input', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode({
      _not: 'a',
    });
    const followPositionsMap = createFollowPositionsMap(tree);

    const table = createStateTransitionTable(
      tree.firstPositions,
      followPositionsMap,
      indexToNodeMap
    );

    {
      const res1 = matchInput('a', table, createInitState(tree));
      expect(res1.currentState).toBe(EMPTY_POSITIONS);
    }
    {
      const res1 = matchInput('b', table, createInitState(tree));
      expect(res1.currentState).toEqual(tree.lastPositions);
    }
  });

  it.only('matches pred input', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode({
      _pred: (value) => value <= 2,
    });
    const followPositionsMap = createFollowPositionsMap(tree);

    const table = createStateTransitionTable(
      tree.firstPositions,
      followPositionsMap,
      indexToNodeMap
    );

    {
      const res1 = matchInput(2, table, createInitState(tree));
      expect(res1.currentState).toEqual(tree.lastPositions);
    }
    {
      const res1 = matchInput(3, table, createInitState(tree));
      expect(res1.currentState).toBe(EMPTY_POSITIONS);
    }
  });
});
