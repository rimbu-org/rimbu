import { ErrBase } from '../../../common/mod.ts';

export abstract class SemaphoreError extends ErrBase.CustomError {}

export class InvalidConfigError extends SemaphoreError {
  constructor(message: string) {
    super(message);
  }
}

export class InsufficientCapacityError extends SemaphoreError {
  constructor() {
    super('requested weight exceeds semaphore max size');
  }
}

export class CapacityUnderflowError extends SemaphoreError {
  constructor() {
    super('attempt to release more weight than was reserved');
  }
}

export function isSemaphoreError(obj: any): obj is SemaphoreError {
  return obj instanceof SemaphoreError;
}
