import { timeout } from '../src/custom/index.mjs';

export async function expectNotResolves(promise: Promise<any>) {
  await expect(
    Promise.any([promise, timeout(100).then(() => 'timeout')])
  ).resolves.toBe('timeout');
}
