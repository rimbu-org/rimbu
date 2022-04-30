import type { Actor } from '@rimbu/actor';
import { useActorSubscribe, useUpdateUI } from '../internal';

/**
 * Ensures the React component from which this method is called is updated everytime the subject resulting from memoing
 * the given `getSubject` method state changes.
 * @param getSubject - a function returning an actor that can be memoized
 * @example
 * ```ts
 * const obs = Obs.create({ value: 1 })
 *
 * export const MyComponent = () => {
 *   useSubscribeUpdateUI(() => obs)
 *
 *   return (
 *     <>
 *       <div>{state.value}</div>
 *       <button onClick={() => obs.patchState({ value: v => v + 1 })}>Increase</button>
 *     </>
 *   )
 * }
 * ```
 */
export function useSubscribeUpdateUI(
  getSubject: () => Actor.Readonly<any>
): void {
  useActorSubscribe(getSubject, useUpdateUI());
}
