import { Spy } from '@rimbu/spy';
import { Reducer } from '@rimbu/stream';

import { Action, Actor, Slice, type ActionBase } from 'main/index.mjs';
import { SlicePatch } from 'patch/index.mjs';

describe('Actor', () => {
  const action = Action.create();

  it('can be empty', () => {
    const act = Actor.configure({
      reducer: Reducer.combine({}),
    }).build();

    expect(act.state).toEqual({});

    act.dispatch(action());

    expect(act.state).toEqual({});
  });

  it('can have single slice', () => {
    const slice = SlicePatch.create({
      initState: { count: 0, total: 10 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }, { total: (v, p) => v + p.count }],
      },
    });

    const act = Actor.configure(slice).build();

    expect(act.state).toEqual({ count: 0, total: 10 });

    act.actions.inc();

    expect(act.state).toEqual({ count: 1, total: 11 });

    act.actions.inc();

    expect(act.state).toEqual({ count: 2, total: 13 });
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

    const act = Actor.configure(
      Slice.combine({
        counter,
        toggle,
      })
    ).build();

    expect(act.state).toEqual({
      counter: { count: 0, total: 10 },
      toggle: false,
    });

    act.actions.counter.inc();

    expect(act.state).toEqual({
      counter: { count: 1, total: 11 },
      toggle: true,
    });

    act.actions.counter.inc();

    expect(act.state).toEqual({
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

    const act = Actor.configure(slice).build();

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

    const act = Actor.configure(slice).build();

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

    const act = Actor.configure(slice).build();

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

    const act = Actor.configure(slice)
      .addMiddleware((dispatch, actor) => {
        return (action: ActionBase) => {
          const preState = actor.state;

          dispatch(action);

          return {
            preState,
            postState: actor.state,
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

    const act = Actor.configure(Slice.combine({ counter, toggle })).build();

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

    expect(act.state).toEqual({
      count: 0,
      total: 10,
    });
  });

  it('can focus on substate', () => {
    const countSlice = SlicePatch.create({
      initState: { count: 0 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }],
      },
    });
    const toggleSlice = SlicePatch.create({
      initState: { toggle: false },
      actions: {
        toggle: () => [{ toggle: (v) => !v }],
      },
    });

    const combinedSlice = Slice.combine({
      count: countSlice,
      toggle: toggleSlice,
    });

    const act = Actor.configure(combinedSlice).build();

    const countAct = act.focus('count');
    const toggleAct = act.focus('toggle');

    expect(countAct.state).toEqual({ count: 0 });
    expect(toggleAct.state).toEqual({ toggle: false });

    countAct.actions.inc();

    expect(countAct.state).toEqual({ count: 1 });
    expect(toggleAct.state).toEqual({ toggle: false });

    toggleAct.actions.toggle();

    expect(countAct.state).toEqual({ count: 1 });
    expect(toggleAct.state).toEqual({ toggle: true });
  });

  it('supports setFullState', () => {
    const slice = SlicePatch.create({
      initState: { count: 0 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }],
      },
    });

    const act = Actor.configure(slice).build();

    expect(act.state).toEqual({ count: 0 });
    const initFullState = act.fullState;
    act.actions.inc();
    expect(act.state).toEqual({ count: 1 });
    const nextFullstate = act.fullState;
    act.setFullState(initFullState);
    expect(act.state).toEqual({ count: 0 });
    expect(act.fullState).toEqual(initFullState);
    act.setFullState(nextFullstate);
    expect(act.state).toEqual({ count: 1 });
    expect(act.fullState).toEqual(nextFullstate);
  });

  it('can dispatch multiple actions with single notify', () => {
    const slice = SlicePatch.create({
      initState: { count: 5, total: 10 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }, { total: (v, p) => v + p.count }],
        resetCount: () => [{ count: 0 }],
      },
    });

    const act = Actor.configure(slice).build();

    const fn = Spy.fn();

    act.subscribe(fn);

    expect(fn.nrCalls).toBe(0);

    act.dispatch(act.actions.inc.create(), act.actions.resetCount.create());

    expect(act.state).toEqual({ count: 0, total: 16 });

    expect(fn.nrCalls).toBe(1);
  });
});
