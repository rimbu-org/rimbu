import { ErrBase } from '../../../common/mod.ts';

/**
 * The abstract base class/type for RemoteObject Errors.
 */
export abstract class RemoteObjectError extends ErrBase.CustomError {}

/**
 * Error indicating that a path part is not of the expected type.
 */
export class RemoteObjectInvalidPathPartTypeError extends RemoteObjectError {
  constructor() {
    super('remote object path parts should be strings or arrays');
  }
}

/**
 * Error indicating that a remote function call was not actually a function.
 */
export class RemoteObjectInvalidFunctionApplicationError extends RemoteObjectError {
  constructor() {
    super('attempted to invoke a function on non-function value');
  }
}

/**
 * Error indicating that a remote object property did not exist.
 */
export class RemoteObjectInvalidAccessError extends RemoteObjectError {
  constructor() {
    super('attempted to access a non-existing property');
  }
}

/**
 * Error indicating that an attempt was made to perform an unsafe operation.
 */
export class RemoteObjectSecurityError extends RemoteObjectError {
  constructor() {
    super('attempted access to property associated with prototype pollution');
  }
}

/**
 * Returns true if the given object is an instance of a `RemoteObjectError`.
 * @param obj - the value to test
 */
export function isRemoteObjectError(obj: any): obj is RemoteObjectError {
  return obj instanceof RemoteObjectError;
}
