import type { Actor } from '../actor/mod.ts';
import { Deep } from '../deep/mod.ts';
import React from "https://dev.jspm.io/react@17.0.2";;

import {
  updateSelectorValue,
  registerSelector,
  useForceRerender,
  type SelectorEntry,
  unregisterSelector,
} from './internal.ts';

export type Reactor<
  A extends Actor.Base<S> & Actor.Dispatch<D>,
  S,
  D extends (...args: any[]) => any,
> = A & {
  use(): Actor.Dispatch<D> & {
    useSelect<SL extends Deep.Selector<S>>(
      selector: Deep.Selector.Shape<SL>,
      deps?: React.DependencyList
    ): Deep.Selector.Result<S, SL>;
  };
};

export namespace Reactor {
  export function enhancer<
    S,
    A extends Actor.Base<S> & Actor.Dispatch<D>,
    D extends (...args: any[]) => any,
  >(actor: A & Actor.Base<S>): Reactor<A, S, D> {
    const selectorCache = new Map<Deep.Selector.Shape<any>, SelectorEntry>();

    const originalDispatch = actor.dispatch;

    actor.dispatch = ((...args) => {
      const prevState = actor.getState();
      const result = originalDispatch(...args);
      const state = actor.getState();

      if (Object.is(prevState, state)) {
        return result;
      }

      const updateViews = new Set<Actor.Listener>();

      for (const [selector, entry] of selectorCache) {
        const beforeValue = entry.value;
        const newValue = updateSelectorValue(state, selector, selectorCache);

        if (!Object.is(newValue, beforeValue)) {
          for (const listener of entry.listeners.keys()) {
            updateViews.add(listener);
          }
        }
      }

      for (const updateView of updateViews) {
        updateView();
      }

      return result;
    }) as D;

    const result = actor as Reactor<A, S, D>;

    result.use = (): A & {
      useSelect<SL extends Deep.Selector<S>>(
        selector: Deep.Selector.Shape<SL>,
        deps?: React.DependencyList
      ): Deep.Selector.Result<S, SL>;
    } => {
      const forceRerender = useForceRerender();

      function useSelect<SL extends Deep.Selector<S>>(
        selector: Deep.Selector.Shape<SL>,
        deps?: React.DependencyList
      ): Deep.Selector.Result<S, SL> {
        const entry = React.useRef<SelectorEntry>();

        React.useEffect(() => {
          // register selector
          entry.current = registerSelector(
            actor.getState(),
            selector,
            forceRerender,
            selectorCache
          );

          // return unregister function
          return (): void => {
            unregisterSelector(selector, forceRerender, selectorCache);
            entry.current = undefined;
          };
        }, deps ?? []);

        // fallback if ref has not yet been set
        const value =
          undefined === entry.current
            ? Deep.select(actor.getState(), selector)
            : (entry.current.value as Deep.Selector.Result<S, SL>);

        return value;
      }

      return {
        ...actor,
        useSelect,
      };
    };

    return result;
  }
}
