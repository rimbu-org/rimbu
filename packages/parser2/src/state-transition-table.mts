import { Err } from '@rimbu/common';
import type { FollowPositionsMap } from './follow-positions-map.mjs';
import { eachIndex, EMPTY_POSITIONS, type Positions } from './positions.mjs';
import type { IndexToNodeMap } from './tree-builder.mjs';
import { MatchNode } from './tree-node.mjs';

type Token = any;

export type StateInfo = NextStateInfo | CounterNextStateInfo;

export interface NextStateInfo {
  type: 'nextState';
  nextState: Positions;
}

export interface CounterNextStateInfo {
  type: 'counter';
  conditions: Map<
    number,
    { repeatPositions: Positions; donePositions: Positions }
  >;
}

export interface TransitionInfo {
  matchTransitionsMap: Map<Token, StateInfo>;
  matchNegTransitionsMap: Map<Token, StateInfo>;
  otherTransitionsMap: Map<Token, StateInfo>;
}

export interface InitCounterInfo {
  repeatAmount: number;
  counterId: number;
}

export interface StateTransitionTable {
  transitions: Map<Positions, TransitionInfo>;
  initCounters: Map<Positions, InitCounterInfo>;
}

export function createStateTransitionTable(
  startState: Positions,
  followPositionsMap: FollowPositionsMap,
  indexToNodeMap: IndexToNodeMap,
  stateTransitionsTable: StateTransitionTable = {
    transitions: new Map(),
    initCounters: new Map(),
  }
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
    }

    const [key] = node.keyInfo;

    const stateInfo = targetMap.get(key);

    const positionsInfo = followPositionsMap.get(startIndex) ?? Err();

    if (positionsInfo.type === 'followPositions') {
      if (stateInfo === undefined) {
        targetMap.set(key, {
          type: 'nextState',
          nextState: positionsInfo.followPositions,
        });
      } else if (stateInfo.type === 'nextState') {
        stateInfo.nextState |= positionsInfo.followPositions;
      } else {
        throw Error('unexpected counter');
      }
    } else {
      // positions type is counters
      for (const [counterId, counterInfo] of positionsInfo.counters) {
        if (startState === counterInfo.doneFollowPositions) {
          targetMap.set(key, {
            type: 'nextState',
            nextState: counterInfo.doneFollowPositions,
          });
        } else {
          let startStateCounterInfo =
            stateTransitionsTable.initCounters.get(startState);

          if (startStateCounterInfo === undefined) {
            startStateCounterInfo = {
              repeatAmount: counterInfo.repeatAmount,
              counterId,
            };
            stateTransitionsTable.initCounters.set(
              startState,
              startStateCounterInfo
            );
          }

          let currentStateInfo = targetMap.get(key);

          if (currentStateInfo === undefined) {
            currentStateInfo = {
              type: 'counter',
              conditions: new Map(),
            };
            targetMap.set(key, currentStateInfo);
          } else if (currentStateInfo.type !== 'counter') {
            currentStateInfo = {
              type: 'counter',
              conditions: new Map(),
            };
            targetMap.set(key, currentStateInfo);
          }
          currentStateInfo.conditions.set(counterId, {
            repeatPositions: counterInfo.repeatFollowPositions,
            donePositions: counterInfo.doneFollowPositions,
          });
        }
      }
    }
  });

  for (const targetMap of [
    transitionInfo.matchTransitionsMap,
    transitionInfo.matchNegTransitionsMap,
    transitionInfo.otherTransitionsMap,
  ]) {
    for (const [, stateInfo] of targetMap) {
      if (stateInfo.type === 'nextState') {
        createStateTransitionTable(
          stateInfo.nextState,
          followPositionsMap,
          indexToNodeMap,
          stateTransitionsTable
        );
      } else {
        for (const [, counterInfo] of stateInfo.conditions) {
          createStateTransitionTable(
            counterInfo.repeatPositions,
            followPositionsMap,
            indexToNodeMap,
            stateTransitionsTable
          );
          createStateTransitionTable(
            counterInfo.donePositions,
            followPositionsMap,
            indexToNodeMap,
            stateTransitionsTable
          );
        }
      }
    }
  }

  return stateTransitionsTable;
}
