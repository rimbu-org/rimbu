import type { StateTransitionTable } from 'state-transition-table.mjs';
import type { FollowPositionsMap } from './follow-positions-map.mjs';
import {
  EMPTY_POSITIONS,
  FIRST_BIT_MASK,
  SHIFT_ONE_BIT,
  type Positions,
} from './positions.mjs';

export function showFollowPositionsMap(map: FollowPositionsMap): void {
  console.log('--------------------');
  for (const [key, value] of map.entries()) {
    const str = value.steps
      .map((step) =>
        step.type === 'repeat'
          ? `repeat(${step.repeatAmount}) #${step.repeatNodeId} -> ${positionsToString(step.followPositions)} ${step.childIsRepeat ? '<reset>' : ''}`
          : `always -> ${positionsToString(step.followPositions)}`
      )
      .join(', ');
    console.log(`${key} -> ${str}`);
  }
  console.log('--------------------');
}

export function showStateTransitionTable(table: StateTransitionTable): void {
  console.log('--------------------');
  for (const [key, value] of table.transitions.entries()) {
    console.log(`State: ${positionsToString(key)}`);
    console.log('Transitions:');
    for (const [token, transition] of value.matchTransitionsMap.entries()) {
      const str = transition.options.map((option) =>
        option.type === 'unconditional'
          ? `unconditional -> ${positionsToString(option.nextState)}`
          : `repeat ${option.repeatAmount} (${option.repeatNodeId}) -> ${positionsToString(option.nextState)} ${option.resetPrevious ? '<reset>' : ''}`
      );
      console.log(`  ${token} -> ${str}`);
    }
    for (const [token, transition] of value.matchNegTransitionsMap.entries()) {
      const str = transition.options.map((option) =>
        option.type === 'unconditional'
          ? `unconditional -> ${positionsToString(option.nextState)}`
          : `repeat ${option.repeatAmount} (${option.repeatNodeId}) -> ${positionsToString(option.nextState)}`
      );
      console.log(`  !${token} -> ${str}`);
    }
  }
  console.log('--------------------');
}

export function positionsToString(positions: Positions): string {
  if (typeof positions !== 'bigint') {
    throw new TypeError(`Expected a bigint instead of ${positions}`);
  }
  if (positions < 0n) {
    return 'negative';
  }

  let result = '[';
  let currentPosition = 0;
  let sep = '';

  while (positions !== EMPTY_POSITIONS) {
    if (positions & FIRST_BIT_MASK) {
      result += `${sep}${currentPosition}`;
      sep = ',';
    }

    positions = positions >> SHIFT_ONE_BIT;
    currentPosition++;
  }

  result += ']';

  return result;
}
