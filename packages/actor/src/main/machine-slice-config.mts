import { Reducer } from '@rimbu/stream';
import type { ActionBase, Slice } from './internal.mjs';
import { OptLazy } from '@rimbu/common';

interface ContextUpdate<C extends MachineSliceConfig> {
  guard?: C['_transition_guard'];
  update?: C['_transition_update'];
}

interface TransitionInfo<C extends MachineSliceConfig>
  extends ContextUpdate<C> {
  to?: C['_transition_targets'];
}

type Lookup<C extends MachineSliceConfig> = Record<
  string,
  {
    statePrefix: string;
    handlers: Record<string, C['_transition_handler']>;
    enter?: ContextUpdate<C>;
    exit?: ContextUpdate<C>;
  }
>;

function createLookup<C extends MachineSliceConfig>(
  state: MachineSliceConfig.Shape,
  statePrefix: string = '.',
  stateName: string = '',
  lookup: Lookup<C> = {}
): Lookup<C> {
  const handlerLookup: Record<string, C['_transition_handler']> = {};

  if (state.transitions) {
    if (typeof state.transitions !== 'function') {
      throw Error('should be a function');
    }

    state.transitions((action: any, handler: any) => {
      handlerLookup[action.actionTag] = handler;
    });
  }

  const fullPath = `${statePrefix}${stateName}`;

  lookup[fullPath] = {
    handlers: handlerLookup,
    statePrefix: statePrefix,
    enter: state.enter,
    exit: state.exit,
  };

  for (const [subStateName, subState] of Object.entries(state.states ?? {})) {
    const newPrefix = fullPath.endsWith('.') ? fullPath : `${fullPath}.`;
    createLookup(subState, newPrefix, subStateName, lookup);
  }

  return lookup;
}

function getInitState(
  state: MachineSliceConfig.Shape,
  result: string[] = []
): string[] {
  if (state.initState === undefined || state.states === undefined) {
    return result;
  }

  return getInitState(state.states[state.initState], [
    ...result,
    state.initState,
  ]);
}

function getStatePath(state: string[]): string {
  return `.${state.join('.')}`;
}

function fromStatePath(path: string): string[] {
  return path.slice(1).split('.');
}

export interface MachineSliceConfig {
  _context: unknown;

  _transition_handler_args: unknown[];

  _transition_handler: (
    ...args: this['_transition_handler_args']
  ) => this['_transition_handler_result'];

  _transition_handler_unknown: unknown;

  _transition_handler_result: TransitionInfo<this>;

  _transition_guard?: unknown;

  _transition_update?: unknown;

  _transition_targets: string;

  /**
   * The action type used for action handlers.
   */
  _action_type: ActionBase;
}

export namespace MachineSliceConfig {
  /**
   * Function type to use to apply the given action handler.
   * @typeparam C - the slice configuration type
   */
  export type ApplyTransitionHandler<C extends MachineSliceConfig> = <CTX>(
    context: CTX,
    action: (C & { _context: CTX })['_action_type'],
    transitionHandler: (C & { _context: CTX })[
      | '_transition_handler'
      | '_transition_handler_result']
  ) => (C & { _context: CTX })['_transition_handler_result'];

  export type ApplyTransitionGuard<C extends MachineSliceConfig> = <CTX>(
    context: CTX,
    action: C['_action_type'],
    transitionGuard: (C & { _context: CTX })['_transition_guard']
  ) => boolean;

  /**
   * Function type to use to apply the given action handler result.
   * @typeparam C - the slice configuration type
   */
  export type ApplyTransitionUpdate<C extends MachineSliceConfig> = <CTX>(
    context: CTX,
    action: C['_action_type'],
    transitionUpdate: (C & { _context: CTX })['_transition_update']
  ) => CTX;

  export interface StateNode<States extends Record<string, any>> {
    initState?: keyof NoInfer<States>;
    states?: { [K in keyof States]: StateNode<States[K]> } | undefined;
  }

  export type Shape =
    | {
        initState: string;
        states: Record<string, Shape>;
        transitions?: unknown;
        enter?: any;
        exit?: any;
      }
    | {
        initState?: undefined;
        states: undefined;
        transitions?: unknown;
        enter?: any;
        exit?: any;
      };

  export type StatePaths<
    States,
    Sep extends string = '.',
  > = undefined extends States
    ? ''
    : Record<string, any> extends States
      ? ''
      : {
          [K in keyof States]:
            | `${Sep}${K & string}`
            | `${Sep}${K & string}${StatePaths<States[K]>}`;
        }[keyof States];

  export type WithTransitions<
    States,
    C extends MachineSliceConfig,
    TO extends string,
    ParState,
  > = {
    initState?: string;
    states?: {} extends States
      ? undefined
      :
          | { [K in keyof States]: WithTransitions<States[K], C, TO, States> }
          | undefined;
    transitions?: (
      onFn: <AC extends C['_action_type']>(
        action: ActionBase.Creator<AC, any[]>,
        handler: (C & {
          _action_type: AC;
          _transition_targets: TO | StatePaths<ParState, ''>;
        })['_transition_handler' | '_transition_handler_result']
      ) => unknown
    ) => unknown[];
    enter?: ContextUpdate<C>;
    exit?: ContextUpdate<C>;
  };

  export function configure<C extends MachineSliceConfig>(sliceConfig: {
    applyTransitionHandler: MachineSliceConfig.ApplyTransitionHandler<C>;
    applyTransitionGuard: MachineSliceConfig.ApplyTransitionGuard<C>;
    applyTransitionUpdate: MachineSliceConfig.ApplyTransitionUpdate<C>;
    initAction: C['_action_type'];
  }): {
    create<
      States extends Record<string, any>,
      CTX,
      AC extends Record<string, any>,
    >(
      config: {
        name?: string | undefined;
        context?: OptLazy<CTX> | undefined;
        actions?: AC | undefined;
      } & Shape &
        StateNode<States> &
        WithTransitions<
          NoInfer<States>,
          C & { _context: NoInfer<CTX> },
          StatePaths<NoInfer<States>>,
          {}
        >,
      options?: {
        skipEnterActionsOnInit?: boolean | undefined;
      }
    ): Slice<{ context: CTX; state: string }, AC>;
  } {
    const {
      applyTransitionHandler,
      applyTransitionGuard,
      applyTransitionUpdate,
      initAction,
    } = sliceConfig;

    function getHandler<C extends MachineSliceConfig>(
      lookup: Lookup<C>,
      state: string[],
      action: ActionBase,
      context: C['_context']
    ): { handler: C['_transition_handler']; statePrefix: string } | undefined {
      const statePath = getStatePath(state);
      const stateActions = lookup[statePath];

      if (stateActions !== undefined) {
        const actionHandler = stateActions.handlers[action.tag];

        if (actionHandler !== undefined) {
          const { guard } = applyTransitionHandler(
            context,
            action,
            actionHandler
          );

          if (
            guard === undefined ||
            applyTransitionGuard(context, action, guard)
          ) {
            return {
              handler: actionHandler,
              statePrefix: stateActions.statePrefix,
            };
          }
        }
      }

      if (state.length === 0) {
        return undefined;
      }

      return getHandler(lookup, state.slice(0, -1), action, context);
    }

    return {
      create<
        States extends Record<string, any>,
        CTX,
        AC extends Record<string, any>,
      >(
        config: {
          name?: string | undefined;
          context?: OptLazy<CTX> | undefined;
          actions?: AC | undefined;
        } & Shape &
          StateNode<States>,
        options: {
          skipEnterActionsOnInit?: boolean | undefined;
        } = {}
      ): Slice<{ context: CTX; state: string }, AC> {
        const {
          name = 'anonMachineSlice',
          context,
          actions = {} as AC,
        } = config;

        const lookup = createLookup<C>(config);

        const { skipEnterActionsOnInit = false } = options;

        function applyEnterUpdates(
          _context: CTX,
          path: string[],
          action: C['_action_type'],
          fromIndex = 0
        ): CTX {
          let newContext = _context;

          for (let i = fromIndex; i < path.length; i++) {
            const partPath = getStatePath(path.slice(0, i + 1));

            const h = lookup[partPath];
            if (h.enter?.update) {
              if (
                h.enter.guard === undefined ||
                applyTransitionGuard(newContext, action, h.enter.guard)
              ) {
                newContext = applyTransitionUpdate(
                  newContext,
                  action,
                  h.enter.update
                );
              }
            }
          }

          return newContext;
        }

        const reducer = Reducer.createOutput<
          ActionBase,
          { context: CTX; state: string }
        >(
          (): { context: CTX; state: string } => {
            let initContext = OptLazy(context) as CTX;
            const initStatePath = getInitState(config);
            const state = getStatePath(initStatePath);

            if (!skipEnterActionsOnInit) {
              initContext = applyEnterUpdates(
                initContext,
                initStatePath,
                initAction
              );
            }

            return {
              context: initContext,
              state,
            };
          },
          (fullState, action) => {
            const { context, state } = fullState;

            const statePath = fromStatePath(state);

            const transitionHandler = getHandler(
              lookup,
              statePath,
              action,
              context
            );

            if (transitionHandler === undefined) {
              return fullState;
            }

            const handlerInfo = applyTransitionHandler(
              context,
              action,
              transitionHandler.handler
            );

            const { update, to } = handlerInfo;

            let newContext = context;

            let finalTo = to;

            if (finalTo !== undefined) {
              if (finalTo !== undefined) {
                if (!finalTo.startsWith('.')) {
                  finalTo = `${transitionHandler.statePrefix}${to}`;
                }
              }

              const toStatePath = fromStatePath(finalTo);
              let index = 0;
              while (
                statePath[index] === toStatePath[index] &&
                index < statePath.length &&
                index < toStatePath.length
              ) {
                index++;
              }

              for (let i = statePath.length - 1; i >= index; i--) {
                const partPath = getStatePath(statePath.slice(0, i + 1));
                const h = lookup[partPath];
                if (h.exit?.update) {
                  if (
                    h.exit.guard === undefined ||
                    applyTransitionGuard(newContext, action, h.exit.guard)
                  ) {
                    newContext = applyTransitionUpdate(
                      newContext,
                      action,
                      h.exit.update
                    );
                  }
                }
              }

              newContext = applyEnterUpdates(
                newContext,
                toStatePath,
                action,
                index
              );
            }

            if (update !== undefined) {
              newContext = applyTransitionUpdate(newContext, action, update);
            }

            if (context === newContext && state === (finalTo ?? state)) {
              return fullState;
            }

            return { context: newContext, state: finalTo ?? state };
          },
          (fullState) => fullState
        );

        return {
          name,
          reducer,
          actions,
        };
      },
    };
  }
}
