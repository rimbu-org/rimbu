import Rimbu from '../src';

describe('Create', () => {
  it('creates', () => {
    expect(Rimbu.Create.List.of(1, 2, 3).toArray()).toEqual([1, 2, 3]);
  });
});
