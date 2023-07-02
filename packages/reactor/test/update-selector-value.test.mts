import { updateSelectorValue, type SelectorCache } from '../src/internal.mjs';

describe('updateSelectorValue', () => {
  it('returns the selector value for simple selector', () => {
    const state = { count: 0 };
    const selector = 'count';
    const selectorValue = 0;
    const selectorEntry = {
      value: selectorValue,
      listeners: new Map(),
    };

    const selectorCache: SelectorCache = new Map([[selector, selectorEntry]]);

    const value = updateSelectorValue(state, selector, selectorCache);

    expect(value).toBe(0);
    expect(selectorEntry.value).toBe(0);
  });

  it('returns and updates the new selector value for simple selector', () => {
    const state = { count: 1 };
    const selector = 'count';
    const selectorValue = 0;
    const selectorEntry = {
      value: selectorValue,
      listeners: new Map(),
    };

    const selectorCache: SelectorCache = new Map([[selector, selectorEntry]]);

    const value = updateSelectorValue(state, selector, selectorCache);

    expect(value).toBe(1);
    expect(selectorEntry.value).toBe(1);
  });

  it('returns the selector value for compound object selector', () => {
    const state = { count: 0 };
    const selector = { a: 'count', b: 'count' };
    const selectorValue = { a: 2, b: 2 };
    const selectorEntry = {
      value: selectorValue,
      listeners: new Map(),
    };
    const countEntry = { value: 1, listeners: new Map() };

    const selectorCache: SelectorCache = new Map([
      ['count', countEntry],
      [selector, selectorEntry],
    ] as any);

    {
      const value = updateSelectorValue(state, selector, selectorCache);

      expect(value).toEqual({ a: 1, b: 1 });
      expect(selectorEntry.value).toEqual({ a: 1, b: 1 });
      expect(countEntry.value).toBe(1);
    }

    countEntry.value = 3;

    {
      const value = updateSelectorValue(state, selector, selectorCache);

      expect(value).toEqual({ a: 3, b: 3 });
      expect(selectorEntry.value).toEqual({ a: 3, b: 3 });
    }
  });

  it('returns the selector value for compound array selector', () => {
    const state = { count: 0 };
    const selector = ['count', 'count'];
    const selectorValue = { a: 2, b: 2 };
    const selectorEntry = {
      value: selectorValue,
      listeners: new Map(),
    };
    const countEntry = { value: 1, listeners: new Map() };

    const selectorCache: SelectorCache = new Map([
      ['count', countEntry],
      [selector, selectorEntry],
    ] as any);

    {
      const value = updateSelectorValue(state, selector, selectorCache);

      expect(value).toEqual([1, 1]);
      expect(selectorEntry.value).toEqual([1, 1]);
      expect(countEntry.value).toBe(1);
    }

    countEntry.value = 3;

    {
      const value = updateSelectorValue(state, selector, selectorCache);

      expect(value).toEqual([3, 3]);
      expect(selectorEntry.value).toEqual([3, 3]);
    }
  });

  it('returns the selector value directly from state for function selector', () => {
    const state = { count: 2 };
    const selector = (st: typeof state) => st.count * 2;
    const selectorValue = 6;
    const selectorEntry = {
      value: selectorValue,
      listeners: new Map(),
    };
    const countEntry = { value: 5, listeners: new Map() };

    const selectorCache: SelectorCache = new Map([
      ['count', countEntry],
      [selector, selectorEntry],
    ] as any);

    const value = updateSelectorValue(state, selector, selectorCache);

    expect(value).toEqual(4);
    expect(selectorEntry.value).toEqual(4);
    expect(countEntry.value).toBe(5);
  });

  it('errors wnen selector was not registered', () => {
    const state = { count: 0 };
    const selector = 'count';

    const selectorCache: SelectorCache = new Map();

    expect(() => updateSelectorValue(state, selector, selectorCache)).toThrow();
  });
});
