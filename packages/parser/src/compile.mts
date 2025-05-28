import { matchInput, type MatchContext } from 'match-input.mjs';
import { EMPTY_POSITIONS } from 'positions.mjs';
import type { TreeNode } from 'tree-node.mjs';
import type { Expr } from '../src/expression-types.mjs';
import { createFollowPositionsMap } from '../src/follow-positions-map.mjs';
import { createStateTransitionTable } from '../src/state-transition-table.mjs';
import { createTreeWithEndNode } from '../src/tree-builder.mjs';
import {
  positionsToString,
  showFollowPositionsMap,
  showStateTransitionTable,
} from 'show.mjs';

function createInitState(tree: TreeNode): MatchContext {
  return {
    stateContext: new Map(),
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

  console.log(tree.toString());
  showFollowPositionsMap(followPositionsMap);
  showStateTransitionTable(table);
  let index = 0;

  return (input) => {
    let context = createInitState(tree);

    for (const item of input) {
      // console.log(
      //   'before',
      //   positionsToString(context.currentState),
      //   context.stateContext
      // );
      console.log({ item, index: index++ });
      context = matchInput(item, table, context);
      console.log(
        'after',
        positionsToString(context.currentState),
        context.stateContext
      );

      if (context.currentState === EMPTY_POSITIONS) {
        return false;
      }
    }

    const endState = context.currentState;

    console.log(
      `end: ${positionsToString(endState)}, current: ${positionsToString(context.currentState)}`
    );

    return (endState & endNodePositions) !== EMPTY_POSITIONS;
  };
}
