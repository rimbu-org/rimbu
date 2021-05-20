import { Obs } from '@rimbu/actor';
import { renderHook } from '@testing-library/react-hooks';
import { useActorState, useUpdateUI } from '../src';

jest.mock('../src/hooks/useUpdateUI');

const mockUseUpdateUI = useUpdateUI as jest.Mock;

describe('useActorState', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('updates UI', () => {
    const updateUI = jest.fn();
    mockUseUpdateUI.mockReturnValue(updateUI);

    const obs = Obs.create({ a: 1 });

    const { result, rerender } = renderHook(() => useActorState(() => obs));

    expect(updateUI).not.toBeCalled();

    expect(result.current).toEqual({ a: 1 });

    obs.setState({ a: 2 });

    rerender();

    expect(updateUI).toBeCalledTimes(1);
    expect(result.current).toEqual({ a: 2 });
  });

  it('stops updating UI on unmount', () => {
    const updateUI = jest.fn();
    mockUseUpdateUI.mockReturnValue(updateUI);

    const obs = Obs.create({ a: 1 });

    const { result, unmount } = renderHook(() => useActorState(() => obs));

    unmount();

    obs.setState({ a: 2 });

    expect(updateUI).not.toBeCalled();
    expect(result.current).toEqual({ a: 1 });
  });
});
