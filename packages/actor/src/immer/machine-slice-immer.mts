import { createDraft, finishDraft } from 'immer';

import { Action, MachineSliceConfig } from '@rimbu/actor';

export namespace MachineSliceImmer {
  export interface Config extends MachineSliceConfig {
    _action_type: Action<unknown>;

    _transition_handler_args: [
      payload: this['_action_type']['payload'],
      action: this['_action_type'],
    ];

    _transition_guard: (
      context: this['_context'],
      payload: this['_action_type']['payload'],
      action: this['_action_type']
    ) => boolean;

    _transition_update: (
      context: this['_context'],
      payload: this['_action_type']['payload'],
      action: this['_action_type']
    ) => void;
  }

  export const { create } =
    MachineSliceConfig.configure<MachineSliceImmer.Config>({
      applyTransitionHandler: (context, action, transitionHandler) =>
        typeof transitionHandler === 'function'
          ? transitionHandler(action.payload, action)
          : transitionHandler,
      applyTransitionGuard: (context, action, transitionGuard) =>
        transitionGuard(context, action.payload, action),
      applyTransitionUpdate: (context, action, transitionUpdate) => {
        const draft = createDraft(context as any);
        transitionUpdate(draft, action.payload, action);
        return finishDraft(draft);
      },
      initAction: Action.create({ type: 'INIT' })(),
    });
}
