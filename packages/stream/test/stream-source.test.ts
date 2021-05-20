import { Stream, StreamSource } from '../src';

describe('StreamSource.isEmptyInstance', () => {
  it('correctly detects empty instances', () => {
    expect(StreamSource.isEmptyInstance('')).toBe(true);
    expect(StreamSource.isEmptyInstance([])).toBe(true);
    expect(StreamSource.isEmptyInstance(Stream.empty<number>())).toBe(true);
    expect(StreamSource.isEmptyInstance(new Map())).toBe(true);

    expect(StreamSource.isEmptyInstance('a')).toBe(false);
    expect(StreamSource.isEmptyInstance([1])).toBe(false);
    expect(StreamSource.isEmptyInstance(new Set([1]))).toBe(false);
    expect(StreamSource.isEmptyInstance(Stream.of(1))).toBe(false);
    // cannot determine if empty:
    expect(StreamSource.isEmptyInstance(Stream.from('abc').drop(5))).toBe(
      false
    );

    const testIsEmpty = {
      [Symbol.iterator](): Iterator<number> {
        return null as any;
      },
      isEmpty: true,
    };

    expect(StreamSource.isEmptyInstance(testIsEmpty)).toBe(true);
  });
});
