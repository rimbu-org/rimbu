export type Last<T extends any[], O = never> = T extends [...any[], infer L]
  ? L
  : O;

export type Prepend<I, T extends any[]> = [I, ...T];
