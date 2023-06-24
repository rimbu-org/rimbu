import type { Actor } from '../actor/mod.ts';
import type { Deep } from '../deep/mod.ts';

export type SelectorEntry = {
  value: unknown;
  listeners: Map<Actor.Listener, { count: number }>;
};

export type SelectorCache = Map<Deep.Selector.Shape<any>, SelectorEntry>;
