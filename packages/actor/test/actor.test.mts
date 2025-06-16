import { Spy } from '@rimbu/spy';
import { Reducer } from '@rimbu/stream';

import { Action, Actor, Slice, type ActionBase } from '../src/main/index.mjs';
import { SlicePatch } from '../src/patch/index.mjs';

describe('Actor', () => {
  const action = Action.create();

  it('can be empty', () => {
    const act = Actor.configure({
      reducer: Reducer.combine({}),
    }).build();

    expect(act.getState()).toEqual({});

    act.dispatch(action());

    expect(act.getState()).toEqual({});
  });

  it('can have single slice', () => {
    const slice = SlicePatch.create({
      initState: { count: 0, total: 10 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }, { total: (v, p) => v + p.count }],
      },
    });

    const act = Actor.configure({
      ...slice,
    }).build();

    expect(act.getState()).toEqual({ count: 0, total: 10 });

    act.actions.inc();

    expect(act.getState()).toEqual({ count: 1, total: 11 });

    act.actions.inc();

    expect(act.getState()).toEqual({ count: 2, total: 13 });
  });

  it('can have multiple slices', () => {
    const counter = SlicePatch.create({
      initState: { count: 0, total: 10 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }, { total: (v, p) => v + p.count }],
      },
    });

    const toggle = SlicePatch.create({
      initState: false,
      actions: {},
      includeActions: (include) => ({
        ...include(counter.actions.inc, () => (v) => !v),
      }),
    });

    const act = Actor.configure({
      ...Slice.combine({
        counter,
        toggle,
      }),
    }).build();

    expect(act.getState()).toEqual({
      counter: { count: 0, total: 10 },
      toggle: false,
    });

    act.actions.counter.inc();

    expect(act.getState()).toEqual({
      counter: { count: 1, total: 11 },
      toggle: true,
    });

    act.actions.counter.inc();

    expect(act.getState()).toEqual({
      counter: { count: 2, total: 13 },
      toggle: false,
    });
  });

  it('subscribe', () => {
    const slice = SlicePatch.create({
      initState: { count: 0, total: 10 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }, { total: (v, p) => v + p.count }],
      },
    });

    const act = Actor.configure({
      ...slice,
    }).build();

    const fn = Spy.fn();

    act.subscribe(fn);

    expect(fn.nrCalls).toBe(0);

    act.actions.inc();

    expect(fn.nrCalls).toBe(1);
  });

  it('unsubscribes', () => {
    const slice = SlicePatch.create({
      initState: { count: 0, total: 10 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }, { total: (v, p) => v + p.count }],
      },
    });

    const act = Actor.configure({
      ...slice,
    }).build();

    const fn = Spy.fn();

    const unsubscribe = act.subscribe(fn);

    act.actions.inc();

    unsubscribe();

    fn.clearCalls();

    act.dispatch(slice.actions.inc());

    expect(fn.nrCalls).toBe(0);
  });

  it('subscribes only once', () => {
    const slice = SlicePatch.create({
      initState: { count: 0, total: 10 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }, { total: (v, p) => v + p.count }],
      },
    });

    const act = Actor.configure({
      ...slice,
    }).build();

    const fn = Spy.fn();

    const unsubscribe = act.subscribe(fn);
    act.subscribe(fn);

    act.actions.inc();

    expect(fn.nrCalls).toBe(1);

    unsubscribe();
    fn.clearCalls();

    act.actions.inc();

    expect(fn.nrCalls).toBe(0);
  });

  it('includes middleware', () => {
    const slice = SlicePatch.create({
      initState: { count: 0, total: 10 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }, { total: (v, p) => v + p.count }],
      },
    });

    const act = Actor.configure({
      ...slice,
    })
      .addMiddleware((actor) => {
        const originalDispatch = actor.dispatch;

        return (action: ActionBase) => {
          const preState = actor.getState();

          originalDispatch(action);

          return {
            preState,
            postState: actor.getState(),
          };
        };
      })
      .build();

    const result = act.actions.inc();

    expect(result).toEqual({
      preState: { count: 0, total: 10 },
      postState: { count: 1, total: 11 },
    });
  });

  it('includes enhancer', () => {
    const slice = SlicePatch.create({
      initState: { count: 0, total: 10 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }, { total: (v, p) => v + p.count }],
      },
    });

    const act = Actor.configure({
      ...slice,
    })
      .addEnhancer((actor) => ({
        dispatchTwice(action: ActionBase) {
          actor.dispatch(action);
          actor.dispatch(action);
        },
      }))
      .build();

    act.dispatchTwice(slice.actions.inc());

    expect(act.getState()).toEqual({
      count: 2,
      total: 13,
    });
  });

  it('creates actions to dispatch', () => {
    const counter = SlicePatch.create({
      initState: { count: 0, total: 10 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }, { total: (v, p) => v + p.count }],
      },
    });

    const toggle = SlicePatch.create({
      initState: false,
      actions: {},
      includeActions: (include) => ({
        ...include(counter.actions.inc, () => (v) => !v),
      }),
    });

    const act = Actor.configure({
      ...Slice.combine({ counter, toggle }),
    }).build();

    expect(act.actions.counter.inc).not.toBeUndefined();
    expect(act.actions.toggle).not.toBeUndefined();
  });

  it('does not dispatch when halted', () => {
    const slice = SlicePatch.create({
      initState: { count: 0, total: 10 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }, { total: (v, p) => v + p.count }],
      },
    });

    const act = Actor.configure({
      reducer: slice.reducer.takeInput(0),
      actions: slice.actions,
    }).build();

    act.actions.inc();

    expect(act.getState()).toEqual({
      count: 0,
      total: 10,
    });
  });

  it('can focus on substate', () => {
    const countSlice = SlicePatch.create({
      initState: { count: 0 },
      actions: {
        inc: () => [{ count: v => v + 1 }],
      },
    });
    const toggleSlice = SlicePatch.create({
      initState: { toggle: false },
      actions: {
        toggle: () => [{ toggle: v => !v }]
      }
    })

    const combinedSlice = Slice.combine({
      count: countSlice,
      toggle: toggleSlice
    });

    const act = Actor.configure({
      ...combinedSlice,
    }).build();

    const countAct = act.focus('count');
    const toggleAct = act.focus('toggle');

    expect(countAct.getState()).toEqual({ count: 0 });
    expect(toggleAct.getState()).toEqual({ toggle: false });

    countAct.actions.inc();

    expect(countAct.getState()).toEqual({ count: 1 });
    expect(toggleAct.getState()).toEqual({ toggle: false });

    toggleAct.actions.toggle();

    expect(countAct.getState()).toEqual({ count: 1 });
    expect(toggleAct.getState()).toEqual({ toggle: true });
  })
});
