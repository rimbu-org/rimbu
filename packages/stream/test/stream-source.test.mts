import { describe, expect, it } from 'bun:test';

import { isEmptyStreamSourceInstance } from '#/stream-base';

import { Stream } from '@rimbu/stream';

describe('isEmptyStreamSourceInstance', () => {
  it('correctly detects empty instances', () => {
    expect(isEmptyStreamSourceInstance('')).toBe(true);
    expect(isEmptyStreamSourceInstance([])).toBe(true);
    expect(isEmptyStreamSourceInstance(Stream.empty<number>())).toBe(true);
    expect(isEmptyStreamSourceInstance(new Map())).toBe(true);

    expect(isEmptyStreamSourceInstance('a')).toBe(false);
    expect(isEmptyStreamSourceInstance([1])).toBe(false);
    expect(isEmptyStreamSourceInstance(new Set([1]))).toBe(false);
    expect(isEmptyStreamSourceInstance(Stream.of(1))).toBe(false);
    // cannot determine if empty:
    expect(isEmptyStreamSourceInstance(Stream.from('abc').drop(5))).toBe(false);

    const testIsEmpty = {
      [Symbol.iterator](): Iterator<number> {
        return null as any;
      },
      isEmpty: true,
    };

    expect(isEmptyStreamSourceInstance(testIsEmpty)).toBe(true);
  });
});
