import type { Reducer } from '../../stream/mod.ts';

import type { ActionBase } from './internal.ts';
/**
 *
 */
export interface Actor<
  S,
  D extends (...args: any[]) => any = (action: ActionBase) => void,
  ACS extends Actor.ActionsDefinition = Record<string, never>,
> extends Actor.Base<S>,
    Actor.Dispatch<D>,
    Actor.ActionsDispatch<ACS, D> {}

export namespace Actor {
  export type ActionReducer<S> = Reducer<ActionBase, S>;

  export interface Base<S> {
    getState(): S;
    subscribe(listener: Actor.Listener): Actor.Unsubscribe;
  }

  export type DispatchFunction = (...args: any[]) => any;

  export interface Dispatch<
    D extends Actor.DispatchFunction = (action: ActionBase) => void,
  > {
    dispatch: D;
  }

  export type ActionsDefinition = {
    [key: string]: Actor.DispatchFunction | ActionsDefinition | undefined;
  };

  export interface Actions<
    AC extends Actor.ActionsDefinition = Record<string, never>,
  > {
    actions: AC;
  }

  export type ActionsToDispatch<
    AC extends Actor.ActionsDefinition,
    D extends Actor.DispatchFunction,
  > = {
    [K in keyof AC]: AC[K] extends (...args: any[]) => any
      ? (...args: Parameters<AC[K]>) => ReturnType<D>
      : ActionsToDispatch<AC[K] & Actor.ActionsDefinition, D>;
  };

  export interface ActionsDispatch<
    AC extends Actor.ActionsDefinition,
    D extends Actor.DispatchFunction,
  > {
    actions: Actor.ActionsToDispatch<AC, D>;
  }

  export type StateType<A extends Actor.Base<any>> =
    A extends Actor.Base<infer S> ? S : unknown;

  export type Listener = () => void;

  export type Unsubscribe = () => void;

  export function configure<
    S,
    D extends Actor.DispatchFunction = (action: ActionBase) => void,
    AC extends Actor.ActionsDefinition = Record<string, never>,
    EnhancedActor extends Actor.Dispatch<any> &
      Actor.Actions<any> & { actionCreators: AC } = Actor<S, D, AC> & {
      actionCreators: AC;
    },
  >(config: {
    reducer: Actor.ActionReducer<S>;
    actions?: AC | undefined;
    middleware?: (actor: Actor<S, (action: ActionBase) => void, any>) => D;
    enhancer?: (
      actor: Actor<S, D, AC> & { actionCreators: AC }
    ) => EnhancedActor;
  }): EnhancedActor {
    const { reducer, middleware, enhancer, actions } = config;

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
      const currentListeners = new Set(listeners);

      if (!halted) {
        const newReducerState = reducer.next(
          reducerState,
          action,
          index++,
          halt
        );

        reducerState = newReducerState;
        cacheState = STALE_STATE;
      }

      for (const listener of currentListeners) {
        listener();
      }
    };

    const actor: any = {
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
    };

    if (undefined !== middleware) {
      actor.dispatch = middleware(actor);
    }

    const actorWithEnhancer: EnhancedActor = enhancer?.(actor) ?? actor;

    actorWithEnhancer.actions = createDispatchActions(
      actions,
      actorWithEnhancer
    );
    actorWithEnhancer.actionCreators = actions!;

    return actorWithEnhancer;
  }
}

function createDispatchActions<
  A extends Actor.ActionsDefinition,
  D extends Actor.DispatchFunction,
>(
  source: A | undefined,
  actor: { dispatch: D }
): Actor.ActionsToDispatch<A, D> {
  const result: any = {};

  if (undefined === source) {
    return result;
  }

  for (const key in source) {
    const item = source[key];

    if (typeof item === 'function') {
      result[key] = (...args: any[]): any => actor.dispatch(item(...args));
    } else {
      result[key] = createDispatchActions(item, actor);
    }
  }

  return result;
}
