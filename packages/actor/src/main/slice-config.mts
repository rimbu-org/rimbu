import { type OptLazy } from '@rimbu/common';

import { Lookup, type ActionBase, type Slice } from './internal.mjs';

/**
 * Utility type to determine the types to be used in the slice configuration.
 */
export interface SliceConfig {
  /**
   * The slice state type
   */
  _state: unknown;

  /**
   * The action handler function arguments.
   */
  _action_handler_args: this['_action_handler_unknown'][];

  /**
   * The action handler unknown type (utility)
   */
  _action_handler_unknown: unknown;

  /**
   * The action handler function type.
   */
  _action_handler: (...args: this['_action_handler_args']) => unknown;

  _include_handler_args: unknown[];

  _include_action_type: ActionBase;

  _include_handler: (
    ...args: this['_include_handler_args']
  ) => this['_action_handler_result'];

  /**
   * The action type used for action handlers.
   */
  _action_type: ActionBase;

  /**
   * The action creator function type.
   */
  _action_creator: ActionBase.Creator<
    this['_action_type'],
    this['_action_creator_params']
  >;

  /**
   * The action creator parameters.
   */
  _action_creator_params: unknown[];

  /**
   * The action handler function result type.
   */
  _action_handler_result: unknown;
}

export namespace SliceConfig {
  /**
   * Function type to use to apply the given action handler.
   * @typeparam C - the slice configuration type
   */
  export type ApplyHandler<C extends SliceConfig> = <S>(
    state: S,
    action: (C & { _state: S })['_action_type'],
    handler: (C & { _state: S })['_action_handler']
  ) => (C & { _state: S })['_action_handler_result'];

  export type ApplyIncluder<C extends SliceConfig> = <S, AC extends ActionBase>(
    state: S,
    action: AC,
    includeHandler: (C & {
      _state: S;
      _include_action_type: AC;
    })['_include_handler']
  ) => (C & { _state: S })['_action_handler_result'];

  /**
   * Function type to use to apply the given action handler result.
   * @typeparam C - the slice configuration type
   */
  export type ApplyHandlerResult<C extends SliceConfig> = <S>(
    state: S,
    action: ActionBase,
    handlerResult: (C & { _state: S })['_action_handler_result']
  ) => S;

  /**
   * Function type to use to include external actions in the slice.
   * @typeparam S - the state type
   * @typeparam C - the slice configuration type
   */
  export type ActionIncluder<S, C extends SliceConfig> = <
    AC extends ActionBase,
  >(
    action: ActionBase.Creator<AC, any[]>,
    handler: (C & { _state: S; _include_action_type: AC })['_include_handler']
  ) => Record<string, (state: S, action: ActionBase) => S>;

  /**
   * The result type of an action include function.
   * @typeparam S - the state type
   * @typeparam C - the slice configuration type
   */
  export type ActionIncluderResult<S, C extends SliceConfig> = Record<
    string,
    (
      state: S,
      action: ActionBase
    ) => (C & { _state: S })['_action_handler_result']
  >;

  /**
   * The type used to define slice actions
   * @typeparam O - object containing string keys and and action handler for each key
   * @typeparam C - the slice configuration type
   */
  export type SliceActions<O, C extends SliceConfig> = {
    [K in keyof O]: (C & {
      _action_handler: O[K];
    })['_action_creator'];
  };

  /**
   * Type used to define a lookup action object.
   * @typeparam S - the state type
   * @typeparam C - the slice configuration type
   */
  export type ActionDefinition<S, C extends SliceConfig> = Lookup<
    (C & {
      _state: S;
      _action_handler_unknown: any;
    })['_action_handler'],
    (C & { _state: S })['_include_handler']
  >;

  export type IncludeActions<S, C extends SliceConfig> = (
    includer: SliceConfig.ActionIncluder<S, C>
  ) => SliceConfig.ActionIncluderResult<S, C>;

  /**
   * Returns a configured object that can be used to produce slices with the
   * given configuration.
   * @param sliceConfig - the configuration for the slice creator.
   */
  export function configure<C extends SliceConfig>(sliceConfig: {
    applyHandler: SliceConfig.ApplyHandler<C>;
    applyIncluder: SliceConfig.ApplyIncluder<C>;
    applyHandlerResult: SliceConfig.ApplyHandlerResult<C>;
    createAction: (
      sliceName: string,
      actionName: string
    ) => C['_action_creator'];
  }): {
    create<S, LU extends SliceConfig.ActionDefinition<S, C>>(
      config: LU & {
        name?: string;
        initState: OptLazy<S>;
        includeActions?: SliceConfig.IncludeActions<S, C> | undefined;
      }
    ): Slice<S, SliceConfig.SliceActions<LU['actions'], C>>;
  } {
    const { createAction, applyHandler, applyHandlerResult, applyIncluder } =
      sliceConfig;

    return {
      create<S, LU extends SliceConfig.ActionDefinition<S, C>>(
        config: LU & {
          name?: string;
          initState: OptLazy<S>;
          includeActions?: (
            includer: SliceConfig.ActionIncluder<S, C>
          ) => SliceConfig.ActionIncluderResult<S, C>;
        }
      ): Slice<S, SliceConfig.SliceActions<LU['actions'], C>> {
        const {
          name = 'anonSlice',
          initState,
          actions,
          fallback,
          includeActions,
        } = config;

        const actionCreators = {} as any;
        const actionHandlers: Record<
          string,
          (state: S, action: ActionBase) => S
        > =
          includeActions?.((actionCreator, actionHandler) => ({
            [actionCreator.actionTag]: (state, action): S =>
              applyHandlerResult(
                state,
                action,
                applyIncluder(state, action, actionHandler)
              ),
          })) ?? ({} as any);

        for (const actionName in actions) {
          const action = createAction(name, actionName);
          actionCreators[actionName] = action;
          actionHandlers[action.actionTag] = (state, action): S =>
            applyHandlerResult(
              state,
              action,
              applyHandler(state, action, actions[actionName])
            );
        }

        const fallbackHandler =
          undefined === fallback
            ? undefined
            : (state: S, action: ActionBase): S =>
                applyHandlerResult(
                  state,
                  action,
                  applyIncluder(state, action, fallback)
                );

        const reducer = Lookup.create<
          S,
          (state: S, action: ActionBase) => S,
          (state: S, action: ActionBase) => S
        >(
          initState,
          {
            actions: actionHandlers,
            fallback: fallbackHandler,
          },
          (state, action, actionHandler) => actionHandler(state, action),
          (state, action, fallbackHandler) => fallbackHandler(state, action)
        );

        return {
          name,
          actions: actionCreators,
          reducer,
        };
      },
    };
  }
}
