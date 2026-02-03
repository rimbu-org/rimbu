import type { Actor } from '@rimbu/actor';
import type { Deep } from '@rimbu/deep';

export type SelectorEntry = {
  value: unknown;
  listeners: Map<Actor.Listener, { count: number }>;
};

export type SelectorCache = Map<Deep.Selector.Shape<any>, SelectorEntry>;
