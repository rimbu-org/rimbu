import { getAt, type Path } from '@rimbu/deep';
import type { Reducer } from '@rimbu/stream';
import {
  Observable,
  type ActionBase,
  type SimplyOverride,
  type Subscribable,
} from './internal.mjs';

export interface Actor<S, Tp extends Actor.Types = Actor.Types>
  extends Actor.Derived<S, Tp> {
  get fullState(): Actor.FullState<S>;
  setFullState(fullState: Actor.FullState<S>): void;
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

function builder<S, Tp extends Actor.Types>(
  config: Actor.Config<S, Tp['_actions']>,
  middleware: any[] = []
): Actor.Builder<S, Tp> {
  const result: Actor.Builder<S, Tp> = {
    addMiddleware: (fn): any => {
      if (!fn) {
        return result;
      }

      return builder(config, [...middleware, fn]);
    },
    build: (): any => {
      const actor = new ActorImpl(config.reducer);

      if (middleware.length > 0) {
        for (const mw of middleware) {
          const originalDispatch = actor.dispatch;
          actor.dispatch = mw(originalDispatch, actor);
        }
      }

      actor.actions = createDispatchActions(config.actions, actor.dispatch);
      return actor;
    },
  };

  return result;
}

abstract class ActorBase<S, Tp extends Actor.Types>
  implements Actor.Derived<S, Tp>
{
  readonly #observable: Observable.Lazy<S>;

  abstract dispatch: Actor.BaseDispatchFunction;

  actions: any;

  constructor(observable: Observable.Lazy<S>) {
    this.#observable = observable;
  }

  get state(): S {
    return this.#observable.value;
  }

  get observable(): Observable.Lazy<S> {
    return this.#observable;
  }

  asObservable(): Observable<S> {
    return this.#observable;
  }

  get subscribe(): Subscribable.Fn {
    return this.#observable.subscribe;
  }

  focus(path: any): any {
    const result = new DerivedActorImpl(
      this.dispatch,
      this.observable.select(path) as Observable.Lazy<any>
    );
    result.actions = getAt(this.actions, path as any) as any;

    return result;
  }
}

class ActorImpl<S, Tp extends Actor.Types>
  extends ActorBase<S, Tp>
  implements Actor<S, Tp>
{
  readonly #reducer: Actor.ActionReducer<S>;

  #reducerState: any;
  #halted = false;
  #index = 0;

  constructor(reducer: Actor.ActionReducer<S>) {
    super(
      Observable.createLazy(() =>
        this.#reducer.stateToResult(
          this.#reducerState,
          this.#index,
          this.#halted
        )
      )
    );
    this.#reducer = reducer;
    this.#reducerState = reducer.init(this.#halt);
  }

  readonly #halt = (): void => {
    this.#halted = true;
  };

  get fullState(): Actor.FullState<S> {
    return {
      index: this.#index,
      halted: this.#halted,
      state: this.state,
      reducerState: this.#reducer.cloneState(this.#reducerState),
    };
  }

  setFullState(fullState: Actor.FullState<S>): void {
    this.#index = fullState.index;
    this.#halted = fullState.halted;
    this.#reducerState = this.#reducer.cloneState(fullState.reducerState);

    this.observable.notifyChange();
  }

  dispatch: Actor.BaseDispatchFunction = (action: ActionBase): void => {
    if (this.#halted) {
      return;
    }
    this.#reducerState = this.#reducer.next(
      this.#reducerState,
      action,
      this.#index++,
      this.#halt
    );

    this.observable.notifyChange();
  };
}

class DerivedActorImpl<S, Tp extends Actor.Types> extends ActorBase<S, Tp> {
  constructor(
    readonly dispatch: Actor.BaseDispatchFunction,
    stateObservable: Observable.Lazy<S>
  ) {
    super(stateObservable);
  }
}

export namespace Actor {
  export interface Derived<S, Tp extends Actor.Types>
    extends Subscribable.WithSubscription {
    readonly actions: Actor.ActionsToDispatch<Tp['_actions'], Tp['_dispatch']>;
    readonly dispatch: Tp['_dispatch'];

    get state(): S;

    asObservable(): Observable<S>;

    focus<P extends Path.Set<S> & Path.Set<Tp['_actions']>>(
      path: P
    ): Actor<
      Path.Result<S, P>,
      SimplyOverride<
        Tp,
        {
          _actions: Path.Result<Tp['_actions'], P>;
        }
      >
    >;
  }

  export type ActionReducer<S> = Reducer<ActionBase, S>;

  export interface FullState<S> {
    readonly index: number;
    readonly halted: boolean;
    readonly state: S;
    readonly reducerState: any;
  }

  export interface Types {
    readonly _actions: Actor.ActionsDefinition;
    readonly _dispatch: Actor.BaseDispatchFunction;
  }

  export type BaseDispatchFunction = (...args: any[]) => any;

  export type DefaultDispatchFunction = (action: ActionBase) => void;

  export type ActionsDefinition = {
    readonly [key: string]:
      | ActionBase.Creator<any, any[]>
      | ActionsDefinition
      | undefined;
  };

  export type ActionsToDispatch<
    AC extends Actor.ActionsDefinition,
    D extends Actor.BaseDispatchFunction,
  > = {
    readonly [K in keyof AC]: AC[K] extends (...args: infer A) => any
      ? (...args: A) => ReturnType<D>
      : ActionsToDispatch<AC[K] & Actor.ActionsDefinition, D>;
  };

  export type Listener = () => void;

  export type Unsubscribe = () => void;

  export interface Config<S, AC extends Actor.ActionsDefinition> {
    readonly reducer: Actor.ActionReducer<S>;
    readonly actions?: AC | undefined;
  }

  export type Middleware<
    S,
    Tp extends Actor.Types,
    D extends Actor.BaseDispatchFunction,
  > = (
    dispatch: Tp['_dispatch'],
    actor: Omit<Actor<S, Tp>, 'dispatch' | 'actions'>
  ) => D;

  export interface Builder<S, Tp extends Actor.Types> {
    readonly addMiddleware: <D extends Actor.BaseDispatchFunction>(
      fn?: Actor.Middleware<S, Tp, D> | undefined
    ) => Builder<S, SimplyOverride<Tp, { _dispatch: D }>>;
    readonly build: () => Actor<S, Tp>;
  }

  export function configure<S, AC extends Actor.ActionsDefinition>(
    config: Actor.Config<S, AC>
  ): Builder<
    S,
    {
      _actions: AC;
      _dispatch: Actor.DefaultDispatchFunction;
    }
  > {
    return builder(config);
  }
}
