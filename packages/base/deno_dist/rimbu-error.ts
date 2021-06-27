import { Err } from '../../common/deno_dist/mod.ts';

export class EmptyCollectionAssumedNonEmptyError extends Err.CustomError {
  constructor() {
    super('empty collection was assumbed to be non-empty');
  }
}

export class ModifiedBuilderWhileLoopingOverItError extends Err.CustomError {
  constructor() {
    super('an attempt was made to modify a builder while looping over it');
  }
}

export class InvalidStateError extends Err.CustomError {
  constructor() {
    super(
      "something happend that shouldn't happen, please consider creating an issue"
    );
  }
}

export class InvalidUsageError extends Err.CustomError {}

export function throwEmptyCollectionAssumedNonEmptyError(): never {
  throw new EmptyCollectionAssumedNonEmptyError();
}

export function throwModifiedBuilderWhileLoopingOverItError(): never {
  throw new ModifiedBuilderWhileLoopingOverItError();
}

export function throwInvalidStateError(): never {
  throw new InvalidStateError();
}

export function throwInvalidUsageError(msg: string): never {
  throw new InvalidUsageError(msg);
}
