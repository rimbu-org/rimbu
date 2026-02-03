import { ErrBase } from '@rimbu/common/err';

/**
 * The abstract base class/type for Semaphore Errors.
 */
export abstract class SemaphoreError extends ErrBase.CustomError {}

export namespace SemaphoreError {
  /**
   * Error indicating that an invalid configuration was provided.
   */
  export class InvalidConfigError extends SemaphoreError {
    constructor(message: string) {
      super(message);
    }
  }

  /**
   * Error indicating that the semaphore does not have sufficient capacity.
   */
  export class InsufficientCapacityError extends SemaphoreError {
    constructor() {
      super('requested weight exceeds semaphore max size');
    }
  }

  /**
   * Error indicating a request was made to release more weight than reserved.
   */
  export class CapacityUnderflowError extends SemaphoreError {
    constructor() {
      super('attempt to release more weight than was reserved');
    }
  }

  /**
   * Returns true if the given object is an instance of a `SemaphoreError`.
   * @param obj - the value to test
   */
  export function isSemaphoreError(obj: any): obj is SemaphoreError {
    return obj instanceof SemaphoreError;
  }
}
