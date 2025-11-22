import { CancellationError, Task } from '../../task/mod.ts';

import { type Last } from '../main/internal.ts';

/**
 * Creates a Task that applies a side-effect function when executed.
 * The side-effect function receives the same arguments as the Task.
 * @param fn - The side-effect function to apply.
 * @returns A function that takes arguments and returns a Task executing the side-effect.
 */
export function effect<R, A extends readonly any[] = []>(
  fn: (...args: A) => R
): (...args: A) => Task<R> {
  return (...args) =>
    () =>
      fn(...args);
}

/**
 * A Task that logs its direct arguments to the console.
 */
export const clog: (
  ...args: Parameters<(typeof console)['log']>
) => Task<void> = effect((...args) => console.log(...args));

/**
 * A Task that logs its Task arguments to the console.
 */
export const clogArgs = <A extends readonly any[] = []>(
  _context: Task.Context,
  ...args: A
): Task.Result<A> => {
  console.log(...args);
  return args;
};

/**
 * A Task that throws an error of the specified class when executed.
 * @param ErrorClass - The error class to instantiate and throw.
 * @returns A Task that throws the specified error when executed.
 */
export const throwErrorClass = effect((ErrorClass: { new (): any }) => {
  throw new ErrorClass();
});

/**
 * A Task that throws an error created by the provided function when executed.
 * @param createError - A function that creates and returns an error object.
 * @returns A Task that throws the created error when executed.
 */
export const throwError = effect((createError: () => any) => {
  throw createError();
});

/**
 * Creates a Task that delays execution for a specified number of milliseconds.
 * @param ms - The number of milliseconds to delay.
 * @returns A Task that delays execution for the specified time when executed.
 */
export function delay(ms: number): Task<void, any[]> {
  return (context) => context.delay(ms);
}

/**
 * Chains multiple Tasks together, executing them sequentially.
 * The output of each Task is passed as the input to the next Task.
 * @param tasks - An array of Tasks to chain together.
 * @returns A Task that represents the chained execution of the provided Tasks.
 */
export function chain<RS extends any[], A extends any[]>(
  tasks: Task.Chain<RS, A>
): Task<Last<RS>, A> {
  return async (context, ...args) => {
    let lastResult: any = args;

    for (const task of tasks) {
      lastResult = await context.run(task, [lastResult] as any);
    }

    return lastResult;
  };
}

/**
 * Executes multiple Tasks concurrently and returns the result of the first Task to complete.
 * All other Tasks are cancelled once one completes.
 * @param tasks - An array of Tasks to execute concurrently.
 * @returns A Task that resolves with the result of the first completed Task.
 */
export function race<R, A extends readonly any[] = []>(
  tasks: Task<R, { [AK in keyof A]?: A[AK] }>[],
  options: { maxBranch?: number | undefined } = {}
): Task<R, A> {
  return async (context, ...args) => {
    return await context
      .launch(
        async (context) => {
          const jobs = mapTasksToJobs(tasks, args, context);

          try {
            return (await Promise.race(jobs.map((p) => p.join()))) as R;
          } finally {
            context.cancelAllChildren();
          }
        },
        { ...options, isSupervisor: true }
      )
      .join();
  };
}

/**
 * Executes multiple Tasks concurrently and returns the result of the first Task to successfully complete.
 * If all Tasks fail, an AggregateError is thrown.
 * All other Tasks are cancelled once one completes successfully.
 * @param tasks - An array of Tasks to execute concurrently.
 * @returns A Task that resolves with the result of the first successfully completed Task.
 */
export function any<R, A extends readonly any[] = []>(
  tasks: Task<R, { [AK in keyof A]?: A[AK] }>[],
  options: { maxBranch?: number | undefined } = {}
): Task<R, A> {
  return async (context, ...args) => {
    return await context
      .launch(
        async (context) => {
          const jobs = mapTasksToJobs(tasks, args, context);
          return await Promise.any(jobs.map((d) => d.join()));
        },
        {
          ...options,
          isSupervisor: true,
        }
      )
      .join();
  };
}

/**
 * Executes multiple Tasks concurrently and waits for all to complete.
 * Returns an array of results corresponding to each Task.
 * @param tasks - An array of Tasks to execute concurrently.
 * @returns A Task that resolves with an array of results from all completed Tasks.
 */
export function all<RS extends any[], A extends readonly any[] = []>(
  tasks: {
    [K in keyof RS]: Task<RS[K], { [AK in keyof A]?: A[AK] }>;
  },
  options: { maxBranch?: number | undefined } = {}
): Task<RS, A> {
  return async (context, ...args) => {
    return await context
      .launch(async (context) => {
        const jobs = mapTasksToJobs(tasks, args, context);
        return (await Promise.all(jobs.map((d) => d.join()))) as RS;
      }, options)
      .join();
  };
}

/**
 * Executes multiple Tasks concurrently and waits for all to settle (either resolve or reject).
 * Returns an array of PromiseSettledResult objects corresponding to each Task.
 * @param tasks - An array of Tasks to execute concurrently.
 * @returns A Task that resolves with an array of PromiseSettledResult objects from all settled Tasks.
 */
export function allSettled<RS extends any[], A extends readonly any[] = []>(
  tasks: {
    [K in keyof RS]: Task<RS[K], { [AK in keyof A]?: A[AK] }>;
  },
  options: { maxBranch?: number | undefined } = {}
): Task<{ [K in keyof RS]: PromiseSettledResult<RS[K]> }, A> {
  return async (context, ...args) => {
    return await context
      .launch(
        async (context) => {
          const jobs = mapTasksToJobs(tasks, args, context);
          return (await Promise.allSettled(jobs.map((d) => d.join()))) as any;
        },
        { ...options, isSupervisor: true }
      )
      .join();
  };
}

function mapTasksToJobs<A extends readonly any[]>(
  tasks: Task<unknown, A>[],
  args: A,
  context: Task.Context
): Task.Job<any>[] {
  return tasks.map((task) => context.launch(task, { args }));
}

/**
 * A Task that cancels all child contexts of the current context when executed.
 * This is useful for stopping all ongoing child tasks.
 */
export const cancelAllChildren: Task = (context) => {
  context.cancelAllChildren();
};

/**
 * A Task that cancels the current context when executed.
 */
export const cancelContext: Task = (context) => {
  context.cancel();
};

/**
 * A Task that cancels the parent context of the current context when executed.
 * If there is no parent context, it throws a CancellationError.
 */
export const cancelParent: Task = (context) => {
  const parent = context.parent;
  if (parent) {
    parent.cancel();
  } else {
    throw new CancellationError();
  }
};

export const runSingleCancelPrevious: {
  (
    context?: Task.Context | undefined
  ): <R, A extends readonly any[]>(task: Task<R, A>, ...args: A) => Task.Job<R>;
  (context?: Task.Context | undefined): <R>(task: Task<R>) => Task.Job<R>;
} = (context = Task.rootContext) => {
  let current: Task.Job | undefined;

  return (task: Task<any, any[]>, ...args: any[]) => {
    current?.cancel();
    current = context.launch(
      [
        task,
        (): void => {
          current = undefined;
        },
      ],
      { args, maxBranch: 1 }
    );

    return current;
  };
};

export const runSingleCancelNew: {
  (
    context?: Task.Context | undefined
  ): <R, A extends readonly any[]>(task: Task<R, A>, ...args: A) => Task.Job<R>;
  (context?: Task.Context | undefined): <R>(task: Task<R>) => Task.Job<R>;
} = (context = Task.rootContext) => {
  let current: Task.Job | undefined;

  return (task: Task<any, any[]>, ...args: any[]) => {
    if (current) {
      return context.launch(cancelContext);
    }

    current = context.launch(
      [
        task,
        (): void => {
          current = undefined;
        },
      ],
      { args }
    );

    return current;
  };
};
