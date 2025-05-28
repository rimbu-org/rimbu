import { matchInput, type MatchContext } from 'match-input.mjs';
import type { Expr } from '../src/expression-types.mjs';
import { createFollowPositionsMap } from '../src/follow-positions-map.mjs';
import { createStateTransitionTable } from '../src/state-transition-table.mjs';
import { createTreeWithEndNode } from '../src/tree-builder.mjs';
import type { TreeNode } from 'tree-node.mjs';
import { EMPTY_POSITIONS } from 'positions.mjs';
import { showFollowPositionsMap, showStateTransitionTable } from 'show.js';

function createInitState(tree: TreeNode): MatchContext {
  return {
    counterStates: new Map(),
    currentState: tree.firstPositions,
  };
}

export function compile<T>(expr: Expr<T>): (input: Iterable<T>) => boolean {
  const { tree, indexToNodeMap, endNodePositions } =
    createTreeWithEndNode(expr);
  const followPositionsMap = createFollowPositionsMap(tree);

  const table = createStateTransitionTable(
    tree.firstPositions,
    followPositionsMap,
    indexToNodeMap
  );

  showFollowPositionsMap(followPositionsMap);
  showStateTransitionTable(table);

  return (input) => {
    let context = createInitState(tree);

    for (const item of input) {
      context = matchInput(item, table, context);

      if (context.currentState === undefined) {
        return false;
      }
    }

    const endState = context.currentState ?? EMPTY_POSITIONS;

    return (endState & endNodePositions) !== EMPTY_POSITIONS;
  };
}
