import { Err } from '@rimbu/common';
import {
  eachIndex,
  EMPTY_POSITIONS,
  type Index,
  type Positions,
} from './positions.mjs';
import {
  EndNode,
  MaxAmountRepeatNode,
  OrNode,
  RepeatNode,
  SeqNode,
  ZeroOrMoreRepeatNode,
  type TreeNode,
} from './tree-node.mjs';

export interface CounterInfo {
  repeatAmount: number;
  repeatFollowPositions: Positions;
  doneFollowPositions: Positions;
}
export type CounterMap = Map<number, CounterInfo>;

export type PositionsInfo = FollowPositionsInfo | CounterPositionsInfo;

type PosI =
  | { type: 'followPositions'; followPositions: Positions }
  | {
      type: 'counter';
      repeatAmount: number;
      repeatFollowPositions: Positions;
      doneFollowPositions: Positions;
    };

// interface RepeatInfo {
//   repeatAmount: number;
//   repeatFollowPositions: Positions;
// }

// interface PosI2 {
//   followPositions: Positions;
//   counters: RepeatInfo[];
// }
export interface FollowPositionsInfo {
  type: 'followPositions';
  followPositions: Positions;
}

export interface CounterPositionsInfo {
  type: 'counterPositions';
  counters: CounterMap;
}

export type FollowPositionsMap = Map<Index, PositionsInfo>;

export function createFollowPositionsMap(
  rootNode: TreeNode,
  followPositionsMap: FollowPositionsMap = new Map()
): FollowPositionsMap {
  if (rootNode instanceof EndNode) {
    // End node is the last node in the tree and has no follow positions
    followPositionsMap.set(rootNode.position, {
      type: 'followPositions',
      followPositions: EMPTY_POSITIONS,
    });
  } else if (rootNode instanceof SeqNode) {
    // If the node is a sequence, we need to process its left and right children
    const rightFirstPositions = rootNode.right.firstPositions;

    createFollowPositionsMap(rootNode.left, followPositionsMap);

    if (
      rootNode.left instanceof RepeatNode &&
      !(rootNode.left instanceof ZeroOrMoreRepeatNode)
    ) {
      // If the left child is a repeat node, we only want to add the right first positions when counter is done
      const repeatNode = rootNode.left;

      eachIndex(repeatNode.lastPositions, (repeatLastIndex) => {
        const positionsInfo = followPositionsMap.get(repeatLastIndex);

        if (positionsInfo === undefined) {
          followPositionsMap.set(repeatLastIndex, {
            type: 'followPositions',
            followPositions: rightFirstPositions,
          });
        } else {
          if (positionsInfo.type === 'followPositions') {
            positionsInfo.followPositions |= rightFirstPositions;
          } else {
            const counterInfo =
              positionsInfo.counters.get(repeatNode.repeatNodeId) ?? Err();

            if (repeatNode instanceof MaxAmountRepeatNode) {
              counterInfo.repeatFollowPositions |= rightFirstPositions;
            }
            counterInfo.doneFollowPositions |= rightFirstPositions;
          }
        }
      });
    } else {
      eachIndex(rootNode.left.lastPositions, (lastIndex) => {
        const info = followPositionsMap.get(lastIndex);

        if (info === undefined) {
          followPositionsMap.set(lastIndex, {
            type: 'followPositions',
            followPositions: rightFirstPositions,
          });
        } else if (info.type === 'followPositions') {
          info.followPositions |= rightFirstPositions;
        } else {
          // info.counters.
        }
      });
    }

    createFollowPositionsMap(rootNode.right, followPositionsMap);
  } else if (rootNode instanceof RepeatNode) {
    createFollowPositionsMap(rootNode.child, followPositionsMap);

    // If the node is a repeat node, we need to process its child
    if (rootNode instanceof ZeroOrMoreRepeatNode) {
      eachIndex(rootNode.lastPositions, (lastIndex) => {
        const info = followPositionsMap.get(lastIndex);

        if (info === undefined) {
          followPositionsMap.set(lastIndex, {
            type: 'followPositions',
            followPositions: rootNode.firstPositions,
          });
        } else if (info.type === 'followPositions') {
          info.followPositions |= rootNode.firstPositions;
        } else {
          // something counters
        }
      });
    } else {
      eachIndex(rootNode.lastPositions, (lastIndex) => {
        const info = followPositionsMap.get(lastIndex);

        if (info === undefined) {
          followPositionsMap.set(lastIndex, {
            type: 'counterPositions',
            counters: new Map([
              [
                rootNode.repeatNodeId,
                {
                  repeatAmount: rootNode.max ?? rootNode.min,
                  repeatFollowPositions: rootNode.firstPositions,
                  doneFollowPositions: EMPTY_POSITIONS,
                },
              ],
            ]),
          });
        } else if (info.type === 'counterPositions') {
          const counterInfo = info.counters.get(rootNode.repeatNodeId);

          if (counterInfo === undefined) {
            info.counters.set(rootNode.repeatNodeId, {
              repeatAmount: rootNode.max ?? rootNode.min,
              repeatFollowPositions: rootNode.firstPositions,
              doneFollowPositions: EMPTY_POSITIONS,
            });
          } else {
            // throw Error('already processed counter');
          }
        }
      });
    }
  } else if (rootNode instanceof OrNode) {
    createFollowPositionsMap(rootNode.left, followPositionsMap);
    createFollowPositionsMap(rootNode.right, followPositionsMap);
  }

  return followPositionsMap;
}
