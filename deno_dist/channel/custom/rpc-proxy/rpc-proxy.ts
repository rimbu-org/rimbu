import { RpcProxyError, RpcProxyImpl } from '../index.ts';

/**
 * A remote procedure call proxy that can be used to perform methods on a remote object
 * as though it is accessible locally.
 */
export interface RpcProxy<T> {
  /**
   * Remotely executes the method/access performed on the provided proxy object, and resolves, when successful,
   * the result of the operation.
   * @typeparam R - the result type of executing the function on the proxy object
   * @param remoteFn - a function that receives a proxy object, and will remotely perform the actions performed on the proxy
   * on the actual object.
   */
  exec<R>(remoteFn: (proxy: RpcProxy.Unpromise<T>) => R): Promise<R>;
}

export namespace RpcProxy {
  /**
   * A part of an RPC call path, which can be either:<br/>
   * - a string indicating an object property/method<br/>
   * - an array of data indicating a function call with the array as arguments
   */
  export type PathPart = string | any[];

  /**
   * An RPC call path, consisting of an array of path parts
   */
  export type Path = PathPart[];

  /**
   * Utility type to transform an object/API with potentially asynchronous calls into a synchronous one.
   * This is used to allow RPC calls to act as though they are synchronous, but have only the resulting return
   * type be asynchronous.
   * @typeparam T - the source type to unpromise
   */
  export type Unpromise<T> =
    T extends Promise<infer R>
      ? Unpromise<R>
      : T extends (...args: infer A) => infer R
        ? (...args: A) => Unpromise<R>
        : T extends readonly any[]
          ? { readonly [K in keyof T]: Unpromise<T[K]> }
          : T extends Record<any, any>
            ? { readonly [K in keyof T]: Unpromise<T[K]> }
            : T;

  /**
   * The RpcProxy error type
   */
  export type Error = RpcProxyError.RpcProxyError;

  /**
   * Defines the static `RpcProxy` API.
   */
  export interface Constructors {
    /**
     * Returns the Error types and utilities available for RpcProxy.
     */
    get Error(): typeof RpcProxyError;

    /**
     * Returns a new RpcProxy instance, where each `exec` call will retrieve the proxy execution path
     * and forward the path to the given `onCall` function.
     * @typeparam T - the interface to proxy
     * @param onCall - function that will be called with the execution path each time an operation is performed on the proxy object
     */
    create<T>(onCall: (path: RpcProxy.Path) => Promise<any>): RpcProxy<T>;
  }
}

export const RpcProxy: RpcProxy.Constructors = Object.freeze(
  class {
    static get Error(): typeof RpcProxyError {
      return RpcProxyError;
    }

    static create<T>(
      onCall: (path: RpcProxy.Path) => Promise<any>
    ): RpcProxy<T> {
      return new RpcProxyImpl(onCall);
    }
  }
);
