import { renderHook } from '@testing-library/react-hooks';
import React from 'react';

import { useForceRerender } from '../src';

describe('useUpdateUI', () => {
  it('calls setState', () => {
    const setState = jest.fn();

    jest.spyOn(React, 'useState').mockImplementation(() => [{}, setState]);

    const { result } = renderHook(() => useForceRerender());

    result.current();

    expect(setState).toHaveBeenCalledTimes(1);
  });

  it('calls setState on rerender', () => {
    const setState = jest.fn();

    jest.spyOn(React, 'useState').mockImplementation(() => [{}, setState]);

    const { result, rerender } = renderHook(() => useForceRerender());

    result.current();

    rerender();

    result.current();

    expect(setState).toHaveBeenCalledTimes(2);
  });
});
