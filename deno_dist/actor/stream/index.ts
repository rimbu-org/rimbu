import { AsyncStream } from '../../stream/mod.ts';

import type { ActionBase, Actor } from '../main/internal.ts';

export type ActorStream<A extends Actor.Base<S>, S> = AsyncStream<
  ActorStream.Event<A, S>
>;

export namespace ActorStream {
  export type Event<
    A extends Actor.Base<S>,
    S,
    AC extends ActionBase = ActionBase
  > = {
    action: AC;
    prevState: S;
    state: S;
    actor: A;
  };

  export function enhancer<
    A extends Actor.Base<S> & Actor.Dispatch<D>,
    D extends Actor.DispatchFunction,
    S
  >(
    actor: A
  ): A & {
    stream(): ActorStream<A, S>;
  } {
    const [control, stream] = AsyncStream.live<ActorStream.Event<A, S>>();

    const originalDispatch = actor.dispatch;

    const result: any = actor;

    result.stream = (): ActorStream<A, S> => stream;

    result.dispatch = (...args: any[]): any => {
      const prevState = actor.getState();
      const dispatchResult = originalDispatch(...args);
      const state = actor.getState();

      control.submit({ action: args[0], prevState, state, actor: result });

      return dispatchResult;
    };

    return result;
  }
}
