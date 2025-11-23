import { TraverseState } from '@rimbu/common';
import { List } from '@rimbu/list';

type GenBlockBuilderEntry<E> = BlockBuilderBase<E> | CollisionBuilderBase<E>;

/**
 * Base class for mutable builders that construct hash blocks for hashed collections.
 * @typeparam E - the entry type stored in the block
 */
export abstract class BlockBuilderBase<E> {
  abstract source?: undefined | GenSource<E>;
  abstract _entries?: undefined | E[];
  abstract _entrySets?: undefined | GenBlockBuilderEntry<E>[];
  abstract get size(): number;

  get isEmpty(): boolean {
    return this.size === 0;
  }

  forEach(
    f: (entry: E, index: number, halt: () => void) => void,
    options: { state?: TraverseState } = {}
  ): void {
    const { state = TraverseState() } = options;

    if (this.isEmpty || state.halted) return;
    if (undefined !== this.source) return this.source.forEach(f, { state });

    const { halt } = state;

    if (undefined !== this._entries) {
      for (const key in this._entries) {
        f(this._entries[key], state.nextIndex(), halt);
        if (state.halted) break;
      }
    }
    if (undefined !== this._entrySets) {
      for (const key in this._entrySets) {
        this._entrySets[key].forEach(f, { state });
        if (state.halted) break;
      }
    }
  }
}

/**
 * Base class for mutable builders that handle hash collisions in hashed collections.
 * @typeparam E - the entry type contained in the collision bucket
 */
export abstract class CollisionBuilderBase<E> {
  abstract source?:
    | undefined
    | {
        size: number;
        entries: List.NonEmpty<E>;
        forEach(
          f: (entry: E, index: number, halt: () => void) => void,
          options?: { state?: TraverseState }
        ): void;
      };
  abstract _entries?: List.Builder<E> | undefined;

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
    options: { state?: TraverseState } = {}
  ): void {
    const { state = TraverseState() } = options;

    if (state.halted) return;

    if (undefined !== this.source) {
      return this.source.forEach(f, { state });
    }

    this.entries.forEach(f, { state });
  }
}

/**
 * Generic source interface that represents a read-only view over block entries
 * and collision entry sets used by block builders.
 * @typeparam E - the entry type contained in the source
 */
export interface GenSource<E> {
  entries: readonly E[] | null;
  entrySets: readonly GenBlockBuilderEntry<E>[] | null;
  forEach(
    f: (entry: E, index: number, halt: () => void) => void,
    options?: { state?: TraverseState }
  ): void;
}
