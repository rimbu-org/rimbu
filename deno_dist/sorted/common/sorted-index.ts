export function next(index: number): number {
  return index >= 0 ? -index - 2 : -index - 1;
}

export function prev(index: number): number {
  return index >= 0 ? -index - 1 : -index - 2;
}

export const firstChild = -1;

export function compare(i1: number, i2: number): number {
  if (Object.is(i1, i2)) return 0;

  const v1 = i1 >= 0 ? i1 : -i1 - 1.5;
  const v2 = i2 >= 0 ? i2 : -i2 - 1.5;

  return v1 - v2;
}
