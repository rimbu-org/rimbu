import { registerSelector } from '../src/register-selector';
import type { SelectorCache } from '../src/types';

describe('registerSelector', () => {
  it('adds a new simple selector', () => {
    const state = { count: 0 };
    const selector = 'count';
    const listener = () => {};
    const selectorCache = new Map();

    const entry = registerSelector(state, selector, listener, selectorCache);

    expect(entry.value).toBe(0);
    expect([...selectorCache]).toEqual([[selector, entry]]);
  });

  it('does not do anything if selector already registered', () => {
    const state = { count: 0 };
    const selector = 'count';
    const selectorEntry = {
      value: 3,
      listeners: new Map(),
    };

    const listener = () => {};
    const selectorCache = new Map([[selector, selectorEntry]]);

    const entry = registerSelector(state, selector, listener, selectorCache);

    expect(entry).toBe(selectorEntry);
    expect(entry.value).toBe(3);
  });

  it('adds subselectors of object selector', () => {
    const state = { count: 1 };
    const selector = { a: 'count', b: 'count' };
    const listener = () => {};

    const selectorCache: SelectorCache = new Map();

    const entry = registerSelector(state, selector, listener, selectorCache);

    expect(entry.value).toEqual({ a: 1, b: 1 });
    expect(selectorCache.get('count')!.value).toBe(1);
  });

  it('uses existing cache for object selector', () => {
    const state = { count: 1 };
    const selector = { a: 'count', b: 'count' };
    const listener = () => {};

    const selectorCache: SelectorCache = new Map([
      ['count', { value: 4, listeners: new Map() }],
    ]);

    const entry = registerSelector(state, selector, listener, selectorCache);

    expect(entry.value).toEqual({ a: 4, b: 4 });
    expect(selectorCache.get('count')!.value).toBe(4);
  });

  it('adds subselectors of array selector', () => {
    const state = { count: 1 };
    const selector = ['count', 'count'];
    const listener = () => {};

    const selectorCache: SelectorCache = new Map();

    const entry = registerSelector(state, selector, listener, selectorCache);

    expect(entry.value).toEqual([1, 1]);
    expect(selectorCache.get('count')!.value).toBe(1);
  });

  it('uses existing cache for array selector', () => {
    const state = { count: 1 };
    const selector = ['count', 'count'];
    const listener = () => {};

    const selectorCache: SelectorCache = new Map([
      ['count', { value: 4, listeners: new Map() }],
    ]);

    const entry = registerSelector(state, selector, listener, selectorCache);

    expect(entry.value).toEqual([4, 4]);
    expect(selectorCache.get('count')!.value).toBe(4);
  });

  it('adds a new function selector', () => {
    const state = { count: 1 };
    const selector = (st: typeof state) => st.count * 2;
    const listener = () => {};

    const selectorCache: SelectorCache = new Map();

    const entry = registerSelector(state, selector, listener, selectorCache);

    expect(entry.value).toEqual(2);
    expect(selectorCache.get(selector)!.value).toBe(2);
  });
});
