import { act, renderHook } from '@testing-library/react-hooks';
import { useCreateObs } from '../src';

describe('useCreateObs', () => {
  it('creates basic obs', () => {
    const { result } = renderHook(() => useCreateObs({ a: 1 }));

    expect(result.current[0]).toEqual({ a: 1 });

    act(() => result.current[1].setState({ a: 2 }));

    expect(result.current[0]).toEqual({ a: 2 });
  });

  it('creates basic obs from lazy state', () => {
    const { result } = renderHook(() => useCreateObs(() => ({ a: 1 })));

    expect(result.current[0]).toEqual({ a: 1 });

    act(() => result.current[1].setState({ a: 2 }));

    expect(result.current[0]).toEqual({ a: 2 });
  });
});
