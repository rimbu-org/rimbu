import { Err } from '../common/dist/esm/err.mjs';
import type { Positions } from './positions.mjs';
import type { StateTransitionTable } from './state-transition-table.mjs';

export interface MatchContext {
  counterStates: Map<number, number>;
  currentState: Positions | undefined;
}

export function matchInput(
  input: any,
  stateTransitionsTable: StateTransitionTable,
  context: MatchContext
): MatchContext {
  const { currentState } = context;

  if (currentState === undefined) {
    return context;
  }

  const { transitions, initCounters } = stateTransitionsTable;

  const transitionInfo = transitions.get(currentState) ?? Err();

  if (transitionInfo.matchTransitionsMap.has(input)) {
    const stateInfo = transitionInfo.matchTransitionsMap.get(input)!;

    if (stateInfo.type === 'nextState') {
      const counterInfo = initCounters.get(currentState);

      if (counterInfo !== undefined) {
        context.counterStates.set(
          counterInfo.counterId,
          counterInfo.repeatAmount
        );
      }

      return { ...context, currentState: stateInfo.nextState };
    } else {
      const { conditions } = stateInfo;

      const newCounterStates = new Map(context.counterStates);
      let finalPositions: Positions | undefined;

      for (const [
        counterId,
        { repeatPositions, donePositions },
      ] of conditions) {
        const currentCount = newCounterStates.get(counterId);
        console.log({ input, counterId, currentCount, context, conditions });

        if (currentCount === undefined) {
          const init = initCounters.get(currentState) ?? Err();

          if (init.repeatAmount === 1) {
            return {
              ...context,
              currentState: donePositions,
              counterStates: newCounterStates,
            };
          }

          return {
            ...context,
            currentState: repeatPositions,
            counterStates: newCounterStates.set(
              counterId,
              init.repeatAmount - 1
            ),
          };
        } else if (currentCount === 1) {
          newCounterStates.delete(counterId);

          return {
            ...context,
            currentState: donePositions,
          };
        } else if (currentCount > 1) {
          newCounterStates.set(counterId, currentCount - 1);
          return {
            ...context,
            currentState: repeatPositions,
            counterStates: newCounterStates,
          };
        }

        finalPositions = donePositions;
      }

      return {
        ...context,
        counterStates: newCounterStates,
        currentState: finalPositions,
      };
    }
  }

  return { ...context, currentState: undefined };
}
