import { Semaphore } from '@rimbu/channel/semaphore';
import { Module } from '@rimbu/common/module';

/**
 * A Mutex is used to restrict access to a shared resource in a concurrent environment. The Mutex can be
 * used to acquire a lock for the resource, preventing others using the Mutex from accessing the resource. When
 * finished using the resource, the lock can be released, allowing other waiting processes to acquire a lock.
 */
export interface Mutex {
	/**
	 * Returns true if the resource can be acquired immediately, false otherwise.
	 * @returns true when the resource can be acquired immediately, false otherwise
	 */
	canAcquire(): boolean;
	/**
	 * Acquire a lock. Blocks if the resource is already locked. Resolves when the resource is available.
	 * @param options - (optional) acquisition options<br/>
	 * - signal: (optional) an abort signal to cancel waiting for the lock<br/>
	 * - timeoutMs: (optional) amount of milliseconds to wait for acquiring the lock before throwing
	 * @returns a `Promise` that resolves when the lock is acquired
	 */
	acquire(options?: {
		signal?: AbortSignal | undefined;
		timeoutMs?: number | undefined;
	}): Promise<void>;
	/**
	 * Release a lock after it is acquired. Allows other processes to obtain a lock.
	 * @returns void
	 */
	release(): void;
}

const mutexModule = Module.create<typeof Mutex>(() => ({
	create: (): Mutex => {
		const sem = Semaphore.create({ maxSize: 1 });
		return {
			canAcquire: () => sem.canAcquire(1),
			acquire: (options?) => sem.acquire(1, options),
			release: () => sem.release(1),
		};
	},
}));

export const Mutex: {
	/**
	 * Returns a new `Mutex` instance that can be used to enforce single access to a shared resource.
	 * @returns a new `Mutex` instance
	 */
	create(): Mutex;
} = mutexModule.build();
