import { SlicePatch } from 'patch/slice-patch.mjs';
import type { Slice } from './slice.mjs';
import type { Actor } from './actor.mjs';
import type { Action } from './action.mjs';

export type LoaderState<R, E> =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'error'; error: E }
  | { type: 'loaded'; data: R };

export interface LoaderActions<R, E> extends Actor.ActionsDefinition {
  setIdle: Action.Creator<[], []>;
  setLoading: Action.Creator<[], []>;
  setError: Action.Creator<[error: E], [error: E]>;
  setLoaded: Action.Creator<[data: R], [data: R]>;
}

export function createLoader<R, E = unknown>(): Slice<
  LoaderState<R, E>,
  LoaderActions<R, E>
> {
  return SlicePatch.create({
    initState: {
      type: 'idle',
    } as LoaderState<R, E>,
    actions: {
      setIdle: () => ({ type: 'idle' }) as const,
      setLoading: () => ({ type: 'loading' }) as const,
      setError: (error: E) => ({ type: 'error', error }) as const,
      setLoaded: (data: R) => ({ type: 'loaded', data }) as const,
    },
  });
}

export function withLoader<
  R,
  A extends Actor<{
    _state: LoaderState<R, E>;
    _actions: LoaderActions<R, E>;
    _dispatch: any;
    _enhanced: any;
  }>,
  E = unknown,
  ARGS extends any[] = [],
>(
  loaderActor: A,
  fn: (...args: ARGS) => R | Promise<R>
): {
  load: (...args: ARGS) => Promise<void>;
  unload: () => Promise<void>;
} {
  return {
    async load(...args: ARGS): Promise<void> {
      loaderActor.actions.setLoading();
      try {
        const data = await fn(...args);
        loaderActor.actions.setLoaded(data);
      } catch (error) {
        loaderActor.actions.setError(error);
      }
    },
    async unload(): Promise<void> {
      loaderActor.actions.setIdle();
    },
  };
}
