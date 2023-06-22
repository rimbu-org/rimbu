import { Reducer } from '@rimbu/common';
import { Spy } from '@rimbu/spy';

import { Action, ActionBase, Actor, Slice } from '../src/main';
import { SlicePatch } from '../src/patch';

describe('Actor', () => {
  const action = Action.create();

  it('can be empty', () => {
    const act = Actor.configure({
      reducer: Reducer.combineObj({}),
    });

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
    });

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
    });

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
    });

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
    });

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
    });

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
      middleware: (actor) => {
        const originalDispatch = actor.dispatch;

        return (action: ActionBase) => {
          const preState = actor.getState();

          originalDispatch(action);

          return {
            preState,
            postState: actor.getState(),
          };
        };
      },
    });

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
      enhancer: (actor) => ({
        ...actor,
        dispatchTwice(action: ActionBase) {
          actor.dispatch(action);
          actor.dispatch(action);
        },
      }),
    });

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
    });

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
    });

    act.actions.inc();

    expect(act.getState()).toEqual({
      count: 0,
      total: 10,
    });
  });
});
