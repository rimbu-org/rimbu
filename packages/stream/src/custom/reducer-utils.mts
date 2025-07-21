export function createState<T extends {}, R>(
  baseState: T,
  f: (baseState: T) => R
): T & R {
  return Object.assign(baseState, f(baseState));
}

export async function createAsyncState<T extends {}, R>(
  baseState: T,
  f: (baseState: T) => Promise<R>
): Promise<T & R> {
  return Object.assign(baseState, await f(baseState));
}
