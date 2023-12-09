import { Arr, RimbuError } from '@rimbu/base';
import { EmptyBase, NonEmptyBase } from '@rimbu/collection-types/map-custom';
import { IndexRange, OptLazy, TraverseState } from '@rimbu/common';
import { Stream } from '@rimbu/stream';

import { SortedIndex } from './index.mjs';

export class SortedEmpty extends EmptyBase {
  min<O>(otherwise?: OptLazy<O>): O {
    return OptLazy(otherwise) as O;
  }

  max<O>(otherwise?: OptLazy<O>): O {
    return OptLazy(otherwise) as O;
  }

  getAtIndex<O>(index: number, otherwise?: OptLazy<O>): O {
    return OptLazy(otherwise) as O;
  }

  take(): any {
    return this;
  }

  drop(): any {
    return this;
  }

  sliceIndex(): any {
    return this;
  }
}

export abstract class SortedNonEmptyBase<
  E,
  TS extends SortedNonEmptyBase<E, TS>
> extends NonEmptyBase<E> {
  abstract getAtIndex<O>(index: number, otherwise?: OptLazy<O>): E | O;

  // internal
  abstract get entries(): readonly E[];

  abstract takeInternal(amount: number): TS;
  abstract dropInternal(amount: number): TS;

  abstract mutateSplitRight(index?: number): [E, TS];
  abstract mutateGiveToLeft(left: TS, toLeft: E): [E, TS];
  abstract mutateGiveToRight(right: TS, toRight: E): [E, TS];
  abstract mutateGetFromLeft(left: TS, toMe: E): [E, TS];
  abstract mutateGetFromRight(right: TS, toMe: E): [E, TS];
  abstract mutateJoinLeft(left: TS, entry: E): void;
  abstract mutateJoinRight(right: TS, entry: E): void;
  abstract deleteMin(): [E, TS];
  abstract deleteMax(): [E, TS];

  get mutateEntries(): E[] {
    return this.entries as E[];
  }
}

export interface LeafMutateSource<TS extends LeafMutateSource<TS, E>, E> {
  mutateEntries: E[];
  entries: readonly E[];
  copy(entries: readonly E[]): TS;
}

export function leafDeleteMin<S extends LeafMutateSource<S, E>, E>(
  source: S
): [E, S] {
  return [source.entries[0], source.copy(Arr.tail(source.entries))];
}

export function leafDeleteMax<S extends LeafMutateSource<S, E>, E>(
  source: S
): [E, S] {
  return [Arr.last(source.entries), source.copy(Arr.init(source.entries))];
}

export function leafMutateSplitRight<S extends LeafMutateSource<S, E>, E>(
  source: S,
  index = source.entries.length >>> 1
): [E, S] {
  const rightEntries = source.mutateEntries.splice(index);
  const rightNode = source.copy(rightEntries);
  const upEntry = rightEntries.shift()!;
  return [upEntry, rightNode];
}

export function leafMutateGiveToLeft<S extends LeafMutateSource<S, E>, E>(
  source: S,
  left: S,
  toLeft: E
): [E, S] {
  const toUp = source.mutateEntries.shift()!;
  const newLeft = left.copy(Arr.append(left.entries, toLeft));
  return [toUp, newLeft];
}

export function leafMutateGiveToRight<S extends LeafMutateSource<S, E>, E>(
  source: S,
  right: S,
  toRight: E
): [E, S] {
  const toUp = source.mutateEntries.pop()!;
  const newRight = right.copy(Arr.prepend(right.entries, toRight));
  return [toUp, newRight];
}

export function leafMutateGetFromLeft<S extends LeafMutateSource<S, E>, E>(
  source: S,
  left: S,
  toMe: E
): [E, S] {
  const toUp = Arr.last(left.entries);
  const newLeft = left.copy(Arr.init(left.entries));
  source.mutateEntries.unshift(toMe);
  return [toUp, newLeft];
}

export function leafMutateGetFromRight<S extends LeafMutateSource<S, E>, E>(
  source: S,
  right: S,
  toMe: E
): [E, S] {
  const toUp = right.entries[0];
  const newRight = right.copy(Arr.tail(right.entries));
  source.mutateEntries.push(toMe);
  return [toUp, newRight];
}

export function leafMutateJoinLeft<S extends LeafMutateSource<S, E>, E>(
  source: S,
  left: S,
  entry: E
): void {
  source.mutateEntries.unshift(entry);
  source.entries = left.entries.concat(source.entries);
}

export function leafMutateJoinRight<S extends LeafMutateSource<S, E>, E>(
  source: S,
  right: S,
  entry: E
): void {
  source.mutateEntries.push(entry);
  source.entries = source.entries.concat(right.entries);
}

export interface InnerChild<E> {
  readonly size: number;
  getAtIndex<O>(index: number, otherwise?: OptLazy<O>): E | O;
  stream(reversed: boolean): Stream<E>;
  streamSliceIndex(range: IndexRange, reversed: boolean): Stream<E>;
  readonly entries: readonly E[];
  takeInternal(amount: number): InnerChild<E>;
  dropInternal(amount: number): InnerChild<E>;
  deleteMin(): [E, InnerChild<E>];
  deleteMax(): [E, InnerChild<E>];
  mutateGiveToLeft(left: InnerChild<E>, toLeft: E): [E, InnerChild<E>];
  mutateGiveToRight(right: InnerChild<E>, toRight: E): [E, InnerChild<E>];
  mutateSplitRight(index?: number): [E, InnerChild<E>];
  mutateJoinLeft(left: InnerChild<E>, entry: E): void;
  mutateJoinRight(right: InnerChild<E>, entry: E): void;
  mutateGetFromLeft(left: InnerChild<E>, toMe: E): [E, InnerChild<E>];
  mutateGetFromRight(right: InnerChild<E>, toMe: E): [E, InnerChild<E>];
}

export interface InnerMutateSource<TS extends InnerMutateSource<TS, E>, E> {
  readonly context: {
    readonly minEntries: number;
    readonly maxEntries: number;
    inner(
      entries: readonly E[],
      children: readonly InnerChild<E>[],
      size: number
    ): TS;
  };
  size: number;
  entries: readonly E[];
  mutateEntries: E[];
  children: readonly InnerChild<E>[];
  mutateChildren: InnerChild<E>[];
  stream(reversed: boolean): Stream.NonEmpty<E>;
  copy(
    entries?: readonly E[],
    children?: readonly InnerChild<E>[],
    size?: number
  ): TS;
  addInternal(entry: E): TS;
  normalizeDownsizeChild(
    childIndex: number,
    newChild: InnerChild<E>,
    newSize: number
  ): TS;
  normalizeIncreaseChild(
    childIndex: number,
    newChild: InnerChild<E>,
    newSize: number
  ): TS;
}

export function innerDeleteMin<S extends InnerMutateSource<S, E>, E>(
  source: S
): [E, S] {
  const [min, newFirst] = source.children[0].deleteMin();
  const newSelf = source.normalizeIncreaseChild(0, newFirst, source.size - 1);
  return [min, newSelf];
}

export function innerDeleteMax<S extends InnerMutateSource<S, E>, E>(
  source: S
): [E, S] {
  const lastChildIndex = source.children.length - 1;
  const [max, newLast] = source.children[lastChildIndex].deleteMax();
  const newSelf = source.normalizeIncreaseChild(
    lastChildIndex,
    newLast,
    source.size - 1
  );
  return [max, newSelf];
}

export function innerMutateSplitRight<S extends InnerMutateSource<S, E>, E>(
  source: S,
  index = source.entries.length >>> 1
): [E, S] {
  const size = source.size;
  const rightEntries = source.mutateEntries.splice(index - 1);
  const rightChildren = source.mutateChildren.splice(index);
  source.size = source.children.reduce(
    (r, c): number => r + c.size,
    source.entries.length
  );
  const rightSize = size - source.size - 1;
  const upEntry = rightEntries.shift()!;
  const rightNode = source.copy(rightEntries, rightChildren, rightSize);

  return [upEntry, rightNode];
}

export function innerMutateGiveToLeft<S extends InnerMutateSource<S, E>, E>(
  source: S,
  left: S,
  toLeft: E
): [E, S] {
  const toUp = source.mutateEntries.shift()!;
  const toLeftChild = source.mutateChildren.shift()!;
  source.size -= toLeftChild.size + 1;
  const newLeft = left.copy(
    Arr.append(left.entries, toLeft),
    Arr.append(left.children, toLeftChild),
    left.size + toLeftChild.size + 1
  );
  return [toUp, newLeft];
}

export function innerMutateGiveToRight<S extends InnerMutateSource<S, E>, E>(
  source: S,
  right: S,
  toRight: E
): [E, S] {
  const toUp = source.mutateEntries.pop()!;
  const toRightChild = source.mutateChildren.pop()!;
  source.size -= toRightChild.size + 1;
  const newRight = right.copy(
    Arr.prepend(right.entries, toRight),
    Arr.prepend(right.children, toRightChild),
    right.size + toRightChild.size + 1
  );
  return [toUp, newRight];
}

export function innerMutateGetFromLeft<S extends InnerMutateSource<S, E>, E>(
  source: S,
  left: S,
  toMe: E
): [E, S] {
  const toUp = Arr.last(left.entries);
  const toMeChild = Arr.last(left.children);
  const leftShrink = toMeChild.size + 1;
  const newLeft = left.copy(
    Arr.init(left.entries),
    Arr.init(left.children),
    left.size - leftShrink
  );
  source.mutateEntries.unshift(toMe);
  source.mutateChildren.unshift(toMeChild);
  source.size += leftShrink;
  return [toUp, newLeft];
}

export function innerMutateGetFromRight<S extends InnerMutateSource<S, E>, E>(
  source: S,
  right: S,
  toMe: E
): [E, S] {
  const toUp = right.entries[0];
  const toMeChild = right.children[0];
  const rightShrink = toMeChild.size + 1;
  const newLeft = right.copy(
    Arr.tail(right.entries),
    Arr.tail(right.children),
    right.size - rightShrink
  );
  source.mutateEntries.push(toMe);
  source.mutateChildren.push(toMeChild);
  source.size += rightShrink;
  return [toUp, newLeft];
}

export function innerMutateJoinLeft<S extends InnerMutateSource<S, E>, E>(
  source: S,
  left: S,
  entry: E
): void {
  source.mutateEntries.unshift(entry);
  source.entries = left.entries.concat(source.entries);
  source.children = left.children.concat(source.children);
  source.size += left.size + 1;
}

export function innerMutateJoinRight<S extends InnerMutateSource<S, E>, E>(
  source: S,
  right: S,
  entry: E
): void {
  source.mutateEntries.push(entry);
  source.entries = source.entries.concat(right.entries);
  source.children = source.children.concat(right.children);
  source.size += right.size + 1;
}

export function innerNormalizeDownsizeChild<
  S extends InnerMutateSource<S, E>,
  E
>(source: S, childIndex: number, newChild: InnerChild<E>, newSize: number): S {
  // try to shift
  const leftChild = source.children[childIndex - 1];
  const rightChild = source.children[childIndex + 1];

  if (
    (undefined === leftChild ||
      leftChild.entries.length >= source.context.maxEntries) &&
    (undefined === rightChild ||
      rightChild.entries.length >= source.context.maxEntries)
  ) {
    // cannot shift
    const [upEntry, rightChild] = newChild.mutateSplitRight();
    const newEntries = Arr.insert(source.entries, childIndex, upEntry);
    const newChildren = Arr.splice(
      source.children,
      childIndex,
      1,
      newChild,
      rightChild
    );
    return source.copy(newEntries, newChildren, newSize);
  }

  if (
    undefined !== leftChild &&
    (undefined === rightChild ||
      rightChild.entries.length >= leftChild.entries.length)
  ) {
    // shiftleft
    const [newSep, newLeft] = newChild.mutateGiveToLeft(
      leftChild,
      source.entries[childIndex - 1]
    );
    const newEntries = Arr.update(source.entries, childIndex - 1, newSep);
    const newChildren = Arr.splice(
      source.children,
      childIndex - 1,
      2,
      newLeft,
      newChild
    );
    return source.copy(newEntries, newChildren, newSize);
  }

  // shiftright
  const [newSep, newRight] = newChild.mutateGiveToRight(
    rightChild,
    source.entries[childIndex]
  );
  const newEntries = Arr.update(source.entries, childIndex, newSep);
  const newChildren = Arr.splice(
    source.children,
    childIndex,
    2,
    newChild,
    newRight
  );
  return source.copy(newEntries, newChildren, newSize);
}

export function innerNormalizeIncreaseChild<
  S extends InnerMutateSource<S, E>,
  E
>(source: S, childIndex: number, newChild: InnerChild<E>, newSize: number): S {
  if (newChild.entries.length >= source.context.minEntries) {
    const newChildren = Arr.update(source.children, childIndex, newChild);
    return source.copy(undefined, newChildren, newSize);
  }

  // try to shift
  const leftChild = source.children[childIndex - 1];
  const rightChild = source.children[childIndex + 1];

  if (
    (undefined === leftChild ||
      leftChild.entries.length <= source.context.minEntries) &&
    (undefined === rightChild ||
      rightChild.entries.length <= source.context.minEntries)
  ) {
    // cannot shift
    if (undefined !== leftChild) {
      newChild.mutateJoinLeft(leftChild, source.entries[childIndex - 1]);
      const newEntries = Arr.splice(source.entries, childIndex - 1, 1);
      const newChildren = Arr.splice(
        source.children,
        childIndex - 1,
        2,
        newChild
      );
      return source.copy(newEntries, newChildren, newSize);
    }

    newChild.mutateJoinRight(rightChild, source.entries[childIndex]);
    const newEntries = Arr.splice(source.entries, childIndex, 1);
    const newChildren = Arr.splice(source.children, childIndex, 2, newChild);
    return source.copy(newEntries, newChildren, newSize);
  }

  if (
    undefined !== leftChild &&
    (undefined === rightChild ||
      rightChild.entries.length <= leftChild.entries.length)
  ) {
    // get from left
    const [newSep, newLeft] = newChild.mutateGetFromLeft(
      leftChild,
      source.entries[childIndex - 1]
    );
    const newEntries = Arr.update(source.entries, childIndex - 1, newSep);
    const newChildren = Arr.splice(
      source.children,
      childIndex - 1,
      2,
      newLeft,
      newChild
    );
    return source.copy(newEntries, newChildren, newSize);
  }

  // get from right
  const [newSep, newRight] = newChild.mutateGetFromRight(
    rightChild,
    source.entries[childIndex]
  );
  const newEntries = Arr.update(source.entries, childIndex, newSep);
  const newChildren = Arr.splice(
    source.children,
    childIndex,
    2,
    newChild,
    newRight
  );
  return source.copy(newEntries, newChildren, newSize);
}

/**
 * Returns the index of the element in the sources element array, or a tuple with the child index and the index within the child
 * @param source the collection to operate on
 * @param index the index to find
 */
export function innerGetSubIndex(
  source: InnerMutateSource<any, any>,
  index: number
): number | [number, number] {
  let elemIndex = -1;
  let i = index;

  while (true) {
    if (elemIndex >= 0) {
      if (i === 0) return elemIndex;
      i--;
    } else {
      const childIndex = SortedIndex.next(elemIndex);
      const child = source.children[childIndex];
      if (i < child.size) return [childIndex, i];
      i -= child.size;
    }
    elemIndex = SortedIndex.next(elemIndex);
  }
}

export function innerGetAtIndex<E, O>(
  source: InnerMutateSource<any, E>,
  index: number,
  otherwise?: OptLazy<O>
): E | O {
  if (index >= source.size || -index > source.size)
    return OptLazy(otherwise) as O;
  if (index < 0) return innerGetAtIndex(source, source.size + index, otherwise);

  const subIndex = innerGetSubIndex(source, index);

  if (Array.isArray(subIndex))
    return source.children[subIndex[0]].getAtIndex(subIndex[1], otherwise);
  return source.entries[subIndex];
}

export function innerTakeInternal<S extends InnerMutateSource<S, E>, E>(
  source: S,
  amount: number
): S {
  if (amount <= 0 || amount >= source.size) RimbuError.throwInvalidStateError();

  const indexResult = innerGetSubIndex(source, amount - 1);

  if (Array.isArray(indexResult)) {
    const [childIndex, inChildIndex] = indexResult;
    const untilChild = childIndex;
    const entries = source.entries.slice(0, untilChild);
    const children = source.children.slice(0, untilChild);
    const takeAmount = inChildIndex + 1;
    const lastChild = source.children[childIndex].takeInternal(takeAmount);
    children.push(lastChild);

    let result = source.context.inner(entries, children, amount);
    if (childIndex === 0) return result;

    while (
      Arr.last(result.children).entries.length < source.context.minEntries
    ) {
      result = result.normalizeIncreaseChild(
        result.entries.length,
        Arr.last(result.children),
        amount
      );
    }

    return result;
  }

  const elemIndex = indexResult;
  const entries = source.entries.slice(0, elemIndex);
  const children = source.children.slice(0, elemIndex + 1);
  return source.context
    .inner(entries, children, amount - 1)
    .addInternal(source.entries[elemIndex]);
}

export function innerDropInternal<S extends InnerMutateSource<S, E>, E>(
  source: S,
  amount: number
): S {
  if (amount <= 0 || amount >= source.size) RimbuError.throwInvalidStateError();

  const newSize = source.size - amount;

  const indexResult = innerGetSubIndex(source, amount);

  if (Array.isArray(indexResult)) {
    const [childIndex, inChildIndex] = indexResult;
    const fromChild = childIndex;
    const entries = source.entries.slice(fromChild);
    const children = source.children.slice(fromChild + 1);
    const dropAmount = inChildIndex;
    const firstChild = source.children[childIndex].dropInternal(dropAmount);
    children.unshift(firstChild);

    let result = source.context.inner(entries, children, newSize);
    if (childIndex === source.entries.length) return result;

    while (result.children[0].entries.length < source.context.minEntries) {
      result = result.normalizeIncreaseChild(0, result.children[0], newSize);
    }

    return result;
  }

  const elemIndex = indexResult;
  const entries = source.entries.slice(elemIndex + 1);
  const children = source.children.slice(elemIndex + 1);
  return source.context
    .inner(entries, children, newSize - 1)
    .addInternal(source.entries[elemIndex]);
}

export function innerStreamSliceIndex<E>(
  source: InnerMutateSource<any, E>,
  range: IndexRange,
  reversed = false
): Stream<E> {
  const result = IndexRange.getIndicesFor(range, source.size);

  if (result === 'all') return source.stream(reversed);
  if (result === 'empty') return Stream.empty();

  const [startIndex, endIndex] = result;

  const startSubIndex = innerGetSubIndex(source, startIndex);
  const endSubIndex = innerGetSubIndex(source, endIndex);

  let startElemIndex = 0;
  let inStartElemIndex = 0;

  if (Array.isArray(startSubIndex)) {
    startElemIndex = SortedIndex.prev(startSubIndex[0]);
    inStartElemIndex = startSubIndex[1];
  } else {
    startElemIndex = startSubIndex;
  }

  let endElemIndex = 0;
  let inEndElemIndex = 0;

  if (Array.isArray(endSubIndex)) {
    endElemIndex = SortedIndex.prev(endSubIndex[0]);
    inEndElemIndex = endSubIndex[1];
  } else {
    endElemIndex = endSubIndex;
  }

  if (startElemIndex === endElemIndex) {
    if (startElemIndex >= 0) return Stream.of(source.entries[startElemIndex]);

    return source.children[SortedIndex.next(startElemIndex)].streamSliceIndex(
      {
        start: inStartElemIndex,
        end: inEndElemIndex,
      },
      reversed
    );
  }

  const indices = reversed
    ? Stream.unfold(endElemIndex, (i, _, stop) =>
        SortedIndex.compare(i, startElemIndex) <= 0 ? stop : SortedIndex.prev(i)
      )
    : Stream.unfold(startElemIndex, (i, _, stop) =>
        SortedIndex.compare(i, endElemIndex) >= 0 ? stop : SortedIndex.next(i)
      );

  return indices.flatMap((index) => {
    if (index >= 0) return Stream.of(source.entries[index]);

    const childIndex = SortedIndex.next(index);
    const child = source.children[childIndex];

    if (index === startElemIndex) {
      return child.streamSliceIndex({ start: inStartElemIndex }, reversed);
    }
    if (index === endElemIndex) {
      return child.streamSliceIndex({ end: inEndElemIndex }, reversed);
    }

    return child.stream(reversed);
  });
}

export abstract class SortedBuilder<E> {
  abstract get context(): { minEntries: number; maxEntries: number };
  abstract source?:
    | undefined
    | {
        min<O>(otherwise?: OptLazy<O>): E | O;
        max<O>(otherwise?: OptLazy<O>): E | O;
        getAtIndex<O>(index: number, otherwise?: OptLazy<O>): E | O;
        forEach(
          f: (entry: E, index: number, halt: () => void) => void,
          state?: TraverseState
        ): void;
      };
  abstract _entries?: undefined | E[];
  abstract _children?: undefined | SortedBuilder<E>[];
  abstract get children(): SortedBuilder<E>[];
  abstract set children(value: SortedBuilder<E>[]);
  abstract size: number;
  abstract prepareMutate(): void;
  abstract createNew(
    source?: undefined | unknown,
    entries?: undefined | E[],
    children?: undefined | SortedBuilder<E>[],
    size?: undefined | number
  ): SortedBuilder<E>;

  _lock = 0;

  checkLock(): void {
    if (this._lock) RimbuError.throwModifiedBuilderWhileLoopingOverItError();
  }

  get entries(): E[] {
    this.prepareMutate();
    return this._entries!;
  }

  set entries(value: E[]) {
    this.prepareMutate();
    this.source = undefined;
    this._entries = value;
  }

  get hasChildren(): boolean {
    return undefined !== this._children && this._children.length > 0;
  }

  get isEmpty(): boolean {
    return this.size === 0;
  }

  min<O>(otherwise?: OptLazy<O>): E | O {
    if (undefined !== this.source) return this.source.min(otherwise);

    if (this.size === 0) return OptLazy(otherwise) as O;

    if (this.hasChildren) return this.children[0].min(otherwise);
    return this.entries[0];
  }

  max<O>(otherwise?: OptLazy<O>): E | O {
    if (undefined !== this.source) return this.source.max(otherwise);

    if (this.size === 0) return OptLazy(otherwise) as O;

    if (this.hasChildren) return Arr.last(this.children).max(otherwise);
    else return Arr.last(this.entries);
  }

  getAtIndex<O>(index: number, otherwise?: OptLazy<O>): E | O {
    if (undefined !== this.source) {
      return this.source.getAtIndex(index, otherwise);
    }

    if (index >= this.size || -index > this.size) {
      return OptLazy(otherwise) as O;
    }

    if (index < 0) {
      return this.getAtIndex(this.size + index, otherwise);
    }

    if (!this.hasChildren) return this.entries[index];

    let elemIndex = -1;
    let i = index;

    while (true) {
      if (elemIndex >= 0) {
        if (i === 0) return this.entries[elemIndex];
        i--;
      } else {
        const childIndex = SortedIndex.next(elemIndex);
        const child = this.children[childIndex];

        if (i < child.size) return child.getAtIndex(i, otherwise);
        i -= child.size;
      }
      elemIndex = SortedIndex.next(elemIndex);
    }
  }

  forEach(
    f: (entry: E, index: number, halt: () => void) => void,
    state: TraverseState = TraverseState()
  ): void {
    if (state.halted || this.isEmpty) return;

    this._lock++;

    if (undefined !== this.source) {
      this.source.forEach(f, state);
    } else {
      if (!this.hasChildren) {
        Arr.forEach(this.entries, f, state);
      } else {
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
    }

    this._lock--;
  }

  normalize(): void {
    if (this.entries.length === 0) {
      if (!this.hasChildren) return;

      const firstChild = this.children[0];
      this.entries = firstChild.entries;
      this.children = firstChild.children;
      this.size = firstChild.size;
      return;
    }

    if (this.entries.length <= this.context.maxEntries) return;

    const index = this.entries.length >>> 1;
    const leftEntries = this.entries;
    const rightEntries = leftEntries.splice(index);
    const upEntry = rightEntries.shift()!;

    if (!this.hasChildren) {
      const leftNode = this.createNew(
        undefined,
        leftEntries,
        undefined,
        leftEntries.length
      );
      const rightNode = this.createNew(
        undefined,
        rightEntries,
        undefined,
        rightEntries.length
      );
      this.entries = [upEntry];
      this.children = [leftNode, rightNode];
    } else {
      const leftChildren = this.children;
      const rightChildren = leftChildren.splice(index + 1);
      const leftSize = leftChildren.reduce(
        (r, c): number => r + c.size,
        leftEntries.length
      );
      const rightSize = this.size - leftSize - 1;
      const leftNode = this.createNew(
        undefined,
        leftEntries,
        leftChildren,
        leftSize
      );
      const rightNode = this.createNew(
        undefined,
        rightEntries,
        rightChildren,
        rightSize
      );
      this.entries = [upEntry];
      this.children = [leftNode, rightNode];
    }
  }

  // check whether child at given `childIndex` has gotten too small
  // get from neighbouring children if it is too small so child increases
  normalizeChildIncrease(childIndex: number): void {
    const child = this.children[childIndex];
    if (child.entries.length >= this.context.minEntries) return;

    const leftChild = this.children[childIndex - 1];
    const rightChild = this.children[childIndex + 1];

    if (
      (undefined === leftChild ||
        leftChild.entries.length <= this.context.minEntries) &&
      (undefined === rightChild ||
        rightChild.entries.length <= this.context.minEntries)
    ) {
      // cannot shift
      if (undefined !== leftChild) {
        // join left
        leftChild.source = undefined;
        const [down] = this.entries.splice(childIndex - 1, 1);
        leftChild.entries.push(down);
        leftChild.entries = leftChild.entries.concat(child.entries);
        leftChild.size += child.size + 1;

        if (leftChild.hasChildren) {
          leftChild.children = leftChild.children.concat(child.children);
        }
        this.children.splice(childIndex, 1);
        return;
      }

      // join right
      rightChild.source = undefined;
      child.source = undefined;
      const [down] = this.entries.splice(childIndex, 1);
      rightChild.entries.unshift(down);
      rightChild.entries = child.entries.concat(rightChild.entries);
      rightChild.size += child.size + 1;

      if (rightChild.hasChildren) {
        rightChild.children = child.children.concat(rightChild.children);
      }
      this.children.splice(childIndex, 1);
      return;
    }

    if (
      undefined !== leftChild &&
      (undefined === rightChild ||
        rightChild.entries.length < leftChild.entries.length)
    ) {
      // get from left
      child.source = undefined;
      leftChild.source = undefined;
      child.entries.unshift(this.entries[childIndex - 1]);
      child.size++;
      this.entries[childIndex - 1] = leftChild.entries.pop()!;
      leftChild.size--;

      if (leftChild.hasChildren) {
        const shiftChild = leftChild.children.pop()!;
        child.children.unshift(shiftChild);
        leftChild.size -= shiftChild.size;
        child.size += shiftChild.size;
      }

      return;
    }

    // get from right
    child.source = undefined;
    rightChild.source = undefined;
    child.entries.push(this.entries[childIndex]);
    child.size++;
    this.entries[childIndex] = rightChild.entries.shift()!;
    rightChild.size--;

    if (rightChild.hasChildren) {
      const shiftChild = rightChild.children.shift()!;
      child.children.push(shiftChild);
      rightChild.size -= shiftChild.size;
      child.size += shiftChild.size;
    }
  }

  // check whether child at given `childIndex` has gotten too large
  // shift to neighbouring children if it is too large so child decreases
  normalizeChildDecrease(childIndex: number): void {
    const child = this.children[childIndex];

    if (child.entries.length <= this.context.maxEntries) return;

    const leftChild = this.children[childIndex - 1];
    const rightChild = this.children[childIndex + 1];

    if (
      (undefined === leftChild ||
        leftChild.entries.length >= this.context.maxEntries) &&
      (undefined === rightChild ||
        rightChild.entries.length >= this.context.maxEntries)
    ) {
      // need to split child
      child.source = undefined;
      const index = (child.entries.length >>> 1) + 1;
      const preSize = child.size;
      const rightEntries = child.entries.splice(index);
      const upEntry = child.entries.pop()!;
      let rightChildren = undefined;

      if (child.hasChildren) {
        rightChildren = child.children.splice(index);

        child.size = child.children.reduce(
          (r, c): number => r + c.size,
          child.entries.length
        );
      } else {
        child.size = child.entries.length;
      }
      const rightSize = preSize - child.size - 1;

      const rightNode = this.createNew(
        undefined,
        rightEntries,
        rightChildren,
        rightSize
      );

      this.entries.splice(childIndex, 0, upEntry);
      this.children.splice(childIndex + 1, 0, rightNode);

      return;
    }

    if (
      undefined !== leftChild &&
      (undefined === rightChild ||
        rightChild.entries.length >= leftChild.entries.length)
    ) {
      // shiftleft
      leftChild.source = undefined;
      child.source = undefined;

      leftChild.entries.push(this.entries[childIndex - 1]);
      leftChild.size++;
      this.entries[childIndex - 1] = child.entries.shift()!;
      child.size--;

      if (child.hasChildren) {
        const shiftChild = child.children.shift()!;
        leftChild.children.push(shiftChild);
        leftChild.size += shiftChild.size;
        child.size -= shiftChild.size;
      }

      return;
    }

    rightChild.source = undefined;
    child.source = undefined;
    rightChild.entries.unshift(this.entries[childIndex]);
    rightChild.size++;
    this.entries[childIndex] = child.entries.pop()!;
    child.size--;

    if (child.hasChildren) {
      const shiftChild = child.children.pop()!;
      rightChild.children.unshift(shiftChild);
      rightChild.size += shiftChild.size;
      child.size -= shiftChild.size;
    }
  }

  deleteMin(): E {
    this.size--;

    if (!this.hasChildren) return this.entries.shift()!;

    const result = this.children[0].deleteMin();
    this.normalizeChildIncrease(0);
    return result;
  }

  deleteMax(): E {
    this.size--;

    if (!this.hasChildren) return this.entries.pop()!;

    const lastChildIndex = this.children.length - 1;
    const result = this.children[lastChildIndex].deleteMax();
    this.normalizeChildIncrease(lastChildIndex);
    return result;
  }
}
