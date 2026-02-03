import { SemaphoreImpl } from '#channel/semaphore-impl';
import { SemaphoreError } from '#private/semaphore-error';

export { SemaphoreError };

/**
 * A Semaphore is a generalized version of a Mutex, allowing boundaries on the amount of concurrent
 * processes that can have simultaneous access to a shared resource. The semaphore is weighted, meaning
 * that the semaphore has a maximum size/capacity available for the shared resources. When acquiring the
 * resource, a weight can be provided allowing more intensive tasks to acquire a larger share of the shared
 * resource, preventing too many other tasks from also acquiring the resource.
 */
export interface Semaphore {
  /**
   * The maximum simultaneous "weight" that the semaphore allows access to for the shared resource.
   */
  readonly maxSize: number;
  /**
   * Returns true if the semaphore will directly give access to the shared resource for the given `weight` when
   * requested.
   * @param weight - (default: 1) the desired weight for access request
   */
  canAcquire(weight?: number): boolean;
  /**
   * Request access to a shared resource with the given `weight`. Blocks if the semaphore has insufficient capacity
   * until enough weight has been released. Resolves when the semaphore has enough capacity for the operation.
   * @param weight - (default: 1) the weight of the operation to be performed
   */
  acquire(
    weight?: number,
    options?: {
      signal?: AbortSignal | undefined;
      timeoutMs?: number | undefined;
    }
  ): Promise<void>;
  /**
   * Release obtained capacity from the semaphore to allow potential other blocked processes to access the resource.
   * @param weight - (default: 1) the amount of weight to release
   */
  release(weight?: number): void;
}

export namespace Semaphore {
  /**
   * The semaphore error type.
   */
  export type Error = SemaphoreError;

  /**
   * Defines the static `Semaphore` API.
   */
  export interface Constructors {
    /**
     * Returns a new Semaphore instance with the given configuration.
     * @param options - the options for the Semaphore, including:<br/>
     * - maxSize: the maximum size/capacity for the semaphore
     */
    create(options: { maxSize: number }): Semaphore;
  }
}

export const Semaphore: Semaphore.Constructors = Object.freeze(
  class {
    static create(options: { maxSize: number }): Semaphore {
      return new SemaphoreImpl(options.maxSize);
    }
  }
);
