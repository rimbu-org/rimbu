import { Arr, Entry, RimbuError, Token } from '@rimbu/base';
import {
  ArrayNonEmpty,
  IndexRange,
  OptLazy,
  OptLazyOr,
  Range,
  RelatedTo,
  ToJSON,
  TraverseState,
  Update,
} from '@rimbu/common';
import { Stream, StreamSource } from '@rimbu/stream';
import { SortedIndex, SortedMap } from '../internal';
import {
  innerDeleteMax,
  innerDeleteMin,
  innerDropInternal,
  innerGetAtIndex,
  innerMutateGetFromLeft,
  innerMutateGetFromRight,
  innerMutateGiveToLeft,
  innerMutateGiveToRight,
  innerMutateJoinLeft,
  innerMutateJoinRight,
  innerMutateSplitRight,
  innerNormalizeDownsizeChild,
  innerNormalizeIncreaseChild,
  innerStreamSliceIndex,
  innerTakeInternal,
  leafDeleteMax,
  leafDeleteMin,
  leafMutateGetFromLeft,
  leafMutateGetFromRight,
  leafMutateGiveToLeft,
  leafMutateGiveToRight,
  leafMutateJoinLeft,
  leafMutateJoinRight,
  leafMutateSplitRight,
  SortedEmpty,
  SortedNonEmptyBase,
} from '../sorted-custom';
import type { SortedMapBuilder, SortedMapContext } from '../sortedmap-custom';

export class SortedMapEmpty<K = any, V = any>
  extends SortedEmpty
  implements SortedMap<K, V>
{
  constructor(readonly context: SortedMapContext<K>) {
    super();
  }

  streamRange(): Stream<readonly [K, V]> {
    return Stream.empty();
  }

  streamKeys(): Stream<K> {
    return Stream.empty();
  }

  streamValues(): Stream<V> {
    return Stream.empty();
  }

  streamSliceIndex(): Stream<readonly [K, V]> {
    return Stream.empty();
  }

  minKey<O>(otherwise?: OptLazy<O>): O {
    return OptLazy(otherwise) as O;
  }

  minValue<O>(otherwise?: OptLazy<O>): O {
    return OptLazy(otherwise) as O;
  }

  maxKey<O>(otherwise?: OptLazy<O>): O {
    return OptLazy(otherwise) as O;
  }

  maxValue<O>(otherwise?: OptLazy<O>): O {
    return OptLazy(otherwise) as O;
  }

  get<_, O>(key: any, otherwise?: OptLazy<O>): O {
    return OptLazy(otherwise) as O;
  }

  hasKey(): false {
    return false;
  }

  getKeyAtIndex<O>(index: number, otherwise?: OptLazy<O>): O {
    return OptLazy(otherwise) as O;
  }

  getValueAtIndex<O>(index: number, otherwise?: OptLazy<O>): O {
    return OptLazy(otherwise) as O;
  }

  set(key: K, value: V): SortedMap.NonEmpty<K, V> {
    return this.context.leaf([[key, value]]);
  }

  addEntry(entry: readonly [K, V]): SortedMap.NonEmpty<K, V> {
    return this.context.leaf([entry]);
  }

  addEntries(entries: StreamSource<readonly [K, V]>): SortedMap.NonEmpty<K, V> {
    return this.context.from(entries);
  }

  removeKey(): SortedMap<K, V> {
    return this;
  }

  removeKeys(): SortedMap<K, V> {
    return this;
  }

  removeKeyAndGet(): undefined {
    return undefined;
  }

  modifyAt(
    atKey: K,
    options: {
      ifNew?: OptLazyOr<V, Token>;
    }
  ): SortedMap<K, V> {
    if (undefined !== options.ifNew) {
      const value = OptLazyOr(options.ifNew, Token);

      if (Token === value) return this;

      return this.context.leaf([[atKey, value]]);
    }

    return this;
  }

  mapValues<V2>(): SortedMap<K, V2> {
    return this as any;
  }

  updateAt(): SortedMap<K, V> {
    return this;
  }

  slice(): SortedMap<K, V> {
    return this;
  }

  toBuilder(): SortedMapBuilder<K, V> {
    return this.context.builder();
  }

  toString(): string {
    return `SortedMap()`;
  }

  toJSON(): ToJSON<any[]> {
    return {
      dataType: this.context.typeTag,
      value: [],
    };
  }

  extendValues(): any {
    return this;
  }

  mergeAll<O, I extends readonly [unknown, ...unknown[]]>(
    fillValue: O,
    ...sources: { [KT in keyof I]: StreamSource<readonly [K, I[KT]]> }
  ): any {
    return this.context.mergeAll(
      fillValue,
      this,
      ...(sources as any as [any, ...any[]])
    );
  }

  mergeAllWith<R, O, I extends readonly [unknown, ...unknown[]]>(
    fillValue: O,
    mergeFun: (
      key: K,
      value: V | O,
      ...values: { [KT in keyof I]: I[KT] | O }
    ) => R,
    ...sources: { [KT in keyof I]: StreamSource<readonly [K, I[KT]]> }
  ): any {
    return this.context.mergeAllWith(
      fillValue,
      mergeFun as any,
      this,
      ...(sources as any as [any, ...any[]])
    );
  }

  merge<I extends readonly [unknown, ...unknown[]]>(
    ...sources: { [KT in keyof I]: StreamSource<readonly [K, I[KT]]> }
  ): any {
    return this.context.merge(this, ...(sources as any as any[]));
  }

  mergeWith<R, K, I extends readonly [unknown, ...unknown[]]>(
    mergeFun: (key: K, ...values: I) => R,
    ...sources: { [KT in keyof I]: StreamSource<readonly [K, I[KT]]> }
  ): any {
    return this.context.mergeWith(
      mergeFun as any,
      this as any,
      ...(sources as any as any[])
    );
  }
}

export abstract class SortedMapNode<K, V>
  extends SortedNonEmptyBase<readonly [K, V], SortedMapNode<K, V>>
  implements SortedMap.NonEmpty<K, V>
{
  abstract get context(): SortedMapContext<K>;
  abstract get size(): number;
  abstract stream(): Stream.NonEmpty<readonly [K, V]>;
  abstract streamSliceIndex(range: IndexRange): Stream<readonly [K, V]>;
  abstract forEach(
    f: (entry: readonly [K, V], index: number, halt: () => void) => void,
    traverseState?: TraverseState
  ): void;
  abstract get<U, O>(key: RelatedTo<K, U>, otherwise?: OptLazy<O>): V | O;
  abstract addInternal(
    entry: readonly [K, V],
    hash?: number
  ): SortedMapNode<K, V>;
  abstract modifyAtInternal(
    atKey: K,
    options: {
      ifNew?: OptLazyOr<V, Token>;
      ifExists?: (currentEntry: V, remove: Token) => V | Token;
    }
  ): SortedMapNode<K, V>;
  abstract getInsertIndexOf(key: K): number;
  abstract mapValues<V2>(
    mapFun: (value: V, key: K) => V2
  ): SortedMapNode<K, V2>;
  abstract toArray(): ArrayNonEmpty<readonly [K, V]>;
  abstract normalize(): SortedMap<K, V>;
  abstract min(): readonly [K, V];
  abstract max(): readonly [K, V];

  asNormal(): this {
    return this;
  }

  getSliceRange(range: Range<K>): { startIndex: number; endIndex: number } {
    const { start, end } = Range.getNormalizedRange(range);
    let startIndex = 0;
    let endIndex = this.size - 1;

    if (undefined !== start) {
      const [startValue, startInclude] = start;
      startIndex = this.getInsertIndexOf(startValue);

      if (startIndex < 0) startIndex = SortedIndex.next(startIndex);
      else if (!startInclude) startIndex++;
    }
    if (undefined !== end) {
      const [endValue, endInclude] = end;
      endIndex = this.getInsertIndexOf(endValue);

      if (endIndex < 0) endIndex = SortedIndex.prev(endIndex);
      else if (!endInclude) endIndex--;
    }

    return { startIndex, endIndex };
  }

  streamKeys(): Stream.NonEmpty<K> {
    return this.stream().map(Entry.first);
  }

  streamValues(): Stream.NonEmpty<V> {
    return this.stream().map(Entry.second);
  }

  streamRange(keyRange: Range<K>): Stream<readonly [K, V]> {
    const { startIndex, endIndex } = this.getSliceRange(keyRange);

    return this.streamSliceIndex({
      start: [startIndex, true],
      end: [endIndex, true],
    });
  }

  minKey(): K {
    return this.min()[0];
  }

  minValue(): V {
    return this.min()[1];
  }

  maxKey(): K {
    return this.max()[0];
  }

  maxValue(): V {
    return this.max()[1];
  }

  hasKey<UK>(key: RelatedTo<K, UK>): boolean {
    const token = Symbol();
    return token !== this.get(key, token);
  }

  getKeyAtIndex<O>(index: number, otherwise?: OptLazy<O>): K | O {
    const token = Symbol();
    const result = this.getAtIndex(index, token);
    if (token === result) return OptLazy(otherwise) as O;
    return result[0];
  }

  getValueAtIndex<O>(index: number, otherwise?: OptLazy<O>): V | O {
    const token = Symbol();
    const result = this.getAtIndex(index, token);
    if (token === result) return OptLazy(otherwise) as O;
    return result[1];
  }

  addEntry(entry: readonly [K, V]): SortedMap.NonEmpty<K, V> {
    return this.addInternal(entry).normalize().assumeNonEmpty();
  }

  addEntries(entries: StreamSource<readonly [K, V]>): SortedMap.NonEmpty<K, V> {
    if (StreamSource.isEmptyInstance(entries)) return this;

    const builder = this.toBuilder();
    builder.addEntries(entries);
    return builder.build() as SortedMap.NonEmpty<K, V>;
  }

  modifyAt(
    atKey: K,
    options: {
      ifNew?: OptLazyOr<V, Token>;
      ifExists?: (currentEntry: V, remove: Token) => V | Token;
    }
  ): SortedMap<K, V> {
    return this.modifyAtInternal(atKey, options).normalize();
  }

  set(key: K, value: V): SortedMap.NonEmpty<K, V> {
    return this.addEntry([key, value]);
  }

  updateAt<U>(
    key: RelatedTo<K, U>,
    update: Update<V>
  ): SortedMap.NonEmpty<K, V> {
    if (!this.context.isValidKey(key)) return this;

    return this.modifyAt(key, {
      ifExists: (value): V => Update(value, update),
    }).assumeNonEmpty();
  }

  removeKey<UK>(key: RelatedTo<K, UK>): SortedMap<K, V> {
    if (!this.context.isValidKey(key)) return this;

    return this.modifyAt(key, {
      ifExists: (_, remove): typeof remove => remove,
    });
  }

  removeKeys<UK>(keys: StreamSource<RelatedTo<K, UK>>): SortedMap<K, V> {
    if (StreamSource.isEmptyInstance(keys)) return this;

    const builder = this.toBuilder();
    builder.removeKeys(keys);
    return builder.build();
  }

  removeKeyAndGet<UK>(key: RelatedTo<K, UK>): [SortedMap<K, V>, V] | undefined {
    if (!this.context.isValidKey(key)) return undefined;

    const token = Symbol();
    let currentValue: V | typeof token = token;

    const newMap = this.modifyAt(key, {
      ifExists: (value, remove): V | typeof remove => {
        currentValue = value;
        return remove;
      },
    });

    if (token === currentValue) {
      return undefined;
    }

    return [newMap, currentValue];
  }

  filter(
    pred: (entry: readonly [K, V], index: number, halt: () => void) => boolean
  ): SortedMap<K, V> {
    const builder = this.context.builder<K, V>();
    builder.addEntries(this.stream().filter(pred));

    if (builder.size === this.size) return this;

    return builder.build();
  }

  take(amount: number): SortedMap<K, V> | any {
    if (amount === 0) return this.context.empty();
    if (amount >= this.size || -amount > this.size) return this;
    if (amount < 0) return this.drop(this.size + amount);

    return this.takeInternal(amount).normalize();
  }

  drop(amount: number): SortedMap<K, V> {
    if (amount === 0) return this;
    if (amount >= this.size || -amount > this.size) return this.context.empty();
    if (amount < 0) return this.take(this.size + amount);

    return this.dropInternal(amount).normalize();
  }

  sliceIndex(range: IndexRange): SortedMap<K, V> {
    const indexRange = IndexRange.getIndicesFor(range, this.size);

    if (indexRange === 'empty') return this.context.empty();
    if (indexRange === 'all') return this;

    const [start, end] = indexRange;

    return this.drop(start).take(end - start + 1);
  }

  slice(range: Range<K>): SortedMap<K, V> {
    const { startIndex, endIndex } = this.getSliceRange(range);

    return this.sliceIndex({
      start: [startIndex, true],
      end: [endIndex, true],
    });
  }

  toBuilder(): SortedMapBuilder<K, V> {
    return this.context.createBuilder(this);
  }

  toString(): string {
    return this.stream().join({
      start: 'SortedMap(',
      sep: ', ',
      end: ')',
      valueToString: (entry) => `${entry[0]} -> ${entry[1]}`,
    });
  }

  toJSON(): ToJSON<(readonly [K, V])[]> {
    return {
      dataType: this.context.typeTag,
      value: this.toArray(),
    };
  }

  extendValues(): any {
    return this;
  }

  mergeAll<O, I extends readonly [unknown, ...unknown[]]>(
    fillValue: O,
    ...sources: { [KT in keyof I]: StreamSource<readonly [K, I[KT]]> }
  ): any {
    return this.context.mergeAll(
      fillValue,
      this,
      ...(sources as any as [any, ...any[]])
    );
  }

  mergeAllWith<R, O, I extends readonly [unknown, ...unknown[]]>(
    fillValue: O,
    mergeFun: (
      key: K,
      value: V | O,
      ...values: { [KT in keyof I]: I[KT] | O }
    ) => R,
    ...sources: { [KT in keyof I]: StreamSource<readonly [K, I[KT]]> }
  ): any {
    return this.context.mergeAllWith(
      fillValue,
      mergeFun as any,
      this,
      ...(sources as any as [any, ...any[]])
    );
  }

  merge<I extends readonly [unknown, ...unknown[]]>(
    ...sources: { [KT in keyof I]: StreamSource<readonly [K, I[KT]]> }
  ): any {
    return this.context.merge(this, ...(sources as any as any[]));
  }

  mergeWith<R, K, I extends readonly [unknown, ...unknown[]]>(
    mergeFun: (key: K, ...values: I) => R,
    ...sources: { [KT in keyof I]: StreamSource<readonly [K, I[KT]]> }
  ): any {
    return this.context.mergeWith(
      mergeFun as any,
      this as any,
      ...(sources as any as any[])
    );
  }
}

export class SortedMapLeaf<K, V> extends SortedMapNode<K, V> {
  constructor(
    readonly context: SortedMapContext<K>,
    public entries: readonly (readonly [K, V])[]
  ) {
    super();
  }

  copy(entries: readonly (readonly [K, V])[]): SortedMapLeaf<K, V> {
    if (entries === this.entries) return this;
    return this.context.leaf(entries);
  }

  get size(): number {
    return this.entries.length;
  }

  stream(): Stream.NonEmpty<readonly [K, V]> {
    return Stream.fromArray(this.entries) as Stream.NonEmpty<[K, V]>;
  }

  streamSliceIndex(range: IndexRange): Stream<readonly [K, V]> {
    return Stream.fromArray(this.entries, range);
  }

  min(): readonly [K, V] {
    return this.entries[0];
  }

  max(): readonly [K, V] {
    return Arr.last(this.entries);
  }

  get<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O {
    if (!this.context.isValidKey(key)) return OptLazy(otherwise) as O;

    const index = this.context.findIndex(key, this.entries);

    if (index < 0) return OptLazy(otherwise) as O;

    return this.entries[index][1];
  }

  getAtIndex<O>(index: number, otherwise?: OptLazy<O>): readonly [K, V] | O {
    if (index >= this.size || -index > this.size)
      return OptLazy(otherwise) as O;
    if (index < 0) return this.getAtIndex(this.size + index, otherwise);

    return this.entries[index];
  }

  forEach(
    f: (entry: readonly [K, V], index: number, halt: () => void) => void,
    state: TraverseState = TraverseState()
  ): void {
    if (state.halted) return;

    Arr.forEach(this.entries, f, state);
  }

  mapValues<V2>(mapFun: (value: V, key: K) => V2): SortedMapLeaf<K, V2> {
    const newEntries = this.entries.map((entry): [K, V2] => {
      const newValue = mapFun(entry[1], entry[0]);
      return [entry[0], newValue];
    });

    return this.context.leaf(newEntries);
  }

  toArray(): ArrayNonEmpty<[K, V]> {
    return this.entries.slice() as ArrayNonEmpty<[K, V]>;
  }

  // internal methods

  getInsertIndexOf(key: K): number {
    return this.context.findIndex(key, this.entries);
  }

  addInternal(entry: readonly [K, V]): SortedMapNode<K, V> {
    const index = this.context.findIndex(entry[0], this.entries);

    if (index >= 0) {
      const currentEntry = this.entries[index];
      if (Object.is(currentEntry[1], entry[1])) return this;

      const newEntries = Arr.update(this.entries, index, entry);
      return this.copy(newEntries);
    }

    const insertIndex = SortedIndex.next(index);
    const newEntries = Arr.insert(this.entries, insertIndex, entry);
    return this.copy(newEntries);
  }

  modifyAtInternal(
    key: K,
    options: {
      ifNew?: OptLazyOr<V, Token>;
      ifExists?: (currentEntry: V, remove: Token) => V | Token;
    }
  ): SortedMapNode<K, V> {
    const entryIndex = this.context.findIndex(key, this.entries);

    if (entryIndex >= 0) {
      if (undefined === options.ifExists) return this;

      const currentEntry = this.entries[entryIndex];
      const currentValue = currentEntry[1];
      const newValue = options.ifExists(currentValue, Token);

      if (Object.is(newValue, currentValue)) return this;

      if (Token === newValue) {
        const newEntries = Arr.splice(this.mutateEntries, entryIndex, 1);
        return this.copy(newEntries);
      }

      const newEntries = Arr.update(this.entries, entryIndex, [
        key,
        newValue,
      ] as [K, V]);
      return this.copy(newEntries);
    }

    if (undefined === options.ifNew) return this;

    const newValue = OptLazyOr(options.ifNew, Token);

    if (Token === newValue) return this;

    const insertIndex = SortedIndex.next(entryIndex);
    const newEntries = Arr.insert(this.entries, insertIndex, [
      key,
      newValue,
    ] as [K, V]);

    return this.copy(newEntries);
  }

  takeInternal(amount: number): SortedMapLeaf<K, V> {
    return this.context.leaf(this.entries.slice(0, amount));
  }

  dropInternal(amount: number): SortedMapLeaf<K, V> {
    return this.context.leaf(this.entries.slice(amount));
  }

  deleteMin(): [readonly [K, V], SortedMapLeaf<K, V>] {
    return leafDeleteMin<SortedMapLeaf<K, V>, readonly [K, V]>(this);
  }

  deleteMax(): [readonly [K, V], SortedMapLeaf<K, V>] {
    return leafDeleteMax<SortedMapLeaf<K, V>, readonly [K, V]>(this);
  }

  mutateSplitRight(index?: number): [readonly [K, V], SortedMapLeaf<K, V>] {
    return leafMutateSplitRight<SortedMapLeaf<K, V>, readonly [K, V]>(
      this,
      index
    );
  }

  mutateGiveToLeft(
    left: SortedMapLeaf<K, V>,
    toLeft: readonly [K, V]
  ): [readonly [K, V], SortedMapLeaf<K, V>] {
    return leafMutateGiveToLeft(this, left, toLeft);
  }

  mutateGiveToRight(
    right: SortedMapLeaf<K, V>,
    toRight: readonly [K, V]
  ): [readonly [K, V], SortedMapLeaf<K, V>] {
    return leafMutateGiveToRight(this, right, toRight);
  }

  mutateGetFromLeft(
    left: SortedMapLeaf<K, V>,
    toMe: readonly [K, V]
  ): [readonly [K, V], SortedMapLeaf<K, V>] {
    return leafMutateGetFromLeft(this, left, toMe);
  }

  mutateGetFromRight(
    right: SortedMapLeaf<K, V>,
    toMe: readonly [K, V]
  ): [readonly [K, V], SortedMapLeaf<K, V>] {
    return leafMutateGetFromRight(this, right, toMe);
  }

  mutateJoinLeft(left: SortedMapLeaf<K, V>, entry: readonly [K, V]): void {
    return leafMutateJoinLeft(this, left, entry);
  }

  mutateJoinRight(right: SortedMapLeaf<K, V>, entry: readonly [K, V]): void {
    return leafMutateJoinRight(this, right, entry);
  }

  normalize(): SortedMap<K, V> {
    if (this.entries.length === 0) return this.context.empty();
    if (this.entries.length <= this.context.maxEntries) return this;
    const size = this.size;
    const [upEntry, rightNode] = this.mutateSplitRight();
    return this.context.inner([upEntry], [this, rightNode], size);
  }
}

export class SortedMapInner<K, V> extends SortedMapNode<K, V> {
  constructor(
    readonly context: SortedMapContext<K>,
    public entries: readonly (readonly [K, V])[],
    public children: readonly SortedMapNode<K, V>[],
    readonly size: number
  ) {
    super();
  }

  get mutateChildren(): SortedMapNode<K, V>[] {
    return this.children as SortedMapNode<K, V>[];
  }

  copy(
    entries: readonly (readonly [K, V])[] = this.entries,
    children: readonly SortedMapNode<K, V>[] = this.children,
    size: number = this.size
  ): SortedMapInner<K, V> {
    if (
      entries === this.entries &&
      children === this.children &&
      size === this.size
    )
      return this;
    return this.context.inner(entries, children, size);
  }

  stream(): Stream.NonEmpty<readonly [K, V]> {
    const token = Symbol();
    return Stream.from(this.children)
      .zipAll(token, this.entries)
      .flatMap(([child, e]): Stream.NonEmpty<readonly [K, V]> => {
        if (token === child) RimbuError.throwInvalidStateError();
        if (token === e) return child.stream();
        return child.stream().append(e);
      }) as Stream.NonEmpty<readonly [K, V]>;
  }

  streamSliceIndex(range: IndexRange): Stream<readonly [K, V]> {
    return innerStreamSliceIndex<readonly [K, V]>(this, range);
  }

  min(): readonly [K, V] {
    return this.children[0].min();
  }

  max(): readonly [K, V] {
    return Arr.last(this.children).max();
  }

  get<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O {
    if (!this.context.isValidKey(key)) return OptLazy(otherwise) as O;

    const index = this.context.findIndex(key, this.entries);

    if (index >= 0) return this.entries[index][1];

    const childIndex = SortedIndex.next(index);
    const child = this.children[childIndex];

    return child.get(key, otherwise);
  }

  getAtIndex<O>(index: number, otherwise?: OptLazy<O>): readonly [K, V] | O {
    return innerGetAtIndex<readonly [K, V], O>(this, index, otherwise);
  }

  forEach(
    f: (entry: readonly [K, V], index: number, halt: () => void) => void,
    state: TraverseState = TraverseState()
  ): void {
    let i = -1;
    const entryLength = this.entries.length;
    const { halt } = state;

    while (!state.halted && i < entryLength) {
      if (i >= 0) f(this.entries[i], state.nextIndex(), halt);
      else {
        const childIndex = SortedIndex.next(i);
        this.children[childIndex].forEach(f, state);
      }
      i = SortedIndex.next(i);
    }
  }

  mapValues<V2>(mapFun: (value: V, key: K) => V2): SortedMapInner<K, V2> {
    const newEntries = this.entries.map((entry): [K, V2] => {
      const newValue = mapFun(entry[1], entry[0]);
      return [entry[0], newValue];
    });
    const newChildren = this.children.map(
      (child): SortedMapNode<K, V2> => child.mapValues(mapFun)
    );

    return this.context.inner(newEntries, newChildren, this.size);
  }

  toArray(): ArrayNonEmpty<readonly [K, V]> {
    let i = -1;
    let result: (readonly [K, V])[] = [];

    while (i < this.entries.length) {
      if (i >= 0) result.push(this.entries[i]);
      else {
        const childIndex = SortedIndex.next(i);
        result = result.concat(this.children[childIndex].toArray());
      }
      i = SortedIndex.next(i);
    }

    return result as ArrayNonEmpty<[K, V]>;
  }

  // internal methods

  getInsertIndexOf(key: K): number {
    let index = 0;

    for (let i = 0; i < this.entries.length; i++) {
      const comp = this.context.comp.compare(key, this.entries[i][0]);
      const child = this.children[i];

      if (comp < 0) {
        const insertIndex = child.getInsertIndexOf(key);

        if (insertIndex < 0) return -index + insertIndex;
        return index + insertIndex;
      }

      index += child.size + 1;

      if (comp === 0) return index;
    }

    const insertIndex = Arr.last(this.children).getInsertIndexOf(key);

    if (insertIndex < 0) return -index + insertIndex;
    return index + insertIndex;
  }

  addInternal(entry: readonly [K, V]): SortedMapInner<K, V> {
    const entryIndex = this.context.findIndex(entry[0], this.entries);

    if (entryIndex >= 0) {
      const newEntries = Arr.update(
        this.entries,
        entryIndex,
        (currentEntry): readonly [K, V] => {
          if (Object.is(currentEntry[1], entry[1])) return currentEntry;
          return entry;
        }
      );

      return this.copy(newEntries);
    }

    const childIndex = SortedIndex.next(entryIndex);
    const child = this.children[childIndex];

    const newChild = child.addInternal(entry);
    if (newChild === child) return this;

    const newSize = this.size + newChild.size - child.size;

    if (newChild.entries.length <= this.context.maxEntries) {
      // no need to shift
      const newChildren = Arr.update(this.children, childIndex, newChild);
      return this.copy(undefined, newChildren, newSize);
    }

    return this.normalizeDownsizeChild(childIndex, newChild, newSize);
  }

  modifyAtInternal(
    key: K,
    options: {
      ifNew?: OptLazyOr<V, Token>;
      ifExists?: (currentEntry: V, remove: Token) => V | Token;
    }
  ): SortedMapInner<K, V> {
    const entryIndex = this.context.findIndex(key, this.entries);

    if (entryIndex >= 0) {
      if (undefined === options.ifExists) return this;

      const currentEntry = this.entries[entryIndex];
      const currentValue = currentEntry[1];
      const newValue = options.ifExists(currentValue, Token);

      if (Object.is(newValue, currentValue)) return this;

      if (Token === newValue) {
        // remove inner entry
        const leftChild = this.children[entryIndex];
        const rightChild = this.children[entryIndex + 1];

        if (leftChild.entries.length >= rightChild.entries.length) {
          const [max, newLeft] = leftChild.deleteMax();
          const newEntries = Arr.update(this.entries, entryIndex, max);
          const newSelf = this.copy(newEntries);
          return newSelf.normalizeIncreaseChild(
            entryIndex,
            newLeft,
            this.size - 1
          );
        }

        const [min, newRight] = rightChild.deleteMin();
        const newEntries = Arr.update(this.entries, entryIndex, min);
        const newSelf = this.copy(newEntries);
        return newSelf.normalizeIncreaseChild(
          entryIndex + 1,
          newRight,
          this.size - 1
        );
      }

      // update inner entry
      const newEntry: [K, V] = [key, newValue];
      const newEntries = Arr.update(this.entries, entryIndex, newEntry);
      return this.copy(newEntries);
    }

    const childIndex = SortedIndex.next(entryIndex);
    const child = this.children[childIndex];

    const newChild = child.modifyAtInternal(key, options);
    const newSize = this.size + newChild.size - child.size;

    if (newChild.entries.length < this.context.minEntries) {
      return this.normalizeIncreaseChild(childIndex, newChild, newSize);
    }
    if (newChild.entries.length > this.context.maxEntries) {
      return this.normalizeDownsizeChild(childIndex, newChild, newSize);
    }

    const newChildren = Arr.update(this.children, childIndex, newChild);
    return this.copy(
      undefined,
      newChildren,
      this.size + newChild.size - child.size
    );
  }

  takeInternal(amount: number): SortedMapNode<K, V> {
    return innerTakeInternal<SortedMapInner<K, V>, readonly [K, V]>(
      this,
      amount
    );
  }

  dropInternal(amount: number): SortedMapNode<K, V> {
    return innerDropInternal<SortedMapInner<K, V>, readonly [K, V]>(
      this,
      amount
    );
  }

  deleteMin(): [readonly [K, V], SortedMapInner<K, V>] {
    return innerDeleteMin<SortedMapInner<K, V>, readonly [K, V]>(this);
  }

  deleteMax(): [readonly [K, V], SortedMapInner<K, V>] {
    return innerDeleteMax<SortedMapInner<K, V>, readonly [K, V]>(this);
  }

  mutateSplitRight(index?: number): [readonly [K, V], SortedMapInner<K, V>] {
    return innerMutateSplitRight<SortedMapInner<K, V>, readonly [K, V]>(
      this,
      index
    );
  }

  mutateGiveToLeft(
    left: SortedMapInner<K, V>,
    toLeft: readonly [K, V]
  ): [readonly [K, V], SortedMapInner<K, V>] {
    return innerMutateGiveToLeft(this, left, toLeft);
  }

  mutateGiveToRight(
    right: SortedMapInner<K, V>,
    toRight: readonly [K, V]
  ): [readonly [K, V], SortedMapInner<K, V>] {
    return innerMutateGiveToRight(this, right, toRight);
  }

  mutateGetFromLeft(
    left: SortedMapInner<K, V>,
    toMe: readonly [K, V]
  ): [readonly [K, V], SortedMapInner<K, V>] {
    return innerMutateGetFromLeft(this, left, toMe);
  }

  mutateGetFromRight(
    right: SortedMapInner<K, V>,
    toMe: readonly [K, V]
  ): [readonly [K, V], SortedMapInner<K, V>] {
    return innerMutateGetFromRight(this, right, toMe);
  }

  mutateJoinLeft(left: SortedMapInner<K, V>, entry: readonly [K, V]): void {
    return innerMutateJoinLeft(this, left, entry);
  }

  mutateJoinRight(right: SortedMapInner<K, V>, entry: readonly [K, V]): void {
    return innerMutateJoinRight(this, right, entry);
  }

  normalizeDownsizeChild(
    childIndex: number,
    newChild: SortedMapNode<K, V>,
    newSize: number
  ): SortedMapInner<K, V> {
    return innerNormalizeDownsizeChild<SortedMapInner<K, V>, readonly [K, V]>(
      this,
      childIndex,
      newChild,
      newSize
    );
  }

  normalizeIncreaseChild(
    childIndex: number,
    newChild: SortedMapNode<K, V>,
    newSize: number
  ): SortedMapInner<K, V> {
    return innerNormalizeIncreaseChild<SortedMapInner<K, V>, readonly [K, V]>(
      this,
      childIndex,
      newChild,
      newSize
    );
  }

  normalize(): SortedMap<K, V> {
    if (this.entries.length === 0) return this.children[0].normalize();

    if (this.entries.length <= this.context.maxEntries) return this;

    const size = this.size;
    const [upEntry, rightNode] = this.mutateSplitRight();

    return this.copy([upEntry], [this, rightNode], size);
  }
}
