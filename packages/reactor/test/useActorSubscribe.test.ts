import { Obs } from '@rimbu/actor';
import { useActorSubscribe } from '../src';
import { renderHook } from '@testing-library/react-hooks';

describe('useActorSubscribe', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('subscribes', () => {
    const actor = Obs.create({ a: 1 });

    const onStart = jest.fn();
    const onChange = jest.fn();

    renderHook(() => useActorSubscribe(() => actor, onChange, onStart));

    expect(onStart).toBeCalledTimes(1);
    onStart.mockReset();
    expect(onChange).not.toBeCalled();

    actor.setState({ a: 2 });

    expect(onStart).not.toBeCalled();
    expect(onChange).toBeCalledTimes(1);
    expect(onChange).toBeCalledWith({ a: 2 }, { a: 1 });
  });

  it('unsubscribes on unmount', () => {
    const actor = Obs.create({ a: 1 });
    const onChange = jest.fn();

    const { unmount } = renderHook(() =>
      useActorSubscribe(() => actor, onChange)
    );
    unmount();

    actor.setState({ a: 2 });

    expect(onChange).not.toBeCalled();
  });
});
