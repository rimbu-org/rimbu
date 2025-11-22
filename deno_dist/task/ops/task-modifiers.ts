import {
  CancellationError,
  RetryExhaustedError,
  type Task,
  TimeoutError,
} from '../../task/mod.ts';

import { delay, race, throwErrorClass } from './internal.ts';

/**
 * Combines multiple Task modifiers into a single modifier.
 * If no modifiers are provided, returns an identity modifier.
 * Modifiers are applied in the order they are provided.
 * @param modifiers - An array of Task modifiers to combine.
 * @returns A single Task modifier that applies all provided modifiers in sequence.
 */
export function combined(...modifiers: Task.Modifier[]): Task.Modifier {
  if (modifiers.length === 0) {
    return (task) => task;
  }

  return modifiers.reduce(
    (combinedModifier, modifier) => (task) => combinedModifier(modifier(task))
  );
}

/**
 * Applies a timeout to a Task. If the Task does not complete within the specified time,
 * it will be cancelled and a TimeoutError will be thrown.
 * @param ms - The timeout duration in milliseconds.
 * @returns A Task modifier that applies the timeout.
 */
export function withTimeout(ms: number): Task.Modifier {
  return (task) => race([task, [delay(ms), throwErrorClass(TimeoutError)]]);
}

/**
 * Retries a Task a specified number of times with optional delays between attempts.
 * If the Task fails after all attempts, a RetryExhaustedError is thrown.
 * @param times - The maximum number of retry attempts. If undefined, retries indefinitely.
 * @param delayMsArray - An array of delay durations in milliseconds between attempts.
 *                       The delay for each attempt is taken from this array in order,
 *                       and if there are more attempts than delays, the last delay is used for all remaining attempts.
 * @returns A Task modifier that applies the retry logic.
 */
export function withRetry(
  times?: number | undefined,
  delayMsArray: number[] = []
): Task.Modifier {
  return (task) =>
    async (context, ...args) => {
      if (undefined !== times && times <= 0) {
        throw new RetryExhaustedError();
      }

      let currentTry = 0;

      while (undefined === times || currentTry < times) {
        try {
          return await context.run(task, args);
        } catch (error) {
          if (error instanceof CancellationError) {
            // do not retry on cancellation
            throw error;
          }

          const delayMs =
            delayMsArray[Math.min(currentTry, delayMsArray.length - 1)] ?? 0;

          if (delayMs > 0) {
            await context.delay(delayMs);
          }
        }

        currentTry++;
      }

      throw new RetryExhaustedError();
    };
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
 * The mapping function receives the output of the Task as its arguments.
 * @param fn - The function to map the Task's output.
 * @returns A Task that applies the mapping function to the output of the original Task.
 */
export function mapOutput<RO, RI extends [any]>(
  fn: (...input: RI) => RO
): Task<RO, RI> {
  return (_, ...input) => fn(...input);
}

/**
 * Maps the output of a Task that returns an array using a provided function.
 * The mapping function receives the elements of the output array as its arguments.
 * @param fn - The function to map the Task's output array.
 * @returns A Task that applies the mapping function to the elements of the output array of the original Task.
 */
export function mapOutputArr<RO, RI extends readonly any[]>(
  fn: (...input: RI) => RO
): Task<RO, [RI]> {
  return (_, [input]) => fn(...input);
}

/**
 * Catches errors thrown by a Task and allows for handling them with a provided function.
 * If the handling function returns a Task, it will be executed; otherwise, the original error is re-thrown.
 * Note that CancellationError is not caught and will always be re-thrown.
 * @param onError - A function that takes an error and returns a Task to handle it, or undefined to re-throw the error.
 * @returns A Task modifier that applies the error handling logic.
 */
export function catchError<R = never>(
  onError?: ((error: any) => Task<R> | undefined) | undefined
): Task.Modifier<R> {
  if (undefined === onError) {
    return (task) => task;
  }

  return (task) =>
    async (context, ...args) => {
      try {
        return await context.run(task, args);
      } catch (error) {
        if (error instanceof CancellationError) {
          // do not catch cancellation errors
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
 * Note that CancellationError is not caught and will always be re-thrown.
 * @param onError - A Task to execute when an error is caught, or undefined to return undefined on error.
 * @returns A Task modifier that applies the error handling logic.
 */
export function catchAll<R = undefined>(
  onError?: Task<R> | undefined
): Task.Modifier<R> {
  if (undefined === onError) {
    return catchError<undefined>(() => () => undefined);
  }

  return catchError(() => onError);
}

/**
 * Repeats a Task a specified number of times.
 * @param times - The number of times to repeat the Task.
 * @returns A Task modifier that repeats the original Task the specified number of times.
 */
export function repeat(
  times: number
): <A extends readonly any[] = []>(
  task: Task<unknown, [...A, number]>
) => Task<void, A> {
  return (task) =>
    async (context, ...args) => {
      let index = -1;

      while (++index < times) {
        await context.run(task, [...args, index]);
      }
    };
}
