import { ErrBase } from '@rimbu/common';

/**
 * Error thrown when a Task is cancelled.
 */
export class CancellationError extends ErrBase.CustomError {
  constructor() {
    super('Task was cancelled');
  }
}

/**
 * Error thrown when a Task exceeds its allowed execution time.
 */
export class TimeoutError extends ErrBase.CustomError {
  constructor() {
    super('Task timed out');
  }
}

/**
 * Error thrown when the retry limit for a Task is reached.
 */
export class RetryExhaustedError extends ErrBase.CustomError {
  constructor() {
    super('Task retry exhausted');
  }
}
