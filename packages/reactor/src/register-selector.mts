import type { Actor } from '@rimbu/actor';
import { Deep } from '@rimbu/deep';

import type { SelectorCache, SelectorEntry } from './internal.mjs';

export function registerSelector<S>(
  state: S,
  selector: Deep.Selector.Shape<any>,
  listener: Actor.Listener,
  selectorCache: SelectorCache
): SelectorEntry {
  let currentEntry = selectorCache.get(selector);

  if (undefined === currentEntry) {
    currentEntry = {
      value: undefined,
      listeners: new Map([[listener, { count: 1 }]]),
    };

    if (Array.isArray(selector)) {
      currentEntry.value = selector.map(
        (sel) => registerSelector(state, sel, listener, selectorCache).value
      );
    } else if (typeof selector === 'object') {
      const value: any = {};

      for (const key in selector) {
        value[key] = registerSelector(
          state,
          selector[key],
          listener,
          selectorCache
        ).value;
      }

      currentEntry.value = value;
    } else {
      currentEntry.value = Deep.select(state, selector);
    }

    selectorCache.set(selector, currentEntry);
  } else {
    const counter = currentEntry.listeners.get(listener);

    if (undefined === counter) {
      currentEntry.listeners.set(listener, { count: 1 });
    } else {
      counter.count++;
    }
  }

  return currentEntry;
}
