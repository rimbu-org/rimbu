import { Semaphore } from '@rimbu/channel/semaphore';
import { Module } from '@rimbu/common/module';

/**
 * A Mutex is used to restrict access to a shared resource in a concurrent environment. The Mutex can be
 * used to acquire a lock for the resource, preventing others using the Mutex from accessing the resource. When
 * finished using the resource, the lock can be released, allowing other waiting processes to acquire a lock.
 */
export interface Mutex extends Semaphore {
	/**
	 * Returns true if the resource can be acquired immediately, false otherwise.
	 * @returns true when the resource can be acquired immediately, false otherwise
	 */
	canAcquire(): boolean;
	/**
	 * Acquire a lock. Blocks if the resource is already locked. Resolves when the resource is available.
	 * @param unused - reserved for future API compatibility (do not pass)
	 * @param options - (optional) acquisition options<br/>
	 * - signal: (optional) an abort signal to cancel waiting for the lock<br/>
	 * - timeoutMs: (optional) amount of milliseconds to wait for acquiring the lock before throwing
	 * @returns a `Promise` that resolves when the lock is acquired
	 */
	acquire(
		unused?: undefined,
		options?: {
			signal?: AbortSignal | undefined;
			timeoutMs?: number | undefined;
		},
	): Promise<void>;
	/**
	 * Release a lock after it is acquired. Allows other functions to obtain a lock.
	 * @returns void
	 */
	release(): void;
}

export namespace Mutex {
	/**
	 * Defines the static `Mutex` API.
	 */
	export interface Constructors {
		/**
		 * Returns a new `Mutex` instance that can be used to enforce single access to a shared resource.
		 * @returns a new `Mutex` instance
		 */
		create(): Mutex;
	}
}

const mutexModule = Module.create<Mutex.Constructors>(() => ({
	create: () => Semaphore.create({ maxSize: 1 }),
}));

export const Mutex: Mutex.Constructors = mutexModule.build();
