import { createDraft, finishDraft } from 'immer';

import { Action, SliceConfig } from '@rimbu/actor';

import type { Tail } from '../main/utils.mjs';

export namespace SliceImmer {
  export interface Config extends SliceConfig {
    _action_handler_args: [
      this['_state'],
      ...this['_action_handler_unknown'][],
    ];

    _action_handler: (...args: this['_action_handler_args']) => void;

    _action_handler_result: this['_state'];

    _include_handler_args: [
      state: this['_state'],
      action: this['_include_action_type'],
    ];

    _include_handler: (...args: this['_include_handler_args']) => void;

    _action_type: Action<Tail<Parameters<this['_action_handler']>>>;
    _action_creator_params: Tail<Parameters<this['_action_handler']>>;
  }

  export const { create } = SliceConfig.configure<SliceImmer.Config>({
    applyHandler: <S, A extends unknown[]>(
      state: S,
      action: Action<A>,
      handler: (state: S, ...args: A) => void
    ) => {
      const draft = createDraft(state as any) as S;
      handler(draft, ...action.payload);
      return finishDraft(draft) as S;
    },
    applyIncluder: (state, action, includeHandler) => {
      const draft = createDraft(state as any) as typeof state;
      includeHandler(draft, action);
      return finishDraft(draft) as any;
    },
    applyHandlerResult: (state, action, result) => result,
    createAction: (sliceName, actionName) =>
      Action.create({
        type: `${sliceName}.${actionName}`,
        createPayload: Array.of,
      }),
  });
}
