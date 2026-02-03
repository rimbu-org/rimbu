import { describe, expect, it } from 'bun:test';

import { Mutex } from '@rimbu/channel/mutex';

describe('Mutex', () => {
  it('disallows acquiring twice synchronously', () => {
    const sem = Mutex.create();

    const a1 = sem.acquire(undefined, { timeoutMs: 100 });
    const a2 = sem.acquire(undefined, { timeoutMs: 100 });

    expect(a1).resolves.toBeUndefined();
    expect(a2).rejects.toThrow();
  });
});
