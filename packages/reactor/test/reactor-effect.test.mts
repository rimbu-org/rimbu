import { Action, Actor } from '@rimbu/actor';
import { SlicePatch } from '@rimbu/actor/patch';
import { renderHook } from '@testing-library/react-hooks';

import { Reactor } from '../src/index.mjs';

const useStateMock = vi.fn();

vi.mock('react', async () => ({
  ...(await vi.importActual('react')),
  useState: () => useStateMock(),
}));

describe('Reactor.enhancer', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('rerenders on state change', () => {
    const mockSetState = vi.fn();
    useStateMock.mockImplementation(() => [{}, mockSetState]);

    const slice = SlicePatch.create({
      initState: { count: 0, total: 10 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }, { total: (v, c) => v + c.count }],
      },
    });
    const actor = Actor.configure(slice).build();
    const reactor = Reactor.toReact(actor);

    renderHook(() => {
      return reactor.useSelect('count');
    });

    expect(mockSetState).toBeCalledTimes(0);
    actor.actions.inc();
    expect(mockSetState).toBeCalledTimes(1);
  });

  it('does not rerender on unrelated state change', () => {
    const mockSetState = vi.fn();
    useStateMock.mockImplementation(() => [{}, mockSetState]);

    const slice = SlicePatch.create({
      initState: { count: 0, total: 10 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }, { total: (v, c) => v + c.count }],
        incTotal: () => [{ total: (v) => v + 1 }],
      },
    });
    const actor = Actor.configure(slice).build();
    const reactor = Reactor.toReact(actor);

    renderHook(() => {
      return reactor.useSelect('count');
    });

    actor.actions.incTotal();
    expect(mockSetState).not.toBeCalled();
    actor.actions.inc();
    expect(mockSetState).toBeCalledTimes(1);
    actor.actions.incTotal();
    expect(mockSetState).toBeCalledTimes(1);
  });

  it('does not rerender on unknown action', () => {
    const mockSetState = vi.fn();
    useStateMock.mockImplementation(() => [{}, mockSetState]);

    const slice = SlicePatch.create({
      initState: { count: 0, total: 10 },
    });

    const actor = Actor.configure(slice).build();
    const reactor = Reactor.toReact(actor);

    renderHook(() => {
      return reactor.useSelect('count');
    });

    const action = Action.create();

    actor.dispatch(action());

    expect(mockSetState).not.toBeCalled();
  });

  it('unregisters on unmount', () => {
    const mockSetState = vi.fn();
    useStateMock.mockImplementation(() => [{}, mockSetState]);

    const slice = SlicePatch.create({
      initState: { count: 0, total: 10 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }],
      },
    });

    const actor = Actor.configure(slice).build();
    const reactor = Reactor.toReact(actor);

    const { unmount } = renderHook(() => {
      reactor.useSelect({ a: 'count' });

      return reactor.useSelect('count');
    });

    unmount();

    actor.actions.inc();

    expect(mockSetState).not.toBeCalled();
  });
});
