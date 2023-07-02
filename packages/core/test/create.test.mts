import Menu from '../src/menu/index.mjs';

describe('Create', () => {
  it('creates', () => {
    expect(Menu.List.of(1, 2, 3).toArray()).toEqual([1, 2, 3]);
  });
});
