import { RpcProxy } from '../index.ts';

export class RpcProxyImpl<T> implements RpcProxy<T> {
  constructor(readonly onCall: (path: RpcProxy.Path) => Promise<any>) {}

  exec<R>(remoteFn: (p: RpcProxy.Unpromise<T>) => R): Promise<R> {
    const path = this.getExecPath(remoteFn);

    return this.onCall(path);
  }

  getExecPath(execFn: (p: any) => any): RpcProxy.Path {
    const result: RpcProxy.Path = [];

    const proxy: any = new Proxy(() => null, {
      get(_, name): any {
        if (typeof name !== 'string') {
          throw new RpcProxy.Error.InvalidPathType();
        }

        result.push(name);

        return proxy;
      },
      apply(_, __, args): any {
        result.push(args);

        return proxy;
      },
    });

    execFn(proxy);

    return result;
  }
}
