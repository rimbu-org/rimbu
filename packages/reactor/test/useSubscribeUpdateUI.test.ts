import { Obs } from '@rimbu/actor';
import { renderHook } from '@testing-library/react-hooks';
import { useSubscribeUpdateUI, useUpdateUI } from '../src';

jest.mock('../src/hooks/useUpdateUI');

const mockUseUpdateUI = useUpdateUI as jest.Mock;

describe('useSubscribeUpdateUI', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('updates UI', () => {
    const updateUI = jest.fn();
    mockUseUpdateUI.mockReturnValue(updateUI);

    const obs = Obs.create({ a: 1 });

    renderHook(() => useSubscribeUpdateUI(() => obs));

    expect(updateUI).not.toBeCalled();

    obs.setState({ a: 2 });

    expect(updateUI).toBeCalledTimes(1);
  });

  it('stops updating UI after unmount', () => {
    const updateUI = jest.fn();
    mockUseUpdateUI.mockReturnValue(updateUI);

    const obs = Obs.create({ a: 1 });

    const { unmount } = renderHook(() => useSubscribeUpdateUI(() => obs));
    unmount();

    obs.setState({ a: 2 });

    expect(updateUI).not.toBeCalled();
  });
});
