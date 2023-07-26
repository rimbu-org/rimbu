export function attachAbort(
  signal: AbortSignal | undefined,
  fn: () => void
): undefined | (() => void) {
  if (signal === undefined || signal.aborted) {
    return undefined;
  }

  signal.addEventListener('abort', fn, { once: true });

  return () => signal.removeEventListener('abort', fn);
}

export function timeout(timeOutMs?: number): Promise<void> {
  return new Promise<void>((resolve) => {
    if (timeOutMs === undefined) {
      resolve();
      return;
    }

    setTimeout(resolve, timeOutMs);
  });
}

export function defer(): Promise<void> {
  return timeout(0);
}

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

export function getRandomInt(min: number, max: number): number {
  return min + Math.round(Math.random() * (max - min));
}

export function getRandomBool(): boolean {
  return getRandomInt(0, 1) === 0;
}

export function getRandomSequenceNumber(): number {
  return getRandomInt(1000, 9999);
}

export interface Cleaner {
  add(...actions: Array<(() => void) | undefined>): void;
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
