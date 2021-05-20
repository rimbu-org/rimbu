import { Create } from '../src';

describe('Create', () => {
  it('creates', () => {
    expect(Create.List.of(1, 2, 3).toArray()).toEqual([1, 2, 3]);
  });
});
