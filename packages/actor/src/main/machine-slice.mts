import { Action, MachineSliceConfig } from './internal.mjs';

export namespace MachineSlice {
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
    ) => this['_context'];
  }

  export const { create } = MachineSliceConfig.configure<MachineSlice.Config>({
    applyTransitionHandler: (context, action, transitionHandler) =>
      typeof transitionHandler === 'function'
        ? transitionHandler(action.payload, action)
        : transitionHandler,
    applyTransitionGuard: (context, action, transitionGuard) =>
      transitionGuard(context, action.payload, action),
    applyTransitionUpdate: (context, action, transitionUpdate) =>
      transitionUpdate(context, action.payload, action),
    initAction: Action.create({ type: 'machine_init' })(),
  });
}

// MachineSlice.create({
//   context: { count: 0 },
//   states: undefined,
//   transitions: (on) => [
//     on(Action.create<number>(), () => ({
//       update: (context, ac) => ({ count: context.count + ac.payload }),
//     })),
//     on(Action.create<number>(), {
//       update: (context, ac) => ({ count: context.count + 1 }),
//     }),
//   ],
// });
