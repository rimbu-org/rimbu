import { Arr, RimbuError } from '@rimbu/base';
import { RelatedTo, TraverseState } from '@rimbu/common';
import { List } from '@rimbu/list';
import { Stream, StreamSource } from '@rimbu/stream';
import { BlockBuilderBase, CollisionBuilderBase } from '../hashed-custom';
import {
  HashSetBlock,
  HashSetCollision,
  HashSetContext,
} from '../hashset-custom';
import { HashSet } from '../internal';

type SetBlockBuilderEntry<T> =
  | HashSetBlockBuilder<T>
  | HashSetCollisionBuilder<T>;

export class HashSetBlockBuilder<T>
  extends BlockBuilderBase<T>
  implements HashSet.Builder<T>
{
  constructor(
    readonly context: HashSetContext<T>,
    public source?: HashSetBlock<T>,
    public _entries?: T[],
    public _entrySets?: SetBlockBuilderEntry<T>[],
    public size = source?.size ?? 0,
    public level = source?.level ?? 0
  ) {
    super();
  }

  _lock = 0;

  checkLock(): void {
    if (this._lock) RimbuError.throwModifiedBuilderWhileLoopingOverItError();
  }

  prepareMutate(): void {
    if (undefined === this._entries) {
      if (undefined !== this.source) {
        this._entries =
          null === this.source.entries
            ? []
            : Arr.copySparse(this.source.entries);
      } else {
        this._entries = [];
      }
    }

    if (undefined === this._entrySets) {
      if (undefined !== this.source && null !== this.source.entrySets) {
        this._entrySets = Arr.mapSparse(
          this.source.entrySets,
          (entrySet): SetBlockBuilderEntry<T> => {
            if (entrySet instanceof HashSetBlock) {
              return new HashSetBlockBuilder(this.context, entrySet);
            }
            return new HashSetCollisionBuilder(this.context, entrySet);
          }
        );
      } else {
        this._entrySets = [];
      }
    }
  }

  get entries(): T[] {
    this.prepareMutate();

    return this._entries!;
  }

  get entrySets(): SetBlockBuilderEntry<T>[] {
    this.prepareMutate();

    return this._entrySets!;
  }

  has = <U>(value: RelatedTo<T, U>): boolean => {
    if (undefined !== this.source) return this.source.has(value);

    if (!this.context.hasher.isValid(value)) return false;

    return this.hasInternal(value);
  };

  hasInternal(value: T, hash = this.context.hash(value)): boolean {
    if (undefined !== this.source) return this.source.has(value, hash);

    const keyIndex = this.context.getKeyIndex(this.level, hash);

    if (keyIndex in this.entries) {
      return this.context.eq(value, this.entries[keyIndex]);
    }

    if (keyIndex in this.entrySets) {
      const currentEntrySet = this.entrySets[keyIndex];
      return currentEntrySet.hasInternal(value, hash);
    }

    return false;
  }

  add = (value: T): boolean => {
    this.checkLock();

    return this.addInternal(value);
  };

  addAll = (source: StreamSource<T>): boolean => {
    this.checkLock();

    return Stream.from(source).filterPure(this.add).count() > 0;
  };

  addInternal(value: T, hash = this.context.hash(value)): boolean {
    const keyIndex = this.context.getKeyIndex(this.level, hash);

    if (keyIndex in this.entries) {
      const currentEntry = this.entries[keyIndex];

      if (this.context.eq(value, currentEntry)) return false;

      this.source = undefined;

      this.size++;

      delete this.entries[keyIndex];

      if (this.level < this.context.maxDepth) {
        const newEntrySet = new HashSetBlockBuilder<T>(
          this.context,
          undefined,
          undefined,
          undefined,
          0,
          this.level + 1
        );
        newEntrySet.addInternal(currentEntry);
        newEntrySet.addInternal(value, hash);

        this.entrySets[keyIndex] = newEntrySet;
        return true;
      }

      const newEntries = List.builder<T>();
      newEntries.append(currentEntry);
      newEntries.append(value);

      const newEntrySet = new HashSetCollisionBuilder<T>(
        this.context,
        undefined,
        newEntries
      );
      this.entrySets[keyIndex] = newEntrySet;
      return true;
    }

    if (keyIndex in this.entrySets) {
      const currentEntrySet = this.entrySets[keyIndex];
      const preSize = currentEntrySet.size;
      const changed = currentEntrySet.addInternal(value, hash);

      if (changed) this.source = undefined;

      this.size += currentEntrySet.size - preSize;
      return changed;
    }

    this.source = undefined;

    this.size++;
    this.entries[keyIndex] = value;
    return true;
  }

  remove = <ST>(value: ST): boolean => {
    this.checkLock();

    if (!this.context.hasher.isValid(value)) return false;

    return this.removeInternal(value);
  };

  removeAll = <ST>(values: StreamSource<ST>): boolean => {
    this.checkLock();

    return Stream.from(values).filterPure(this.remove).count() > 0;
  };

  removeInternal(value: T, hash = this.context.hash(value)): boolean {
    const index = this.context.getKeyIndex(this.level, hash);

    if (index in this.entries) {
      // potential match in entries
      const currentValue = this.entries[index];

      if (!this.context.eq(value, currentValue)) return false;

      // exact match
      this.source = undefined;

      this.size--;
      delete this.entries[index];
      return true;
    }

    if (index in this.entrySets) {
      // potential match in entrysets
      const entrySet = this.entrySets[index];
      const preSize = entrySet.size;
      const changed = entrySet.removeInternal(value, hash);

      if (changed) this.source = undefined;

      this.size += entrySet.size - preSize;

      if (entrySet.size > 1) return changed;

      // single entry needs to be pulled up

      let first: T = undefined as any;

      if (entrySet instanceof HashSetBlockBuilder) {
        for (const i in entrySet.entries) {
          first = entrySet.entries[i];
          break;
        }
      } else {
        first = entrySet.entries.get(0, RimbuError.throwInvalidStateError);
      }

      delete this.entrySets[index];
      this.entries[index] = first;
      return true;
    }

    return false;
  }

  forEach = (
    f: (value: T, index: number, halt: () => void) => void,
    state: TraverseState = TraverseState()
  ): void => {
    this._lock++;
    super.forEach(f, state);
    this._lock--;
  };

  build = (): HashSet<T> => {
    if (this.size === 0) return this.context.empty();

    return this.buildNE();
  };

  buildNE(): HashSetBlock<T> {
    if (undefined !== this.source) return this.source;

    const entries =
      this.entries.length === 0 ? null : Arr.copySparse(this.entries);

    const entrySets =
      this.entrySets.length === 0
        ? null
        : Arr.mapSparse(this.entrySets, (entrySet) => entrySet.buildNE());

    return this.context.block(entries, entrySets, this.size, this.level);
  }
}

export class HashSetCollisionBuilder<T> extends CollisionBuilderBase<T> {
  constructor(
    readonly context: HashSetContext<T>,
    public source?: HashSetCollision<T>,
    public _entries?: List.Builder<T>
  ) {
    super();
  }

  hasInternal(value: T, hash?: number): boolean {
    if (undefined !== this.source) return this.source.has(value, hash);

    let result = false;
    this.entries.forEach((v, _, halt): void => {
      if (this.context.eq(v, value)) {
        result = true;
        halt();
      }
    });
    return result;
  }

  addInternal(value: T): boolean {
    let index = -1;
    this.entries.forEach((v, i, halt): void => {
      if (this.context.eq(v, value)) {
        index = i;
        halt();
      }
    });

    if (index < 0) {
      this.source = undefined;

      this.entries.append(value);
      return true;
    }

    const token = Symbol();
    const oldValue = this.entries.set(index, value, token);

    const changed = token === oldValue || !this.context.eq(oldValue, value);

    if (changed) this.source = undefined;

    return changed;
  }

  removeInternal(value: T): boolean {
    let index = -1;

    this.entries.forEach((v, i, halt): void => {
      if (this.context.eq(v, value)) {
        index = i;
        halt();
      }
    });

    if (index < 0) return false;

    this.source = undefined;

    this.entries.remove(index);
    return true;
  }

  buildNE(): HashSetCollision<T> {
    return (
      this.source ??
      this.context.collision(this.entries.build().assumeNonEmpty())
    );
  }
}
