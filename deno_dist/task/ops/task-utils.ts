import { type Task } from '../../task/mod.ts';

import { cleanupOn } from '../main/internal.ts';

/**
 * Converts a function that takes an AbortSignal in one of its arguments into a Task.
 * The Task will automatically handle cancellation using the Task's context signal.
 * @param fn - The function to convert, which must take an AbortSignal in one of its arguments.
 * @param signalArgIndex - The index of the argument that should receive the AbortSignal.
 * @returns A Task that wraps the original function and manages cancellation.
 * @example
 * ```ts
 * import { taskify } from '@rimbu/task/ops';
 * import { readFile } from 'fs/promises';
 *
 * const readFileTask = taskify(readFile, 1);
 * const job = Task.launch(readFileTask, ['path/to/file', { encoding: 'utf-8' }]);
 * job.cancel();
 * await job.join({ recover: () => {} }); // recovers from error or cancellation
 * ```
 */
export function taskify<
  R,
  A extends readonly any[],
  N extends number,
  S extends string = 'signal',
>(
  fn: (...args: A) => R,
  signalArgIndex: N,
  signalPropName: S = 'signal' as S
): A[N] extends { [N in S]?: AbortSignal | undefined } | null | undefined
  ? Task<R, A>
  : never {
  return (async (context: Task.Context, ...args: A): Promise<R> => {
    if (args.length < signalArgIndex) {
      const finalArgs = [...args] as unknown as A;
      finalArgs[signalArgIndex] = { [signalPropName]: context.cancelledSignal };

      return await fn(...finalArgs);
    }

    const targetArg = args[signalArgIndex];

    using _ = cleanupOn(targetArg?.[signalPropName], context);

    const finalArgs = [...args] as unknown as A;
    finalArgs[signalArgIndex] = {
      ...targetArg,
      [signalPropName]: context.cancelledSignal,
    };

    return await fn(...finalArgs);
  }) as any;
}

export function joinAll<R extends readonly any[]>(jobs: {
  [K in keyof R]: Task.Job<R[K]>;
}): Promise<R> {
  return Promise.all(jobs.map((d) => d.join())) as Promise<any> as Promise<R>;
}
