import { Arr, RimbuError } from '@rimbu/base';
import { EmptyBase, NonEmptyBase } from '@rimbu/collection-types/set-custom';
import {
  type ArrayNonEmpty,
  type RelatedTo,
  type ToJSON,
  TraverseState,
} from '@rimbu/common';
import type { List } from '@rimbu/list';
import { Stream, type StreamSource } from '@rimbu/stream';
import { isEmptyStreamSourceInstance } from '@rimbu/stream/custom';

import type { HashSet } from '@rimbu/hashed/set';
import type { HashSetContext } from '@rimbu/hashed/set-custom';

export class HashSetEmpty<T = any> extends EmptyBase implements HashSet<T> {
  readonly addAll: any;

  constructor(readonly context: HashSetContext<T>) {
    super();

    this.addAll = context.from;
  }

  has(): false {
    return false;
  }

  add(value: T): HashSet.NonEmpty<T> {
    return this.context.emptyBlock().add(value);
  }

  remove(): this {
    return this;
  }

  removeAll(): this {
    return this;
  }

  union(other: StreamSource<T>): HashSet<T> | any {
    if (
      this.context.isHashSetBlock(other as any) ||
      this.context.isHashSetCollision(other as any)
    ) {
      if ((other as any).context === this.context) return other;
    }

    return this.context.from(other);
  }

  difference(): HashSet<T> {
    return this.context.empty();
  }

  intersect(): HashSet<T> {
    return this.context.empty();
  }

  symDifference(other: StreamSource<T>): HashSet<T> {
    return this.union(other);
  }

  toBuilder(): HashSet.Builder<T> {
    return this.context.builder();
  }

  toString(): string {
    return `HashSet()`;
  }

  toJSON(): ToJSON<T[]> {
    return {
      dataType: this.context.typeTag,
      value: [],
    };
  }
}

export abstract class HashSetNonEmptyBase<T>
  extends NonEmptyBase<T>
  implements HashSet.NonEmpty<T>
{
  abstract get context(): HashSetContext<T>;
  abstract get size(): number;
  abstract stream(): Stream.NonEmpty<T>;
  abstract forEach(
    f: (value: T, index: number, halt: () => void) => void,
    options?: { state?: TraverseState }
  ): void;
  abstract has<U>(value: RelatedTo<T, U>): boolean;
  abstract add(value: T): HashSetNonEmptyBase<T>;
  abstract remove<U>(value: RelatedTo<T, U>): HashSet<T>;
  abstract toArray(): ArrayNonEmpty<T>;

  asNormal(): this {
    return this;
  }

  addAll(values: StreamSource<T>): HashSet.NonEmpty<T> {
    if (isEmptyStreamSourceInstance(values)) return this;

    const builder = this.toBuilder();
    builder.addAll(values);
    return builder.build() as HashSet.NonEmpty<T>;
  }

  removeAll(values: StreamSource<T>): HashSet<T> {
    if (isEmptyStreamSourceInstance(values)) return this;

    const builder = this.toBuilder();
    builder.removeAll(values);
    return builder.build();
  }

  filter(
    pred: (value: T, index: number, halt: () => void) => boolean,
    options: { negate?: boolean | undefined } = {}
  ): any {
    const builder = this.context.builder();

    builder.addAll(this.stream().filter(pred, options));

    if (builder.size === this.size) return this;

    return builder.build();
  }

  union(other: StreamSource<T>): HashSet.NonEmpty<T> {
    if (other === this) return this;
    if (isEmptyStreamSourceInstance(other)) return this;

    const builder = this.toBuilder();
    builder.addAll(other);
    return builder.build().assumeNonEmpty();
  }

  difference(other: StreamSource<T>): HashSet<T> {
    if (other === this) return this.context.empty();
    if (isEmptyStreamSourceInstance(other)) return this;

    const builder = this.toBuilder();
    builder.removeAll(other);
    return builder.build();
  }

  intersect(other: StreamSource<T>): HashSet<T> {
    if (other === this) return this;
    if (isEmptyStreamSourceInstance(other)) return this.context.empty();

    const builder = this.context.builder();

    const it = Stream.from(other)[Symbol.iterator]();
    const done = Symbol('Done');
    let value: T | typeof done;

    while (done !== (value = it.fastNext(done))) {
      if (this.has(value)) builder.add(value);
    }

    if (builder.size === this.size) return this;

    return builder.build();
  }

  symDifference(other: StreamSource<T>): HashSet<T> {
    if (other === this) return this.context.empty();
    if (isEmptyStreamSourceInstance(other)) return this;

    const builder = this.toBuilder();

    Stream.from(other)
      .filterPure({ pred: builder.remove, negate: true })
      .forEach(builder.add);

    return builder.build();
  }

  toBuilder(): HashSet.Builder<T> {
    return this.context.createBuilder(this);
  }

  toString(): string {
    return this.stream().join({ start: 'HashSet(', sep: ', ', end: ')' });
  }

  toJSON(): ToJSON<T[]> {
    return {
      dataType: this.context.typeTag,
      value: [],
    };
  }
}

export type SetEntrySet<T> = HashSetBlock<T> | HashSetCollision<T>;

export class HashSetBlock<T> extends HashSetNonEmptyBase<T> {
  constructor(
    readonly context: HashSetContext<T>,
    readonly entries: readonly T[] | null,
    readonly entrySets: readonly SetEntrySet<T>[] | null,
    readonly size: number,
    readonly level: number
  ) {
    super();
  }

  copy(
    entries = this.entries,
    entrySets = this.entrySets,
    size = this.size
  ): HashSetBlock<T> {
    if (
      entries === this.entries &&
      entrySets === this.entrySets &&
      size === this.size
    ) {
      return this;
    }
    return new HashSetBlock(this.context, entries, entrySets, size, this.level);
  }

  stream(): Stream.NonEmpty<T> {
    if (null !== this.entries) {
      if (null === this.entrySets) {
        return Stream.fromObjectValues(this.entries) as Stream.NonEmpty<T>;
      }

      return Stream.fromObjectValues(this.entries).concat(
        Stream.fromObjectValues(this.entrySets).flatMap(
          (entrySet): Stream.NonEmpty<T> => entrySet.stream()
        )
      ) as Stream.NonEmpty<T>;
    }

    if (null === this.entrySets) {
      RimbuError.throwInvalidStateError();
    }

    return Stream.fromObjectValues(this.entrySets).flatMap(
      (entrySet): Stream.NonEmpty<T> => entrySet.stream()
    ) as Stream.NonEmpty<T>;
  }

  has<U>(value: RelatedTo<T, U>, inHash?: number): boolean {
    if (!this.context.hasher.isValid(value)) return false;

    const hash = inHash ?? this.context.hash(value);
    const atKeyIndex = this.context.getKeyIndex(this.level, hash);

    if (null !== this.entries && atKeyIndex in this.entries) {
      const entry = this.entries[atKeyIndex];
      return this.context.eq(entry, value);
    }

    if (null !== this.entrySets && atKeyIndex in this.entrySets) {
      const entrySet = this.entrySets[atKeyIndex];
      return entrySet.has<U>(value, hash);
    }

    return false;
  }

  add(value: T, hash = this.context.hash(value)): HashSetBlock<T> {
    const atKeyIndex = this.context.getKeyIndex(this.level, hash);

    if (null !== this.entries && atKeyIndex in this.entries) {
      const currentValue = this.entries[atKeyIndex];
      if (this.context.eq(value, currentValue)) return this;

      let newEntries: T[] | null = Arr.copySparse(this.entries);
      delete newEntries[atKeyIndex];

      let isEmpty = true;
      /* eslint-disable @typescript-eslint/no-unused-vars */
      for (const _ in newEntries) {
        isEmpty = false;
        break;
      }
      if (isEmpty) newEntries = null;

      if (this.level < this.context.maxDepth) {
        const newEntrySet = this.context
          .block(null, null, 0, this.level + 1)
          .add(currentValue)
          .add(value, hash);

        const newEntrySets =
          null === this.entrySets ? [] : Arr.copySparse(this.entrySets);
        newEntrySets[atKeyIndex] = newEntrySet;

        return this.copy(newEntries, newEntrySets, this.size + 1);
      }

      const newEntrySet = this.context.collision(
        this.context.listContext.of(currentValue, value)
      );
      const newEntrySets =
        null === this.entrySets ? [] : Arr.copySparse(this.entrySets);
      newEntrySets[atKeyIndex] = newEntrySet;

      return this.copy(newEntries, newEntrySets, this.size + 1);
    }

    if (null !== this.entrySets && atKeyIndex in this.entrySets) {
      const currentEntrySet = this.entrySets[atKeyIndex];
      const newEntrySet = currentEntrySet.add(value, hash);
      if (newEntrySet === currentEntrySet) return this;

      const newEntrySets = Arr.copySparse(this.entrySets);
      newEntrySets[atKeyIndex] = newEntrySet;

      return this.copy(
        undefined,
        newEntrySets,
        this.size + newEntrySet.size - currentEntrySet.size
      );
    }

    const newEntries =
      null === this.entries ? [] : Arr.copySparse(this.entries);
    newEntries[atKeyIndex] = value;

    return this.copy(newEntries, undefined, this.size + 1);
  }

  remove<U>(value: RelatedTo<T, U>, hash?: number): HashSet<T> {
    if (!this.context.hasher.isValid(value)) return this;

    const valueHash = hash ?? this.context.hash(value);

    const atKeyIndex = this.context.getKeyIndex(this.level, valueHash);

    if (null !== this.entries && atKeyIndex in this.entries) {
      const currentValue = this.entries[atKeyIndex];

      if (!this.context.eq(currentValue, value)) return this;

      if (this.size === 1) return this.context.empty();

      const newEntries = Arr.copySparse(this.entries);

      delete newEntries[atKeyIndex];

      for (const _ in newEntries) {
        return this.copy(newEntries, undefined, this.size - 1);
      }

      return this.copy(null, undefined, this.size - 1);
    }

    if (null !== this.entrySets && atKeyIndex in this.entrySets) {
      // key is in entrySet
      const currentEntrySet = this.entrySets[atKeyIndex];
      const newEntrySet = currentEntrySet.remove<U>(
        value,
        hash
      ) as SetEntrySet<T>;

      if (newEntrySet === currentEntrySet) return this;

      if (newEntrySet.size === 1) {
        let firstValue: T = undefined as any;

        if (this.context.isHashSetBlock(newEntrySet)) {
          for (const key in newEntrySet.entries!) {
            firstValue = newEntrySet.entries![key];
            break;
          }
        } else {
          firstValue = newEntrySet.entries.first();
        }

        const newEntries =
          null === this.entries ? [] : Arr.copySparse(this.entries);
        newEntries[atKeyIndex] = firstValue;

        const newEntrySets = Arr.copySparse(this.entrySets);
        delete newEntrySets[atKeyIndex];

        return this.copy(newEntries, newEntrySets, this.size - 1);
      }

      const newEntrySets = Arr.copySparse(this.entrySets);
      newEntrySets[atKeyIndex] = newEntrySet;

      return this.copy(
        undefined,
        newEntrySets,
        this.size - currentEntrySet.size + newEntrySet.size
      );
    }

    return this;
  }

  forEach(
    f: (entry: T, index: number, halt: () => void) => void,
    options: { state?: TraverseState } = {}
  ): void {
    const { state = TraverseState() } = options;

    if (state.halted) return;

    const { halt } = state;

    if (null !== this.entries) {
      for (const key in this.entries) {
        f(this.entries[key], state.nextIndex(), halt);
        if (state.halted) return;
      }
    }
    if (null !== this.entrySets) {
      for (const key in this.entrySets) {
        this.entrySets[key].forEach(f, { state });
        if (state.halted) return;
      }
    }
  }

  toArray(): ArrayNonEmpty<T> {
    let result: T[] = [];

    if (null !== this.entries) {
      for (const key in this.entries) {
        result.push(this.entries[key]);
      }
    }
    if (null !== this.entrySets) {
      for (const key in this.entrySets) {
        result = result.concat(this.entrySets[key].toArray());
      }
    }

    return result as ArrayNonEmpty<T>;
  }
}

export class HashSetCollision<T> extends HashSetNonEmptyBase<T> {
  constructor(
    readonly context: HashSetContext<T>,
    readonly entries: List.NonEmpty<T>
  ) {
    super();
  }

  get size(): number {
    return this.entries.length;
  }

  copy(entries = this.entries): HashSetCollision<T> {
    if (entries === this.entries) return this;
    return new HashSetCollision(this.context, entries);
  }

  stream(): Stream.NonEmpty<T> {
    return this.entries.stream();
  }

  has<U>(value: RelatedTo<T, U>, inHash?: number): boolean {
    if (!this.context.hasher.isValid(value)) return false;
    return this.stream().contains(value, { eq: this.context.eq });
  }

  add(value: T): HashSetCollision<T> {
    const currentIndex = this.stream().indexOf(value, { eq: this.context.eq });

    if (undefined === currentIndex) {
      return this.copy(this.entries.append(value));
    }

    return this.copy(this.entries.updateAt(currentIndex, value));
  }

  remove<U>(value: RelatedTo<T, U>, hash?: number): HashSet<T> {
    if (!this.context.hasher.isValid(value)) return this;

    const currentIndex = this.stream().indexOf(value, { eq: this.context.eq });

    if (undefined === currentIndex) return this;

    const newEntries = this.entries.remove(currentIndex).assumeNonEmpty();
    return this.copy(newEntries);
  }

  forEach(
    f: (entry: T, index: number, halt: () => void) => void,
    options: { state?: TraverseState } = {}
  ): void {
    const { state = TraverseState() } = options;

    if (state.halted) return;

    this.entries.forEach(f, { state });
  }

  toArray(): ArrayNonEmpty<T> {
    return this.entries.toArray();
  }
}
