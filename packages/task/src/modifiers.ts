import type { Task } from '@rimbu/task';

import { TaskCancellationError, TaskTimeoutError } from '@rimbu/task';
import { chain, delay, race, throwErrorClass } from '@rimbu/task/ops-impl';

/**
 * Combines multiple Task modifiers into a single modifier.
 * If no modifiers are provided, returns an identity modifier.
 * Modifiers are applied in the order they are provided.
 * @param modifiers - Task modifiers to combine.
 * @returns A single Task modifier that applies all provided modifiers in sequence.
 */
export function combined(...modifiers: Task.Modifier[]): Task.Modifier {
	if (modifiers.length === 0) {
		return (task) => task;
	}

	return modifiers.reduce(
		(combinedModifier, modifier) => (task) => combinedModifier(modifier(task)),
	);
}

/**
 * Applies a timeout to a Task. If the Task does not complete within the specified time,
 * it will be cancelled and a TimeoutError will be thrown.
 * @param ms - The timeout duration in milliseconds.
 * @returns A Task modifier that applies the timeout.
 */
export function withTimeout(ms: number): Task.Modifier {
	return (task) =>
		race(task, chain(delay(ms), throwErrorClass(TaskTimeoutError)));
}

/**
 * A low-level retry primitive with full control over retry behaviour.
 * The control function receives the error and the attempt number (0-based),
 * and returns either a delay in milliseconds before the next attempt,
 * or `false` to stop retrying and re-throw the error.
 * @param fn - Control function: `(error, attempt) => delayMs | false`
 * @returns A Task modifier that applies the retry logic.
 *
 * Example:
 * ```ts
 * const retried = retryWhen((error, attempt) => {
 *   if (attempt >= 3 || error instanceof FatalError) return false;
 *   return 100 * (attempt + 1); // exponential-ish backoff
 * })(myTask);
 * ```
 */
export function retryWhen(
	fn: (error: unknown, attempt: number) => number | false,
): Task.Modifier {
	return (task) =>
		async (context, ...args) => {
			let attempt = 0;

			while (true) {
				try {
					return await context.run(task, args);
				} catch (error) {
					if (error instanceof TaskCancellationError) {
						throw error;
					}

					const result = fn(error, attempt);

					if (result === false) {
						throw error;
					}

					if (result > 0) {
						await context.delay(result);
					}

					attempt++;
				}
			}
		};
}

/**
 * Retries a Task a specified total number of times, with optional delays between attempts.
 * If the Task fails after every attempt, the last error is re-thrown.
 *
 * `maxAttempts` is the **total** number of times the task may run, including the
 * first invocation. `withRetry(1)` therefore runs the task exactly once with no
 * retries; `withRetry(3)` runs it up to three times.
 *
 * The `delays` array supplies the wait between consecutive attempts:
 * `delays[0]` is used between attempts 0 and 1, `delays[1]` between 1 and 2,
 * and so on. If there are more inter-attempt gaps than delays supplied, the
 * last delay is reused for the remaining gaps. An empty `delays` array (or
 * omitting the option) means no waiting between attempts.
 *
 * @param maxAttempts - The maximum total number of attempts (including the initial call).
 *   Passing a value less than 1 causes the task to run exactly once and then rethrow.
 * @param options - Optional configuration:
 *   - `delays`: Array of delay durations in milliseconds between consecutive attempts.
 *   - `onRetry`: Called after each failed attempt that will be followed by another
 *     attempt. Receives the error and the 0-based attempt index that just failed.
 * @returns A Task modifier that applies the retry logic.
 */
export function withRetry(
	maxAttempts: number,
	options: {
		delays?: number[];
		onRetry?: (error: unknown, attempt: number) => void;
	} = {},
): Task.Modifier {
	const { delays = [], onRetry } = options;

	return retryWhen((error, attempt) => {
		if (attempt + 1 >= maxAttempts) {
			return false;
		}

		onRetry?.(error, attempt);

		if (delays.length === 0) return 0;
		return delays[Math.min(attempt, delays.length - 1)];
	});
}

/**
 * Binds specific arguments to a Task, returning a new Task that requires no arguments.
 * @param task - The original Task to bind arguments to.
 * @param args - The arguments to bind to the Task.
 * @returns A new Task that, when executed, will run the original Task with the bound arguments.
 */
export function withArgs<R, A extends readonly any[]>(
	task: Task<R, A>,
	...args: A
): Task<R> {
	return (context) => context.run(task, args);
}

/**
 * Maps the output of a Task using a provided function.
 * The mapping function receives the output of the Task as its argument.
 * @param fn - The function to map the Task's output.
 * @returns A Task that applies the mapping function to the output of the original Task.
 */
export function mapOutput<RO, RI>(fn: (input: RI) => RO): Task<RO, [RI]> {
	return (_, input) => fn(input);
}

/**
 * Maps the output of a Task that returns an array using a provided function.
 * The mapping function receives the elements of the output array as its arguments.
 * @param fn - The function to map the Task's output array.
 * @returns A Task that applies the mapping function to the elements of the output array.
 */
export function mapOutputArr<RO, RI extends readonly any[]>(
	fn: (...input: RI) => RO,
): Task<RO, [RI]> {
	return (_, input) => fn(...input);
}

/**
 * Catches errors thrown by a Task and allows for handling them with a provided function.
 * If the handling function returns a Task, it will be executed; otherwise, the original error is re-thrown.
 * CancellationError is never caught and will always be re-thrown.
 * @param onError - A function that takes an error and returns a Task to handle it, or undefined to re-throw the error.
 * @returns A Task modifier that applies the error handling logic.
 */
export function catchError<R = never>(
	onError?: ((error: any) => Task<R> | undefined) | undefined,
): Task.Modifier<R> {
	if (undefined === onError) {
		return (task) => task;
	}

	return (task) =>
		async (context, ...args) => {
			try {
				return await context.run(task, args);
			} catch (error) {
				if (error instanceof TaskCancellationError) {
					throw error;
				}

				const errorTask = onError(error);

				if (undefined === errorTask) {
					throw error;
				}

				return await context.run(errorTask);
			}
		};
}

/**
 * Catches all errors thrown by a Task and allows for handling them with a provided Task.
 * If no handling Task is provided, errors are caught and undefined is returned.
 * CancellationError is never caught and will always be re-thrown.
 * @param onError - A Task to execute when an error is caught, or undefined to return undefined on error.
 * @returns A Task modifier that applies the error handling logic.
 */
export function catchAll<R = undefined>(
	onError?: Task<R> | undefined,
): Task.Modifier<R> {
	if (undefined === onError) {
		return catchError<undefined>(() => () => undefined);
	}

	return catchError(() => onError);
}

/**
 * Repeats a Task a specified number of times.
 * The task receives no index — use `repeatWithIndex` if you need the iteration index.
 * @param times - The number of times to repeat the Task.
 * @returns A Task modifier that repeats the original Task the specified number of times.
 */
export function repeat(
	times: number,
): <A extends readonly any[]>(task: Task<unknown, A>) => Task<void, A> {
	return (task) =>
		async (context, ...args) => {
			for (let i = 0; i < times; i++) {
				await context.run(task, args);
			}
		};
}

/**
 * Repeats a task factory a specified number of times, passing the current index to the factory.
 * The factory receives the index (0-based) and returns the Task to run for that iteration.
 * @param times - The number of times to repeat.
 * @param factory - A function that receives the iteration index and returns a Task.
 * @returns A Task with no arguments that runs the factory-produced tasks in sequence.
 *
 * Example:
 * ```ts
 * const indexed = repeatWithIndex(3, (i) => Task.fn((ctx) => console.log(i)));
 * await Task.launch(indexed).join(); // logs 0, 1, 2
 * ```
 */
export function repeatWithIndex(
	times: number,
	factory: (index: number) => Task,
): Task {
	return async (context) => {
		for (let i = 0; i < times; i++) {
			await context.run(factory(i));
		}
	};
}
