import type { StateTransitionTable } from 'state-transition-table.mjs';
import type { FollowPositionsMap } from './follow-positions-map.mjs';
import {
  EMPTY_POSITIONS,
  FIRST_BIT_MASK,
  SHIFT_ONE_BIT,
  type Positions,
} from './positions.mjs';

export function showFollowPositionsMap(map: FollowPositionsMap): void {
  for (const [key, value] of map.entries()) {
    if (value.type === 'followPositions') {
      console.log(`${key} -> ${positionsToString(value.followPositions)}`);
    } else {
      console.log(
        `${key} -> ${[...value.counters].map(([counterId, counterValues]) => `counter id: ${counterId}, amount: ${counterValues.repeatAmount}, repeat: ${positionsToString(counterValues.repeatFollowPositions)} done: ${positionsToString(counterValues.doneFollowPositions)}`).join(', ')}`
      );
    }
  }
}

export function showStateTransitionTable(table: StateTransitionTable): void {
  for (const [key, value] of table.transitions.entries()) {
    console.log(`State: ${positionsToString(key)}`);
    console.log('Transitions:');
    for (const [token, transition] of value.matchTransitionsMap.entries()) {
      if (transition.type === 'nextState') {
        console.log(`  ${token} -> ${positionsToString(transition.nextState)}`);
      } else {
        console.log(`  ${token} -> conditions`);
        for (const [
          counterId,
          { repeatPositions, donePositions },
        ] of transition.conditions) {
          console.log(
            `    counter id: ${counterId}, repeat: ${positionsToString(repeatPositions)}, done: ${positionsToString(donePositions)}`
          );
        }
      }
    }
  }
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
