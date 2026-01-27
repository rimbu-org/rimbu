import { expect } from 'bun:test';

import { timeout } from '#channel/utils';

export async function expectNotResolves(promise: Promise<any>) {
  await expect(
    Promise.any([promise, timeout(100).then(() => 'timeout')])
  ).resolves.toBe('timeout');
}
