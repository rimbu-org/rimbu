import { ErrBase } from 'https://deno.land/x/rimbu/common/mod.ts';

export class EmptyCollectionAssumedNonEmptyError extends ErrBase.CustomError {
  constructor() {
    super('empty collection was assumbed to be non-empty');
  }
}

export class ModifiedBuilderWhileLoopingOverItError extends ErrBase.CustomError {
  constructor() {
    super('an attempt was made to modify a builder while looping over it');
  }
}

export class InvalidStateError extends ErrBase.CustomError {
  constructor() {
    super(
      "something happend that shouldn't happen, please consider creating an issue"
    );
  }
}

export class InvalidUsageError extends ErrBase.CustomError {}

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
