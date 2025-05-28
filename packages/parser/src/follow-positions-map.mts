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

interface RepeatStepInfo {
  type: 'repeat';
  repeatNodeId: number;
  repeatAmount: number;
  followPositions: Positions;
  childIsRepeat: boolean;
}

interface AlwaysFollowPositionsStepInfo {
  type: 'always';
  followPositions: Positions;
}

type FollowPositionsStepInfo = RepeatStepInfo | AlwaysFollowPositionsStepInfo;

interface FollowPositionsInfo {
  steps: FollowPositionsStepInfo[];
}

export type FollowPositionsMap = Map<Index, FollowPositionsInfo>;

export function createFollowPositionsMap(
  rootNode: TreeNode,
  followPositionsMap: FollowPositionsMap = new Map()
): FollowPositionsMap {
  if (rootNode instanceof EndNode) {
    // End node is the last node in the tree and has no follow positions
    followPositionsMap.set(rootNode.position, {
      steps: [{ type: 'always', followPositions: EMPTY_POSITIONS }],
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

        if (positionsInfo === undefined || positionsInfo.steps.length === 0) {
          throw Error('unexpected counter 1');
        } else {
          const counterIndex = positionsInfo.steps.findIndex(
            (step) =>
              step.type === 'repeat' &&
              step.repeatNodeId === repeatNode.repeatNodeId
          );

          for (let i = counterIndex + 1; i < positionsInfo.steps.length; i++) {
            const stepInfo = positionsInfo.steps[i];
            stepInfo.followPositions |= rightFirstPositions;
          }
          const lastStep = positionsInfo.steps.at(-1)!;

          if (repeatNode instanceof MaxAmountRepeatNode) {
            lastStep.followPositions |= rightFirstPositions;
          }

          if (lastStep.type === 'repeat') {
            positionsInfo.steps.push({
              type: 'always',
              followPositions: rightFirstPositions,
            });
          }
        }
      });
    } else {
      eachIndex(rootNode.left.lastPositions, (lastIndex) => {
        const followPositionsInfo = followPositionsMap.get(lastIndex);

        if (followPositionsInfo === undefined) {
          followPositionsMap.set(lastIndex, {
            steps: [{ type: 'always', followPositions: rightFirstPositions }],
          });
        } else {
          const lastPositionsInfo = followPositionsInfo.steps.at(-1)!;

          lastPositionsInfo.followPositions |= rightFirstPositions;
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
            steps: [
              { type: 'always', followPositions: rootNode.firstPositions },
            ],
          });
        } else {
          const lastPositionsInfo = info.steps.at(-1)!;

          lastPositionsInfo.followPositions |= rootNode.firstPositions;
        }
      });
    } else {
      eachIndex(rootNode.lastPositions, (lastIndex) => {
        const info = followPositionsMap.get(lastIndex);

        if (info === undefined) {
          followPositionsMap.set(lastIndex, {
            steps: [
              {
                type: 'repeat',
                repeatNodeId: rootNode.repeatNodeId,
                repeatAmount: rootNode.max ?? rootNode.min,
                followPositions: rootNode.firstPositions,
                childIsRepeat: false,
              },
            ],
          });
        } else {
          const existing = info.steps.find(
            (step) =>
              step.type === 'repeat' &&
              step.repeatNodeId === rootNode.repeatNodeId
          );

          if (existing === undefined) {
            const lastStep = info.steps.at(-1);

            if (lastStep === undefined) {
              throw Error('no last step');
            }

            const childIsRepeat =
              rootNode.child instanceof RepeatNode &&
              !(rootNode.child instanceof ZeroOrMoreRepeatNode);

            if (lastStep.type === 'always') {
              info.steps.pop()!;
              info.steps.push({
                type: 'repeat',
                repeatNodeId: rootNode.repeatNodeId,
                repeatAmount: rootNode.max ?? rootNode.min,
                followPositions:
                  lastStep.followPositions | rootNode.firstPositions,
                childIsRepeat,
              });
            } else {
              info.steps.push({
                type: 'repeat',
                repeatNodeId: rootNode.repeatNodeId,
                repeatAmount: rootNode.max ?? rootNode.min,
                followPositions: rootNode.firstPositions,
                childIsRepeat,
              });
            }
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
