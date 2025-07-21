import { Actor } from '@rimbu/actor';
import { SlicePatch } from '@rimbu/actor/patch';
import { renderHook } from '@testing-library/react-hooks';

import { Reactor } from '../src/index.mjs';

describe('Reactor.enhancer', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('correctly updates state', () => {
    const slice = SlicePatch.create({
      initState: { count: 0, total: 10 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }, { total: (v, c) => v + c.count }],
      },
    });
    const actor = Actor.configure(slice).build();
    const reactor = Reactor.toReact(actor);

    const { result } = renderHook(() => {
      return reactor.useSelect('count');
    });

    expect(result.current).toEqual(0);
    actor.actions.inc();
    expect(result.current).toEqual(1);
  });
});
