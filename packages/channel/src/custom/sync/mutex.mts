import { Semaphore } from '../index.mjs';

/**
 * A Mutex is used to restrict access to a shared resource in a concurrent environment. The Mutex can be
 * used to acquire a lock for the resource, preventing others using the Mutext from accessing the resource. When
 * finished using the resource, the lock can be released, allowing other waiting processes to acquire a lock.
 */
export interface Mutex {
  /**
   * Returns true if the resource can be acquired immediately, false otherwise.
   */
  canAcquire(): boolean;
  /**
   * Acquire a lock. Blocks if the resource is already locked. Resolves when the resource is available.
   */
  acquire(): Promise<void>;
  /**
   * Release a lock after it is acquired. Allows other functions to obtain a lock.
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
     */
    create(): Mutex;
  }
}

export const Mutex: Mutex.Constructors = Object.freeze(
  class {
    static create(): Mutex {
      return Semaphore.create({ maxSize: 1 });
    }
  }
);
