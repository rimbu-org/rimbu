import { Obs } from '@rimbu/actor';
import { OptLazy } from '@rimbu/common';
import type { Immutable } from '@rimbu/deep';
import { useActor } from './useActor';

/**
 * A lightweight method to create and Obs instance that is memoized. Returns a 2-tuple containing the Obs state and the Obs itself.
 * @typeparam T - the state type
 * @param initState - an optionally lazy initial state
 * @example
 * ```ts
 * export const MyComponent = () => {
 *   const [state, obs] = useCreateObs({ value: 1 })
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
export function useCreateObs<T>(
  initState: OptLazy<T>
): readonly [Immutable<T>, Obs<T>] {
  return useActor(() => Obs.create<T>(OptLazy(initState)));
}
