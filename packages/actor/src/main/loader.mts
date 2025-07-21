import { type Action, type Actor, Slice } from '@rimbu/actor';

export type LoaderState<R> =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'error'; error: any }
  | { type: 'loaded'; data: R };

export interface LoaderActions<R> extends Actor.ActionsDefinition {
  setIdle: Action.Creator<[], []>;
  setLoading: Action.Creator<[], []>;
  setError: Action.Creator<[error: any], [error: any]>;
  setLoaded: Action.Creator<[data: R], [data: R]>;
}

export function createLoader<R>(
  options: {
    name?: string;
  } = {}
): Slice<LoaderState<R>, LoaderActions<R>> {
  const { name = 'ANON_LOADER' } = options;

  return Slice.create({
    name,
    initState: {
      type: 'idle',
    } as LoaderState<R>,
    actions: {
      setIdle: () => ({ type: 'idle' }),
      setLoading: () => ({ type: 'loading' }),
      setError: (_, error) => ({ type: 'error', error }),
      setLoaded: (_, data: R) => ({ type: 'loaded', data }),
    },
  });
}

export function withLoader<R, ARGS extends any[] = []>(
  loaderActor: Actor<
    LoaderState<R>,
    Actor.Types & { _actions: LoaderActions<R> }
  >,
  fn: (...args: ARGS) => R | Promise<R>,
  options: {
    mode?: 'multiple' | 'single';
  } = {}
): {
  load: (...args: ARGS) => Promise<void>;
  unload: () => Promise<void>;
} {
  const { mode = 'multiple' } = options;

  return {
    async load(...args: ARGS): Promise<void> {
      if (mode === 'single' && loaderActor.state.type === 'loading') {
        return;
      }

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
