import type { Task } from '@rimbu/task';

import { Task as TaskValue } from '@rimbu/task';

/**
 * Creates a Task that applies a side-effect function when executed.
 * The side-effect function receives the same arguments as the Task.
 * @param fn - The side-effect function to apply.
 * @returns A function that takes arguments and returns a Task executing the side-effect.
 */
export function effect<R, A extends readonly any[] = []>(
	fn: (...args: A) => R,
): (...args: A) => Task<R> {
	return (...args) =>
		() =>
			fn(...args);
}

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
 * Respects cancellation — throws CancellationError if the context is cancelled during the delay.
 * @param ms - The number of milliseconds to delay.
 * @returns A Task that delays execution for the specified time when executed.
 */
export function delay(ms: number): Task<void, any[]> {
	return (context) => context.delay(ms);
}

/**
 * Chains multiple Tasks together, executing them sequentially.
 * The output of each Task is passed as a single argument to the next Task.
 * @param tasks - Tasks to chain together, in order.
 * @returns A Task that represents the chained sequential execution of the provided Tasks.
 *
 * Example:
 * ```ts
 * const pipeline = chain(
 *   async (_ctx, id: number) => ({ id, name: 'User ' + id }),
 *   async (_ctx, user: { id: number; name: string }) => user.name,
 *   mapOutput((name: string) => name.length),
 * );
 * // pipeline: Task<number, [number]>
 * ```
 */
export function chain<RS extends any[], A extends any[]>(
	...tasks: Task.Chain<RS, A>
): Task<Task.Last<RS>, A> {
	return async (context, ...args) => {
		let lastResult: any;
		let isFirst = true;

		for (const task of tasks) {
			if (isFirst) {
				lastResult = await context.run(task as Task<any, any>, args as any);
				isFirst = false;
			} else {
				lastResult = await context.run(
					task as Task<any, any>,
					[lastResult] as any,
				);
			}
		}

		return lastResult;
	};
}

/**
 * Executes multiple Tasks concurrently and returns the result of the first Task to complete.
 * All other Tasks are cancelled once one completes.
 * @param tasks - Tasks to execute concurrently.
 * @returns A Task that resolves with the result of the first completed Task.
 */
export function race<R, A extends readonly any[] = []>(
	...tasks: Task<R, { [AK in keyof A]?: A[AK] }>[]
): Task<R, A>;
export function race<R, A extends readonly any[] = []>(
	...args: [...Task<R, { [AK in keyof A]?: A[AK] }>[], { maxBranch?: number }]
): Task<R, A>;
export function race<R, A extends readonly any[] = []>(
	...args: any[]
): Task<R, A> {
	const { tasks, options } = splitTasksAndOptions(args);

	return async (context, ...callArgs) => {
		return await context
			.launch(
				async (context) => {
					const jobs = mapTasksToJobs(tasks, callArgs, context);

					try {
						return (await Promise.race(jobs.map((p) => p.join()))) as R;
					} finally {
						context.cancelAllChildren();
					}
				},
				{ ...options, isolated: true },
			)
			.join();
	};
}

/**
 * Executes multiple Tasks concurrently and returns the result of the first Task to successfully complete.
 * If all Tasks fail, an AggregateError is thrown.
 * All other Tasks are cancelled once one completes successfully.
 * @param tasks - Tasks to execute concurrently.
 * @returns A Task that resolves with the result of the first successfully completed Task.
 */
export function any<R, A extends readonly any[] = []>(
	...tasks: Task<R, { [AK in keyof A]?: A[AK] }>[]
): Task<R, A>;
export function any<R, A extends readonly any[] = []>(
	...args: [...Task<R, { [AK in keyof A]?: A[AK] }>[], { maxBranch?: number }]
): Task<R, A>;
export function any<R, A extends readonly any[] = []>(
	...args: any[]
): Task<R, A> {
	const { tasks, options } = splitTasksAndOptions(args);

	return async (context, ...callArgs) => {
		return await context
			.launch(
				async (context) => {
					const jobs = mapTasksToJobs(tasks, callArgs, context);
					return await Promise.any(jobs.map((d) => d.join()));
				},
				{ ...options, isolated: true },
			)
			.join();
	};
}

/**
 * Executes multiple Tasks concurrently and waits for all to complete.
 * Returns an array of results corresponding to each Task.
 * @param tasks - Tasks to execute concurrently.
 * @returns A Task that resolves with an array of results from all completed Tasks.
 */
export function all<RS extends any[], A extends readonly any[] = []>(
	...tasks: { [K in keyof RS]: Task<RS[K], { [AK in keyof A]?: A[AK] }> }
): Task<RS, A>;
export function all<RS extends any[], A extends readonly any[] = []>(
	...args: [
		...{ [K in keyof RS]: Task<RS[K], { [AK in keyof A]?: A[AK] }> },
		{ maxBranch?: number },
	]
): Task<RS, A>;
export function all<RS extends any[], A extends readonly any[] = []>(
	...args: any[]
): Task<RS, A> {
	const { tasks, options } = splitTasksAndOptions(args);

	return async (context, ...callArgs) => {
		return await context
			.launch(async (context) => {
				const jobs = mapTasksToJobs(tasks, callArgs, context);
				return (await Promise.all(jobs.map((d) => d.join()))) as RS;
			}, options)
			.join();
	};
}

/**
 * Executes multiple Tasks concurrently and waits for all to settle (either resolve or reject).
 * Returns an array of PromiseSettledResult objects corresponding to each Task.
 * @param tasks - Tasks to execute concurrently.
 * @returns A Task that resolves with an array of PromiseSettledResult objects from all settled Tasks.
 */
export function allSettled<RS extends any[], A extends readonly any[] = []>(
	...tasks: { [K in keyof RS]: Task<RS[K], { [AK in keyof A]?: A[AK] }> }
): Task<{ [K in keyof RS]: PromiseSettledResult<RS[K]> }, A>;
export function allSettled<RS extends any[], A extends readonly any[] = []>(
	...args: [
		...{ [K in keyof RS]: Task<RS[K], { [AK in keyof A]?: A[AK] }> },
		{ maxBranch?: number },
	]
): Task<{ [K in keyof RS]: PromiseSettledResult<RS[K]> }, A>;
export function allSettled<RS extends any[], A extends readonly any[] = []>(
	...args: any[]
): Task<{ [K in keyof RS]: PromiseSettledResult<RS[K]> }, A> {
	const { tasks, options } = splitTasksAndOptions(args);

	return async (context, ...callArgs) => {
		return await context
			.launch(
				async (context) => {
					const jobs = mapTasksToJobs(tasks, callArgs, context);
					return (await Promise.allSettled(jobs.map((d) => d.join()))) as any;
				},
				{ ...options, isolated: true },
			)
			.join();
	};
}

function splitTasksAndOptions(args: any[]): {
	tasks: Task<any, any>[];
	options: { maxBranch?: number };
} {
	const last = args[args.length - 1];
	if (
		args.length > 0 &&
		typeof last === 'object' &&
		last !== null &&
		typeof last !== 'function' &&
		!('length' in last)
	) {
		return { tasks: args.slice(0, -1), options: last };
	}
	return { tasks: args, options: {} };
}

function mapTasksToJobs<A extends readonly any[]>(
	tasks: Task<unknown, A>[],
	args: A,
	context: Task.Context,
): Task.Job<any>[] {
	return tasks.map((task) => context.launch(task, { args }));
}

/**
 * A Task that cancels all child contexts of the current context when executed.
 * Useful for stopping all ongoing child tasks.
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

export const runSingleCancelPrevious: {
	(
		context?: Task.Context | undefined,
	): <R, A extends readonly any[]>(task: Task<R, A>, ...args: A) => Task.Job<R>;
	(context?: Task.Context | undefined): <R>(task: Task<R>) => Task.Job<R>;
} = (context?: Task.Context) => {
	const ctx = context ?? TaskValue.rootContext;
	let current: Task.Job | undefined;

	return (task: Task<any, any[]>, ...args: any[]) => {
		current?.cancel();
		let job!: Task.Job;
		job = ctx.launch(
			chain(task, (): void => {
				// Only clear `current` if it still points at *this* job. If a
				// subsequent invocation has already overwritten `current` with
				// a newer job, this cleanup must not stomp on that pointer or
				// we would lose the handle to the in-flight new job.
				if (current === job) current = undefined;
			}),
			{ args, maxBranch: 1 },
		);
		current = job;

		return job;
	};
};

export const runSingleCancelNew: {
	(
		context?: Task.Context | undefined,
	): <R, A extends readonly any[]>(task: Task<R, A>, ...args: A) => Task.Job<R>;
	(context?: Task.Context | undefined): <R>(task: Task<R>) => Task.Job<R>;
} = (context?: Task.Context) => {
	const ctx = context ?? TaskValue.rootContext;
	let current: Task.Job | undefined;

	return (task: Task<any, any[]>, ...args: any[]) => {
		if (current) {
			return ctx.launch(cancelContext);
		}

		let job!: Task.Job;
		job = ctx.launch(
			chain(task, (): void => {
				if (current === job) current = undefined;
			}),
			{ args },
		);
		current = job;

		return job;
	};
};
