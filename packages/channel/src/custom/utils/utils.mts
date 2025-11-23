/**
 * Attaches the given function to the given abort signal if the signal is not undefined or aborted.
 * Returns a cleanup function that will remove the function from the abort signal or undefined in case
 * one of the conditions mentioned earlier prevents the function from being attached.
 * @param signal - the abort signal to attach the function to
 * @param fn - the function to attach to the abort signal
 */
export function attachAbort(
  signal: AbortSignal | undefined,
  fn: () => void
): undefined | (() => void) {
  if (signal === undefined) {
    return undefined;
  }

  if (signal.aborted) {
    fn();
    return undefined;
  }

  signal.addEventListener('abort', fn, { once: true });

  return () => signal.removeEventListener('abort', fn);
}

/**
 * Returns a promise that is resolved after the given amount of milliseconds.
 * @param timeOutMs - (optional) the amount of milliseconds to wait to resolve
 */
export function timeout(timeOutMs?: number): Promise<void> {
  return new Promise<void>((resolve) => {
    if (timeOutMs === undefined) {
      resolve();
      return;
    }

    setTimeout(resolve, timeOutMs);
  });
}

/**
 * Returns a promise that will resolve deferred (immediately but not in the current loop).
 */
export function defer(): Promise<void> {
  return timeout(0);
}

/**
 * Performs the given `action` function after the given `timeoutMs` milliseconds, unless
 * the returns cancel function is called before the timer expires.
 * @param action - the action function to perform
 * @param timeoutMs - (optional) the amount of milliseconds to wait before executing the action
 */
export function timeoutAction(
  action: () => unknown,
  timeoutMs?: number
): undefined | (() => void) {
  if (timeoutMs === undefined) {
    return undefined;
  }

  // prevent keeping reference to incoming function
  let copyAction: undefined | (() => void) = action;

  timeout(timeoutMs).then(() => {
    copyAction?.();
    copyAction = undefined;
  });

  return () => {
    copyAction = undefined;
  };
}

/**
 * Returns a random integer between the given `min` and `max` (both inclusive).
 * @param min - the minimum value that can be generated
 * @param max - the maximum value that can be generated
 */
export function getRandomInt(min: number, max: number): number {
  return min + Math.round(Math.random() * (max - min));
}

/**
 * Returns a four-digit random number that can serve as a sequence number.
 */
export function getRandomSequenceNumber(): number {
  return getRandomInt(1000, 9999);
}

/**
 * Utility that can be used to clean up resources after usage.
 */
export interface Cleaner {
  /**
   * Adds the given actions to the queue for clean-up.
   * @param actions - a number of actions to add
   */
  add(...actions: Array<(() => void) | undefined>): void;
  /**
   * Executes the added clean-up functions and clears the Cleaner.
   */
  cleanup(): void;
}

export function createCleaner(): Cleaner {
  const actionsSet = new Set<() => void>();

  return {
    add(...actions): void {
      for (const action of actions) {
        if (action !== undefined) {
          actionsSet.add(action);
        }
      }
    },
    cleanup(): void {
      for (const action of actionsSet) {
        action();
      }
      actionsSet.clear();
    },
  };
}
