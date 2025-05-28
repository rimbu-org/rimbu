import { Err } from '@rimbu/common';
import type { FollowPositionsMap } from './follow-positions-map.mjs';
import { eachIndex, EMPTY_POSITIONS, type Positions } from './positions.mjs';
import type { IndexToNodeMap } from './tree-builder.mjs';
import { MatchNode, PredNode } from './tree-node.mjs';

type Token = any;

export interface UnconditionalNextState {
  type: 'unconditional';
  nextState: Positions;
}

export interface RepeatNextState {
  type: 'repeat';
  repeatNodeId: number;
  repeatAmount: number;
  nextState: Positions;
  resetPrevious: boolean;
}

export type NextState = UnconditionalNextState | RepeatNextState;

export interface NextStateInfo {
  options: NextState[];
}

export interface TransitionInfo {
  matchTransitionsMap: Map<Token, NextStateInfo>;
  matchNegTransitionsMap: Map<Token, NextStateInfo>;
  predTransitionsMap: Map<(value: any) => boolean, NextStateInfo>;
  predNegTransitionsMap: Map<(value: any) => boolean, NextStateInfo>;
  otherTransitionsMap: Map<Token, NextStateInfo>;
}

export interface StateTransitionTable {
  transitions: Map<Positions, TransitionInfo>;
}

export function createStateTransitionTable(
  startState: Positions,
  followPositionsMap: FollowPositionsMap,
  indexToNodeMap: IndexToNodeMap,
  stateTransitionsTable: StateTransitionTable = {
    transitions: new Map(),
  },
  processedRepeatNodes: Set<number> = new Set()
): StateTransitionTable {
  if (
    startState === EMPTY_POSITIONS ||
    stateTransitionsTable.transitions.has(startState)
  ) {
    return stateTransitionsTable;
  }

  const transitionInfo: TransitionInfo = {
    matchTransitionsMap: new Map(),
    matchNegTransitionsMap: new Map(),
    predTransitionsMap: new Map(),
    predNegTransitionsMap: new Map(),
    otherTransitionsMap: new Map(),
  };
  stateTransitionsTable.transitions.set(startState, transitionInfo);

  eachIndex(startState, (startIndex) => {
    const node = indexToNodeMap.get(startIndex) ?? Err();

    let targetMap = transitionInfo.otherTransitionsMap;

    if (node instanceof MatchNode) {
      if (node.neg) {
        targetMap = transitionInfo.matchNegTransitionsMap;
      } else {
        targetMap = transitionInfo.matchTransitionsMap;
      }
    } else if (node instanceof PredNode) {
      if (node.neg) {
        targetMap = transitionInfo.predNegTransitionsMap;
      } else {
        targetMap = transitionInfo.predTransitionsMap;
      }
    }

    const [key] = node.keyInfo;

    let stateInfo = targetMap.get(key);

    if (stateInfo === undefined) {
      stateInfo = {
        options: [],
      };
      targetMap.set(key, stateInfo);
    }

    const positionsInfo = followPositionsMap.get(startIndex) ?? Err();

    let stepIndex = -1;
    while (++stepIndex < positionsInfo.steps.length) {
      const step = positionsInfo.steps[stepIndex];
      // console.log('before', {
      //   startState: positionsToString(startState),
      //   startIndex,
      //   step,
      //   stateInfo: stateInfo.options,
      // });
      if (step.type === 'always') {
        const lastOption = stateInfo.options.at(-1);

        if (lastOption === undefined || lastOption.type === 'repeat') {
          stateInfo.options.push({
            type: 'unconditional',
            nextState: step.followPositions,
          });
        } else {
          lastOption.nextState |= step.followPositions;
        }
        break;
      } else {
        if (!processedRepeatNodes.has(step.repeatNodeId)) {
          if (step.childIsRepeat && step.followPositions !== startState) {
            stateInfo.options.push({
              type: 'unconditional',
              nextState: step.followPositions,
            });
          } else {
            processedRepeatNodes.add(step.repeatNodeId);

            stateInfo.options.push({
              type: 'repeat',
              repeatNodeId: step.repeatNodeId,
              repeatAmount: step.repeatAmount,
              nextState: step.followPositions,
              resetPrevious: step.childIsRepeat,
            });

            if (step.followPositions === startState) {
              const nextStep = positionsInfo.steps[stepIndex + 1];

              if (nextStep.type === 'repeat' && !nextStep.childIsRepeat) {
                stateInfo.options.push({
                  type: 'unconditional',
                  nextState: nextStep.followPositions,
                });
                break;
              }
            }
          }
        }
      }
      // console.log('after', { stateInfo: stateInfo.options });
    }
  });

  for (const targetMap of [
    transitionInfo.matchTransitionsMap,
    transitionInfo.matchNegTransitionsMap,
    transitionInfo.predTransitionsMap,
    transitionInfo.predNegTransitionsMap,
    transitionInfo.otherTransitionsMap,
  ]) {
    for (const [, stateInfo] of targetMap) {
      for (const option of stateInfo.options) {
        createStateTransitionTable(
          option.nextState,
          followPositionsMap,
          indexToNodeMap,
          stateTransitionsTable,
          processedRepeatNodes
        );
      }
    }
  }

  return stateTransitionsTable;
}
