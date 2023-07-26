export type StaticOnly<T> = Omit<T, 'prototype'>;

export function StaticOnly<T>(obj: T): StaticOnly<T> {
  return Object.freeze(obj);
}
