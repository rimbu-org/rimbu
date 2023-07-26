import { ErrBase } from '@rimbu/common';

export abstract class RemoteObjectError extends ErrBase.CustomError {}

export class RemoteObjectInvalidPathPartTypeError extends RemoteObjectError {
  constructor() {
    super('remote object path parts should be strings or arrays');
  }
}

export class RemoteObjectInvalidFunctionApplicationError extends RemoteObjectError {
  constructor() {
    super('attempted to invoke a function on non-function value');
  }
}

export class RemoteObjectInvalidAccessError extends RemoteObjectError {
  constructor() {
    super('attempted to access a non-existing property');
  }
}

export class RemoteObjectSecurityError extends RemoteObjectError {
  constructor() {
    super('attempted access to property associated with prototype pollution');
  }
}

export function isRemoteObjectError(obj: any): obj is RemoteObjectError {
  return obj instanceof RemoteObjectError;
}
