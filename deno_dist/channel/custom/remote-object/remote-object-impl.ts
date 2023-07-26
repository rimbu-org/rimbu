import { RemoteObject, type RpcProxy } from '../index.ts';

export namespace RemoteObjectImpl {
  export type CallHandler = (path: RpcProxy.Path) => Promise<any>;
}

export function RemoteObjectImpl(source: any): RemoteObjectImpl.CallHandler {
  return async (path) => {
    let parent: any = undefined;
    let current: unknown = source;

    for (const part of path) {
      if (Array.isArray(part)) {
        // part is function application

        if (typeof current !== 'function') {
          throw new RemoteObject.Error.RemoteObjectInvalidFunctionApplicationError();
        }

        current = await current.apply(parent, part);
      } else if (typeof part !== 'string') {
        throw new RemoteObject.Error.RemoteObjectInvalidPathPartTypeError();
      } else if (part === '__proto__') {
        throw new RemoteObject.Error.RemoteObjectSecurityError();
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
        throw new RemoteObject.Error.RemoteObjectInvalidAccessError();
      }
    }

    if (typeof current === 'function') {
      throw new RemoteObject.Error.RemoteObjectInvalidFunctionApplicationError();
    }

    return current;
  };
}
