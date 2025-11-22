import { CancellationError, TimeoutError } from './internal.mjs';

export type Last<T extends any[], O = never> = T extends [...any[], infer L]
  ? L
  : O;

export type Prepend<I, T extends any[]> = [I, ...T];

export type DisposablePromise<T> = Promise<T> & Disposable;

export type Cleanup = (() => void) | Disposable;

export type DisposableCallback = (() => void) & Disposable;

const EMPTY_CALLBACK_AND_DISPOSABLE: DisposableCallback = toDisposableCallback(
  () => {}
);

export function disposableDelay(ms: number): DisposablePromise<void> {
  let resolve!: () => void;
  let reject!: (reason?: any) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  const timeout = setTimeout(resolve, ms);

  return promiseToDisposable(promise, () => {
    clearTimeout(timeout);
    reject(new CancellationError());
  });
}

export async function withTimeout<R>(
  promise: Promise<R>,
  timeoutMs?: number | undefined
): Promise<R> {
  if (undefined === timeoutMs) {
    return promise;
  }

  using delayPromise = disposableDelay(timeoutMs);

  return await Promise.race([
    promise,
    delayPromise.then(() => {
      throw new TimeoutError();
    }),
  ]);
}

export function cleanupOn(
  signal: AbortSignal | undefined,
  cleanup: Cleanup
): DisposableCallback {
  if (undefined === signal) {
    return EMPTY_CALLBACK_AND_DISPOSABLE;
  }

  const callback = cleanupToCallback(cleanup);

  if (signal.aborted) {
    callback();
    return EMPTY_CALLBACK_AND_DISPOSABLE;
  }

  signal.addEventListener('abort', callback, { once: true });

  return toDisposableCallback(() => {
    signal.removeEventListener('abort', callback);
  });
}

export function toDisposableCallback(callback: () => void): DisposableCallback {
  const result = callback as DisposableCallback;
  result[Symbol.dispose] = callback;

  return result;
}

export function cleanupToCallback(cleanup: Cleanup): () => void {
  if (Symbol.dispose in cleanup) {
    return cleanup[Symbol.dispose];
  }
  if (typeof cleanup === 'function') {
    return cleanup;
  }

  throw new Error('Invalid cleanup type');
}

export function promiseToDisposable<T>(
  promise: Promise<T>,
  cleanup: Cleanup
): DisposablePromise<T> {
  const result = promise as DisposablePromise<T>;
  result[Symbol.dispose] = cleanupToCallback(cleanup);
  return result;
}
