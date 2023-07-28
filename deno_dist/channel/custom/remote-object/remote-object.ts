import {
  RemoteObjectError,
  RemoteObjectImpl,
  RpcProxy,
  type CrossChannel,
} from '../index.ts';

/**
 * RemoteObject offers a convenient way to retrieve data and invoke methods across a RemoteChannel. It involves setting up a remote object
 * server that takes a given TypeScript object and allows a remote object client to perform remote calls to this object and getting the results.
 */
export namespace RemoteObject {
  /**
   * Interface defining a remote call structure.
   */
  export interface Call {
    path: RpcProxy.Path;
  }

  /** Type defining a remote call response structure */
  export type Response =
    | { type: 'success'; value: any }
    | { type: 'fail'; error: any };

  /**
   * Type defining the RemoteObject client channel type.
   */
  export type ClientCrossChannel = CrossChannel<
    RemoteObject.Call,
    RemoteObject.Response
  >;

  /**
   * Type defining the RemoteObject server channel type.
   */
  export type ServerCrossChannel = CrossChannel<
    RemoteObject.Response,
    RemoteObject.Call
  >;

  /**
   * The RemoteObject Error type.
   */
  export type Error = RemoteObjectError.RemoteObjectError;

  /**
   * Defines the static `RemoteObject` API.
   */
  export interface Constructors {
    /**
     * Object containing the possible remote object errors.
     */
    get Error(): typeof RemoteObjectError;

    /**
     * Returns a new `RpcProxy` that can be used to perform remote operations on a RemoteObject server.
     * @typeparam T - the remote object interface type
     * @param commCh - the cross-channel to use for communication
     */
    createClient<T>(commCh: RemoteObject.ClientCrossChannel): RpcProxy<T>;

    /**
     * Creates a remote object server that allows clients to perform remote operations on the given `source` object.
     * @typeparam T - the type of the object to serve remotely
     * @param commCh - the cross-channel to use for communication
     */
    createServer<T>(
      source: T,
      commCh: RemoteObject.ServerCrossChannel
    ): Promise<void>;
  }
}

export const RemoteObject: RemoteObject.Constructors = Object.freeze(
  class {
    static get Error(): typeof RemoteObjectError {
      return RemoteObjectError;
    }

    static createClient<T>(
      commCh: CrossChannel<RemoteObject.Call, RemoteObject.Response>
    ): RpcProxy<T> {
      async function execCall(path: RpcProxy.Path): Promise<any> {
        await commCh.send({ path });
        const response = await commCh.receive();

        switch (response.type) {
          case 'success': {
            return response.value;
          }
          case 'fail': {
            throw response.error;
          }
        }
      }

      const proxy = RpcProxy.create<T>(execCall);

      return proxy;
    }

    static async createServer<T>(
      source: T,
      commCh: CrossChannel<RemoteObject.Response, RemoteObject.Call>
    ): Promise<void> {
      const handler = RemoteObjectImpl(source);

      while (!commCh.isExhausted) {
        const { path } = await commCh.receive();

        try {
          const value = await handler(path);

          await commCh.send({ type: 'success', value });
        } catch (error) {
          await commCh.send({ type: 'fail', error });
        }
      }

      commCh.close();
    }
  }
);
