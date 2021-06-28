import React from 'react';

const emptyArray: any[] = [];

/**
 * Returns a fixed value based on the given `create` function, optionally supplied by given `args` arguments.
 * @typeparam R - the result type
 * @typeparam Args - the arguments for the create function
 * @param create - a function taking arguments, and returning some value that will be memoized
 * @param args - arguments to supply to the create function
 * @example
 *
 * function createActor(initValue: string) {
 *   return Obs.create({ value: initValue })
 * }
 *
 * const MyWrongComponent = () => {
 *   // this actor will be recreated on every rerender
 *   const actor = createActor('init')
 *
 *   return <div>...</div>
 * }
 *
 * const MyRightComponent = () => {
 *   // this actor will be created only once
 *   const actor = useConst(createActor, 'init')
 *
 *   return <div>...</div>
 * }
 */
export function useConst<R, Args extends readonly unknown[] = []>(
  create: (...args: Args) => R,
  ...args: Args
): R {
  return React.useMemo(() => create(...args), emptyArray);
}
