import { type Patch, patch } from '@rimbu/deep';

import { Action, SliceConfig } from '@rimbu/actor';

export namespace SlicePatch {
  export interface Config extends SliceConfig {
    _action_handler_args: this['_action_handler_unknown'][];

    _action_handler_result: Patch<
      unknown extends this['_state'] ? unknown : this['_state']
    >;

    _action_handler: (
      ...args: this['_action_handler_args']
    ) => this['_action_handler_result'];

    _include_handler_args: [action: this['_include_action_type']];

    _action_type: Action<Parameters<this['_action_handler']>>;
    _action_creator_params: Parameters<this['_action_handler']>;
  }

  export const { create } = SliceConfig.configure<SlicePatch.Config>({
    applyHandler: <S, A extends unknown[]>(
      state: S,
      action: Action<A>,
      handler: (...args: A) => Patch<S>
    ) => handler(...action.payload),
    applyIncluder: (state, action, includeHandler) => includeHandler(action),
    applyHandlerResult: (state, action, result) => patch(state, result),
    createAction: (sliceName, actionName) =>
      Action.create({
        type: `${sliceName}.${actionName}`,
        createPayload: Array.of,
      }),
  });
}
