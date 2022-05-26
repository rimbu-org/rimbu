import type { Actor } from '@rimbu/actor';
import type { Protected } from '@rimbu/deep';
import { useSubscribeUpdateUI } from '../internal';
import { useConst } from './useConst';

/**
 * Memoizes the given `getActor` result, and returns a tuple containing the actor state, and the actor itself.
 * Also subscribes to changes of the actor state.
 * @typeparam A - the Actor type
 * @typeparam Args - the arguments type of getActor
 * @param getActor - a memoizable function optionally taking some args, and returning an Actor.
 * @param args - the arguments to supply to `getActor`
 * @example
 * ```ts
 * function createActor(defaultString: string) {
 *   return Obs.create({ value: defaultString })
 * }
 *
 * export const MyComponent = () => {
 *   const [state, actor] = useActor(createActor, 'init');
 *
 *   return (
 *     <>
 *       <div>{state}</div>
 *       <button onClick={() => actor.setState({ value: 'other' })>Change</button>
 *     </>
 *   )
 * }
 * ```
 */
export function useActor<
  A extends Actor.Readonly<any>,
  Args extends readonly unknown[] = []
>(
  getActor: (...args: Args) => A,
  ...args: Args
): readonly [Protected<Actor.StateType<A>>, A] {
  const stableObs = useConst(getActor, ...args);
  useSubscribeUpdateUI(() => stableObs);
  return [stableObs.state, stableObs];
}
