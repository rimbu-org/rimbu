import type { Actor } from '@rimbu/actor';
import type { Deep } from '@rimbu/deep';

import type { SelectorCache } from './internal.mjs';

export function unregisterSelector(
  selector: Deep.Selector.Shape<any>,
  listener: Actor.Listener,
  selectorCache: SelectorCache
): void {
  const updateEntry = selectorCache.get(selector);

  if (undefined === updateEntry) {
    return;
  }

  const counter = updateEntry.listeners.get(listener);

  if (undefined === counter) {
    return;
  }

  if (counter.count === 1) {
    updateEntry.listeners.delete(listener);

    if (updateEntry.listeners.size === 0) {
      selectorCache.delete(selector);
    }
  } else {
    counter.count--;
  }

  if (Array.isArray(selector)) {
    for (const subSelector of selector) {
      unregisterSelector(subSelector, listener, selectorCache);
    }
  } else if (typeof selector === 'object') {
    for (const key in selector) {
      unregisterSelector(selector[key], listener, selectorCache);
    }
  }
}
