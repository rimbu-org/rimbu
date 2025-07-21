import { Deep } from '@rimbu/deep';
import { Action, MachineSliceConfig } from '@rimbu/actor';

export namespace MachineSlicePatch {
  export interface Config extends MachineSliceConfig {
    _action_type: Action<unknown>;

    _transition_handler_args: [
      payload: this['_action_type']['payload'],
      action: this['_action_type'],
    ];

    _transition_guard: Deep.Match<this['_context']>;

    _transition_update: Deep.Patch<this['_context']>;
  }

  export const { create } =
    MachineSliceConfig.configure<MachineSlicePatch.Config>({
      applyTransitionHandler: (context, action, transitionHandler) =>
        typeof transitionHandler === 'function'
          ? transitionHandler(action.payload, action)
          : transitionHandler,
      applyTransitionGuard: (context, action, transitionGuard) =>
        Deep.match(context, transitionGuard),
      applyTransitionUpdate: (context, action, transitionUpdate) =>
        Deep.patch(context, transitionUpdate),
      initAction: Action.create({ type: 'INIT' })(),
    });
}
