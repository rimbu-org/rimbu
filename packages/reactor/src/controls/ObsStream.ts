import type { Actor } from '@rimbu/actor';
import type { Immutable } from '@rimbu/deep';
import { Stream, StreamSource } from '@rimbu/stream';
import React from 'react';
import { useActorState } from '../internal';

/**
 * An `ObsStream` is a component that can be used to render `component` Views for an Observable StreamSource of elements.
 * It will only rerender when the given `source` changes, and it will memoize already rendered elements based on their
 * keys as calculated through the `toKey` method.
 * The given `toProps` method adds properties to the rendered components.
 * @typeparam T - the StreamSource element type
 * @typeparam P - the component properties type
 * @param source - a memoizable function returning the Observable StreamSource to monitor
 * @param component - the component to render for each StreamSource item
 * @param toKey - a function taking one StreamSource element and returning a unique key
 * @param toProps - a function taking one StreamSource element and returning the component props
 * @example
 * ```ts
 * const MyComponent = () => {
 *   const [state, actor] = useActor(() => Obs.create({ values: List.of('a', 'b', 'c')}))
 *
 *   return (
 *     <>
 *       {state.values.map(v => <div>{v}</div>)}
 *       <button onClick={() => actor.patch({ values: v => v.append('d') })}>Add</button>
 *     </>
 *   )
 * }
 * ```
 */
export const ObsStream: <T, P>(props: {
  source: () => Actor.Readonly<StreamSource<T>>;
  component: React.ComponentType<P>;
  toKey: (item: Immutable<T>) => string;
  toProps: (item: Immutable<T>) => P;
}) => JSX.Element = React.memo(
  <T, P>(props: {
    source: () => Actor.Readonly<StreamSource<T>>;
    component: React.ComponentType<P>;
    toKey: (item: Immutable<T>) => string;
    toProps: (item: Immutable<T>) => P;
  }) => {
    const streamSource: StreamSource<T> = useActorState(
      props.source as any
    ) as any;

    const viewCache = React.useRef(new Map<string, JSX.Element>());

    const newViewCache = new Map<string, JSX.Element>();

    const newViews = Stream.from(streamSource)
      .map((item) => {
        const i = item as Immutable<T>;

        const key = props.toKey(i);

        const currentView = viewCache.current.get(key);

        if (currentView !== undefined) {
          newViewCache.set(key, currentView);
          return currentView;
        }

        const newView = React.createElement(props.component, {
          key,
          ...props.toProps(i),
        });

        newViewCache.set(key, newView);

        return newView;
      })
      .toArray();

    viewCache.current = newViewCache;

    return React.createElement(React.Fragment, { children: newViews });
  }
) as any;
