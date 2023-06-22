import type { OptLazy } from '@rimbu/common';

import { Lookup, type ActionBase, type Slice } from './internal.mjs';

/**
 * Utility type to determine the types to be used in the slice configuration.
 */
export interface SliceConfig {
  /**
   * The slice state type
   */
  _STATE: unknown;

  /**
   * The action handler function arguments.
   */
  _ACTION_HANDLER_ARGS: this['_ACTION_HANDLER_UNKNOWN'][];

  /**
   * The action handler unknown type (utility)
   */
  _ACTION_HANDLER_UNKNOWN: unknown;

  /**
   * The action handler function type.
   */
  _ACTION_HANDLER: (...args: this['_ACTION_HANDLER_ARGS']) => unknown;

  _INCLUDE_HANDLER_ARGS: unknown[];

  _INCLUDE_ACTION_TYPE: ActionBase;

  _INCLUDE_HANDLER: (
    ...args: this['_INCLUDE_HANDLER_ARGS']
  ) => this['_ACTION_HANDLER_RESULT'];

  /**
   * The action type used for action handlers.
   */
  _ACTION_TYPE: ActionBase;

  /**
   * The action creator function type.
   */
  _ACTION_CREATOR: ActionBase.Creator<
    this['_ACTION_TYPE'],
    this['_ACTION_CREATOR_PARAMS']
  >;

  /**
   * The action creator parameters.
   */
  _ACTION_CREATOR_PARAMS: unknown[];

  /**
   * The action handler function result type.
   */
  _ACTION_HANDLER_RESULT: unknown;
}

export namespace SliceConfig {
  /**
   * Function type to use to apply the given action handler.
   * @typeparam C - the slice configuration type
   */
  export type ApplyHandler<C extends SliceConfig> = <S>(
    state: S,
    action: (C & { _STATE: S })['_ACTION_TYPE'],
    handler: (C & { _STATE: S })['_ACTION_HANDLER']
  ) => (C & { _STATE: S })['_ACTION_HANDLER_RESULT'];

  export type ApplyIncluder<C extends SliceConfig> = <S, AC extends ActionBase>(
    state: S,
    action: AC,
    includeHandler: (C & {
      _STATE: S;
      _INCLUDE_ACTION_TYPE: AC;
    })['_INCLUDE_HANDLER']
  ) => (C & { _STATE: S })['_ACTION_HANDLER_RESULT'];

  /**
   * Function type to use to apply the given action handler result.
   * @typeparam C - the slice configuration type
   */
  export type ApplyHandlerResult<C extends SliceConfig> = <S>(
    state: S,
    action: ActionBase,
    handlerResult: (C & { _STATE: S })['_ACTION_HANDLER_RESULT']
  ) => S;

  /**
   * Function type to use to include external actions in the slice.
   * @typeparam S - the state type
   * @typeparam C - the slice configuration type
   */
  export type ActionIncluder<S, C extends SliceConfig> = <
    AC extends ActionBase
  >(
    action: ActionBase.Creator<AC, any[]>,
    handler: (C & { _STATE: S; _INCLUDE_ACTION_TYPE: AC })['_INCLUDE_HANDLER']
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
    ) => (C & { _STATE: S })['_ACTION_HANDLER_RESULT']
  >;

  /**
   * The type used to define slice actions
   * @typeparam O - object containing string keys and and action handler for each key
   * @typeparam C - the slice configuration type
   */
  export type SliceActions<O, C extends SliceConfig> = {
    [K in keyof O]: (C & {
      _ACTION_HANDLER: O[K];
    })['_ACTION_CREATOR'];
  };

  /**
   * Type used to define a lookup action object.
   * @typeparam S - the state type
   * @typeparam C - the slice configuration type
   */
  export type ActionDefinition<S, C extends SliceConfig> = Lookup<
    (C & {
      _STATE: S;
      _ACTION_HANDLER_UNKNOWN: any;
    })['_ACTION_HANDLER'],
    (C & { _STATE: S })['_INCLUDE_HANDLER']
  >;

  /**
   * Returns a configured object that can be used to produce slices with the
   * given configuration.
   * @param config - the configuration for the slice creator.
   */
  export function configure<C extends SliceConfig>(config: {
    applyHandler: SliceConfig.ApplyHandler<C>;
    applyIncluder: SliceConfig.ApplyIncluder<C>;
    applyHandlerResult: SliceConfig.ApplyHandlerResult<C>;
    createAction: (
      sliceName: string,
      actionName: string
    ) => C['_ACTION_CREATOR'];
  }): {
    create<S, LU extends SliceConfig.ActionDefinition<S, C>>(
      config: LU & {
        name?: string;
        initState: OptLazy<S>;
        includeActions?: (
          includer: SliceConfig.ActionIncluder<S, C>
        ) => SliceConfig.ActionIncluderResult<S, C>;
      }
    ): Slice<S, SliceConfig.SliceActions<LU['actions'], C>>;
  } {
    const { createAction, applyHandler, applyHandlerResult, applyIncluder } =
      config;

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
        const { name, initState, actions, fallback, includeActions } = config;

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
          const action = createAction(name ?? 'anonSlice', actionName);
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
          actions: actionCreators,
          reducer,
        };
      },
    };
  }
}
