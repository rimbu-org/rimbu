import { RemoteObjectError } from '@rimbu/channel/remote-object';
import type { RpcProxy } from '@rimbu/channel/rpc-proxy';

/**
 * Namespace containing types related to the `RemoteObjectImpl` call handler.
 */
export namespace RemoteObjectImpl {
  export type CallHandler = (path: RpcProxy.Path) => Promise<any>;
}

/**
 * Creates a `RemoteObject` call handler that safely traverses and invokes members on the given source object.
 * @param source - the object to expose remotely
 */
export function RemoteObjectImpl(source: any): RemoteObjectImpl.CallHandler {
  return async (path) => {
    let parent: any = undefined;
    let current: unknown = source;

    for (const part of path) {
      if (Array.isArray(part)) {
        // part is function application

        if (typeof current !== 'function') {
          throw new RemoteObjectError.RemoteObjectInvalidFunctionApplicationError();
        }

        current = await current.apply(parent, part);
      } else if (typeof part !== 'string') {
        throw new RemoteObjectError.RemoteObjectInvalidPathPartTypeError();
      } else if (part === '__proto__') {
        throw new RemoteObjectError.RemoteObjectSecurityError();
      } else if (
        typeof current === 'object' &&
        current !== null &&
        part in current
      ) {
        parent = current;
        current = (current as any)[part];

        // await if promise
        if (
          typeof current === 'object' &&
          current !== null &&
          'then' in current
        ) {
          current = await (current as PromiseLike<any>);
        }
      } else {
        throw new RemoteObjectError.RemoteObjectInvalidAccessError();
      }
    }

    if (typeof current === 'function') {
      throw new RemoteObjectError.RemoteObjectInvalidFunctionApplicationError();
    }

    return current;
  };
}
