import { describe, expect, it } from 'bun:test';

import { Mutex } from '@rimbu/channel/mutex';

describe('Mutex', () => {
  it('disallows acquiring twice synchronously', async () => {
    const sem = Mutex.create();

    const a1 = sem.acquire(undefined, { timeoutMs: 100 });
    const a2 = sem.acquire(undefined, { timeoutMs: 100 });

    await expect(a1).resolves.toBeUndefined();
    await expect(a2).rejects.toThrow();
  });
});
