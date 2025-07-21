import { Actor, createLoader, withLoader } from 'main/index.mjs';

describe('Loader', () => {
  it('works for sync functions', async () => {
    const loaderSlice = createLoader<{ value: number }>();

    const actor = Actor.configure(loaderSlice).build();

    const fn = vitest.fn().mockReturnValue({ value: 1 });

    const loader = withLoader(actor, fn);
    expect(actor.state).toEqual({ type: 'idle' });
    await loader.load();
    expect(actor.state).toEqual({ type: 'loaded', data: { value: 1 } });
    const error = Error('error');
    fn.mockImplementation(() => {
      throw error;
    });
    await loader.load();
    expect(actor.state).toEqual({ type: 'error', error });
    await loader.unload();
    expect(actor.state).toEqual({ type: 'idle' });
  });

  it('works for async functions', async () => {
    const loaderSlice = createLoader<{ value: number }>();

    const actor = Actor.configure({
      ...loaderSlice,
    }).build();

    const fn = vitest.fn().mockResolvedValue({ value: 1 });

    const loader = withLoader(actor, fn);
    expect(actor.state).toEqual({ type: 'idle' });
    await loader.load();
    expect(actor.state).toEqual({ type: 'loaded', data: { value: 1 } });
    const error = Error('error');
    fn.mockRejectedValue(error);
    await loader.load();
    expect(actor.state).toEqual({ type: 'error', error });
    await loader.unload();
    expect(actor.state).toEqual({ type: 'idle' });
  });

  it('sets state to loading while promise is not resolved', async () => {
    const loaderSlice = createLoader<{ value: number }>();

    const actor = Actor.configure({
      ...loaderSlice,
    }).build();

    let resolve: (value: unknown) => void = null as any;

    const promise = new Promise((res) => (resolve = res));
    const fn = vitest.fn().mockReturnValue(promise);

    const loader = withLoader(actor, fn);
    fn.mockReturnValue(promise);

    const op = loader.load();

    expect(actor.state).toEqual({ type: 'loading' });

    resolve({ value: 1 } as any);
    await op;

    expect(actor.state).toEqual({ type: 'loaded', data: { value: 1 } });
  });

  it('propagates arguments to load', async () => {
    const loaderSlice = createLoader<{ value: number }>();

    const actor = Actor.configure(loaderSlice).build();

    const loader = withLoader(actor, async (value: number) => ({ value }));
    await loader.load(5);
    expect(actor.state).toEqual({ type: 'loaded', data: { value: 5 } });

    await loader.load(3);
    expect(actor.state).toEqual({ type: 'loaded', data: { value: 3 } });
  });
});
