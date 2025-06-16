import type { Reducer } from '@rimbu/stream';

import { type Path, getAt, type Selector, select } from '@rimbu/deep';
import type { ActionBase } from './internal.mjs';
import type { Override, Simplify, SimplyOverride } from './utils.mjs';

/**
 *
 */
export type Actor<Tp extends Actor.Types = Actor.Types> = Override<
  {
    readonly actions: Actor.ActionsToDispatch<Tp['_actions'], Tp['_dispatch']>;
    readonly dispatch: Tp['_dispatch'];
    getState(): Tp['_state'];
    subscribe(listener: Actor.Listener): Actor.Unsubscribe;
    focus<P extends Path.Set<Tp['_state']> & Path.Set<Tp['_actions']>>(
      path: P
    ): Actor<
      SimplyOverride<
        Tp,
        {
          _state: Path.Result<Tp['_state'], P>;
          _actions: Path.Result<Tp['_actions'], P>;
        }
      >
    >;
    select<SL extends Selector<Tp['_state']>>(
      selector: SL
    ): Actor<SimplyOverride<Tp, { _state: Selector.Result<Tp['_state'], SL> }>>;
  },
  Tp['_enhanced']
>;

function builder<Tp extends Actor.Types, AC extends Actor.ActionsDefinition>(
  actor: Actor<Tp>,
  actionsDefinition: AC | undefined
): Actor.Builder<Tp> {
  return {
    build: (): Actor<Tp> => {
      const actions = createDispatchActions(
        actionsDefinition,
        actor.dispatch as any
      );

      return {
        ...actor,
        actions,
        focus: (path: any): any => {
          return {
            ...actor,
            actions: getAt(actions, path),
            getState: () => getAt((actor.getState as any)(), path),
          };
        },
        select: (selector: any): any => {
          return {
            ...actor,
            getState: () => select((actor.getState as any)(), selector),
          };
        },
      };
    },
    addMiddleware: (fn): any => {
      const dispatch = fn({
        getState: actor.getState,
        dispatch: actor.dispatch,
      } as any);

      return builder(
        {
          ...actor,
          dispatch,
        } as any,
        actionsDefinition
      ) as any;
    },
    addEnhancer: (fn): any =>
      builder({ ...actor, ...fn(actor) } as Actor, actionsDefinition),
  };
}

export namespace Actor {
  export type ActionReducer<S> = Reducer<ActionBase, S>;

  export interface AddMidlewareSource<Tp extends Actor.Types> {
    readonly dispatch: Tp['_dispatch'];
    getState(): Tp['_state'];
  }

  export interface Builder<Tp extends Actor.Types> {
    build(): Actor<Tp>;
    addMiddleware<D extends Actor.BaseDispatchFunction>(
      fn: (actor: Actor.AddMidlewareSource<Tp>) => D
    ): Builder<Override<Tp, { _dispatch: D }>>;
    addEnhancer<E>(
      fn: (actor: Actor<Tp>) => E & { dispatch?: never }
    ): Builder<Override<Tp, { _enhanced: Simplify<Tp['_enhanced'] & E> }>>;
  }

  export interface Types {
    _state: unknown;
    _actions: Actor.ActionsDefinition;
    _dispatch: Actor.BaseDispatchFunction;
    _enhanced: unknown;
  }

  export type BaseDispatchFunction = (...args: any[]) => any;

  export type DefaultDispatchFunction = (action: ActionBase) => void;

  export type ActionsDefinition = {
    [key: string]:
      | ActionBase.Creator<any, any[]>
      | ActionsDefinition
      | undefined;
  };

  export type ActionsToDispatch<
    AC extends Actor.ActionsDefinition,
    D extends Actor.BaseDispatchFunction,
  > = {
    [K in keyof AC]: AC[K] extends Actor.BaseDispatchFunction
      ? (...args: Parameters<AC[K]>) => ReturnType<D>
      : ActionsToDispatch<AC[K] & Actor.ActionsDefinition, D>;
  };

  export type Listener = () => void;

  export type Unsubscribe = () => void;

  export interface Config<S, AC extends Actor.ActionsDefinition> {
    reducer: Actor.ActionReducer<S>;
    actions?: AC | undefined;
  }

  export function configure<S, AC extends Actor.ActionsDefinition>(
    config: Actor.Config<S, AC>
  ): Builder<{
    _state: S;
    _actions: AC;
    _dispatch: Actor.DefaultDispatchFunction;
    _enhanced: unknown;
  }> {
    const { reducer } = config;
    let halted = false;

    const halt = (): void => {
      halted = true;
    };

    let reducerState = reducer.init(halt);
    let index = 0;
    const listeners = new Set<Actor.Listener>();
    const STALE_STATE = Symbol();
    let cacheState: S | typeof STALE_STATE = STALE_STATE;

    const dispatch = (action: ActionBase): void => {
      if (halted) {
        return;
      }

      const currentListeners = new Set(listeners);

      reducerState = reducer.next(reducerState, action, index++, halt);
      cacheState = STALE_STATE;

      for (const listener of currentListeners) {
        listener();
      }
    };

    const actor: Actor = {
      actions: undefined as any,
      getState: (): S => {
        if (STALE_STATE === cacheState) {
          cacheState = reducer.stateToResult(reducerState, index, halted);
        }
        return cacheState;
      },
      dispatch,
      subscribe: (listener: Actor.Listener): Actor.Unsubscribe => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      focus: undefined as any,
      select: undefined as any,
    };

    return builder(actor, config.actions) as any;
  }
}

function createDispatchActions<
  A extends Actor.ActionsDefinition,
  D extends Actor.BaseDispatchFunction,
>(source: A | undefined, dispatch: D): Actor.ActionsToDispatch<A, D> {
  const result: any = {};

  if (undefined === source) {
    return result;
  }

  for (const key in source) {
    const item = source[key];

    if (typeof item === 'function') {
      result[key] = (...args: any[]): any => dispatch(item(...args));
    } else {
      result[key] = createDispatchActions(item, dispatch);
    }
  }

  return result;
}
