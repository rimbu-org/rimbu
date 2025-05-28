import { Err } from '../common/dist/esm/err.mjs';
import { EMPTY_POSITIONS, type Positions } from './positions.mjs';
import type {
  NextStateInfo,
  StateTransitionTable,
} from './state-transition-table.mjs';

export interface StateContextInfo {
  optionIndex: number;
  currentCounts: Map<number, number>;
}

export type StateContext = Map<Positions, StateContextInfo>;

export interface MatchContext {
  stateContext: StateContext;
  currentState: Positions;
}

function tr2(
  nextStateInfo: NextStateInfo,
  matchContext: MatchContext,
  firstState: Positions
): MatchContext {
  const stateContext = new Map(matchContext.stateContext);

  const { currentState } = matchContext;

  const stateContextInfo = stateContext.get(currentState);

  if (stateContextInfo === undefined) {
    stateContext.set(currentState, {
      optionIndex: 0,
      currentCounts: new Map(),
    });

    return tr2(
      nextStateInfo,
      { ...matchContext, stateContext: stateContext },
      firstState
    );
  }

  const currentOption = nextStateInfo.options[stateContextInfo.optionIndex];

  if (currentOption.type === 'unconditional') {
    return {
      stateContext,
      currentState: currentOption.nextState,
    };
  }

  const { optionIndex } = stateContextInfo;
  const currentCounts = new Map(stateContextInfo.currentCounts);

  const currentCount = currentCounts.get(currentOption.repeatNodeId);

  if (currentOption.resetPrevious) {
    // console.log('reset, keep count', currentCount);

    if (currentCount === undefined) {
      currentCounts.set(currentOption.repeatNodeId, currentOption.repeatAmount);
      stateContext.set(currentState, {
        ...stateContextInfo,
        currentCounts,
      });

      // return {
      //   ...matchContext,
      //   stateContext,
      //   currentState: firstState,
      // };

      return tr2(
        nextStateInfo,
        { ...matchContext, stateContext, currentState },
        firstState
      );
    }

    const nextOptionIndex = optionIndex + 1;
    const nextOption = nextStateInfo.options[nextOptionIndex];

    if (currentCount === 0) {
      stateContext.set(currentState, {
        ...stateContextInfo,
        optionIndex: nextOptionIndex,
      });

      return tr2(
        nextStateInfo,
        { ...matchContext, stateContext, currentState: nextOption.nextState },
        firstState
      );
    }

    if (currentCount === 1) {
      console.log('here', nextOption);
      currentCounts.set(currentOption.repeatNodeId, 0);

      stateContext.set(currentState, {
        currentCounts,
        optionIndex: nextOptionIndex,
      });

      return {
        ...matchContext,
        stateContext,
        currentState: nextOption.nextState,
      };
    }

    currentCounts.set(currentOption.repeatNodeId, currentCount - 1);

    stateContext.set(currentState, {
      ...stateContextInfo,
      currentCounts,
    });

    const currentFirstContextInfo = stateContext.get(firstState) ?? Err();
    stateContext.set(firstState, {
      ...currentFirstContextInfo,
      optionIndex: 0,
    });

    return {
      ...matchContext,
      stateContext,
      currentState: firstState,
    };

    // return tr2(
    //   nextStateInfo,
    //   {
    //     ...matchContext,
    //     stateContext,
    //     currentState: firstState,
    //   },
    //   firstState
    // );
  }

  if (currentCount === undefined) {
    currentCounts.set(currentOption.repeatNodeId, currentOption.repeatAmount);

    stateContext.set(currentState, {
      ...stateContextInfo,
      currentCounts,
    });

    return tr2(nextStateInfo, { ...matchContext, stateContext }, firstState);
  }

  if (currentCount === 1) {
    currentCounts.delete(currentOption.repeatNodeId);

    stateContext.set(currentState, {
      optionIndex: optionIndex + 1,
      currentCounts,
    });

    const nextOption = nextStateInfo.options[optionIndex + 1];

    if (nextOption.type === 'repeat' && nextOption.resetPrevious) {
      return tr2(
        nextStateInfo,
        {
          ...matchContext,
          stateContext,
          currentState,
        },
        firstState
      );
    }

    return {
      ...matchContext,
      stateContext,
      currentState: nextOption.nextState,
    };
  }

  if (currentCount === 0) {
    stateContext.set(currentState, {
      optionIndex: optionIndex + 1,
      currentCounts,
    });

    return tr2(nextStateInfo, { ...matchContext, stateContext }, firstState);
  }

  currentCounts.set(currentOption.repeatNodeId, currentCount - 1);

  if (currentOption.resetPrevious) {
    const currentFirstContextInfo = stateContext.get(firstState)!;

    stateContext.set(firstState, {
      ...currentFirstContextInfo,
      optionIndex: 0,
    });

    return {
      ...matchContext,
      stateContext,
      currentState: firstState,
    };
  }

  stateContext.set(currentState, {
    ...stateContextInfo,
    currentCounts,
  });

  return {
    ...matchContext,
    stateContext,
    currentState: currentOption.nextState,
  };
}

function transitionResult(
  nextStateInfo: NextStateInfo,
  matchContext: MatchContext,
  firstState: Positions
): MatchContext {
  const newStateContext = new Map(matchContext.stateContext);

  const { currentState, stateContext } = matchContext;

  let stateContextInfo = stateContext.get(currentState);

  if (stateContextInfo === undefined) {
    const firstOption = nextStateInfo.options[0];
    const currentCounts = new Map<number, number>();
    if (firstOption.type === 'repeat') {
      currentCounts.set(firstOption.repeatNodeId, firstOption.repeatAmount);
    }

    stateContextInfo = {
      optionIndex: 0,
      currentCounts,
    };
  } else {
    stateContextInfo = { ...stateContextInfo };
  }
  newStateContext.set(currentState, stateContextInfo);

  const currentOption = nextStateInfo.options[stateContextInfo.optionIndex];

  if (currentOption.type === 'unconditional') {
    return {
      stateContext: newStateContext,
      currentState: currentOption.nextState,
    };
  }

  const { optionIndex, currentCounts } = stateContextInfo;

  let currentCount = currentCounts.get(currentOption.repeatNodeId);

  // console.log({
  //   state: positionsToString(currentState),
  //   optionIndex,
  //   currentCount,
  //   currentOption,
  //   currentCounts,
  // });

  if (currentCount === undefined) {
    currentCounts.set(currentOption.repeatNodeId, currentOption.repeatAmount);
    currentCount = currentOption.repeatAmount;
  }

  if (currentCount === 1) {
    let nextOptionIndex = optionIndex + 1;
    const nextOption = nextStateInfo.options[nextOptionIndex];

    const newCounts = new Map(currentCounts);
    newCounts.delete(currentOption.repeatNodeId);

    if (nextOption !== undefined && nextOption.type === 'repeat') {
      if (nextOption.resetPrevious) {
        const resetCount = newCounts.get(nextOption.repeatNodeId);

        if (resetCount === undefined) {
          newCounts.set(nextOption.repeatNodeId, nextOption.repeatAmount);

          const firstOption = nextStateInfo.options[0];

          if (firstOption.type === 'repeat') {
            newCounts.set(firstOption.repeatNodeId, firstOption.repeatAmount);
          }
          nextOptionIndex = 0;
        } else if (resetCount === 1) {
          newCounts.set(nextOption.repeatNodeId, resetCount - 1);
          // newCounts.delete(nextOption.repeatNodeId);
          // nextOptionIndex++;

          newStateContext.set(currentState, {
            optionIndex: nextOptionIndex,
            currentCounts: newCounts,
          });

          return {
            ...matchContext,
            stateContext: newStateContext,
            currentState: firstState,
          };
        } else if (resetCount === 0) {
          nextOptionIndex++;
        } else {
          newCounts.set(nextOption.repeatNodeId, resetCount - 1);
          const firstOption = nextStateInfo.options[0];
          if (firstOption.type === 'repeat') {
            newCounts.set(
              firstOption.repeatNodeId,
              firstOption.repeatAmount - 1
            );
          }
        }
      } else {
        newCounts.set(nextOption.repeatNodeId, nextOption.repeatAmount);
      }
    }

    newStateContext.set(currentState, {
      optionIndex: nextOptionIndex,
      currentCounts: newCounts,
    });

    return {
      ...matchContext,
      stateContext: newStateContext,
      currentState: nextOption.nextState,
    };
  }

  const newCounts = new Map(currentCounts);
  newCounts.set(currentOption.repeatNodeId, currentCount - 1);

  newStateContext.set(currentState, {
    ...stateContextInfo,
    currentCounts: newCounts,
  });

  return {
    ...matchContext,
    stateContext: newStateContext,
    currentState: currentOption.nextState,
  };
}

export function matchInput(
  input: any,
  stateTransitionsTable: StateTransitionTable,
  matchContext: MatchContext
): MatchContext {
  const { currentState } = matchContext;

  if (currentState === EMPTY_POSITIONS) {
    return matchContext;
  }

  const { transitions } = stateTransitionsTable;

  const transitionInfo = transitions.get(currentState) ?? Err();
  const [[firstState]] = [...stateTransitionsTable.transitions];

  let nextStateInfo: NextStateInfo | undefined;

  if (transitionInfo.matchTransitionsMap.has(input)) {
    nextStateInfo = transitionInfo.matchTransitionsMap.get(input)!;
  }

  if (nextStateInfo === undefined) {
    for (const [key, stateInfo] of transitionInfo.matchNegTransitionsMap) {
      if (key !== input) {
        nextStateInfo = stateInfo;
        break;
      }
    }
  }

  if (nextStateInfo === undefined) {
    for (const [pred, stateInfo] of transitionInfo.predTransitionsMap) {
      if (pred(input)) {
        nextStateInfo = stateInfo;
        break;
      }
    }
  }

  if (nextStateInfo === undefined) {
    for (const [pred, stateInfo] of transitionInfo.predNegTransitionsMap) {
      if (!pred(input)) {
        nextStateInfo = stateInfo;
        break;
      }
    }
  }

  if (nextStateInfo === undefined) {
    return { ...matchContext, currentState: EMPTY_POSITIONS };
  }

  let stateContextInfo = matchContext.stateContext.get(currentState);

  if (stateContextInfo === undefined) {
    const stateContext: StateContext = new Map();
    stateContextInfo = {
      optionIndex: 0,
      currentCounts: new Map(),
    };
    stateContext.set(currentState, stateContextInfo);

    const firstOption = nextStateInfo.options[0];

    if (firstOption.type === 'repeat') {
      stateContextInfo.currentCounts.set(
        firstOption.repeatNodeId,
        firstOption.repeatAmount
      );
    }

    return tr2(nextStateInfo, { ...matchContext, stateContext }, firstState);
  }

  return tr2(nextStateInfo, matchContext, firstState);
}
