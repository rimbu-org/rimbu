import { SliceImmer } from '../src/immer';
import { Action } from '../src/main';

describe('SliceImmer', () => {
  it('empty slice', () => {
    const initState = { count: 0 };

    const slice = SliceImmer.create({ initState, actions: {} });

    const action = Action.create();

    expect(slice.actions).toEqual({});
    expect(slice.reducer.init).toBe(initState);
    expect(slice.reducer.next(slice.reducer.init, action(), 0, () => {})).toBe(
      initState
    );
  });

  it('creates and handles actions', () => {
    const initState = { count: 0 };

    const slice = SliceImmer.create({
      initState,
      actions: {
        inc: (state) => {
          state.count++;
        },
      },
    });

    expect(
      slice.reducer.next(slice.reducer.init, slice.actions.inc(), 0, () => {})
    ).toEqual({ count: 1 });
  });

  it('creates and handles actions with parameters', () => {
    const initState = { count: 0 };

    const slice = SliceImmer.create({
      initState,
      actions: {
        inc: (state, v1: number, v2: number) => {
          state.count += v1 + v2;
        },
      },
    });

    expect(
      slice.reducer.next(
        slice.reducer.init,
        slice.actions.inc(1, 2),
        0,
        () => {}
      )
    ).toEqual({ count: 3 });
  });

  it('handles fallback', () => {
    const initState = { count: 0 };

    const slice = SliceImmer.create({
      initState,
      actions: {
        inc: (state) => {
          state.count++;
        },
      },
      fallback: (state) => {
        state.count = -3;
      },
    });

    expect(
      slice.reducer.next(slice.reducer.init, slice.actions.inc(), 0, () => {})
    ).toEqual({ count: 1 });

    const action = Action.create();

    expect(
      slice.reducer.next(slice.reducer.init, action(), 0, () => {})
    ).toEqual({ count: -3 });
  });

  it('handles custom fallback', () => {
    const initState = { count: 0 };

    const action = Action.create();

    const slice = SliceImmer.create({
      initState,
      actions: {
        inc: (state) => {
          state.count++;
        },
      },
      fallback: (s, a) => {
        if (action.match(a)) {
          s.count = -3;
        }
      },
    });

    expect(
      slice.reducer.next(slice.reducer.init, slice.actions.inc(), 0, () => {})
    ).toEqual({ count: 1 });

    expect(
      slice.reducer.next(slice.reducer.init, action(), 0, () => {})
    ).toEqual({ count: -3 });

    const action2 = Action.create();

    expect(
      slice.reducer.next(slice.reducer.init, action2(), 0, () => {})
    ).toEqual({ count: 0 });
  });

  it('can include actions', () => {
    const initState = { count: 0 };

    const increaseAction = Action.create<number>();

    const slice = SliceImmer.create({
      initState,
      actions: {
        inc: (state) => {
          state.count++;
        },
      },
      includeActions: (include) => ({
        ...include(increaseAction, (s, a) => {
          s.count += a.payload;
        }),
      }),
    });

    expect(
      slice.reducer.next(slice.reducer.init, slice.actions.inc(), 0, () => {})
    ).toEqual({ count: 1 });

    expect(
      slice.reducer.next(slice.reducer.init, increaseAction(5), 0, () => {})
    ).toEqual({ count: 5 });
  });
});
