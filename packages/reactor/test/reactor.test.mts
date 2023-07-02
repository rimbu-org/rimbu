import { Action, Actor } from '@rimbu/actor';
import { SlicePatch } from '@rimbu/actor/patch';
import { renderHook } from '@testing-library/react-hooks';
import React from 'react';

import { Reactor } from '../src/index.mjs';

describe('Reactor.enhancer', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('rerenders on state change', () => {
    const slice = SlicePatch.create({
      initState: { count: 0, total: 10 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }, { total: (v, c) => v + c.count }],
      },
    });
    const actor = Actor.configure({
      ...slice,
      enhancer: Reactor.enhancer,
    });

    const setState = vi.fn();

    vi.spyOn(React, 'useState').mockImplementation(() => [{}, setState]);

    const { result, rerender } = renderHook(() => {
      const { useSelect } = actor.use();

      return useSelect('count');
    });

    expect(result.current).toEqual(0);
    actor.actions.inc();
    expect(setState).toBeCalledTimes(1);
    rerender();

    expect(result.current).toEqual(1);
  });

  it('does not rerender on state change', () => {
    const slice = SlicePatch.create({
      initState: { count: 0, total: 10 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }, { total: (v, c) => v + c.count }],
        incTotal: () => [{ total: (v) => v + 1 }],
      },
    });
    const actor = Actor.configure({
      ...slice,
      enhancer: Reactor.enhancer,
    });

    const setState = vi.fn();

    vi.spyOn(React, 'useState').mockImplementation(() => [{}, setState]);

    const { result, rerender } = renderHook(() => {
      const { useSelect } = actor.use();

      return useSelect('count');
    });

    expect(result.current).toEqual(0);

    actor.actions.incTotal();
    expect(setState).not.toBeCalled();
    rerender();
    expect(result.current).toEqual(0);
  });

  it('does not rerender on unknown action', () => {
    const slice = SlicePatch.create({
      initState: { count: 0, total: 10 },
    });

    const actor = Actor.configure({
      ...slice,
      enhancer: Reactor.enhancer,
    });

    const setState = vi.fn();

    vi.spyOn(React, 'useState').mockImplementation(() => [{}, setState]);

    const { result, rerender } = renderHook(() => {
      const { useSelect } = actor.use();

      return useSelect('count');
    });

    const action = Action.create();

    expect(result.current).toEqual(0);

    actor.dispatch(action());

    expect(setState).not.toBeCalled();
    rerender();
    expect(result.current).toEqual(0);
  });

  it('unregisters on unmount', () => {
    const slice = SlicePatch.create({
      initState: { count: 0, total: 10 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }],
      },
    });

    const actor = Actor.configure({
      ...slice,
      enhancer: Reactor.enhancer,
    });

    const setState = vi.fn();

    vi.spyOn(React, 'useState').mockImplementation(() => [{}, setState]);

    const { result, unmount } = renderHook(() => {
      const { useSelect } = actor.use();

      useSelect({ a: 'count' });

      return useSelect('count');
    });

    expect(result.current).toEqual(0);

    unmount();

    actor.actions.inc();

    expect(setState).not.toBeCalled();

    expect(result.current).toEqual(0);
  });
});
