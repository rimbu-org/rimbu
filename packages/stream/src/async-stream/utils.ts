import { CollectFun, OptLazy } from '@rimbu/common';

export type MaybePromise<T> = T | Promise<T>;

export type AsyncCollectFun<T, R> = (
  value: T,
  index: number,
  skip: CollectFun.Skip,
  halt: () => void
) => MaybePromise<R | CollectFun.Skip>;

export type AsyncOptLazy<T> = OptLazy<MaybePromise<T>>;

export namespace AsyncOptLazy {
  export const toMaybePromise: <T>(
    optLazy: AsyncOptLazy<T>
  ) => MaybePromise<T> = OptLazy;

  export async function toPromise<T>(optLazy: AsyncOptLazy<T>): Promise<T> {
    if (optLazy instanceof Function) return optLazy();
    return optLazy;
  }
}
