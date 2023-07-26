import { ErrBase } from '@rimbu/common';

export abstract class RpcProxyError extends ErrBase.CustomError {}

export class InvalidPathType extends RpcProxyError {
  constructor() {
    super('RpcProxy does not support non-string properties');
  }
}

export function isRpcProxyError(obj: any): obj is RpcProxyError {
  return obj instanceof RpcProxyError;
}
