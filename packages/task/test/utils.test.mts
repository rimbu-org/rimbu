import { CancellationError, TimeoutError } from '@rimbu/task';

// Import internal utility functions directly from source
import {
  disposableDelay,
  withTimeout as internalWithTimeout,
  cleanupOn,
  toDisposableCallback,
  cleanupToCallback,
  promiseToDisposable,
} from '../src/main/utils.mjs';

describe(disposableDelay.name, () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves after the given delay', async () => {
    vi.useFakeTimers();
    const p = disposableDelay(100);
    vi.advanceTimersByTime(100);
    await expect(p).resolves.toBeUndefined();
    // disposing after resolution should be harmless
    p[Symbol.dispose]();
  });

  it('rejects with CancellationError when disposed before resolving', async () => {
    vi.useFakeTimers();
    const p = disposableDelay(1000);
    p[Symbol.dispose]();
    await expect(p).rejects.toThrow(CancellationError);
  });
});

describe('internal withTimeout', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns original promise when timeoutMs is undefined', async () => {
    const result = await internalWithTimeout(Promise.resolve('ok'));
    expect(result).toBe('ok');
  });

  it('resolves if inner promise settles before timeout', async () => {
    const result = await internalWithTimeout(Promise.resolve('fast'), 50);
    expect(result).toBe('fast');
  });

  it('throws TimeoutError if promise does not settle before timeout', async () => {
    vi.useFakeTimers();
    const never = new Promise<void>(() => {});
    const timed = internalWithTimeout(never, 100);
    vi.advanceTimersByTime(100);
    await expect(timed).rejects.toThrow(TimeoutError);
  });
});

describe(cleanupOn.name, () => {
  it('returns empty disposable when signal is undefined', () => {
    let called = 0;
    const cleanup = () => {
      called++;
    };
    const result = cleanupOn(undefined, cleanup);
    // invoking returned callback should do nothing
    result();
    result[Symbol.dispose]();
    expect(called).toBe(0);
  });

  it('invokes cleanup immediately if signal already aborted', () => {
    let called = 0;
    const cleanup = () => {
      called++;
    };
    const ac = new AbortController();
    ac.abort();
    const result = cleanupOn(ac.signal, cleanup);
    expect(called).toBe(1);
    // returned disposable should be empty (calling does not increment)
    result();
    result[Symbol.dispose]();
    expect(called).toBe(1);
  });

  it('registers listener and executes cleanup on abort, disposable removes listener', () => {
    let called = 0;
    const cleanup = () => {
      called++;
    };
    const ac = new AbortController();
    const disposable = cleanupOn(ac.signal, cleanup);
    expect(called).toBe(0);
    ac.abort();
    expect(called).toBe(1);
    // dispose (remove listener) — no further effect
    disposable[Symbol.dispose]();
    expect(called).toBe(1);
  });
});

describe(toDisposableCallback.name, () => {
  it('assigns Symbol.dispose and both invoke the original callback', () => {
    let count = 0;
    const cb = toDisposableCallback(() => {
      count++;
    });
    cb();
    expect(count).toBe(1);
    cb[Symbol.dispose]();
    expect(count).toBe(2);
  });
});

describe(cleanupToCallback.name, () => {
  it('returns the function when given a plain function', () => {
    let count = 0;
    const fn = () => {
      count++;
    };
    const cb = cleanupToCallback(fn);
    cb();
    expect(count).toBe(1);
  });

  it('returns the dispose method when given a disposable', () => {
    let count = 0;
    const disp = toDisposableCallback(() => {
      count++;
    });
    const cb = cleanupToCallback(disp);
    cb();
    expect(count).toBe(1);
  });

  it('throws on invalid cleanup type', () => {
    expect(() => cleanupToCallback({} as any)).toThrow('Invalid cleanup type');
  });
});

describe(promiseToDisposable.name, () => {
  it('attaches cleanup that can be invoked via Symbol.dispose', async () => {
    let cleaned = 0;
    const p = Promise.resolve('value');
    const disposable = promiseToDisposable(p, () => {
      cleaned++;
    });
    disposable[Symbol.dispose]();
    expect(cleaned).toBe(1);
    await expect(disposable).resolves.toBe('value');
  });

  it('invokes provided cleanup before unresolved promise settles', async () => {
    vi.useFakeTimers();
    let cleaned = 0;
    let resolved = false;
    const p = new Promise<string>((resolve) => {
      setTimeout(() => {
        resolved = true;
        resolve('late');
      }, 1000);
    });
    const disposable = promiseToDisposable(p, () => {
      cleaned++;
    });
    disposable[Symbol.dispose]();
    expect(cleaned).toBe(1);
    vi.advanceTimersByTime(1000);
    // Still resolves (cleanup does not cancel promise implementation here)
    await expect(disposable).resolves.toBe('late');
    expect(resolved).toBe(true);
  });
});
