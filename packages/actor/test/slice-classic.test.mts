import { Action, Slice } from '../src/main/index.mjs';

describe('Slice', () => {
  it('empty slice', () => {
    const initState = { count: 0 };

    const slice = Slice.create({ initState, actions: {} });

    const action = Action.create();

    expect(slice.actions).toEqual({});
    expect(slice.reducer.init()).toBe(initState);
    expect(
      slice.reducer.next(slice.reducer.init(), action(), 0, () => {})
    ).toBe(initState);
  });

  it('creates and handles actions', () => {
    const initState = { count: 0 };

    const slice = Slice.create({
      initState,
      actions: {
        inc: (state) => ({ count: state.count + 1 }),
      },
    });

    expect(
      slice.reducer.next(slice.reducer.init(), slice.actions.inc(), 0, () => {})
    ).toEqual({ count: 1 });
  });

  it('creates and handles actions with parameters', () => {
    const initState = { count: 0 };

    const slice = Slice.create({
      initState,
      actions: {
        inc: (state, v1: number, v2: number) => ({
          count: state.count + v1 + v2,
        }),
      },
    });

    expect(
      slice.reducer.next(
        slice.reducer.init(),
        slice.actions.inc(1, 2),
        0,
        () => {}
      )
    ).toEqual({ count: 3 });
  });

  it('handles fallback', () => {
    const initState = { count: 0 };

    const slice = Slice.create({
      initState,
      actions: {
        inc: (state) => ({
          count: state.count + 1,
        }),
      },
      fallback: () => ({ count: -3 }),
    });

    expect(
      slice.reducer.next(slice.reducer.init(), slice.actions.inc(), 0, () => {})
    ).toEqual({ count: 1 });

    const action = Action.create();

    expect(
      slice.reducer.next(slice.reducer.init(), action(), 0, () => {})
    ).toEqual({ count: -3 });
  });

  it('handles custom fallback', () => {
    const initState = { count: 0 };

    const action = Action.create();

    const slice = Slice.create({
      initState,
      actions: {
        inc: (state) => ({
          count: state.count + 1,
        }),
      },
      fallback: (s, a) => {
        if (action.match(a)) {
          return { count: -3 };
        }

        return s;
      },
    });

    expect(
      slice.reducer.next(slice.reducer.init(), slice.actions.inc(), 0, () => {})
    ).toEqual({ count: 1 });

    expect(
      slice.reducer.next(slice.reducer.init(), action(), 0, () => {})
    ).toEqual({ count: -3 });

    const action2 = Action.create();

    expect(
      slice.reducer.next(slice.reducer.init(), action2(), 0, () => {})
    ).toEqual({ count: 0 });
  });

  it('can include actions', () => {
    const initState = { count: 0 };

    const increaseAction = Action.create<number>();

    const slice = Slice.create({
      initState,
      actions: {
        inc: (state) => ({
          count: state.count + 1,
        }),
      },
      includeActions: (include) => ({
        ...include(increaseAction, (s, a) => ({ count: s.count + a.payload })),
      }),
    });

    expect(
      slice.reducer.next(slice.reducer.init(), slice.actions.inc(), 0, () => {})
    ).toEqual({ count: 1 });

    expect(
      slice.reducer.next(slice.reducer.init(), increaseAction(5), 0, () => {})
    ).toEqual({ count: 5 });
  });
});
