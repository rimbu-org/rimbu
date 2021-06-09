import { TraverseState } from '@rimbu/common';
import { List } from '@rimbu/list';

type GenBlockBuilderEntry<E> = BlockBuilderBase<E> | CollisionBuilderBase<E>;

export abstract class BlockBuilderBase<E> {
  abstract source?: GenSource<E>;
  abstract _entries?: E[];
  abstract _entrySets?: GenBlockBuilderEntry<E>[];
  abstract size: number;

  get isEmpty(): boolean {
    return this.size === 0;
  }

  forEach(
    f: (entry: E, index: number, halt: () => void) => void,
    state: TraverseState = TraverseState()
  ): void {
    if (this.isEmpty || state.halted) return;
    if (undefined !== this.source) return this.source.forEach(f, state);

    const { halt } = state;

    if (undefined !== this._entries) {
      for (const key in this._entries) {
        f(this._entries[key], state.nextIndex(), halt);
        if (state.halted) break;
      }
    }
    if (undefined !== this._entrySets) {
      for (const key in this._entrySets) {
        this._entrySets[key].forEach(f, state);
        if (state.halted) break;
      }
    }
  }
}

export abstract class CollisionBuilderBase<E> {
  abstract source?: {
    size: number;
    entries: List.NonEmpty<E>;
    forEach(
      f: (entry: E, index: number, halt: () => void) => void,
      state: TraverseState
    ): void;
  };
  abstract _entries?: List.Builder<E>;

  get size(): number {
    if (undefined !== this.source) return this.source.size;

    return this.entries.length;
  }

  get entries(): List.Builder<E> {
    if (undefined === this._entries) {
      if (undefined !== this.source) {
        this._entries = this.source.entries.toBuilder();
      } else {
        this._entries = List.builder();
      }
    }

    return this._entries!;
  }

  forEach(
    f: (entry: E, index: number, halt: () => void) => void,
    state: TraverseState = TraverseState()
  ): void {
    if (state.halted) return;

    if (undefined !== this.source) {
      return this.source.forEach(f, state);
    }

    this.entries.forEach(f, state);
  }
}

export interface GenSource<E> {
  entries: readonly E[] | null;
  entrySets: readonly GenBlockBuilderEntry<E>[] | null;
  forEach(
    f: (entry: E, index: number, halt: () => void) => void,
    state?: TraverseState
  ): void;
}
