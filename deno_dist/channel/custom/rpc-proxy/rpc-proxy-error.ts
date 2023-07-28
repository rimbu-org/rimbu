import { ErrBase } from '../../../common/mod.ts';

/**
 * The abstract base class/type for RpcProxy Errors.
 */
export abstract class RpcProxyError extends ErrBase.CustomError {}

/**
 * Error indicating an attempt was made to access a non-string property,
 */
export class InvalidPathType extends RpcProxyError {
  constructor() {
    super('RpcProxy does not support non-string properties');
  }
}

/**
 * Returns true if the given object is an instance of a `RpcProxyError`.
 * @param obj - the value to test
 */
export function isRpcProxyError(obj: any): obj is RpcProxyError {
  return obj instanceof RpcProxyError;
}
