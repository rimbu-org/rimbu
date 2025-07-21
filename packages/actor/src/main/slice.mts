import { Reducer } from '@rimbu/stream';

import { Action, SliceConfig, type Actor, type Tail } from './internal.mjs';

/**
 * An actor slice containing an action reducer for state of type S, and potentially action definitions.
 * @typeparam S - the state type
 * @typeparam ACS - an object containing action definitions
 */
export type Slice<S, ACS = Record<string, never>> = {
  readonly name: string;
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
    _action_handler_args: [
      this['_state'],
      ...this['_action_handler_unknown'][],
    ];

    _action_handler_result: this['_state'];

    _action_handler: (...args: this['_action_handler_args']) => this['_state'];

    _include_handler_args: [
      state: this['_state'],
      action: this['_include_action_type'],
    ];

    _action_type: Action<Tail<Parameters<this['_action_handler']>>>;
    _action_creator_params: Tail<Parameters<this['_action_handler']>>;
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
        type: `${sliceName}.${actionName}`,
        createPayload: Array.of,
      }),
  });

  export interface CombinedSlice<
    SDef extends Record<string, Slice<any, Record<string, any>>>,
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
      reducer: Reducer.combine(reducers) as any,
      actions,
    };
  }
}
