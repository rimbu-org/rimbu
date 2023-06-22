import { Tuple } from '@rimbu/deep';

describe('Tuple', () => {
  const tuple = Tuple.of(1, 'a', true);

  it('of', () => {
    expect(Tuple.of(1, 'a')).toEqual([1, 'a']);
    expect(Tuple.of(1, 'a', true)).toEqual([1, 'a', true]);
  });

  it('getIndex', () => {
    expect(Tuple.getIndex(tuple, 0)).toBe(1);
    expect(Tuple.getIndex(tuple, 2)).toBe(true);
  });

  it('first', () => {
    expect(Tuple.first(tuple)).toBe(tuple[0]);
  });

  it('second', () => {
    expect(Tuple.second(tuple)).toBe(tuple[1]);
  });

  it('last', () => {
    expect(Tuple.last(tuple)).toBe(tuple[2]);
  });

  it('updateAt', () => {
    expect(Tuple.updateAt(tuple, 1, 'b')).toEqual([1, 'b', true]);
  });

  it('concat', () => {
    expect(Tuple.concat(tuple, tuple)).toEqual(tuple.concat(tuple));
  });

  it('init', () => {
    expect(Tuple.init(tuple)).toEqual([1, 'a']);
  });

  it('tail', () => {
    expect(Tuple.tail(tuple)).toEqual(['a', true]);
  });

  it('append', () => {
    expect(Tuple.append(tuple, 'q')).toEqual([...tuple, 'q']);
  });
});
