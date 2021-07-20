import { MaybePromise, OptLazy } from './internal.ts';

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
