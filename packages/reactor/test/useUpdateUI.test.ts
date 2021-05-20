import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { useUpdateUI } from '../src';

describe('useUpdateUI', () => {
  it('calls setState', () => {
    const setState = jest.fn();

    jest.spyOn(React, 'useState').mockImplementation(() => [{}, setState]);

    const { result } = renderHook(() => useUpdateUI());

    result.current();

    expect(setState).toHaveBeenCalledTimes(1);
  });
});
