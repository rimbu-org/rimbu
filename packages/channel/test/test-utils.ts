import { expect } from 'bun:test';

import { timeout } from '#channel/utils';

export function expectNotResolves(promise: Promise<any>) {
	expect(
		Promise.any([promise, timeout(100).then(() => 'timeout')]),
	).resolves.toBe('timeout');
}
