import { Obs } from '@rimbu/actor';
import { renderHook } from '@testing-library/react-hooks';
import { useActor, useUpdateUI } from '@rimbu/reactor';

jest.mock('../src/hooks/useUpdateUI');

const mockUseUpdateUI = useUpdateUI as jest.Mock;

describe('useActor', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('updates UI', () => {
    const updateUI = jest.fn();
    mockUseUpdateUI.mockReturnValue(updateUI);

    const { result, rerender } = renderHook(() =>
      useActor(() => Obs.create({ a: 1 }))
    );

    expect(updateUI).not.toBeCalled();

    expect(result.current[0]).toEqual({ a: 1 });

    result.current[1].setState({ a: 2 });

    rerender();

    expect(updateUI).toBeCalledTimes(1);
    expect(result.current[0]).toEqual({ a: 2 });
  });

  it('stops updating UI on unmount', () => {
    const updateUI = jest.fn();
    mockUseUpdateUI.mockReturnValue(updateUI);

    const { result, unmount } = renderHook(() =>
      useActor(() => Obs.create({ a: 1 }))
    );

    unmount();

    result.current[1].setState({ a: 2 });

    expect(updateUI).not.toBeCalled();
    expect(result.current[0]).toEqual({ a: 1 });
  });
});
