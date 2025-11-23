import { ErrBase } from '@rimbu/common';

/**
 * Error thrown when an operation assumes a collection is non-empty but it is empty.
 */
export class EmptyCollectionAssumedNonEmptyError extends ErrBase.CustomError {
  constructor() {
    super('empty collection was assumbed to be non-empty');
  }
}

/**
 * Error thrown when a builder is modified while it is being iterated.
 */
export class ModifiedBuilderWhileLoopingOverItError extends ErrBase.CustomError {
  constructor() {
    super('an attempt was made to modify a builder while looping over it');
  }
}

/**
 * Error indicating an unexpected internal state. Users are encouraged to file an issue.
 */
export class InvalidStateError extends ErrBase.CustomError {
  constructor() {
    super(
      "something happend that shouldn't happen, please consider creating an issue"
    );
  }
}

/**
 * Error indicating incorrect usage of the API.
 */
export class InvalidUsageError extends ErrBase.CustomError {}

/**
 * Throws an `EmptyCollectionAssumedNonEmptyError`.
 */
export function throwEmptyCollectionAssumedNonEmptyError(): never {
  throw new EmptyCollectionAssumedNonEmptyError();
}

/**
 * Throws a `ModifiedBuilderWhileLoopingOverItError`.
 */
export function throwModifiedBuilderWhileLoopingOverItError(): never {
  throw new ModifiedBuilderWhileLoopingOverItError();
}

/**
 * Throws an `InvalidStateError`.
 */
export function throwInvalidStateError(): never {
  throw new InvalidStateError();
}

/**
 * Throws an `InvalidUsageError` with the provided message.
 * @param msg - context message describing the invalid usage
 */
export function throwInvalidUsageError(msg: string): never {
  throw new InvalidUsageError(msg);
}
