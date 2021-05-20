import { Actor, Obs } from '@rimbu/actor';
import { Immutable } from '@rimbu/deep';
import { useEffect } from 'react';

/**
 * Subscribes the given `onNotification` function to the given `subject`, such that on every subject's notification,
 * the `onNotification` function is executed. If an `onStart` function is given, the function is called immediately,
 * just before subscribing.
 * The hook will unsubscribe automatically when the component unmounts.
 * @typeparam T - the Actor state type
 * @param getActor - a memoizable function returning an Actor.
 * @param onChange - a function to call on each state update
 * @param onStart - (optional) function to immediately call when subscribing
 * @param onEnd - (optional) function to call after unsubscribing
 * @example
 * function createActor(defaultString: string) {
 *   const obs = Obs.create({ value: defaultString })
 *   setTimeout(() => obs.setState({ value: 'other' }), 1000);
 *   return obs;
 * }
 *
 * export const MyComponent = () => {
 *   useActorSubscribe(() => createActor('init'), (newState) => console.log(newState));
 *   // will log the various states of the actor to console
 *
 *   return (
 *     <>
 *       <div>Component</div>
 *     </>
 *   )
 * }
 */
export function useActorSubscribe<T>(
  getActor: () => Actor.Readonly<T>,
  onChange: Obs.StateUpdate<Immutable<T>>,
  onStart?: (state: Immutable<T>) => void,
  onEnd?: (state: Immutable<T>) => void
): void {
  useEffect(() => {
    const stableSubject = getActor();

    onStart?.(stableSubject.state);

    const unsubscribe = stableSubject.obsReadonly.subscribe(onChange);

    return () => {
      unsubscribe?.();
      onEnd?.(stableSubject.state);
    };
  }, []);
}
