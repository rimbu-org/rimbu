import { Range } from '../src';

describe('getNormalizedRange', () => {
  it('correctly returns range', () => {
    const r = Range.getNormalizedRange;

    expect(r({ start: 'a' })).toEqual({ start: ['a', true] });
    expect(r({ start: ['a', true] })).toEqual({ start: ['a', true] });
    expect(r({ start: ['a', false] })).toEqual({ start: ['a', false] });
    expect(r({ end: 'a' })).toEqual({ end: ['a', true] });
    expect(r({ end: ['a', true] })).toEqual({ end: ['a', true] });
    expect(r({ end: ['a', false] })).toEqual({ end: ['a', false] });
    expect(r({ start: 'a', end: 'b' })).toEqual({
      start: ['a', true],
      end: ['b', true],
    });
    expect(r({ start: ['a', true], end: ['b', true] })).toEqual({
      start: ['a', true],
      end: ['b', true],
    });
    expect(r({ start: ['a', false], end: ['b', false] })).toEqual({
      start: ['a', false],
      end: ['b', false],
    });
  });
});
