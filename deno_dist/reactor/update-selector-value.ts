import { Deep } from '../deep/mod.ts';

import type { SelectorCache } from './internal.ts';

export function updateSelectorValue<S>(
  state: S,
  selector: Deep.Selector.Shape<any>,
  selectorCache: SelectorCache
): any {
  const currentEntry = selectorCache.get(selector);

  if (undefined === currentEntry) {
    throw Error('should not be undefined');
  }

  if (Array.isArray(selector)) {
    let anyChanged = false;
    const currentValue = currentEntry.value as any[];

    const result = selector.map((selItem, index) => {
      const subEntry = selectorCache.get(selItem);

      const newValue = subEntry!.value;

      if (!Object.is(currentValue[index], newValue)) {
        anyChanged = true;
      }

      return newValue;
    });

    if (anyChanged) {
      currentEntry.value = result;
    }

    return currentEntry.value;
  }

  if (typeof selector === 'object') {
    let anyChanged = false;
    const result: any = {};

    for (const key in selector) {
      const subEntry = selectorCache.get(selector[key]);

      const newValue = subEntry!.value;

      if (!Object.is((currentEntry.value as any)[key], newValue)) {
        anyChanged = true;
      }

      result[key] = newValue;
    }

    if (anyChanged) {
      currentEntry.value = result;
    }

    return currentEntry.value;
  }

  currentEntry.value = Deep.select(state, selector);

  return currentEntry.value;
}
