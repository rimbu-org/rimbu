import type { Actor } from '@rimbu/actor';
import { useSubscribeUpdateUI } from '../internal';
import { useConst } from './useConst';

/**
 * Memoizes the given `getActor` result, and returns a the actor state.
 * Also subscribes to changes of the actor state.
 * @typeparam A - the Actor type
 * @typeparam Args - the arguments type of getActor
 * @param getActor - a memoizable function optionally taking some args, and returning an Actor.
 * @param args - the arguments to supply to `getActor`
 * @example
 * function createActor(defaultString: string) {
 *   const obs = Obs.create({ value: defaultString })
 *   setTimeout(() => obs.setState({ value: 'other' }), 1000);
 *   return obs;
 * }
 *
 * export const MyComponent = () => {
 *   const state = useActorState(createActor, 'init');
 *   // the actor will change its state after one second
 *
 *   return (
 *     <>
 *       <div>{state}</div>
 *     </>
 *   )
 * }
 */
export function useActorState<
  A extends Actor.Readonly<unknown>,
  Args extends readonly unknown[] = []
>(getActor: (...args: Args) => A, ...args: Args): A['state'] {
  const stableActor = useConst(getActor, ...args);
  useSubscribeUpdateUI(() => stableActor);
  return stableActor.state;
}
