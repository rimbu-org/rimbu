import {
  registerSelector,
  type SelectorCache,
  unregisterSelector,
} from '../src/internal.mjs';

describe('unregisterSelector', () => {
  it('removes listener with count 1', () => {
    const state = { count: 0 };
    const selector = 'count';
    const listener = () => {};
    const selectorCache: SelectorCache = new Map();

    const entry = registerSelector(state, selector, listener, selectorCache);

    expect(entry.listeners.get(listener)!.count).toBe(1);

    unregisterSelector(selector, listener, selectorCache);

    expect(entry.listeners.get(listener)).toBeUndefined();
  });

  it('decrements listener with count > 1', () => {
    const state = { count: 0 };
    const selector = 'count';
    const listener = () => {};
    const selectorCache: SelectorCache = new Map();

    const entry = registerSelector(state, selector, listener, selectorCache);
    registerSelector(state, selector, listener, selectorCache);

    expect(entry.listeners.get(listener)!.count).toBe(2);

    unregisterSelector(selector, listener, selectorCache);

    expect(entry.listeners.get(listener)!.count).toBe(1);
  });

  it('ignores unknown selector', () => {
    const state = { count: 0 };
    const selector = 'count';
    const listener = () => {};
    const selectorCache: SelectorCache = new Map();

    const entry = registerSelector(state, selector, listener, selectorCache);

    unregisterSelector('abc', listener, selectorCache);

    expect(entry.listeners.get(listener)!.count).toBe(1);
  });

  it('unregisters subSelectors for array selector', () => {
    const state = { count: 0 };
    const selector = ['count', 'count'];
    const listener = () => {};
    const selectorCache: SelectorCache = new Map();

    const entry = registerSelector(state, selector, listener, selectorCache);

    expect(entry.listeners.get(listener)?.count).toBe(1);
    expect(selectorCache.get('count')!.listeners.get(listener)!.count).toBe(2);

    unregisterSelector(selector, listener, selectorCache);

    expect(entry.listeners.get(listener)).toBeUndefined();

    expect(selectorCache.get('count')).toBeUndefined();
  });

  it('unregisters subSelectors for object selector', () => {
    const state = { count: 0 };
    const selector = { a: 'count', b: 'count' };
    const listener = () => {};
    const selectorCache: SelectorCache = new Map();

    const entry = registerSelector(state, selector, listener, selectorCache);

    expect(entry.listeners.get(listener)!.count).toBe(1);
    expect(selectorCache.get('count')!.listeners.get(listener)!.count).toBe(2);

    unregisterSelector(selector, listener, selectorCache);

    expect(entry.listeners.get(listener)).toBeUndefined();

    expect(selectorCache.get('count')).toBeUndefined();
  });

  it('does nothing when unregistering unknown handler', () => {
    const state = { count: 0 };
    const selector = 'count';
    const listener = () => {};
    const selectorCache: SelectorCache = new Map();

    const entry = registerSelector(state, selector, listener, selectorCache);

    expect(entry.listeners.get(listener)!.count).toBe(1);

    unregisterSelector(selector, () => {}, selectorCache);

    expect(entry.listeners.get(listener)!.count).toBe(1);
  });
});
