import { Reducer } from '@rimbu/common';

import { Action, SliceConfig, type Actor } from './internal';
import type { Tail } from './utils';

/**
 * An actor slice containing an action reducer for state of type S, and potentially action definitions.
 * @typeparam S - the state type
 * @typeparam ACS - an object containing action definitions
 */
export type Slice<S, ACS = Record<string, never>> = {
  readonly reducer: Actor.ActionReducer<S>;
  readonly actions: ACS;
};

export namespace Slice {
  /**
   * Utility type to extract the state type from a given slice type.
   * @typeparam SL - the slice type
   */
  export type StateType<SL extends Slice<any, any>> =
    SL['reducer'] extends Actor.ActionReducer<infer S> ? S : unknown;

  export interface Config extends SliceConfig {
    _ACTION_HANDLER_ARGS: [
      this['_STATE'],
      ...this['_ACTION_HANDLER_UNKNOWN'][]
    ];

    _ACTION_HANDLER_RESULT: this['_STATE'];

    _ACTION_HANDLER: (...args: this['_ACTION_HANDLER_ARGS']) => this['_STATE'];

    _INCLUDE_HANDLER_ARGS: [
      state: this['_STATE'],
      action: this['_INCLUDE_ACTION_TYPE']
    ];

    _ACTION_TYPE: Action<Tail<Parameters<this['_ACTION_HANDLER']>>>;
    _ACTION_CREATOR_PARAMS: Tail<Parameters<this['_ACTION_HANDLER']>>;
  }

  export const { create } = SliceConfig.configure<Slice.Config>({
    applyHandler: <S, A extends unknown[]>(
      state: S,
      action: Action<A>,
      handler: (state: S, ...args: A) => S
    ) => handler(state, ...action.payload),
    applyIncluder: (state, action, includeHandler) =>
      includeHandler(state, action),
    applyHandlerResult: (state, action, result) => result,
    createAction: (sliceName, actionName) =>
      Action.create({
        type: `${sliceName}_${actionName}`,
        createPayload: Array.of,
      }),
  });

  export interface CombinedSlice<
    SDef extends Record<string, Slice<any, Record<string, any>>>
  > {
    reducer: Actor.ActionReducer<{
      [K in keyof SDef]: Slice.StateType<SDef[K]>;
    }>;
    actions: { [K in keyof SDef]: SDef[K]['actions'] };
  }

  /**
   * Returns an object containing the combined reducer and action creators from the given input object.
   * @param slices - an object containing keyed slices to be combined
   * @typeparam SDef - the object type containing keys and slices to combine
   */
  export function combine<SDef extends Record<string, Slice<any, any>>>(
    slices: SDef
  ): Slice.CombinedSlice<SDef> {
    const reducers: any = {};
    const actions: any = {};

    for (const name in slices) {
      const slice = slices[name]!;
      reducers[name] = slice.reducer;
      actions[name] = slice.actions;
    }

    return {
      reducer: Reducer.combineObj(reducers),
      actions,
    };
  }
}
