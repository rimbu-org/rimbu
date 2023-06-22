import { type Patch, patch } from '@rimbu/deep';

import { Action, SliceConfig } from '#actor/main/internal.mjs';

export namespace SlicePatch {
  export interface Config extends SliceConfig {
    _ACTION_HANDLER_ARGS: this['_ACTION_HANDLER_UNKNOWN'][];

    _ACTION_HANDLER_RESULT: Patch<
      unknown extends this['_STATE'] ? unknown : this['_STATE']
    >;

    _ACTION_HANDLER: (
      ...args: this['_ACTION_HANDLER_ARGS']
    ) => this['_ACTION_HANDLER_RESULT'];

    _INCLUDE_HANDLER_ARGS: [action: this['_INCLUDE_ACTION_TYPE']];

    _ACTION_TYPE: Action<Parameters<this['_ACTION_HANDLER']>>;
    _ACTION_CREATOR_PARAMS: Parameters<this['_ACTION_HANDLER']>;
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
        type: `${sliceName}_${actionName}`,
        createPayload: Array.of,
      }),
  });
}
