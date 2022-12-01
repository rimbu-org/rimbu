import { Reducer, type OptLazy } from '../../common/mod.ts';

import type { ActionBase } from './internal.ts';

/**
 * Interface to define a lookup algorithm based on actions and a fallback.
 * @typeparam R - the result type for the lookup
 */
export interface Lookup<R, F> {
  readonly actions?: Lookup.Actions<R>;
  readonly fallback?: F | undefined;
}

export namespace Lookup {
  /**
   * Interface to define lookup actions.
   * @typeparam R - the result type for the lookup
   */
  export interface Actions<R> {
    readonly [key: string]: R;
  }

  /**
   * Function to determine how the lookup result type should be used to
   * update a given state.
   * @typeparam S - the state type
   * @typeparam R - the lookup result type
   * @typeparam AC - the specific action type
   */
  export type Updater<S, R> = (
    state: S,
    action: ActionBase,
    lookupValue: R
  ) => S;

  /**
   * Returns a reducer that implements a lookup algorithm based on the given
   * configuration.
   * @param initState - the initial state for the lookup
   * @param lookup - the lookup definition
   * @param applyLookupValue - function used to update the given state with the given action and looup value
   * @returns
   */
  export function create<S, R, F>(
    initState: OptLazy<S>,
    lookup: Lookup<R, F>,
    applyLookupValue: Lookup.Updater<S, R>,
    applyFallback: Lookup.Updater<S, F>
  ): Reducer<ActionBase, S> {
    const { actions, fallback } = lookup;

    return Reducer.createOutput(initState, (state, action) => {
      if (undefined !== actions && action.tag in actions) {
        const lookupValue = actions[action.tag];

        return applyLookupValue(state, action, lookupValue);
      }

      if (undefined !== fallback) {
        return applyFallback(state, action, fallback);
      }

      return state;
    });
  }
}
