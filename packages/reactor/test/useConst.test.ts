import { renderHook } from '@testing-library/react-hooks';
import { useConst } from '../src';

describe('useConst', () => {
  it('returns the given value', () => {
    const value = {};

    const { result } = renderHook(() => useConst(() => value));

    expect(result.current).toBe(value);
  });

  it('does not change if input function changes', () => {
    const value1 = {};
    const value2 = {};

    const f = jest.fn();
    f.mockReturnValueOnce(value1);
    f.mockReturnValueOnce(value2);

    const { result, rerender } = renderHook(() => useConst(f));

    expect(result.current).toBe(value1);
    expect(f).toBeCalledTimes(1);

    rerender();

    expect(result.current).toBe(value1);
    expect(f).toBeCalledTimes(1);
    expect(f()).toBe(value2);
  });
});
