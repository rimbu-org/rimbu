import { describe, expect, it, vi } from 'bun:test';

import { Semaphore, SemaphoreError } from '@rimbu/channel/semaphore';

import { timeout } from '#channel/utils';

describe('Semaphore', () => {
	it('throws if maxSize < 1', () => {
		expect(() => Semaphore.create({ maxSize: 0 })).toThrow(
			SemaphoreError.InvalidConfigError,
		);
	});

	it('does not block acquiring when capacity available', async () => {
		const sem = Semaphore.create({ maxSize: 1 });

		await sem.acquire();
		await timeout(100);

		expect(() => sem.release()).not.toThrow();
	});

	it('does not block when acquiring 0 or negative capacity', async () => {
		const sem = Semaphore.create({ maxSize: 1 });

		await sem.acquire();
		await sem.acquire(0);
	});

	it('blocks acquiring when at full capacity', async () => {
		const sem = Semaphore.create({ maxSize: 1 });

		(async () => {
			await sem.acquire();
			await timeout(100);
			sem.release();
		})();

		await sem.acquire();

		expect(() => sem.release()).not.toThrow();
	});

	it('throws when acquiring more than size', () => {
		const sem = Semaphore.create({ maxSize: 1 });

		expect(sem.acquire(2)).rejects.toThrow(
			SemaphoreError.InsufficientCapacityError,
		);
	});

	it('throws when releasing more than current size', () => {
		const sem = Semaphore.create({ maxSize: 1 });

		expect(() => sem.release()).toThrow(SemaphoreError.CapacityUnderflowError);
	});

	it('will provide access first to later smaller task', async () => {
		const sem = Semaphore.create({ maxSize: 2 });

		await sem.acquire();

		await sem.acquire();

		const fn = vi.fn();

		const promise = (async () => {
			await sem.acquire(2);
			fn();
		})();

		expect(fn).not.toBeCalled();

		sem.release();

		await timeout(10);

		expect(fn).not.toBeCalled();

		await timeout(10);

		expect(fn).not.toBeCalled();

		sem.release();

		await promise;

		expect(fn).toBeCalledTimes(1);
	});

	it('will provide access to bigger task once capacity is available', async () => {
		const sem = Semaphore.create({ maxSize: 2 });

		await sem.acquire();

		const fn = vi.fn();

		const promise = (async () => {
			await sem.acquire(2);
			fn();
		})();

		expect(fn).not.toBeCalled();

		await sem.acquire();

		await timeout(10);

		sem.release();

		await timeout(10);

		sem.release();

		expect(fn).not.toBeCalled();

		await timeout(10);

		sem.release();

		await promise;

		expect(fn).toBeCalledTimes(1);
	});

	it('canAcquire returns correct values', async () => {
		const sem = Semaphore.create({ maxSize: 2 });

		expect(sem.canAcquire()).toBe(true);
		expect(sem.canAcquire(0)).toBe(true);
		expect(sem.canAcquire(-3)).toBe(true);
		expect(sem.canAcquire(2)).toBe(true);
		expect(sem.canAcquire(3)).toBe(false);
		expect(sem.canAcquire(4)).toBe(false);

		await sem.acquire();

		expect(sem.canAcquire()).toBe(true);
		expect(sem.canAcquire(0)).toBe(true);
		expect(sem.canAcquire(-3)).toBe(true);
		expect(sem.canAcquire(2)).toBe(false);
		expect(sem.canAcquire(3)).toBe(false);
		expect(sem.canAcquire(4)).toBe(false);
	});

	it('disallows acquiring too much weight synchronously', () => {
		const sem = Semaphore.create({ maxSize: 1 });

		const a1 = sem.acquire(1, { timeoutMs: 100 });
		const a2 = sem.acquire(1, { timeoutMs: 100 });

		expect(a1).resolves.toBeUndefined();
		expect(a2).rejects.toThrow();
	});

	it('can release weight without waiting', async () => {
		const sem = Semaphore.create({ maxSize: 3 });

		await sem.acquire(1);
		await sem.acquire(1);
		await sem.acquire(1);

		sem.release();
		sem.release();
		sem.release();

		expect(sem.canAcquire()).toBe(true);
	});

	// Regression: previously, when a queued `acquire` was rejected via
	// AbortSignal (or timeout), its entry in the internal block-channels
	// map was orphaned. On the next `release`, the semaphore would iterate
	// the map, find the phantom entry, permanently attribute its weight to
	// no holder, and silently drop below its true available capacity.
	it('aborted acquire does not leak capacity', async () => {
		const sem = Semaphore.create({ maxSize: 1 });

		// Fill the semaphore.
		await sem.acquire();

		// Queue an acquire that will be aborted before capacity frees up.
		const controller = new AbortController();
		const queued = sem.acquire(1, { signal: controller.signal });
		controller.abort();
		await queued.catch(() => {});

		// Release the initial holder. Full capacity must be restored.
		sem.release();
		expect(sem.canAcquire(1)).toBe(true);
		// A fresh acquirer should get in immediately.
		await sem.acquire();
		sem.release();
		expect(sem.canAcquire(1)).toBe(true);
	});

	// Regression: same class of leak, but under the race where `release`
	// picks the queued channel *before* the abort listener rejects the
	// waiter. The waiter's throw must return the weight to the pool.
	it('aborted acquire returns weight when release races with abort', async () => {
		const sem = Semaphore.create({ maxSize: 1 });

		await sem.acquire();

		const controller = new AbortController();
		const queued = sem.acquire(1, { signal: controller.signal });

		// Interleave: release first (which claims the slot for `queued`),
		// then immediately abort. Depending on microtask ordering the
		// abort may fire before or after receive resolves.
		sem.release();
		controller.abort();

		// Either the waiter observed the release (queued resolves) or the
		// abort won (queued rejects). In the reject case, the fix must
		// return the weight so the semaphore is back to full capacity.
		await queued.catch(() => {});

		if (!sem.canAcquire(1)) {
			// The waiter resolved (owns the slot); release for cleanup.
			sem.release();
		}
		expect(sem.canAcquire(1)).toBe(true);
	});
});
